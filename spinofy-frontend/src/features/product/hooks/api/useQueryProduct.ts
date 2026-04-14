import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { ProductAPI } from '@/features/product/api/product.api';
import type { ProductResponse } from '@/features/product/types/Product';
import type { ProductDetailResponse, ProductRecommendationResponse } from '@/features/product/types/DetailProduct';

const ONE_MINUTE = 1000 * 60;
const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const productQueryKeys = {
    root: () => ['products'] as const,
    list: (slug: string) => ['products', slug] as const,
    detail: (slug: string, productUuid: string) => ['products', slug, productUuid] as const,
    bestSelling: (slug: string) => ['products', slug, 'best-selling'] as const,
    mostLiked: (slug: string) => ['products', slug, 'most-liked'] as const,
    recommendations: (slug: string, product_uuids?: string[] | null) => ['products', slug, 'recommendations', product_uuids ?? null] as const,
} as const;

const ensureProductListSuccess = (response: ProductResponse, slug: string) => {
    if (response.status === 'error') {
        throw new Error(response.message || `Failed to load products for ${slug}`);
    }
    return response;
};

const ensureProductDetailSuccess = (
    response: ProductDetailResponse,
    slug: string,
    productUuid: string
) => {
    if (response.status === 'error') {
        throw new Error(
            response.message || `Failed to load product ${productUuid} for ${slug}`
        );
    }
    return response;
};

const fetchProductList = async (slug: string) => {
    const response = await ProductAPI.getAllProduct(slug);
    return ensureProductListSuccess(response, slug);
};

const fetchProductDetail = async (slug: string, productUuid: string) => {
    const response = await ProductAPI.getProduct(slug, productUuid);
    return ensureProductDetailSuccess(response, slug, productUuid);
};

const fetchBestSellingProduct = async (slug: string) => {
    const response = await ProductAPI.getBestSellingProduct(slug);
    if (response.status === 'error') {
        throw new Error(response.message || `Failed to load best-selling product for ${slug}`);
    }
    return response;
};

const fetchMostLikedProduct = async (slug: string) => {
    const response = await ProductAPI.getMostLikedProduct(slug);
    if (response.status === 'error') {
        throw new Error(response.message || `Failed to load most-liked product for ${slug}`);
    }
    return response;
};

const fetchRecommendationsProduct = async (slug: string, product_uuids: string[]) => {
    const response = await ProductAPI.getRecommendationsProduct(slug, product_uuids);
    if (response.status === 'error') {
        throw new Error(response.message || `Failed to load recommendations for ${slug}`);
    }
    return response;
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

export const productListQueryOptions = (slug: string) =>
    queryOptions<
        ProductResponse,
        Error,
        ProductResponse,
        ReturnType<typeof productQueryKeys.list>
    >({
        queryKey: productQueryKeys.list(slug),
        queryFn: () => fetchProductList(slug),
        ...listQueryConfig,
    });

export const productDetailQueryOptions = (slug: string, productUuid: string) =>
    queryOptions<
        ProductDetailResponse,
        Error,
        ProductDetailResponse,
        ReturnType<typeof productQueryKeys.detail>
    >({
        queryKey: productQueryKeys.detail(slug, productUuid),
        queryFn: () => fetchProductDetail(slug, productUuid),
        ...detailQueryConfig,
    });

export const productBestSellingQueryOptions = (slug: string) =>
    queryOptions<
        ProductDetailResponse,
        Error,
        ProductDetailResponse,
        ReturnType<typeof productQueryKeys.bestSelling>
    >({
        queryKey: productQueryKeys.bestSelling(slug),
        queryFn: () => fetchBestSellingProduct(slug),
        ...detailQueryConfig,
    });

export const productMostLikedQueryOptions = (slug: string) =>
    queryOptions<
        ProductDetailResponse,
        Error,
        ProductDetailResponse,
        ReturnType<typeof productQueryKeys.mostLiked>
    >({
        queryKey: productQueryKeys.mostLiked(slug),
        queryFn: () => fetchMostLikedProduct(slug),
        ...detailQueryConfig,
    });

export const productRecommendationsQueryOptions = (slug: string, product_uuids?: string[] | null) =>
    queryOptions<
        ProductRecommendationResponse,
        Error,
        ProductRecommendationResponse,
        ReturnType<typeof productQueryKeys.recommendations>
    >({
        queryKey: productQueryKeys.recommendations(slug, product_uuids ?? null),
        queryFn: () => fetchRecommendationsProduct(slug, product_uuids ?? []),
        ...detailQueryConfig,
    });

type ProductListQueryKey = ReturnType<typeof productQueryKeys.list>;
type ProductDetailQueryKey = ReturnType<typeof productQueryKeys.detail>;

type ProductListQueryOptions = Omit<
    UseQueryOptions<ProductResponse, Error, ProductResponse, ProductListQueryKey>,
    'queryKey' | 'queryFn'
>;

type ProductDetailQueryOptions = Omit<
    UseQueryOptions<ProductDetailResponse, Error, ProductDetailResponse, ProductDetailQueryKey>,
    'queryKey' | 'queryFn'
>;

type ProductBestSellingQueryKey = ReturnType<typeof productQueryKeys.bestSelling>;
type ProductMostLikedQueryKey = ReturnType<typeof productQueryKeys.mostLiked>;
type ProductRecommendationsQueryKey = ReturnType<typeof productQueryKeys.recommendations>;

type ProductBestSellingQueryOptions = Omit<
    UseQueryOptions<ProductDetailResponse, Error, ProductDetailResponse, ProductBestSellingQueryKey>,
    'queryKey' | 'queryFn'
>;

type ProductMostLikedQueryOptions = Omit<
    UseQueryOptions<ProductDetailResponse, Error, ProductDetailResponse, ProductMostLikedQueryKey>,
    'queryKey' | 'queryFn'
>;

type ProductRecommendationsQueryOptions = Omit<
    UseQueryOptions<ProductRecommendationResponse, Error, ProductRecommendationResponse, ProductRecommendationsQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryProducts = (
    slug?: string | null,
    options?: ProductListQueryOptions
) => {
    if (!slug) {
        return useQuery<ProductResponse, Error, ProductResponse, ProductListQueryKey>({
            queryKey: productQueryKeys.list(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<ProductResponse, Error, ProductResponse, ProductListQueryKey>({
        ...productListQueryOptions(slug),
        ...options,
    });
};

export const useQueryProductDetail = (
    slug?: string | null,
    productUuid?: string | null,
    options?: ProductDetailQueryOptions
) => {
    if (!slug || !productUuid) {
        return useQuery<ProductDetailResponse, Error, ProductDetailResponse, ProductDetailQueryKey>({
            queryKey: productQueryKeys.detail(slug ?? '', productUuid ?? 'missing'),
            queryFn: async () => {
                throw new Error('Outlet slug and product UUID are required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<ProductDetailResponse, Error, ProductDetailResponse, ProductDetailQueryKey>({
        ...productDetailQueryOptions(slug, productUuid),
        ...options,
    });
};

export const useQueryBestSellingProduct = (
    slug?: string | null,
    options?: ProductBestSellingQueryOptions
) => {
    if (!slug) {
        return useQuery<ProductDetailResponse, Error, ProductDetailResponse, ProductBestSellingQueryKey>({
            queryKey: productQueryKeys.bestSelling(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<ProductDetailResponse, Error, ProductDetailResponse, ProductBestSellingQueryKey>({
        ...productBestSellingQueryOptions(slug),
        ...options,
    });
};

export const useQueryMostLikedProduct = (
    slug?: string | null,
    options?: ProductMostLikedQueryOptions
) => {
    if (!slug) {
        return useQuery<ProductDetailResponse, Error, ProductDetailResponse, ProductMostLikedQueryKey>({
            queryKey: productQueryKeys.mostLiked(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<ProductDetailResponse, Error, ProductDetailResponse, ProductMostLikedQueryKey>({
        ...productMostLikedQueryOptions(slug),
        ...options,
    });
};

export const useQueryRecommendationsProduct = (
    slug?: string | null,
    product_uuids?: string[] | null,
    options?: ProductRecommendationsQueryOptions
) => {
    if (!slug || !product_uuids || product_uuids.length === 0) {
        return useQuery<ProductRecommendationResponse, Error, ProductRecommendationResponse, ProductRecommendationsQueryKey>({
            queryKey: productQueryKeys.recommendations(slug ?? '', product_uuids ?? null),
            queryFn: async () => {
                throw new Error('Outlet slug and product UUIDs are required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<ProductRecommendationResponse, Error, ProductRecommendationResponse, ProductRecommendationsQueryKey>({
        ...productRecommendationsQueryOptions(slug, product_uuids),
        ...options,
    });
};

export const prefetchProducts = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(productListQueryOptions(slug));

export const prefetchProductDetail = (
    queryClient: QueryClient,
    slug: string,
    productUuid: string
) => queryClient.prefetchQuery(productDetailQueryOptions(slug, productUuid));

export const prefetchBestSellingProduct = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(productBestSellingQueryOptions(slug));

export const prefetchMostLikedProduct = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(productMostLikedQueryOptions(slug));

export const prefetchRecommendationsProduct = (queryClient: QueryClient, slug: string, product_uuids?: string[] | null) =>
    queryClient.prefetchQuery(productRecommendationsQueryOptions(slug, product_uuids));
