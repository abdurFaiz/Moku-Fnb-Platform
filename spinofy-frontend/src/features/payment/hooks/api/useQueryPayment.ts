import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { PaymentAPI } from '@/features/checkout/api/payment.api';
import type { OrderResponse } from '@/features/cart/types/Order';

const THIRTY_SECONDS = 1000 * 60 * 5
const FIVE_MINUTES = 1000 * 60 * 15;

export const paymentQueryKeys = {
    root: () => ['payments'] as const,
    list: (slug: string) => ['payments', slug] as const,
} as const;

const fetchPaymentList = async (slug: string): Promise<OrderResponse> => {
    const response = await PaymentAPI.getListPayment(slug);
    if (response.status === 'error') {
        throw new Error(response.message || `Failed to get payment information for ${slug}`);
    }
    return response;
};

const baseQueryConfig = {
    staleTime: THIRTY_SECONDS,
    gcTime: FIVE_MINUTES,
    refetchOnWindowFocus: true,
} as const;

export const paymentQueryOptions = (slug: string) =>
    queryOptions<OrderResponse>({
        queryKey: paymentQueryKeys.list(slug),
        queryFn: () => fetchPaymentList(slug),
        ...baseQueryConfig,
    });

type PaymentQueryKey = ReturnType<typeof paymentQueryKeys.list>;
type PaymentQueryOptions = Omit<
    UseQueryOptions<OrderResponse, Error, OrderResponse, PaymentQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryPayment = (slug?: string | null, options?: PaymentQueryOptions) => {
    if (!slug) {
        return useQuery<OrderResponse, Error, OrderResponse, PaymentQueryKey>({
            queryKey: paymentQueryKeys.list(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<OrderResponse, Error, OrderResponse, PaymentQueryKey>({
        queryKey: paymentQueryKeys.list(slug),
        queryFn: () => fetchPaymentList(slug),
        ...baseQueryConfig,
        ...options,
    });
};

export const prefetchPayment = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(paymentQueryOptions(slug));
