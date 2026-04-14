import type { TransactionStatus } from '@/features/transaction/types/Transaction';

/**
 * Maps backend OrderStatusEnum values to frontend TransactionStatus
 * Based on OrderStatusEnum.php constants
 */
export const ORDER_STATUS_MAP: Record<number, TransactionStatus> = {
    1: 'pending',              // PENDING
    2: 'menunggu-konfirmasi',  // WAITING_CONFIRMATION
    3: 'dalam-proses',         // SUCCESS (being prepared)
    4: 'selesai',              // COMPLETED
    5: 'gagal',                // FAILED
    6: 'expired',              // EXPIRED
    7: 'challenge',            // CHALLENGE
    8: 'dibatalkan',           // CANCEL
    9: 'ditolak',              // REJECT
} as const;

/**
 * Reverse mapping from frontend status to backend status ID
 */
export const FRONTEND_TO_BACKEND_STATUS: Record<TransactionStatus, number> = {
    'pending': 1,
    'menunggu-konfirmasi': 2,
    'dalam-proses': 3,
    'selesai': 4,
    'gagal': 5,
    'expired': 6,
    'challenge': 7,
    'dibatalkan': 8,
    'ditolak': 9,
} as const;

/**
 * Convert backend status ID to frontend status string
 */
export function mapBackendStatusToFrontend(backendStatus: number): TransactionStatus | null {
    return ORDER_STATUS_MAP[backendStatus] || null;
}

/**
 * Convert frontend status string to backend status ID
 */
export function mapFrontendStatusToBackend(frontendStatus: TransactionStatus): number | null {
    return FRONTEND_TO_BACKEND_STATUS[frontendStatus] || null;
}

/**
 * Check if a backend status ID is valid
 */
export function isValidBackendStatus(status: number): boolean {
    return status in ORDER_STATUS_MAP;
}

/**
 * Check if a frontend status string is valid
 */
export function isValidFrontendStatus(status: string): status is TransactionStatus {
    return Object.values(FRONTEND_TO_BACKEND_STATUS).includes(Number(status)) ||
        Object.keys(FRONTEND_TO_BACKEND_STATUS).includes(status as TransactionStatus);
}

/**
 * Get status label for display based on backend status ID
 */
export function getStatusLabel(backendStatus: number): string {
    const frontendStatus = mapBackendStatusToFrontend(backendStatus);
    if (!frontendStatus) return 'Status Tidak Dikenal';

    const labelMap: Record<TransactionStatus, string> = {
        'pending': 'Pending',
        'menunggu-konfirmasi': 'Menunggu Pembayaran',
        'dalam-proses': 'Sedang Disiapkan',
        'selesai': 'Selesai',
        'gagal': 'Gagal',
        'expired': 'Kedaluwarsa',
        'challenge': 'Bermasalah',
        'dibatalkan': 'Dibatalkan',
        'ditolak': 'Ditolak',
    };

    return labelMap[frontendStatus] || 'Status Tidak Dikenal';
}

/**
 * Get CSS classes for status badge styling
 */
export function getStatusBadgeClasses(status: TransactionStatus): string {
    const classMap: Record<TransactionStatus, string> = {
        'pending': 'bg-gray-100 text-gray-800',
        'menunggu-konfirmasi': 'bg-yellow-100 text-yellow-800',
        'dalam-proses': 'bg-blue-100 text-blue-800',
        'selesai': 'bg-green-100 text-green-800',
        'gagal': 'bg-red-100 text-red-800',
        'expired': 'bg-gray-100 text-gray-600',
        'challenge': 'bg-orange-100 text-orange-800',
        'dibatalkan': 'bg-red-100 text-red-600',
        'ditolak': 'bg-red-100 text-red-700',
    };

    return classMap[status] || 'bg-gray-100 text-gray-800';
}