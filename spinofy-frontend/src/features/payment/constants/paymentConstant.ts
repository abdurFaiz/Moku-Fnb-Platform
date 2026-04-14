/**
 * Query cache configuration
 */
export const PAYMENT_CACHE_CONFIG = {
    CHECKOUT_STALE_TIME: 5 * 60 * 1000, // 5 minutes
    CHECKOUT_GC_TIME: 10 * 60 * 1000, // 10 minutes
    WEBHOOK_PROCESSING_TIME: 2000, // 2 seconds - wait time for webhook to process
} as const;

/**
 * Order status threshold for completion
 */
export const ORDER_COMPLETION_STATUS_THRESHOLD = 3;

/**
 * Payment status messages (Indonesian)
 */
export const PAYMENT_MESSAGES = {
    WEBHOOK_TRIGGER: 'Status pembayaran sedang diperbarui...',
    WEBHOOK_ERROR: 'Gagal memicu pembaruan status, tetapi akan tetap mengecek...',
    PAYMENT_PROCESSING: 'Pembayaran masih dalam proses. Silakan coba lagi dalam beberapa saat.',
    ORDER_NOT_FOUND: 'Data pesanan tidak ditemukan. Silakan coba lagi.',
    PAYMENT_CHECK_FAILED: 'Gagal mengecek status pembayaran. Silakan coba lagi.',
} as const;

/**
 * Navigation routes
 */
export const PAYMENT_ROUTES = {
    PAYMENT_SUCCESS: 'payment-success',
    TRANSACTIONS: '/transactions',
} as const;

/**
 * Error messages
 */
export const PAYMENT_ERRORS = {
    ORDER_CODE_REQUIRED: 'Order code is required',
    NO_OUTLET_AVAILABLE: 'No outlet available',
    NO_OUTLET_FROM_API: 'No outlet available from API',
} as const;
