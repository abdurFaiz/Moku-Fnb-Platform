export const AUTH_CONFIG = {
    // Cache configuration
    STALE_TIME: 5 * 60 * 1000, // 5 minutes
    GC_TIME: 10 * 60 * 1000, // 10 minutes

    // Timeouts
    REDIRECT_TIMEOUT: 100, // ms

    // Token prefixes
    GUEST_TOKEN_PREFIX: 'guest_',
} as const;

export const AUTH_ERROR_MESSAGES = {
    REGISTER_FAILED: 'Registrasi gagal',
    UPDATE_PROFILE_FAILED: 'Update profile gagal',
    LOGOUT_FAILED: 'Logout gagal',
    PROFILE_FETCH_FAILED: 'Gagal mengambil profil',
    TOKEN_REFRESH_FAILED: 'Gagal memperbarui token',
} as const;

export const AUTH_ROUTES = {
    ONBOARD: '/onboard',
} as const;

export const AUTH_QUERY_KEYS = {
    ROOT: 'auth',
    PROFILE: 'profile',
} as const;