import { useEffect, useRef, useState } from 'react';
import { websocketService } from '../../../services/websocket.service';
import type { InvoiceStatusMessage } from '../../../services/websocket.service';

/**
 * React hook for monitoring company-wide invoice status via WebSocket
 * Automatically handles connection, subscription, and cleanup
 * 
 * @param companyId Company ID to monitor
 * @param onStatusUpdate Callback when status updates are received
 * @returns Connection state and manual control functions
 */
export function useWebSocketCompanyInvoices(
    companyId: number | null,
    onStatusUpdate: (message: InvoiceStatusMessage) => void
) {
    const [connectionState, setConnectionState] = useState<string>('disconnected');
    const hasConnected = useRef(false);

    useEffect(() => {
        if (!companyId) return;

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

                // Subscribe to company invoices
                websocketService.subscribeToCompanyInvoices(companyId, (message) => {
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

        // Cleanup on unmount or when companyId changes
        return () => {
            isSubscribed = false;
            if (companyId) {
                websocketService.unsubscribeFromCompanyInvoices(companyId);
            }
        };
    }, [companyId, onStatusUpdate]);

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
