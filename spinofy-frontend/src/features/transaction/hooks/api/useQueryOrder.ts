import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { OrderAPI } from '@/features/transaction/api/order.api';
import type { OrderResponse } from '@/features/cart/types/Order';

const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const orderQueryKeys = {
    root: () => ['orders'] as const,
    list: (slug: string) => ['orders', slug] as const,
    detail: (slug: string, orderCode: number | string) => ['orders', slug, orderCode] as const,
} as const;

const ensureOrderListSuccess = (response: OrderResponse, slug: string) => {
    if (response.status === 'error') {
        throw new Error(response.message || `Failed to load orders for ${slug}`);
    }
    return response;
};

const ensureOrderDetailSuccess = (
    response: OrderResponse,
    slug: string,
    orderCode: number | string
) => {
    if (response.status === 'error') {
        throw new Error(
            response.message || `Failed to load order ${orderCode} for ${slug}`
        );
    }
    return response;
};

const fetchOrderList = async (slug: string) => {
    const response = await OrderAPI.getListOrders(slug);
    return ensureOrderListSuccess(response, slug);
};

const fetchOrderDetail = async (slug: string, orderCode: number) => {
    const response = await OrderAPI.getOrderDetails(slug, orderCode);
    return ensureOrderDetailSuccess(response, slug, orderCode);
};

const listQueryConfig = {
    staleTime: ONE_MINUTE,
    gcTime: THIRTY_MINUTES,
    refetchOnWindowFocus: false,
} as const;

const detailQueryConfig = {
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    refetchOnWindowFocus: false,
} as const;

export const orderListQueryOptions = (slug: string) =>
    queryOptions<
        OrderResponse,
        Error,
        OrderResponse,
        ReturnType<typeof orderQueryKeys.list>
    >({
        queryKey: orderQueryKeys.list(slug),
        queryFn: () => fetchOrderList(slug),
        ...listQueryConfig,
    });

export const orderDetailQueryOptions = (slug: string, orderCode: number) =>
    queryOptions<
        OrderResponse,
        Error,
        OrderResponse,
        ReturnType<typeof orderQueryKeys.detail>
    >({
        queryKey: orderQueryKeys.detail(slug, orderCode),
        queryFn: () => fetchOrderDetail(slug, orderCode),
        ...detailQueryConfig,
    });

type OrderListQueryKey = ReturnType<typeof orderQueryKeys.list>;
type OrderDetailQueryKey = ReturnType<typeof orderQueryKeys.detail>;

type OrderListQueryOptions = Omit<
    UseQueryOptions<OrderResponse, Error, OrderResponse, OrderListQueryKey>,
    'queryKey' | 'queryFn'
>;

type OrderDetailQueryOptions = Omit<
    UseQueryOptions<OrderResponse, Error, OrderResponse, OrderDetailQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryOrders = (
    slug?: string | null,
    options?: OrderListQueryOptions
) => {
    if (!slug) {
        return useQuery<OrderResponse, Error, OrderResponse, OrderListQueryKey>({
            queryKey: orderQueryKeys.list(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<OrderResponse, Error, OrderResponse, OrderListQueryKey>({
        ...orderListQueryOptions(slug),
        ...options,
    });
};

export const useQueryOrderDetail = (
    slug?: string | null,
    orderCode?: number | null,
    options?: OrderDetailQueryOptions
) => {
    if (!slug || orderCode == null) {
        return useQuery<OrderResponse, Error, OrderResponse, OrderDetailQueryKey>({
            queryKey: orderQueryKeys.detail(slug ?? '', orderCode ?? 'missing'),
            queryFn: async () => {
                throw new Error('Outlet slug and order code are required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<OrderResponse, Error, OrderResponse, OrderDetailQueryKey>({
        ...orderDetailQueryOptions(slug, orderCode),
        ...options,
    });
};

export const prefetchOrders = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(orderListQueryOptions(slug));

export const prefetchOrderDetail = (queryClient: QueryClient, slug: string, orderCode: number) =>
    queryClient.prefetchQuery(orderDetailQueryOptions(slug, orderCode));
