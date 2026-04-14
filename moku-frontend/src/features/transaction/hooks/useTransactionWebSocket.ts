import { useEffect, useRef } from 'react';
import echo from '@/lib/echo';

interface TransactionUpdateEvent {
    order_id: number;
    order_code: string;
    status: number;
    payment_status: string;
    message?: string;
}

interface UseTransactionWebSocketProps {
    orderCode: string | undefined;
    onTransactionUpdate: (event: TransactionUpdateEvent) => void;
    enabled?: boolean;
}

export function useTransactionWebSocket({
    orderCode,
    onTransactionUpdate,
    enabled = true,
}: UseTransactionWebSocketProps) {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        // Check if echo is initialized
        if (!echo) {
            if (enabled && import.meta.env.MODE === 'development') {
                console.warn('[TransactionWebSocket] Echo not initialized. Check Pusher configuration in .env.local');
            }
            return;
        }

        if (!enabled || !orderCode) {
            return;
        }

        const channelName = `order-completed.${orderCode}`;

        try {
            // Subscribe to the private channel
            const channel = echo.private(channelName);
            channelRef.current = channel;

            // Listen for the order-completed event
            channel.listen('.orderCompleted', (event: any) => {


                // Extract order data from the event
                const order = event.order;

                if (order && order.code === orderCode) {


                    // Transform to expected format
                    const transactionUpdate: TransactionUpdateEvent = {
                        order_id: order.id,
                        order_code: order.code,
                        status: order.status,
                        payment_status: order.status === 3 ? 'paid' : order.status === 4 ? 'completed' : 'pending',
                        message: order.status === 4 ? 'Pesanan selesai!' : 'Status pesanan diperbarui'
                    };

                    onTransactionUpdate(transactionUpdate);
                }
            });

            // Handle connection errors
            channel.error((error: any) => {
                console.error('[TransactionWebSocket] Channel error:', error);
            });
        } catch (error) {
            console.error('[TransactionWebSocket] Failed to subscribe:', error);
        }

        // Cleanup on unmount
        return () => {
            if (channelRef.current && echo) {
                try {

                    echo.leave(channelName);
                } catch (error) {
                    console.error('[TransactionWebSocket] Error leaving channel:', error);
                }
                channelRef.current = null;
            }
        };
    }, [orderCode, onTransactionUpdate, enabled]);

    return {
        isConnected: !!channelRef.current,
    };
}
