import { useEffect, useRef } from 'react';
import echo from '@/lib/echo';

interface OrderUpdateData {
    order: any;
    message?: string;
}

interface UseOrderUpdatesOptions {
    outletId: string | number;
    onOrderUpdate?: (data: OrderUpdateData) => void;
    enabled?: boolean;
}

export const useOrderUpdates = ({
    outletId,
    onOrderUpdate,
    enabled = true,
}: UseOrderUpdatesOptions) => {
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!enabled || !outletId || !echo) {
            return;
        }

        try {
            const channelName = `new-order-line-created.${outletId}`;

            // Subscribe to the channel
            channelRef.current = echo.channel(channelName);

            // Listen for the event
            channelRef.current.listen('.new-order-line-created', (data: OrderUpdateData) => {
                onOrderUpdate?.(data);
            });


            // Cleanup
            return () => {
                if (channelRef.current && echo) {
                    channelRef.current.stopListening('.new-order-line-created');
                    echo.leaveChannel(channelName);
                    channelRef.current = null;
                }
            };
        } catch (error) {
            console.error('Error setting up order updates:', error);
        }
    }, [outletId, enabled, onOrderUpdate]);

    return {
        isConnected: !!channelRef.current,
    };
};
