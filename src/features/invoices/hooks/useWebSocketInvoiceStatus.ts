import { useEffect, useRef, useState } from 'react';
import { websocketService, InvoiceStatusMessage } from '../services/websocket.service';

/**
 * React hook for monitoring invoice status via WebSocket
 * Automatically handles connection, subscription, and cleanup
 * 
 * @param invoiceId Invoice ID to monitor
 * @param onStatusUpdate Callback when status updates are received
 * @returns Connection state and manual control functions
 */
export function useWebSocketInvoiceStatus(
    invoiceId: number | null,
    onStatusUpdate: (message: InvoiceStatusMessage) => void
) {
    const [connectionState, setConnectionState] = useState<string>('disconnected');
    const hasConnected = useRef(false);

    useEffect(() => {
        if (!invoiceId) return;

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('[useWebSocket] No auth token found');
            return;
        }

        let isSubscribed = false;

        // Connect and subscribe
        const connectAndSubscribe = async () => {
            try {
                // Only connect if not already connected
                if (!websocketService.isConnected() && !hasConnected.current) {
                    setConnectionState('connecting');
                    await websocketService.connect(token);
                    hasConnected.current = true;
                }

                setConnectionState('connected');

                // Subscribe to invoice status
                websocketService.subscribeToInvoiceStatus(invoiceId, (message) => {
                    if (isSubscribed) {
                        onStatusUpdate(message);
                    }
                });

                isSubscribed = true;
            } catch (error) {
                console.error('[useWebSocket] Connection error:', error);
                setConnectionState('error');
                hasConnected.current = false;
            }
        };

        connectAndSubscribe();

        // Cleanup on unmount or when invoiceId changes
        return () => {
            isSubscribed = false;
            if (invoiceId) {
                websocketService.unsubscribe(invoiceId);
            }
        };
    }, [invoiceId, onStatusUpdate]);

    return {
        connectionState,
        isConnected: connectionState === 'connected',
        reconnect: () => {
            const token = localStorage.getItem('token');
            if (token) {
                websocketService.disconnect();
                hasConnected.current = false;
                websocketService.connect(token);
            }
        },
    };
}
