import { useEffect, useRef, useCallback } from 'react';
import echo from '@/lib/echo';
import { toast } from 'sonner';

interface OrderUpdateEvent {
    order: {
        id: number;
        code: string;
        status: number;
        outlet_id: number;
    };
}

interface UseTransactionListWebSocketProps {
    outletId: string | number | undefined;
    onOrderUpdate: () => void;
    enabled?: boolean;
}

export function useTransactionListWebSocket({
    outletId,
    onOrderUpdate,
    enabled = true,
}: UseTransactionListWebSocketProps) {
    const channelRef = useRef<any>(null);
    const lastUpdateRef = useRef<number>(0);

    const handleOrderUpdate = useCallback((event: OrderUpdateEvent) => {
        const now = Date.now();

        lastUpdateRef.current = now;

        // Show subtle toast notification
        toast.success('Pesanan Diperbarui', {
            description: `Order #${event.order.code} telah diperbarui`,
            duration: 3000,
        });

        // Trigger list refresh
        onOrderUpdate();
    }, [onOrderUpdate]);

    useEffect(() => {
        // Check if echo is initialized
        if (!echo) {
            if (enabled && import.meta.env.MODE === 'development') {
                console.warn('[TransactionListWebSocket] Echo not initialized');
            }
            return;
        }

        if (!enabled || !outletId) {
            return;
        }

        const channelName = `new-order-line-created.${outletId}`;


        try {
            // Subscribe to the private channel
            const channel = echo.private(channelName);
            channelRef.current = channel;

            // Listen for order updates
            channel.listen('.newOrderLineCreated', (event: OrderUpdateEvent) => {
                handleOrderUpdate(event);
            });

            // Handle connection errors
            channel.error((error: any) => {
                console.error('[TransactionListWebSocket] Channel error:', error);
            });
        } catch (error) {
            console.error('[TransactionListWebSocket] Failed to subscribe:', error);
        }

        // Cleanup on unmount
        return () => {
            if (channelRef.current && echo) {
                try {
                    echo.leave(channelName);
                } catch (error) {
                    console.error('[TransactionListWebSocket] Error leaving channel:', error);
                }
                channelRef.current = null;
            }
        };
    }, [outletId, enabled, handleOrderUpdate]);

    return {
        isConnected: !!channelRef.current,
    };
}
