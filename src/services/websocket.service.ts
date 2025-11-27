import { Client, type StompSubscription, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
     * Get WebSocket URL from environment or use default
     */
    private getWebSocketUrl(): string {
        return import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
    }

    /**
     * Connect to WebSocket server with JWT authentication
     * @param token JWT authentication token
     * @returns Promise that resolves when connected
     */
    connect(token: string): Promise<void> {
        if (this.client?.connected) {
            console.log('[WebSocket] Already connected');
            return Promise.resolve();
        }

        if (this.isConnecting) {
            console.log('[WebSocket] Connection already in progress');
            return Promise.reject(new Error('Connection already in progress'));
        }

        this.isConnecting = true;

        return new Promise((resolve, reject) => {
            const wsUrl = this.getWebSocketUrl();
            console.log('[WebSocket] Connecting to', wsUrl);

            this.client = new Client({
                webSocketFactory: () => new SockJS(wsUrl),
                connectHeaders: {
                    Authorization: `Bearer ${token}`,
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                debug: (msg: string) => {
                    if (import.meta.env.DEV) {
                        console.log('[WebSocket Debug]', msg);
                    }
                },
                onConnect: () => {
                    console.log('[WebSocket] Connected successfully');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('[WebSocket] STOMP Error:', frame);
                    this.isConnecting = false;
                    reject(new Error(frame.headers['message'] || 'STOMP connection error'));
                },
                onWebSocketError: (error) => {
                    console.error('[WebSocket] Transport Error:', error);
                    this.isConnecting = false;
                    reject(error);
                },
                onWebSocketClose: () => {
                    console.log('[WebSocket] Connection closed');
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
            console.error('[WebSocket] Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

        setTimeout(() => {
            this.connect(token).catch((error) => {
                console.error('[WebSocket] Reconnection failed:', error);
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
            console.error('[WebSocket] Cannot subscribe: not connected');
            throw new Error('WebSocket not connected');
        }

        const destination = `/topic/invoice/${invoiceId}/status`;

        // Unsubscribe if already subscribed
        if (this.subscriptions.has(destination)) {
            console.log('[WebSocket] Already subscribed to', destination);
            return;
        }

        console.log('[WebSocket] Subscribing to', destination);

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const data: InvoiceStatusMessage = JSON.parse(message.body);
                console.log('[WebSocket] Received message:', data);
                callback(data);
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
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
            console.error('[WebSocket] Cannot subscribe: not connected');
            throw new Error('WebSocket not connected');
        }

        const destination = `/topic/company/${companyId}/invoices`;

        // Unsubscribe if already subscribed
        if (this.subscriptions.has(destination)) {
            console.log('[WebSocket] Already subscribed to', destination);
            return;
        }

        console.log('[WebSocket] Subscribing to', destination);

        const subscription = this.client.subscribe(destination, (message: IMessage) => {
            try {
                const data: InvoiceStatusMessage = JSON.parse(message.body);
                console.log('[WebSocket] Received company message:', data);
                callback(data);
            } catch (error) {
                console.error('[WebSocket] Error parsing message:', error);
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
            console.log('[WebSocket] Unsubscribing from', destination);
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
            console.log('[WebSocket] Unsubscribing from', destination);
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    /**
     * Unsubscribe from all subscriptions
     */
    unsubscribeAll(): void {
        console.log('[WebSocket] Unsubscribing from all channels');
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
            console.log('[WebSocket] Disconnecting...');
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
