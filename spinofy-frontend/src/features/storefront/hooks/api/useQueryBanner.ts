import { queryOptions, useQuery, type QueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { BannerAPI } from '@/features/storefront/api/banner.api';
import type { Banner } from '@/features/storefront/types/Banner';

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const bannerQueryKeys = {
    root: () => ['banners'] as const,
    list: (slug: string) => ['banners', slug] as const,
} as const;

const mapBannerResponse = async (slug: string) => {
    const response = await BannerAPI.getListBanner(slug);
    if (response.status === 'error') {
        throw new Error(response.message || 'Failed to get banner information, refresh the page');
    }
    return response.data?.banners ?? [];
};

export const bannerQueryOptions = (slug: string) =>
    queryOptions<Banner[]>({
        queryKey: bannerQueryKeys.list(slug),
        queryFn: () => mapBannerResponse(slug),
        staleTime: FIVE_MINUTES,
        gcTime: THIRTY_MINUTES,
        refetchOnWindowFocus: false,
    });

type BannerQueryKey = ReturnType<typeof bannerQueryKeys.list>;
type BannerQueryOptions = Omit<UseQueryOptions<Banner[], Error, Banner[], BannerQueryKey>, 'queryKey' | 'queryFn'>;

export const useQueryBanner = (slug?: string | null, options?: BannerQueryOptions) => {
    const { enabled: enabledOption, ...restOptions } = options ?? {};
    const enabled = enabledOption ?? Boolean(slug);

    return useQuery<Banner[], Error, Banner[], BannerQueryKey>({
        queryKey: bannerQueryKeys.list(slug ?? ''),
        queryFn: () => (slug ? mapBannerResponse(slug) : Promise.resolve<Banner[]>([])),
        enabled,
        staleTime: FIVE_MINUTES,
        gcTime: THIRTY_MINUTES,
        refetchOnWindowFocus: false,
        ...restOptions,
    });
};

export const prefetchBanner = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(bannerQueryOptions(slug));
