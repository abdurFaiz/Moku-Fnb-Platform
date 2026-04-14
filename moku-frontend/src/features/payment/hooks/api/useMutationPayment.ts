import {
    useMutation,
    useQueryClient,
    type UseMutationOptions,
    type QueryClient,
    type QueryKey,
} from '@tanstack/react-query';

import { PaymentAPI } from '@/features/checkout/api/payment.api';
import { DownloadBarcodeAPI } from '@/features/payment/api/downloadQR.api';
import { orderQueryKeys } from '@/features/transaction/hooks/api/useQueryOrder';
import { paymentQueryKeys } from '@/features/payment/hooks/api/useQueryPayment';
import type { CheckoutRequestPayload } from '@/features/checkout/types/Checkout';
import type { OrderResponse, StoreOrderPayload, StoreProductResponse } from '@/features/cart/types/Order';

type PaymentInvalidateTarget =
    | { type: 'payment'; slug: string }
    | { type: 'orderList'; slug: string }
    | { type: 'orderDetail'; slug: string; orderCode: number | string }
    | { type: 'custom'; queryKey: QueryKey };

type PaymentMutationContext<TData, TVariables> = {
    data: TData;
    variables: TVariables;
};

type PaymentInvalidateResolver<TData, TVariables> =
    | PaymentInvalidateTarget[]
    | ((context: PaymentMutationContext<TData, TVariables>) => PaymentInvalidateTarget[] | null | undefined);

export interface PaymentMutationOptions<
    TData,
    TVariables extends { outletSlug: string },
    TContext = unknown,
> extends Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn' | 'onSuccess'> {
    invalidateTargets?: PaymentInvalidateResolver<TData, TVariables>;
    onSuccess?: (
        data: TData,
        variables: TVariables,
        context: TContext,
    ) => void | Promise<void>;
}

const defaultInvalidateResolver = <TData, TVariables extends { outletSlug: string }>(
    context: PaymentMutationContext<TData, TVariables>,
): PaymentInvalidateTarget[] => [
        { type: 'payment', slug: context.variables.outletSlug },
    ];

const normalizeTargets = <TData, TVariables extends { outletSlug: string }>(
    context: PaymentMutationContext<TData, TVariables>,
    resolver?: PaymentInvalidateResolver<TData, TVariables>,
) => {
    const resolved = resolver
        ? typeof resolver === 'function'
            ? resolver(context)
            : resolver
        : defaultInvalidateResolver(context);

    if (!resolved || resolved.length === 0) {
        return [] as PaymentInvalidateTarget[];
    }

    return resolved.filter((target): target is PaymentInvalidateTarget => Boolean(target));
};

const invalidateTargets = (
    queryClient: QueryClient,
    targets: PaymentInvalidateTarget[],
) => {
    const paymentSlugs = new Set<string>();
    const orderListSlugs = new Set<string>();
    const orderDetailTargets: Array<{ slug: string; orderCode: number | string }> = [];
    const customKeys: QueryKey[] = [];

    for (const target of targets) {
        if (!target) continue;

        switch (target.type) {
            case 'payment':
                paymentSlugs.add(target.slug);
                break;
            case 'orderList':
                orderListSlugs.add(target.slug);
                break;
            case 'orderDetail':
                orderDetailTargets.push({ slug: target.slug, orderCode: target.orderCode });
                break;
            case 'custom':
                customKeys.push(target.queryKey);
                break;
            default:
                break;
        }
    }

    const tasks: Array<Promise<unknown>> = [];

    if (paymentSlugs.size > 0) {
        tasks.push(
            queryClient.invalidateQueries({ queryKey: paymentQueryKeys.root() }),
        );

        for (const slug of paymentSlugs) {
            tasks.push(
                queryClient.invalidateQueries({ queryKey: paymentQueryKeys.list(slug) }),
            );
        }
    }

    for (const slug of orderListSlugs) {
        tasks.push(
            queryClient.invalidateQueries({ queryKey: orderQueryKeys.list(slug) }),
        );
    }

    for (const detail of orderDetailTargets) {
        tasks.push(
            queryClient.invalidateQueries({
                queryKey: orderQueryKeys.detail(detail.slug, detail.orderCode),
            }),
        );
    }

    for (const key of customKeys) {
        tasks.push(
            queryClient.invalidateQueries({ queryKey: key }),
        );
    }

    if (tasks.length === 0) {
        return Promise.resolve();
    }

    return Promise.allSettled(tasks);
};

export const usePaymentMutation = <
    TData,
    TVariables extends { outletSlug: string },
    TContext = unknown,
>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: PaymentMutationOptions<TData, TVariables, TContext>,
) => {
    const queryClient = useQueryClient();
    const { invalidateTargets: resolver, onSuccess, ...restOptions } = options ?? {};

    return useMutation<TData, Error, TVariables, TContext>({
        mutationFn,
        onSuccess: async (data, variables, context) => {
            const contextPayload: PaymentMutationContext<TData, TVariables> = {
                data,
                variables,
            };

            const targets = normalizeTargets(contextPayload, resolver);
            if (targets.length > 0) {
                await invalidateTargets(queryClient, targets);
            }

            if (onSuccess) {
                await Promise.resolve(onSuccess(data, variables, context));
            }
        },
        ...restOptions,
    });
};

export interface UpdatePaymentStatusVariables {
    outletSlug: string;
    orderCode: string;
    payload: { method_id: number; table_number_id?: number };
}

export const useUpdatePaymentStatusMutation = (
    options?: PaymentMutationOptions<OrderResponse, UpdatePaymentStatusVariables>,
) =>
    usePaymentMutation<OrderResponse, UpdatePaymentStatusVariables>(
        ({ outletSlug, orderCode, payload }) =>
            PaymentAPI.updateStatusPayment(outletSlug, orderCode, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface StorePaymentProductVariables {
    outletSlug: string;
    payload: StoreOrderPayload;
}

export const useStorePaymentProductMutation = (
    options?: PaymentMutationOptions<StoreProductResponse, StorePaymentProductVariables>,
) =>
    usePaymentMutation<StoreProductResponse, StorePaymentProductVariables>(
        ({ outletSlug, payload }) => PaymentAPI.storeProduct(outletSlug, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface StoreQuantityProductVariables {
    outletSlug: string;
    orderCode: string;
    payload: { order_product_ids: number[]; quantities: number[] };
}

export const useStoreQuantityProductMutation = (
    options?: PaymentMutationOptions<OrderResponse, StoreQuantityProductVariables>,
) =>
    usePaymentMutation<OrderResponse, StoreQuantityProductVariables>(
        ({ outletSlug, orderCode, payload }) =>
            PaymentAPI.storeQuantityProduct(outletSlug, orderCode, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface UpdateOrderProductVariables {
    outletSlug: string;
    orderProductId: number;
    payload: StoreOrderPayload;
}

export const useUpdateOrderProductMutation = (
    options?: PaymentMutationOptions<OrderResponse, UpdateOrderProductVariables>,
) =>
    usePaymentMutation<OrderResponse, UpdateOrderProductVariables>(
        ({ outletSlug, orderProductId, payload }) =>
            PaymentAPI.updateOrderProduct(outletSlug, orderProductId, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface UpdateQuantityPaymentProductVariables {
    outletSlug: string;
    orderProductId: number;
    payload: { quantity: number };
}

export const useUpdateQuantityPaymentProductMutation = (
    options?: PaymentMutationOptions<OrderResponse, UpdateQuantityPaymentProductVariables>,
) =>
    usePaymentMutation<OrderResponse, UpdateQuantityPaymentProductVariables>(
        ({ outletSlug, orderProductId, payload }) =>
            PaymentAPI.updateQuantityPaymentProduct(outletSlug, orderProductId, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface DeleteOrderVariables {
    outletSlug: string;
    orderCode: string;
}

export const useDeleteOrderMutation = (
    options?: PaymentMutationOptions<OrderResponse, DeleteOrderVariables>,
) =>
    usePaymentMutation<OrderResponse, DeleteOrderVariables>(
        ({ outletSlug, orderCode }) => PaymentAPI.deleteOrder(outletSlug, orderCode),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface DeleteProductVariables {
    outletSlug: string;
    orderProductId: number;
}

export const useDeleteProductMutation = (
    options?: PaymentMutationOptions<OrderResponse, DeleteProductVariables>,
) =>
    usePaymentMutation<OrderResponse, DeleteProductVariables>(
        ({ outletSlug, orderProductId }) =>
            PaymentAPI.deleteProduct(outletSlug, orderProductId),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface UseVoucherVariables {
    outletSlug: string;
    voucherCode: string;
}

export const useApplyVoucherMutation = (
    options?: PaymentMutationOptions<OrderResponse, UseVoucherVariables>,
) =>
    usePaymentMutation<OrderResponse, UseVoucherVariables>(
        ({ outletSlug, voucherCode }) => PaymentAPI.useVoucher(outletSlug, voucherCode),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface DeleteVoucherVariables {
    outletSlug: string;
    orderCode: string;
}

export const useDeleteVoucherMutation = (
    options?: PaymentMutationOptions<OrderResponse, DeleteVoucherVariables>,
) =>
    usePaymentMutation<OrderResponse, DeleteVoucherVariables>(
        ({ outletSlug, orderCode }) => PaymentAPI.deleteUseVoucher(outletSlug, orderCode),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface ApplyVoucherCodeVariables {
    outletSlug: string;
    payload: { voucher_code: string };
}

export const useApplyVoucherCodeMutation = (
    options?: PaymentMutationOptions<OrderResponse, ApplyVoucherCodeVariables>,
) =>
    usePaymentMutation<OrderResponse, ApplyVoucherCodeVariables>(
        ({ outletSlug, payload }) =>
            PaymentAPI.useInputCodeVoucher(outletSlug, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface StoreCheckoutRequestVariables {
    outletSlug: string;
    payload: CheckoutRequestPayload;
}

export const useStoreCheckoutRequestMutation = (
    options?: PaymentMutationOptions<OrderResponse, StoreCheckoutRequestVariables>,
) =>
    usePaymentMutation<OrderResponse, StoreCheckoutRequestVariables>(
        ({ outletSlug, payload }) => PaymentAPI.storeCheckoutRequest(outletSlug, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'payment', slug: variables.outletSlug },
                { type: 'orderList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface DownloadBarcodeVariables {
    outletSlug: string;
    url: string;
}

export const useDownloadBarcodeMutation = (
    options?: PaymentMutationOptions<Blob, DownloadBarcodeVariables>,
) =>
    usePaymentMutation<Blob, DownloadBarcodeVariables>(
        ({ url }) => DownloadBarcodeAPI.downloadBarcodeImage(url),
        {
            invalidateTargets: () => [],
            ...options,
        },
    );
