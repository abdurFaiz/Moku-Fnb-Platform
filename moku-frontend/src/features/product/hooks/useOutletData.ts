import { useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { outletDataService } from '@/features/product/services/OutletDataService';
import { PRODUCT_QUERY_CONFIG } from '@/features/product/constant/productQueryConstant';
import { useOutlets, outletQueryKeys } from '@/features/outlets/hooks/api/useQueryOutlet';
import type { Outlet } from '../types/ProductQuery';

interface UseOutletDataReturn {
    outlets: Outlet[];
    currentOutlet: Outlet | null;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    isFetching: boolean;
    refetch: () => Promise<void>;
    invalidateOutlets: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing outlet data
 * Handles outlet fetching and current outlet identification
 *
 * @returns Object containing outlet data and states
 */
export const useOutletData = (): UseOutletDataReturn => {
    const queryClient = useQueryClient();
    const outletSlugFromUrl = useOutletSlug();

    const {
        data: outletsResponse,
        isLoading,
        isError,
        error,
        isFetching,
        refetch,
    } = useOutlets({
        staleTime: PRODUCT_QUERY_CONFIG.OUTLETS_STALE_TIME,
        gcTime: PRODUCT_QUERY_CONFIG.OUTLETS_GC_TIME,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        refetchOnWindowFocus: false,
    });

    const outlets = useMemo(() => outletsResponse ?? [], [outletsResponse]);

    const currentOutlet = useMemo(
        () => outletDataService.findOutletBySlug(outlets, outletSlugFromUrl),
        [outlets, outletSlugFromUrl]
    );

    // Optimized refetch
    const handleRefetch = useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Manual invalidation
    const invalidateOutlets = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: outletQueryKeys.list() });
    }, [queryClient]);

    return {
        outlets,
        currentOutlet,
        isLoading,
        isError,
        error: error || null,
        isFetching,
        refetch: handleRefetch,
        invalidateOutlets,
    };
};
