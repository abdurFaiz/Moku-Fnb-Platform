import type { TransactionStatus, FilterOption } from '../types/Transaction';
import { FILTER_OPTIONS, EMPTY_STATE_MESSAGES } from '../constants/transactionConstant';

export class TransactionFilterService {
  static getFilterOptions(): FilterOption[] {
    return [...FILTER_OPTIONS];
  }

  static getFilterLabel(filter: TransactionStatus | "semua"): string {
    const option = FILTER_OPTIONS.find(f => f.value === filter);
    return option?.label || "Semua";
  }

  static isValidFilter(filter: string): filter is TransactionStatus | "semua" {
    return FILTER_OPTIONS.some(option => option.value === filter);
  }

  static getEmptyStateMessage(filter: TransactionStatus | "semua"): string {
    if (filter === "semua") {
      return EMPTY_STATE_MESSAGES.DEFAULT;
    }
    const filterLabel = this.getFilterLabel(filter);
    return EMPTY_STATE_MESSAGES.FILTERED(filterLabel);
  }

  static getFilterCount(filter: TransactionStatus | "semua"): { value: string; label: string } {
    return {
      value: filter,
      label: this.getFilterLabel(filter)
    };
  }

  static getActiveFilters(): FilterOption[] {
    return FILTER_OPTIONS.filter(option => option.value !== "semua");
  }

  static getDefaultFilter(): TransactionStatus | "semua" {
    return "semua";
  }

  static normalizeFilter(filter: unknown): TransactionStatus | "semua" {
    if (typeof filter === 'string' && this.isValidFilter(filter)) {
      return filter;
    }
    return this.getDefaultFilter();
  }

  static buildFilterQuery(filter: TransactionStatus | "semua", additionalParams?: Record<string, unknown>): Record<string, unknown> {
    const query: Record<string, unknown> = {
      status: filter !== "semua" ? filter : undefined,
      ...additionalParams
    };

    // Remove undefined values
    return Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== undefined)
    );
  }

  static compareFilters(filter1: TransactionStatus | "semua", filter2: TransactionStatus | "semua"): boolean {
    return filter1 === filter2;
  }

  static getFilterPriority(filter: TransactionStatus | "semua"): number {
    const priorityMap: Record<string, number> = {
      "semua": 0,
      "pending": 1,
      "menunggu-konfirmasi": 2,
      "dalam-proses": 3,
      "selesai": 4,
      "gagal": 5,
      "expired": 6,
      "challenge": 7,
      "dibatalkan": 8,
      "ditolak": 9
    };
    return priorityMap[filter] || 99;
  }

  static sortFilterOptions(options: FilterOption[]): FilterOption[] {
    return [...options].sort((a, b) =>
      this.getFilterPriority(a.value) - this.getFilterPriority(b.value)
    );
  }
}
