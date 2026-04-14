export const PRODUCT_QUERY_CONFIG = {
    // Outlets query
    OUTLETS_STALE_TIME: 10 * 60 * 1000, // 10 minutes
    OUTLETS_GC_TIME: 15 * 60 * 1000, // 15 minutes

    // Products query
    PRODUCTS_STALE_TIME: 5 * 60 * 1000, // 5 minutes
    PRODUCTS_GC_TIME: 10 * 60 * 1000, // 10 minutes
    PRODUCTS_QUERY_KEY: 'dynamic-products' as const,

    // Combined key for product queries
    COMBINED_KEY: 'product-combined' as const,
} as const;

/**
 * Error messages
 */
export const PRODUCT_ERROR_MESSAGES = {
    NO_OUTLET_SLUG: 'No outlet slug available to fetch products',
    NO_OUTLETS_AVAILABLE: 'No outlets available',
    PRODUCTS_FETCH_FAILED: 'Failed to fetch products',
    CURRENT_OUTLET_NOT_FOUND: 'Current outlet not found',
} as const;

