import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { VoucherAPI } from '@/features/vouchers/api/voucher.api';
import type { UserVoucherListResponse } from '@/features/vouchers/types/UserVoucher';
import type { VouchersResponse } from '@/features/vouchers/types/Voucher';

const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const voucherQueryKeys = {
    root: () => ['vouchers'] as const,
    userList: (slug: string) => ['vouchers', 'user', slug] as const,
    userProduct: (slug: string, productIds: number[]) => ['vouchers', 'user', 'product', slug, productIds] as const,
    orderList: (slug: string, orderCode: string) => ['vouchers', 'order', slug, orderCode] as const,
    rewardPoints: (slug: string) => ['vouchers', 'reward', 'points', slug] as const,
    rewardProducts: (slug: string) => ['vouchers', 'reward', 'products', slug] as const,
    rewardGeneral: (slug: string) => ['vouchers', 'reward', 'general', slug] as const,
} as const;

const ensureUserVoucherSuccess = (
    response: UserVoucherListResponse,
    slug: string,
    context: 'user' | 'order',
    orderCode?: string
) => {
    if (response.status === 'error') {
        const scope = context === 'order' && orderCode
            ? `order ${orderCode} for ${slug}`
            : `user vouchers for ${slug}`;
        throw new Error(response.message || `Failed to load ${scope}`);
    }

    return response;
};

const ensureRewardVoucherSuccess = (
    response: VouchersResponse,
    slug: string,
    variant: 'points' | 'products' | 'general'
) => {
    if (response.status === 'error') {
        throw new Error(
            response.message || `Failed to load ${variant} reward vouchers for ${slug}`
        );
    }

    return response;
};

const fetchUserVoucherList = async (slug: string) => {
    const response = await VoucherAPI.getListVoucherUser(slug);
    return ensureUserVoucherSuccess(response, slug, 'user');
};

const fetchOrderVoucherList = async (slug: string, orderCode: string) => {
    const response = await VoucherAPI.listVouchersOrder(slug, orderCode);
    return ensureUserVoucherSuccess(response, slug, 'order', orderCode);
};

const fetchRewardVoucherList = async (slug: string) => {
    const response = await VoucherAPI.listVouchersPoint(slug);
    return ensureRewardVoucherSuccess(response, slug, 'points');
};

const fetchRewardProductVoucherList = async (slug: string) => {
    const response = await VoucherAPI.listVouchersProductPoint(slug);
    return ensureRewardVoucherSuccess(response, slug, 'products');
};

const fetchRewardGeneralVoucherList = async (slug: string) => {
    const response = await VoucherAPI.listVouchersGeneralPoint(slug);
    return ensureRewardVoucherSuccess(response, slug, 'general');
};

const fetchUserVoucherListByProducts = async (slug: string, productIds: number[]) => {
    const response = await VoucherAPI.getListVoucherUserProduct(slug, productIds);
    return ensureUserVoucherSuccess(response, slug, 'user');
};

const voucherBaseConfig = {
    staleTime: ONE_MINUTE,
    gcTime: THIRTY_MINUTES,
    refetchOnWindowFocus: false,
} as const;

const rewardVoucherConfig = {
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    refetchOnWindowFocus: false,
} as const;

export const voucherUserListQueryOptions = (slug: string) =>
    queryOptions<
        UserVoucherListResponse,
        Error,
        UserVoucherListResponse,
        ReturnType<typeof voucherQueryKeys.userList>
    >({
        queryKey: voucherQueryKeys.userList(slug),
        queryFn: () => fetchUserVoucherList(slug),
        ...voucherBaseConfig,
    });

export const voucherOrderListQueryOptions = (slug: string, orderCode: string) =>
    queryOptions<
        UserVoucherListResponse,
        Error,
        UserVoucherListResponse,
        ReturnType<typeof voucherQueryKeys.orderList>
    >({
        queryKey: voucherQueryKeys.orderList(slug, orderCode),
        queryFn: () => fetchOrderVoucherList(slug, orderCode),
        ...voucherBaseConfig,
    });

export const voucherUserProductQueryOptions = (slug: string, productIds: number[]) =>
    queryOptions<
        UserVoucherListResponse,
        Error,
        UserVoucherListResponse,
        ReturnType<typeof voucherQueryKeys.userProduct>
    >({
        queryKey: voucherQueryKeys.userProduct(slug, productIds),
        queryFn: () => fetchUserVoucherListByProducts(slug, productIds),
        ...voucherBaseConfig,
    });

export const rewardVoucherListQueryOptions = (slug: string) =>
    queryOptions<
        VouchersResponse,
        Error,
        VouchersResponse,
        ReturnType<typeof voucherQueryKeys.rewardPoints>
    >({
        queryKey: voucherQueryKeys.rewardPoints(slug),
        queryFn: () => fetchRewardVoucherList(slug),
        ...rewardVoucherConfig,
    });

export const rewardProductVoucherListQueryOptions = (slug: string) =>
    queryOptions<
        VouchersResponse,
        Error,
        VouchersResponse,
        ReturnType<typeof voucherQueryKeys.rewardProducts>
    >({
        queryKey: voucherQueryKeys.rewardProducts(slug),
        queryFn: () => fetchRewardProductVoucherList(slug),
        ...rewardVoucherConfig,
    });

export const rewardGeneralVoucherListQueryOptions = (slug: string) =>
    queryOptions<
        VouchersResponse,
        Error,
        VouchersResponse,
        ReturnType<typeof voucherQueryKeys.rewardGeneral>
    >({
        queryKey: voucherQueryKeys.rewardGeneral(slug),
        queryFn: () => fetchRewardGeneralVoucherList(slug),
        ...rewardVoucherConfig,
    });

type VoucherUserListQueryKey = ReturnType<typeof voucherQueryKeys.userList>;
type VoucherOrderListQueryKey = ReturnType<typeof voucherQueryKeys.orderList>;
type VoucherUserProductListQueryKey = ReturnType<typeof voucherQueryKeys.userProduct>;
type RewardVoucherListQueryKey = ReturnType<typeof voucherQueryKeys.rewardPoints>;
type RewardProductVoucherListQueryKey = ReturnType<typeof voucherQueryKeys.rewardProducts>;
type RewardGeneralVoucherListQueryKey = ReturnType<typeof voucherQueryKeys.rewardGeneral>;

type VoucherUserListQueryOptions = Omit<
    UseQueryOptions<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherUserListQueryKey>,
    'queryKey' | 'queryFn'
>;

type VoucherOrderListQueryOptions = Omit<
    UseQueryOptions<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherOrderListQueryKey>,
    'queryKey' | 'queryFn'
>;

type VoucherUserProductListQueryOptions = Omit<
    UseQueryOptions<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherUserProductListQueryKey>,
    'queryKey' | 'queryFn'
>;

type RewardVoucherListQueryOptions = Omit<
    UseQueryOptions<VouchersResponse, Error, VouchersResponse, RewardVoucherListQueryKey>,
    'queryKey' | 'queryFn'
>;

type RewardProductVoucherListQueryOptions = Omit<
    UseQueryOptions<VouchersResponse, Error, VouchersResponse, RewardProductVoucherListQueryKey>,
    'queryKey' | 'queryFn'
>;

type RewardGeneralVoucherListQueryOptions = Omit<
    UseQueryOptions<VouchersResponse, Error, VouchersResponse, RewardGeneralVoucherListQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryUserVouchers = (
    slug?: string | null,
    options?: VoucherUserListQueryOptions
) => {
    if (!slug) {
        return useQuery<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherUserListQueryKey>({
            queryKey: voucherQueryKeys.userList(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherUserListQueryKey>({
        ...voucherUserListQueryOptions(slug),
        ...options,
    });
};

export const useQueryOrderVouchers = (
    slug?: string | null,
    orderCode?: string | null,
    options?: VoucherOrderListQueryOptions
) => {
    if (!slug || !orderCode) {
        return useQuery<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherOrderListQueryKey>({
            queryKey: voucherQueryKeys.orderList(slug ?? '', orderCode ?? 'missing'),
            queryFn: async () => {
                throw new Error('Outlet slug and order code are required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherOrderListQueryKey>({
        ...voucherOrderListQueryOptions(slug, orderCode),
        ...options,
    });
};

export const useQueryUserProductVouchers = (
    slug?: string | null,
    productIds?: number[] | null,
    options?: VoucherUserProductListQueryOptions
) => {
    if (!slug || !productIds || productIds.length === 0) {
        return useQuery<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherUserProductListQueryKey>({
            queryKey: voucherQueryKeys.userProduct(slug ?? '', productIds ?? []),
            queryFn: async () => {
                throw new Error('Outlet slug and product ids are required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<UserVoucherListResponse, Error, UserVoucherListResponse, VoucherUserProductListQueryKey>({
        ...voucherUserProductQueryOptions(slug, productIds),
        ...options,
    });
};

export const useQueryRewardVouchers = (
    slug?: string | null,
    options?: RewardVoucherListQueryOptions
) => {
    if (!slug) {
        return useQuery<VouchersResponse, Error, VouchersResponse, RewardVoucherListQueryKey>({
            queryKey: voucherQueryKeys.rewardPoints(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<VouchersResponse, Error, VouchersResponse, RewardVoucherListQueryKey>({
        ...rewardVoucherListQueryOptions(slug),
        ...options,
    });
};

export const useQueryRewardProductVouchers = (
    slug?: string | null,
    options?: RewardProductVoucherListQueryOptions
) => {
    if (!slug) {
        return useQuery<VouchersResponse, Error, VouchersResponse, RewardProductVoucherListQueryKey>({
            queryKey: voucherQueryKeys.rewardProducts(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<VouchersResponse, Error, VouchersResponse, RewardProductVoucherListQueryKey>({
        ...rewardProductVoucherListQueryOptions(slug),
        ...options,
    });
};

export const useQueryRewardGeneralVouchers = (
    slug?: string | null,
    options?: RewardGeneralVoucherListQueryOptions
) => {
    if (!slug) {
        return useQuery<VouchersResponse, Error, VouchersResponse, RewardGeneralVoucherListQueryKey>({
            queryKey: voucherQueryKeys.rewardGeneral(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<VouchersResponse, Error, VouchersResponse, RewardGeneralVoucherListQueryKey>({
        ...rewardGeneralVoucherListQueryOptions(slug),
        ...options,
    });
};

export const prefetchUserVouchers = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(voucherUserListQueryOptions(slug));

export const prefetchOrderVouchers = (
    queryClient: QueryClient,
    slug: string,
    orderCode: string
) => queryClient.prefetchQuery(voucherOrderListQueryOptions(slug, orderCode));

export const prefetchRewardVouchers = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(rewardVoucherListQueryOptions(slug));

export const prefetchRewardProductVouchers = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(rewardProductVoucherListQueryOptions(slug));

export const prefetchUserProductVouchers = (queryClient: QueryClient, slug: string, productIds: number[]) =>
    queryClient.prefetchQuery(voucherUserProductQueryOptions(slug, productIds));

export const prefetchRewardGeneralVouchers = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(rewardGeneralVoucherListQueryOptions(slug));
