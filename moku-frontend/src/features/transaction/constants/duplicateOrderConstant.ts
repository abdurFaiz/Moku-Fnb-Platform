/**
 * Query Keys untuk React Query
 */
export const DUPLICATE_ORDER_QUERY_KEYS = {
    paymentList: 'payment-list',
} as const;

/**
 * Timings (dalam milliseconds)
 */
export const DUPLICATE_ORDER_TIMINGS = {
    /**
     * Delay sebelum navigate ke checkout
     * Untuk memastikan cart sudah di-update
     */
    CART_SYNC_DELAY: 100,
} as const;

/**
 * Defaults/Fallbacks
 */
export const DUPLICATE_ORDER_DEFAULTS = {
    PRODUCT_NAME: 'Product',
    PRODUCT_PRICE: 0,
    PRODUCT_QUANTITY: 1,
    VARIANT_NAME: '',
    NOTE_PREFIX: 'reorder',
} as const;

/**
 * Error Messages
 */
export const DUPLICATE_ORDER_ERRORS = {
    NO_OUTLET: 'No outlet available',
    NO_ORDER_DATA: 'Failed to get duplicated order data',
    NO_PRODUCTS: 'Duplicate order has no products',
    FAILED_ADD_ITEM: 'Failed to add item to cart',
    FAILED_DUPLICATE: 'Failed to duplicate order',
    INVALID_RESPONSE: 'Invalid response from server',
} as const;

