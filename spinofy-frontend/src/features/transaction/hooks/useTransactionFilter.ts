import { useState, useMemo, useCallback } from "react";
import TransactionService from "@/features/transaction/services/transactionService";
import type { Transaction, TransactionStatus } from "@/features/transaction/types/Transaction";

export interface UseTransactionFilterReturn {
  activeFilter: TransactionStatus | "semua";
  filteredTransactions: Transaction[];
  filterOptions: Array<{ value: TransactionStatus | "semua"; label: string }>;
  emptyStateMessage: string;
  setActiveFilter: (filter: TransactionStatus | "semua") => void;
}

export const useTransactionFilter = (
  transactions: Transaction[],
): UseTransactionFilterReturn => {
  const [activeFilter, setActiveFilter] = useState<TransactionStatus | "semua">(
    "semua",
  );

  // Memoized filtered transactions to prevent unnecessary recalculations
  const filteredTransactions = useMemo(() => {
    if (activeFilter === "semua") {
      return transactions;
    }
    return transactions.filter(
      (transaction) => transaction.status === activeFilter,
    );
  }, [transactions, activeFilter]);

  // Memoized filter options (static data, rarely changes)
  const filterOptions = useMemo(() => TransactionService.getFilterOptions(), []);

  // Memoized empty state message based on filter
  const emptyStateMessage = useMemo(
    () => TransactionService.getEmptyStateMessage(activeFilter),
    [activeFilter],
  );

  // Memoized setter to prevent unnecessary re-renders in child components
  const handleSetActiveFilter = useCallback((filter: TransactionStatus | "semua") => {
    setActiveFilter(filter);
  }, []);

  return {
    activeFilter,
    filteredTransactions,
    filterOptions,
    emptyStateMessage,
    setActiveFilter: handleSetActiveFilter,
  };
};

export default useTransactionFilter;
