import { AUTH_QUERY_KEYS } from './auth.constants';

export const authQueryKeys = {
    /**
     * Base auth key - useful for invalidating all auth-related queries
     */
    all: [AUTH_QUERY_KEYS.ROOT] as const,

    /**
     * Profile-related query keys
     */
    profile: (outletSlug?: string) => {
        const keys = [...authQueryKeys.all, 'profile'];
        if (outletSlug) keys.push(outletSlug);
        return keys;
    },

    /**
     * Profile with specific parameters (for future extensibility)
     */
    profileDetail: (userId?: string) => {
        const keys = [...authQueryKeys.profile(), userId].filter(Boolean);
        return keys as readonly (string | undefined)[];
    },

    /**
     * User-specific queries (extensible for future features)
     */
    user: (userId: string) => [...authQueryKeys.all, 'user', userId] as const,

    /**
     * Session-related queries
     */
    session: () => [...authQueryKeys.all, 'session'] as const,

    /**
     * Permissions-related queries (for future RBAC features)
     */
    permissions: (userId?: string) => {
        const keys = [...authQueryKeys.all, 'permissions', userId].filter(Boolean);
        return keys as readonly (string | undefined)[];
    },
} as const;

/**
 * Type for auth query keys
 * Ensures type safety when using query keys
 */
export type AuthQueryKeys = typeof authQueryKeys;

/**
 * Helper to create scoped query keys for specific features
 * Follows Open/Closed Principle - easy to extend without modification
 */
export const createAuthScopedKeys = <T extends readonly string[]>(scope: T) => {
    return [...authQueryKeys.all, ...scope] as const;
};