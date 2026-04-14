import { useEffect, useRef } from 'react';
import echo from '@/lib/echo';

interface PaymentUpdateEvent {
    order_id: number;
    order_code: string;
    status: number;
    payment_status: string;
    message?: string;
}

interface UsePaymentWebSocketProps {
    outletId: string | undefined;
    orderCode: string | undefined;
    onPaymentUpdate: (event: PaymentUpdateEvent) => void;
    enabled?: boolean;
}

export function usePaymentWebSocket({
    outletId,
    orderCode,
    onPaymentUpdate,
    enabled = true,
}: UsePaymentWebSocketProps) {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        // Check if echo is initialized
        if (!echo) {
            if (enabled && import.meta.env.MODE === 'development') {
                console.warn('[WebSocket] Echo not initialized. Check Pusher configuration in .env.local');
            }
            return;
        }

        if (!enabled || !outletId || !orderCode) {
            return;
        }

        const channelName = `new-order-line-created.${outletId}`;

        try {
            // Subscribe to the private channel
            const channel = echo.private(channelName);
            channelRef.current = channel;

            // Listen for the event
            channel.listen('.newOrderLineCreated', (event: any) => {


                // Extract order data from the event
                const order = event.order;


                // Only process if it's for our current order
                if (order && order.code === orderCode) {


                    // Transform to expected format
                    const paymentUpdate: PaymentUpdateEvent = {
                        order_id: order.id,
                        order_code: order.code,
                        status: order.status,
                        payment_status: order.status === 3 ? 'paid' : 'pending',
                        message: order.status === 3 ? 'Pembayaran berhasil!' : 'Status pesanan diperbarui'
                    };


                    onPaymentUpdate(paymentUpdate);
                }
            });
        } catch (error) {
            console.error('[WebSocket] Failed to subscribe:', error);
        }

        // Cleanup on unmount
        return () => {
            if (channelRef.current && echo) {
                try {
               
                    echo.leave(channelName);
                } catch (error) {
                    console.error('[WebSocket] Error leaving channel:', error);
                }
                channelRef.current = null;
            }
        };
    }, [outletId, orderCode, onPaymentUpdate, enabled]);

    return {
        isConnected: !!channelRef.current,
    };
}
