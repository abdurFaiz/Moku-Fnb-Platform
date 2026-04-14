import { useMemo } from 'react';
import {
    queryOptions,
    useQuery,
    useQueryClient,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { OutletAPI } from '@/features/outlets/api/outlet.api';
import type { Outlet, OutletResponse, SingleOutletResponse } from '@/features/outlets/types/Outlet';

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const outletQueryKeys = {
    root: () => ['outlets'] as const,
    list: () => ['outlets', 'list'] as const,
    detail: (slug: string) => ['outlets', 'detail', slug] as const,
} as const;

const ensureListSuccess = (response: OutletResponse) => {
    if (response.status === 'error') {
        throw new Error(response.message || 'Failed to get outlets information, refresh the page');
    }
    return response.data.outlets;
};

const ensureDetailSuccess = (response: SingleOutletResponse, slug: string) => {
    if (response.status === 'error') {
        throw new Error(response.message || `Failed to get outlet information for ${slug}`);
    }
    return response.data.outlet;
};

export const outletsQueryOptions = () =>
    queryOptions({
        queryKey: outletQueryKeys.list(),
        queryFn: async () => {
            const response = await OutletAPI.getListOutlets();
            return ensureListSuccess(response);
        },
        staleTime: FIVE_MINUTES,
        gcTime: THIRTY_MINUTES,
        refetchOnWindowFocus: false,
    });

export const outletDetailQueryOptions = (slug: string) =>
    queryOptions({
        queryKey: outletQueryKeys.detail(slug),
        queryFn: async () => {
            const response = await OutletAPI.getOutlet(slug);
            return ensureDetailSuccess(response, slug);
        },
        staleTime: FIVE_MINUTES,
        gcTime: THIRTY_MINUTES,
        refetchOnWindowFocus: false,
    });

type OutletsQueryOptions = Omit<
    UseQueryOptions<Outlet[], Error, Outlet[], ReturnType<typeof outletQueryKeys.list>>,
    'queryKey' | 'queryFn'
>;

type OutletDetailQueryOptions = Omit<
    UseQueryOptions<Outlet, Error, Outlet, ReturnType<typeof outletQueryKeys.detail>>,
    'queryKey' | 'queryFn'
>;

export const useOutlets = (options?: OutletsQueryOptions) =>
    useQuery({
        ...outletsQueryOptions(),
        ...options,
    });

export const useQueryOutlet = (propSlug?: string, options?: OutletDetailQueryOptions) => {
    const params = useParams<{ outletSlug: string }>();
    const slug = propSlug ?? params.outletSlug;
    const queryClient = useQueryClient();

    const placeholderData = useMemo(() => {
        if (!slug) return undefined;
        // Allow the detail query to reuse the already cached list item when available.
        return () => {
            const list = queryClient.getQueryData<Outlet[]>(outletQueryKeys.list());
            return list?.find((outlet) => outlet.slug === slug);
        };
    }, [queryClient, slug]);

    if (!slug) {
        return useQuery({
            queryKey: outletQueryKeys.detail(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery({
        ...outletDetailQueryOptions(slug),
        ...(placeholderData ? { placeholderData } : {}),
        ...options,
    });
};

export const prefetchOutlets = (queryClient: QueryClient) =>
    queryClient.prefetchQuery(outletsQueryOptions());

export const prefetchOutlet = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(outletDetailQueryOptions(slug));