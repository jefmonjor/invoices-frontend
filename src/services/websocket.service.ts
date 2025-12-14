import { Client, type StompSubscription, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { logger } from '@/utils/logger';

/**
 * Invoice status message received via WebSocket
 */
export interface InvoiceStatusMessage {
    invoiceId: number;
    status: string;
    txId?: string;
    errorMessage?: string;
    timestamp: number;
}

/**
 * WebSocket service for real-time invoice status updates
 * Uses STOMP over WebSocket with SockJS fallback
 */
class WebSocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private isConnecting = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    /**
     * Get WebSocket URL from environment or derive from API base URL
     * Ensures protocol matches page protocol (https pages require https/wss)
     */
    private getWebSocketUrl(): string {
        // First check for explicit WebSocket URL
        if (import.meta.env.VITE_WS_URL) {
            return import.meta.env.VITE_WS_URL;
        }

        // Derive from API base URL
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
        let wsUrl = apiBaseUrl + '/ws';

        // Ensure protocol matches page protocol to avoid mixed content errors
        if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
            wsUrl = wsUrl.replace(/^http:/, 'https:');
        }

        return wsUrl;
    }

    /**
     * Connect to WebSocket server with JWT authentication
     * @param token JWT authentication token
     * @returns Promise that resolves when connected
     */
    connect(token: string): Promise<void> {
        if (this.client?.connected) {
            logger.log('[WebSocket] Already connected');
            return Promise.resolve();
        }

        if (this.isConnecting) {
            logger.log('[WebSocket] Connection already in progress');
            return Promise.reject(new Error('Connection already in progress'));
        }

        this.isConnecting = true;

        return new Promise((resolve, reject) => {
            const wsUrl = this.getWebSocketUrl();
            logger.log('[WebSocket] Connecting to', wsUrl);

            this.client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (msg: string) => {
                    logger.debug('[WebSocket Debug]', msg);
                },
                onConnect: () => {
                    logger.log('[WebSocket] Connected successfully');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    resolve();
                },
                onStompError: (frame) => {
                    logger.error('[WebSocket] STOMP Error:', frame);
                    this.isConnecting = false;
                    reject(new Error(frame.headers['message'] || 'STOMP connection error'));
                },
                onWebSocketError: (error) => {
                    logger.error('[WebSocket] Transport Error:', error);
                    this.isConnecting = false;
                    reject(error);
                },
                onWebSocketClose: () => {
                    logger.log('[WebSocket] Connection closed');
                    this.handleReconnect(token);
                },
            });

            this.client.activate();
        });
    }

    /**
     * Handle automatic reconnection logic
     */
    private handleReconnect(token: string): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('[WebSocket] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        logger.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        setTimeout(() => {
            this.connect(token).catch((error) => {
                logger.error('[WebSocket] Reconnection failed:', error);
            });
        }, 5000 * this.reconnectAttempts); // Exponential backoff
    }

    /**
     * Subscribe to invoice status updates
     * @param invoiceId Invoice ID to monitor
     * @param callback Function to call when status updates are received
     */
    subscribeToInvoiceStatus(
        invoiceId: number,
        callback: (message: InvoiceStatusMessage) => void
    ): void {
        if (!this.client?.connected) {
            logger.error('[WebSocket] Cannot subscribe: not connected');
            throw new Error('WebSocket not connected');
        }

        const destination = `/topic/invoice/${invoiceId}/status`;

        // Unsubscribe if already subscribed
        if (this.subscriptions.has(destination)) {
            logger.log('[WebSocket] Already subscribed to', destination);
            return;
        }

        logger.log('[WebSocket] Subscribing to', destination);

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const data: InvoiceStatusMessage = JSON.parse(message.body);
                logger.log('[WebSocket] Received message:', data);
                callback(data);
            } catch (error) {
                logger.error('[WebSocket] Error parsing message:', error);
            }
        });

        this.subscriptions.set(destination, subscription);
    }

    /**
     * Subscribe to company-wide invoice status updates
     * @param companyId Company ID to monitor
     * @param callback Function to call when status updates are received
     */
    subscribeToCompanyInvoices(
        companyId: number,
        callback: (message: InvoiceStatusMessage) => void
    ): void {
        if (!this.client?.connected) {
            logger.error('[WebSocket] Cannot subscribe: not connected');
            throw new Error('WebSocket not connected');
        }

        const destination = `/topic/company/${companyId}/invoices`;

        // Unsubscribe if already subscribed
        if (this.subscriptions.has(destination)) {
            logger.log('[WebSocket] Already subscribed to', destination);
            return;
        }

        logger.log('[WebSocket] Subscribing to', destination);

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const data: InvoiceStatusMessage = JSON.parse(message.body);
                logger.log('[WebSocket] Received company message:', data);
                callback(data);
            } catch (error) {
                logger.error('[WebSocket] Error parsing message:', error);
            }
        });

        this.subscriptions.set(destination, subscription);
    }

    /**
     * Unsubscribe from company invoices
     * @param companyId Company ID to stop monitoring
     */
    unsubscribeFromCompanyInvoices(companyId: number): void {
        const destination = `/topic/company/${companyId}/invoices`;
        const subscription = this.subscriptions.get(destination);

        if (subscription) {
            logger.log('[WebSocket] Unsubscribing from', destination);
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    /**
     * Unsubscribe from invoice status updates
     * @param invoiceId Invoice ID to stop monitoring
     */
    unsubscribe(invoiceId: number): void {
        const destination = `/topic/invoice/${invoiceId}/status`;
        const subscription = this.subscriptions.get(destination);

        if (subscription) {
            logger.log('[WebSocket] Unsubscribing from', destination);
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    /**
     * Unsubscribe from all subscriptions
     */
    unsubscribeAll(): void {
        logger.log('[WebSocket] Unsubscribing from all channels');
        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.client) {
            logger.log('[WebSocket] Disconnecting...');
            this.unsubscribeAll();
            this.client.deactivate();
            this.client = null;
            this.isConnecting = false;
            this.reconnectAttempts = 0;
        }
    }

    /**
     * Check if WebSocket is connected
     * @returns true if connected, false otherwise
     */
    isConnected(): boolean {
        return this.client?.connected ?? false;
    }

    /**
     * Get current connection state
     */
    getConnectionState(): string {
        if (!this.client) return 'disconnected';
        if (this.isConnecting) return 'connecting';
        if (this.client.connected) return 'connected';
        return 'disconnected';
    }
}

// Export singleton instance
export const websocketService = new WebSocketService();

