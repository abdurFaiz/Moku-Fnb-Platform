import type { FilterOption } from "@/features/transaction/types/Transaction";


export const FILTER_OPTIONS: FilterOption[] = [
  { value: "semua", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "menunggu-konfirmasi", label: "Menunggu Pembayaran" },
  { value: "dalam-proses", label: "Pesanan Sedang Disiapkan" },
  { value: "selesai", label: "Selesai" },
  { value: "expired", label: "Expired" },
  { value: "dibatalkan", label: "Dibatalkan" },
];


export const EMPTY_STATE_MESSAGES = {
  DEFAULT: "Belum ada pesanan yang dibuat",
  FILTERED: (filterLabel: string) =>
    `Belum ada pesanan dengan status "${filterLabel}"`,
} as const;
