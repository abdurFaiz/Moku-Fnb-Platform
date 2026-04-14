import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productDataService } from '@/features/product/services/ProductDataService';
import type { ExtractedProductData } from '../types/ProductQuery';
import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import { PRODUCT_QUERY_CONFIG } from '@/features/product/constant/productQueryConstant';
import { useMemo, useCallback } from 'react';

interface UseProductDataReturn {
    categories: Category[];
    products: HomeProduct[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    refetch: () => Promise<any>;
    invalidateProducts: () => Promise<void>;
}

/**
 * @param outletSlug - Outlet slug to fetch products for
 * @returns Object containing product data and states
 */
export const useProductData = (outletSlug: string | null | undefined): UseProductDataReturn => {
    const queryClient = useQueryClient();

    // Query to fetch products for the outlet
    const {
        data: productsResponse,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: [PRODUCT_QUERY_CONFIG.PRODUCTS_QUERY_KEY, outletSlug],
        queryFn: async () => {
            if (!outletSlug) {
                throw new Error('Outlet slug is required');
            }
            return productDataService.fetchProducts(outletSlug);
        },
        enabled: !!outletSlug, // Only run when we have an outlet slug
        staleTime: PRODUCT_QUERY_CONFIG.PRODUCTS_STALE_TIME,
        gcTime: PRODUCT_QUERY_CONFIG.PRODUCTS_GC_TIME,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    });

    // Memoized extract product data from response
    const extractedData: ExtractedProductData = useMemo(
        () => productDataService.extractProductData(productsResponse),
        [productsResponse]
    );

    // Optimized refetch
    const handleRefetch = useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Manual invalidation
    const invalidateProducts = useCallback(async () => {
        await queryClient.invalidateQueries({
            queryKey: [PRODUCT_QUERY_CONFIG.PRODUCTS_QUERY_KEY, outletSlug]
        });
    }, [queryClient, outletSlug]);

    return {
        categories: extractedData.categories,
        products: extractedData.products,
        isLoading,
        isError,
        error: error || null,
        isFetching,
        refetch: handleRefetch,
        invalidateProducts,
    };
};
