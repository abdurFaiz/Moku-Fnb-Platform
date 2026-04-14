import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { Transaction } from '@/features/transaction/types/Transaction';
import { useOutlets } from '@/features/outlets/hooks/api/useQueryOutlet';
import { useQueryOrderDetail } from '@/features/transaction/hooks/api/useQueryOrder';
import { orderQueryKeys } from '@/features/transaction/hooks/api/useQueryOrder';
import { OrderTransactionMapper } from '@/features/transaction/services/orderTransactionMapper';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';

export interface UseTransactionDetailReturn {
    transaction: Transaction | null;
    rawOrderData: any;
    isLoading: boolean;
    isOrderLoading: boolean;
    isError: boolean;
    error: string | null;
    isFetching: boolean;
    refetch: () => Promise<void>;
    invalidateDetail: () => Promise<void>;
}

export const useTransactionDetail = (transactionId: string): UseTransactionDetailReturn => {
    const queryClient = useQueryClient();
    const routeSlug = useOutletSlug();
    const persistedSlug = useOutletStore((state) => state.outletSlug);

    const outletsQuery = useOutlets({
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        retry: 1,
    });

    const resolvedSlug = useMemo(() => {
        if (routeSlug) return routeSlug;
        if (persistedSlug) return persistedSlug;
        return outletsQuery.data?.[0]?.slug;
    }, [routeSlug, persistedSlug, outletsQuery.data]);

    const cachedOutletSlug = useMemo(() => {
        if (!resolvedSlug) return undefined;
        const match = outletsQuery.data?.find((outlet) => outlet.slug === resolvedSlug);
        return match?.slug ?? resolvedSlug;
    }, [resolvedSlug, outletsQuery.data]);

    const numericTransactionId = useMemo(() => {
        if (!transactionId) return null;
        const parsed = Number.parseInt(transactionId, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }, [transactionId]);

    const orderQuery = useQueryOrderDetail(cachedOutletSlug, numericTransactionId, {
        enabled: Boolean(cachedOutletSlug && numericTransactionId !== null),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    const rawOrderData = useMemo(() => {
        if (!orderQuery.data) return null;

        const orderData = (orderQuery.data as any)?.data?.order;
        let order = null;

        if (Array.isArray(orderData) && orderData.length > 0) {
            order = orderData[0];
        } else if (orderData && typeof orderData === 'object' && !Array.isArray(orderData)) {
            order = orderData;
        } else if ((orderQuery.data as any)?.data?.data?.code) {
            order = (orderQuery.data as any)?.data?.data;
        } else if ((orderQuery.data as any)?.data?.code) {
            order = (orderQuery.data as any)?.data;
        }

        return order;
    }, [orderQuery.data]);

    const outletName = useMemo(() => {
        if (!cachedOutletSlug) return 'Outlet';
        const matchedOutlet = outletsQuery.data?.find((outlet) => outlet.slug === cachedOutletSlug);
        return matchedOutlet?.name ?? 'Outlet';
    }, [cachedOutletSlug, outletsQuery.data]);

    const transaction = useMemo(() => {
        if (!rawOrderData) return null;

        try {
            return OrderTransactionMapper.mapOrderToTransaction(rawOrderData, outletName);
        } catch (error) {
            console.error('Failed to map order to transaction:', error);
            return null;
        }
    }, [rawOrderData, outletName]);

    // Optimized combined refetch
    const handleRefetch = useCallback(async () => {
        await Promise.all([
            outletsQuery.refetch(),
            orderQuery.refetch(),
        ]);
    }, [outletsQuery, orderQuery]);

    // Invalidate all related queries
    const invalidateDetail = useCallback(async () => {
        await Promise.all([
            cachedOutletSlug && numericTransactionId !== null
                ? queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(cachedOutletSlug, numericTransactionId) })
                : Promise.resolve(),
        ]);
    }, [queryClient, cachedOutletSlug, numericTransactionId]);

    // Combine loading states
    const isLoading = outletsQuery.isLoading || orderQuery.isLoading;
    const isOrderLoading = orderQuery.isLoading;
    const isError = outletsQuery.isError || orderQuery.isError;
    const isFetching = outletsQuery.isFetching || orderQuery.isFetching;

    // Extract error message (prioritize transaction error)
    const error = useMemo(() => {
        if (orderQuery.error) {
            return orderQuery.error instanceof Error ? orderQuery.error.message : String(orderQuery.error);
        }
        if (outletsQuery.error) {
            return outletsQuery.error instanceof Error ? outletsQuery.error.message : String(outletsQuery.error);
        }
        return null;
    }, [orderQuery.error, outletsQuery.error]);

    return {
        transaction,
        rawOrderData,
        isLoading,
        isOrderLoading,
        isError,
        error,
        isFetching,
        refetch: handleRefetch,
        invalidateDetail,
    };
};

export default useTransactionDetail;
