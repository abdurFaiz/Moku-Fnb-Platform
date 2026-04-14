const GUEST_TOKEN_PREFIX = 'guest_';

export const isGuestToken = (token: string | null): boolean => {
    return token?.startsWith(GUEST_TOKEN_PREFIX) ?? false;
};

export const isGuestUser = (): boolean => {
    const token = localStorage.getItem('access_token');
    const isGuest = localStorage.getItem('is_guest');
    return isGuestToken(token) && isGuest === 'true';
};


export const GUEST_ALLOWED_ROUTES = [
    'home', // /:outletSlug/home
    'onboard', // Welcome/login page
    'outlet-selection', // Outlet selection
    'search-product', // Search functionality allowed for browsing
];


export const GUEST_RESTRICTED_ROUTES = [
    'account',
    'checkout',
    'payment',
    'payment-success',
    'vouchers',
    'voucher-checkout',
    'transactions',
    'account',
    'detail-transaction',
    'search-transaction',
    'reward-poin',
    'history-poin',
    'history-vouchers',
    'recommend',
    'favorite',
    'detail-item',
    'table-number',
];

/**
 * Check if a route should be restricted for guest users
 * @param pathname - The current pathname from location.pathname
 * @returns true if guest should be restricted from this route
 */
export const isRestrictedForGuest = (pathname: string): boolean => {
    if (!isGuestUser()) {
        return false; // Not a guest, no restriction
    }

    // Extract the route segment (handle dynamic segments like :outletSlug)
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length < 2) {
        return false; // Root level, allow
    }

    const routeSegment = segments[1];

    return GUEST_RESTRICTED_ROUTES.some(
        (restricted) => restricted.toLowerCase() === routeSegment.toLowerCase()
    );
};

export const getGuestHomeRoute = (outletSlug?: string): string => {
    if (outletSlug) {
        return `/${outletSlug}/home`;
    }
    return '/onboard';
};

/**
 * Guest restriction error message
 */
export const GUEST_RESTRICTION_MESSAGE = 'Guests can only access Home. Please log in to proceed with purchase.';

/**
 * Guest cart restriction message
 */
export const GUEST_CART_RESTRICTION_MESSAGE = 'Please log in to add items to cart.';
