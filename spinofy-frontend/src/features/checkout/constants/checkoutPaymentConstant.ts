/**
 * Timing constants untuk side effects (dalam milliseconds)
 */
export const CHECKOUT_PAYMENT_TIMINGS = {
    /**
     * Delay sebelum clear cart
     * Memastikan Checkout page sudah unmount
     */
    CART_CLEAR_DELAY: 500,

    /**
     * Delay sebelum reset checkout processing flag
     * Memastikan navigation sudah complete
     */
    FLAG_RESET_DELAY: 1000,
} as const;

/**
 * Error messages
 */
export const CHECKOUT_PAYMENT_ERRORS = {
    PAYMENT_FAILED: 'Gagal memproses pembayaran. Silakan coba lagi.',
    NO_OUTLET: 'Tidak ada outlet yang tersedia.',
    GENERIC_ERROR: (message: string) =>
        `Gagal memproses pembayaran.\n\n${message}\n\nSilakan coba lagi atau hubungi staff.`,
} as const;


/**
 * Routes
 */
export const CHECKOUT_PAYMENT_ROUTES = {
    PAYMENT: (outletSlug: string) => `/${outletSlug}/payment`,
} as const;
