import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { OrderAPI } from '@/features/transaction/api/order.api';
import { orderQueryKeys } from '@/features/transaction/hooks/api/useQueryOrder';
import { paymentQueryKeys } from '@/features/payment/hooks/api/useQueryPayment';
import type { OrderResponse } from '@/features/cart/types/Order';
import type { DuplicateOrderParams } from '@/features/cart/types/OrderDuplication';

export type DuplicateOrderMutationVariables = DuplicateOrderParams & {
    outletSlug: string;
};

type DuplicateOrderMutationOptions = Omit<
    UseMutationOptions<OrderResponse, Error, DuplicateOrderMutationVariables, unknown>,
    'mutationFn'
>;

export const useMutationDuplicateOrder = (
    options?: DuplicateOrderMutationOptions,
) => {
    const queryClient = useQueryClient();
    const { onSuccess: userOnSuccess, ...restOptions } = options ?? {};

    return useMutation<OrderResponse, Error, DuplicateOrderMutationVariables, unknown>({
        mutationFn: ({ outletSlug, orderCode }) =>
            OrderAPI.storeDuplicateOrder(outletSlug, { code: orderCode }),
        onSuccess: async (data, variables, context, mutation) => {
            await Promise.allSettled([
                queryClient.invalidateQueries({
                    queryKey: orderQueryKeys.list(variables.outletSlug),
                }),
                queryClient.invalidateQueries({
                    queryKey: paymentQueryKeys.list(variables.outletSlug),
                }),
            ]);

            if (userOnSuccess) {
                await Promise.resolve(userOnSuccess(data, variables, context, mutation));
            }
        },
        ...restOptions,
    });
};
