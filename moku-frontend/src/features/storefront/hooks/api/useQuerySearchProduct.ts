import { queryOptions, useQuery, type QueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { SearchAPI } from '@/features/storefront/api/search.api';
import type { ProductSearch } from '@/features/storefront/types/Search';

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const searchQueryKeys = {
    root: () => ['search'] as const,
    list: (slug: string, q: string) => ['search', slug, q] as const,
} as const;

const mapSearchResponse = async (slug: string, q: string) => {
    const response = await SearchAPI.searchProduct(slug, q);
    if (response.status === 'error') {
        throw new Error(response.message || 'Failed to get search results, refresh the page');
    }
    return response.data?.products ?? [];
};

export const searchQueryOptions = (slug: string, q: string) =>
    queryOptions<ProductSearch[]>({
        queryKey: searchQueryKeys.list(slug, q),
        queryFn: () => mapSearchResponse(slug, q),
        staleTime: FIVE_MINUTES,
        gcTime: THIRTY_MINUTES,
        refetchOnWindowFocus: false,
    });

type SearchQueryKey = ReturnType<typeof searchQueryKeys.list>;
type SearchQueryOptions = Omit<UseQueryOptions<ProductSearch[], Error, ProductSearch[], SearchQueryKey>, 'queryKey' | 'queryFn'>;

export const useQuerySearchProduct = (slug?: string | null, q?: string | null, options?: SearchQueryOptions) => {
    const { enabled: enabledOption, ...restOptions } = options ?? {};
    // Enable query when slug exists (for default products when q is empty)
    const enabled = enabledOption ?? Boolean(slug);

    return useQuery<ProductSearch[], Error, ProductSearch[], SearchQueryKey>({
        queryKey: searchQueryKeys.list(slug ?? '', q ?? ''),
        queryFn: () => (slug ? mapSearchResponse(slug, q ?? '') : Promise.resolve<ProductSearch[]>([])),
        enabled,
        staleTime: FIVE_MINUTES,
        gcTime: THIRTY_MINUTES,
        refetchOnWindowFocus: false,
        ...restOptions,
    });
};

export const prefetchSearchProduct = (queryClient: QueryClient, slug: string, q: string) =>
    queryClient.prefetchQuery(searchQueryOptions(slug, q));
