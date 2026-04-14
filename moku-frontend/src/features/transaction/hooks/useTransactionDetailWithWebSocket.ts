import { useCallback } from 'react';
import { useTransactionDetail } from './useTransactionDetail';
import { useTransactionWebSocket } from './useTransactionWebSocket';
import { toast } from 'sonner';


interface UseTransactionDetailWithWebSocketProps {
    transactionId: string;
    orderCode?: string;
    enableWebSocket?: boolean;
}

export const useTransactionDetailWithWebSocket = ({
    transactionId,
    orderCode,
    enableWebSocket = true,
}: UseTransactionDetailWithWebSocketProps) => {
    const transactionDetail = useTransactionDetail(transactionId);

    // Handle WebSocket transaction updates
    const handleTransactionUpdate = useCallback(
        async (event: any) => {
            // Show toast notification
            toast.success('Status Pesanan Diperbarui', {
                description: event.message || 'Pesanan Anda telah diperbarui',
            });

            // Invalidate and refetch transaction detail
            await transactionDetail.invalidateDetail();
        },
        [transactionDetail]
    );

    // Subscribe to WebSocket updates
    const { isConnected } = useTransactionWebSocket({
        orderCode: orderCode || transactionDetail.transaction?.code,
        onTransactionUpdate: handleTransactionUpdate,
        enabled: enableWebSocket && !!orderCode,
    });

    return {
        ...transactionDetail,
        isWebSocketConnected: isConnected,
    };
};
