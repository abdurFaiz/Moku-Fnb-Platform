
/**
 * Home Page Route Builders
 * Functions untuk build complete routes dengan parameters
 */
export const HOME_ROUTE_BUILDERS = {
  /**
   * Build home route dengan outlet slug
   */
  home: (outletSlug: string): string => {
    return `/${outletSlug}`;
  },

  /**
   * Build product detail route
   */
  productDetail: (productId: string, outletSlug: string): string => {
    return `/${outletSlug}/product/${productId}`;
  },

  /**
   * Build category route
   */
  category: (categoryId: string, outletSlug: string): string => {
    return `/${outletSlug}/category/${categoryId}`;
  },

  /**
   * Build search route
   */
  search: (query: string, outletSlug: string): string => {
    return `/${outletSlug}/search?q=${encodeURIComponent(query)}`;
  },
} as const;

export const HOME_ERRORS = {
  USER_DATA_FETCH_FAILED: 'Gagal memuat data pengguna',
  PRODUCTS_FETCH_FAILED: 'Gagal memuat data produk',
  NETWORK_ERROR: 'Koneksi bermasalah, silakan coba lagi',
  PRODUCT_NOT_FOUND: 'Produk tidak ditemukan',
  INVALID_PRODUCT_ID: 'ID produk tidak valid',
  NO_OUTLET: 'Tidak ada outlet yang dipilih',
  NAVIGATION_FAILED: 'Gagal untuk navigasi',
  FETCH_REWARDS_FAILED: 'Failed to load rewards',
  FETCH_PRODUCTS_FAILED: 'Failed to load products',
  FETCH_USER_FAILED: 'Failed to load user data',
  INVALID_RESPONSE: 'Invalid response from server',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

/**
 * Home Page UI State Defaults
 */
export const HOME_UI_STATE = {
  CART_BOTTOM_SHEET_OPEN: false,
} as const;


export const SCROLL_CONFIG = {
  THRESHOLD: 5,
  DEBOUNCE_DELAY: 150,
  VELOCITY_THRESHOLD: 0.5,
} as const;

/**
 * Default/Fallback Values
 */
export const HOME_DATA_DEFAULTS = {
  USER_NAME: 'User',
  VOUCHERS_COUNT: 0,
  POINTS_BALANCE: 0,
} as const;

