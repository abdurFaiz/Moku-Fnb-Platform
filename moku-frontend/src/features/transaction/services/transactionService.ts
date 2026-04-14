import type { Transaction, TransactionQuery, TransactionStatus, FilterOption, ApiResponse } from '../types/Transaction';
import { RealTransactionApiService } from './realTransactionService';
import { TransactionFilterService } from './transactionFilterservice';
import { TransactionActionService } from './transactionActionservice';


export const transactionQueryConfig = {
  staleTime: {
    list: 5 * 60 * 1000,      // 5 minutes for transaction list
    detail: 30 * 1000,         // 30 seconds for detail page
    stats: 10 * 60 * 1000,     // 10 minutes for stats
  },
  gcTime: {
    list: 15 * 60 * 1000,      // 15 minutes cache
    detail: 5 * 60 * 1000,     // 5 minutes cache
    stats: 30 * 60 * 1000,     // 30 minutes cache
  },
  retry: {
    count: 2,
    delay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
} as const;

export const transactionQueryKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionQueryKeys.all, 'list'] as const,
  list: (filters?: TransactionQuery) => [...transactionQueryKeys.lists(), { filters }] as const,
  details: () => [...transactionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionQueryKeys.details(), id] as const,
  stats: () => [...transactionQueryKeys.all, 'stats'] as const,
  search: (term: string) => [...transactionQueryKeys.all, 'search', term] as const,
} as const;


export class TransactionService {
  private static getCurrentOutletSlug(): string | undefined {
    try {
      const outletStorage = localStorage.getItem('outlet-storage');
      if (outletStorage) {
        const parsed = JSON.parse(outletStorage);
        return parsed.state?.outletSlug;
      }
    } catch (error) {
      console.error('❌ TransactionService: Failed to get outlet slug from localStorage', error);
    }
    return undefined;
  }
  // API Operations
  static async getAllTransactions(outletSlug?: string): Promise<ApiResponse<Transaction[]>> {
    const resolvedSlug = outletSlug ?? this.getCurrentOutletSlug();
    return RealTransactionApiService.getAllTransactions(resolvedSlug);
  }

  static async getTransactionById(id: string): Promise<ApiResponse<Transaction | null>> {
    const outletSlug = this.getCurrentOutletSlug();
    return RealTransactionApiService.getTransactionById(id, outletSlug);
  }

  static async getTransactions(query: TransactionQuery = {}): Promise<ApiResponse<Transaction[]>> {
    const outletSlug = this.getCurrentOutletSlug();
    return RealTransactionApiService.getTransactions(query, outletSlug);
  }

  static async getFilteredTransactions(filter: TransactionStatus | "semua"): Promise<ApiResponse<Transaction[]>> {
    const query: TransactionQuery = {
      status: filter === "semua" ? undefined : filter
    };
    const outletSlug = this.getCurrentOutletSlug();
    return RealTransactionApiService.getTransactions(query, outletSlug);
  }

  // Filter Operations
  static getFilterOptions(): FilterOption[] {
    return TransactionFilterService.getFilterOptions();
  }

  static getFilterLabel(filter: TransactionStatus | "semua"): string {
    return TransactionFilterService.getFilterLabel(filter);
  }

  static getEmptyStateMessage(filter: TransactionStatus | "semua"): string {
    return TransactionFilterService.getEmptyStateMessage(filter);
  }

  static isValidFilter(filter: string): filter is TransactionStatus | "semua" {
    return TransactionFilterService.isValidFilter(filter);
  }

  static normalizeFilter(filter: unknown): TransactionStatus | "semua" {
    return TransactionFilterService.normalizeFilter(filter);
  }

  // Action Operations
  static handleTransactionAction(
    actionLabel: string,
    navigate: (path: string) => void,
    additionalParams?: Record<string, string>
  ): void {
    return TransactionActionService.handleTransactionAction(actionLabel, navigate, additionalParams);
  }

  static buildDetailUrl(transactionCode: string, status: TransactionStatus): string {
    return TransactionActionService.buildDetailUrl(transactionCode, status);
  }

  static getActionVariant(actionLabel: string): "outline" | "primary" {
    return TransactionActionService.getActionVariant(actionLabel);
  }

  static isDestructiveAction(actionLabel: string): boolean {
    return TransactionActionService.isDestructiveAction(actionLabel);
  }

  static validateActionPermissions(actionLabel: string, transactionStatus: string): boolean {
    return TransactionActionService.validateActionPermissions(actionLabel, transactionStatus);
  }

  // Cache Operations
  static clearCache(): void {
    RealTransactionApiService.clearCache();
  }

  static clearCacheByPattern(pattern: string): void {
    RealTransactionApiService.clearCacheByPattern(pattern);
  }

  // Utility Methods
  static async getTransactionStats(): Promise<ApiResponse<Record<TransactionStatus, number>>> {
    try {
      const response = await this.getAllTransactions();
      if (!response.success) {
        return {
          data: {} as Record<TransactionStatus, number>,
          success: false,
          message: response.message
        };
      }

      const stats = response.data.reduce((acc, transaction) => {
        acc[transaction.status] = (acc[transaction.status] || 0) + 1;
        return acc;
      }, {} as Record<TransactionStatus, number>);

      return {
        data: stats,
        success: true,
        message: 'Transaction stats calculated successfully'
      };
    } catch (error) {
      return {
        data: {} as Record<TransactionStatus, number>,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to calculate transaction stats'
      };
    }
  }

  static async getRecentTransactions(limit: number = 5): Promise<ApiResponse<Transaction[]>> {
    const query: TransactionQuery = { limit };
    return this.getTransactions(query);
  }

  static async searchTransactions(searchTerm: string): Promise<ApiResponse<Transaction[]>> {
    try {
      const allTransactionsResponse = await this.getAllTransactions();
      if (!allTransactionsResponse.success) {
        return allTransactionsResponse;
      }

      const searchResults = allTransactionsResponse.data.filter(transaction =>
        transaction.cafeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.items.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toString().includes(searchTerm)
      );

      return {
        data: searchResults,
        success: true,
        message: `Found ${searchResults.length} transactions matching "${searchTerm}"`
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  // Validation Methods
  static validateTransactionId(id: string): { isValid: boolean; error?: string } {
    const numId = Number.parseInt(id, 10);
    if (Number.isNaN(numId) || numId <= 0) {
      return { isValid: false, error: `Invalid transaction ID: ${id}` };
    }
    return { isValid: true };
  }

  static validateTransactionStatus(status: string): { isValid: boolean; error?: string } {
    const validStatuses: TransactionStatus[] = ["menunggu-konfirmasi", "dalam-proses", "selesai", "dibatalkan", "ditolak"];
    if (!validStatuses.includes(status as TransactionStatus)) {
      return { isValid: false, error: `Invalid transaction status: ${status}` };
    }
    return { isValid: true };
  }

  // Helper Methods for Components
  static formatTransactionDate(dateString: string): string {
    try {
      // Add more sophisticated date formatting as needed
      return dateString;
    } catch {
      return dateString
    }
  }

  static formatPrice(price: string): string {
    // Add price formatting logic if needed
    return price;
  }
}

export default TransactionService;
