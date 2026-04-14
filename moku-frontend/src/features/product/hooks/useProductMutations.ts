import { useQueryClient } from '@tanstack/react-query';

import type { StoreProductResponse, OrderResponse, Order } from '@/features/cart/types/Order';
import {
    useStorePaymentProductMutation,
    useUpdateOrderProductMutation,
    type StorePaymentProductVariables,
    type UpdateOrderProductVariables,
    type PaymentMutationOptions,
} from '@/features/payment/hooks/api/useMutationPayment';
import { paymentQueryKeys } from '@/features/payment/hooks/api/useQueryPayment';

export interface ProductMutationHandlers {
    onUpdateSuccess?: () => void;
    onUpdateError?: (error: Error) => void;
    onStoreSuccess?: (data: any) => void;
    onStoreError?: (error: Error) => void;
}

export const useProductMutations = (handlers?: ProductMutationHandlers) => {
    const queryClient = useQueryClient();

    const patchPendingOrder = (slug: string | undefined, nextOrder?: Order) => {
        if (!slug || !nextOrder) {
            return;
        }

        queryClient.setQueryData<OrderResponse | undefined>(paymentQueryKeys.list(slug), (existing) => {
            const previousOrders = existing?.data?.order ?? [];
            const hasExistingOrder = previousOrders.some((order) => order?.id === nextOrder.id);
            const updatedOrders = hasExistingOrder
                ? previousOrders.map((order) => (order?.id === nextOrder.id ? nextOrder : order)).filter(Boolean)
                : [nextOrder, ...previousOrders].filter(Boolean);

            return {
                status: existing?.status ?? 'success',
                message: existing?.message ?? '',
                data: {
                    ...existing?.data,
                    order: updatedOrders,
                },
            } as OrderResponse;
        });
    };
    const updateOptions: PaymentMutationOptions<OrderResponse, UpdateOrderProductVariables> = {
        onSuccess: async () => {
            handlers?.onUpdateSuccess?.();
        },
        onError: (error) => {
            console.error('Update product failed:', error);
            handlers?.onUpdateError?.(error);
        },
    };

    const updateProductMutation = useUpdateOrderProductMutation(updateOptions);

    const storeOptions: PaymentMutationOptions<StoreProductResponse, StorePaymentProductVariables> = {
        invalidateTargets: () => [],
        onSuccess: async (data, variables) => {
            const pendingOrder = data?.data?.data;
            patchPendingOrder(variables.outletSlug, pendingOrder);
            handlers?.onStoreSuccess?.(data);
        },
        onError: (error) => {
            console.error('Store product failed:', error);
            handlers?.onStoreError?.(error);
        },
    };

    const storeProductMutation = useStorePaymentProductMutation(storeOptions);

    return {
        updateProductMutation,
        storeProductMutation,
    };
};
