import { useTransactionsData } from "./useTransactionsData";
import { useTransactionFilter } from "./useTransactionFilter";
import { useTransactionActions } from "./useTransactionActions";
import type {
  Transaction,
  TransactionStatus,
} from "@/features/transaction/types/Transaction";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";

export interface UseTransactionsReturn {
  // State
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  activeFilter: TransactionStatus | "semua";
  isLoading: boolean;
  error: string | null;

  // Actions
  setActiveFilter: (filter: TransactionStatus | "semua") => void;
  handleTransactionClick: (transaction: Transaction) => void;
  refreshTransactions: () => Promise<void>;

  // Computed
  filterOptions: Array<{ value: TransactionStatus | "semua"; label: string }>;
  emptyStateMessage: string;
}

export const useTransactions = (): UseTransactionsReturn => {
  const outletSlug = useOutletSlug();
  // Data fetching and loading state
  const { transactions, isLoading, error, refreshTransactions } =
    useTransactionsData(outletSlug);

  // Filtering logic
  const {
    activeFilter,
    filteredTransactions,
    filterOptions,
    emptyStateMessage,
    setActiveFilter,
  } = useTransactionFilter(transactions);

  // User interactions
  const { handleTransactionClick } = useTransactionActions();

  return {
    // State
    transactions,
    filteredTransactions,
    activeFilter,
    isLoading,
    error,

    // Actions
    setActiveFilter,
    handleTransactionClick,
    refreshTransactions,

    // Computed
    filterOptions,
    emptyStateMessage,
  };
};

export default useTransactions;
