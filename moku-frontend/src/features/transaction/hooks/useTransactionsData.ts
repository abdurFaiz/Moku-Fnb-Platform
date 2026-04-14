import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TransactionService from "@/features/transaction/services/transactionService";
import type { Transaction } from "@/features/transaction/types/Transaction";


export interface UseTransactionsDataReturn {
  transactions: Transaction[];
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: string | null;
  isFetching: boolean;
  refreshTransactions: () => Promise<void>;
  invalidateTransactions: () => Promise<void>;
}

const TRANSACTIONS_QUERY_KEY = ['transactions-list'] as const;

export const useTransactionsData = (outletSlug?: string): UseTransactionsDataReturn => {
  const queryClient = useQueryClient();

  const {
    data: transactionsResponse,
    isLoading,
    isPending,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, outletSlug],
    queryFn: async () => TransactionService.getAllTransactions(outletSlug),
    enabled: Boolean(outletSlug),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: (failureCount, error) => {
      if ((error as any)?.response?.status && (error as any).response.status >= 400 && (error as any).response.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false,  // Avoid excessive refetches
    refetchOnReconnect: true,     // Sync when back online
  });

  // Memoize extracted data to prevent unnecessary object creation
  const transactions = useMemo(
    () => (transactionsResponse as any)?.data || [],
    [(transactionsResponse as any)?.data]
  );

  const isSlugReady = Boolean(outletSlug);
  const combinedLoading = !isSlugReady || isLoading;
  const combinedPending = !isSlugReady || isPending;

  // Convert error to user-friendly message
  const errorMessage = useMemo(() => {
    if (!error) return null;
    if (error instanceof Error) return error.message;
    return "Failed to load transactions";
  }, [error]);

  // Optimized refresh with proper callback
  const refreshTransactions = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Manual invalidation for forced refetch
  const invalidateTransactions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
  }, [queryClient]);

  return {
    transactions,
    isLoading: combinedLoading,
    isPending: combinedPending,
    isError,
    error: error ? errorMessage : null,
    isFetching,
    refreshTransactions,
    invalidateTransactions,
  };
};

export default useTransactionsData;