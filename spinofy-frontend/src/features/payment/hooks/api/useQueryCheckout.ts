import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { CheckoutAPI } from '@/features/payment/api/checkout.api';
import type { PaymentOrderResponse } from '@/features/payment/types/PaymentLog';

const ONE_MINUTE = 1000 * 60;
const TEN_MINUTES = 1000 * 60 * 10;

export const checkoutQueryKeys = {
    root: () => ['checkout'] as const,
    detail: (slug: string, orderCode: number | string) => ['checkout', slug, orderCode] as const,
} as const;

const ensureCheckoutSuccess = (
    response: PaymentOrderResponse,
    slug: string,
    orderCode: number | string
) => {
    if (response.status === 'error') {
        throw new Error(
            response.message || `Failed to load checkout data for ${slug}/${orderCode}`
        );
    }
    return response;
};

const fetchCheckout = async (slug: string, orderCode: number) => {
    const response = await CheckoutAPI.getDataCheckoutOrders(slug, orderCode);
    return ensureCheckoutSuccess(response, slug, orderCode);
};

const baseQueryConfig = {
    staleTime: ONE_MINUTE,
    gcTime: TEN_MINUTES,
    refetchOnWindowFocus: false,
    retry: 1,
} as const;

export const checkoutQueryOptions = (slug: string, orderCode: number) =>
    queryOptions<
        PaymentOrderResponse,
        Error,
        PaymentOrderResponse,
        ReturnType<typeof checkoutQueryKeys.detail>
    >({
        queryKey: checkoutQueryKeys.detail(slug, orderCode),
        queryFn: () => fetchCheckout(slug, orderCode),
        ...baseQueryConfig,
    });

type CheckoutQueryKey = ReturnType<typeof checkoutQueryKeys.detail>;
type CheckoutQueryOptions = Omit<
    UseQueryOptions<PaymentOrderResponse, Error, PaymentOrderResponse, CheckoutQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryCheckout = (
    slug?: string | null,
    orderCode?: number | null,
    options?: CheckoutQueryOptions
) => {
    if (!slug || orderCode == null) {
        return useQuery<PaymentOrderResponse, Error, PaymentOrderResponse, CheckoutQueryKey>({
            queryKey: checkoutQueryKeys.detail(slug ?? '', orderCode ?? 'missing'),
            queryFn: async () => {
                throw new Error('Outlet slug and order code are required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<PaymentOrderResponse, Error, PaymentOrderResponse, CheckoutQueryKey>({
        ...checkoutQueryOptions(slug, orderCode),
        ...options,
    });
};

export const prefetchCheckout = (queryClient: QueryClient, slug: string, orderCode: number) =>
    queryClient.prefetchQuery(checkoutQueryOptions(slug, orderCode));
