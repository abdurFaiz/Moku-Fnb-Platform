import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import {
    extractUserFromAuthResponse
} from './auth.transformers';
import {
    createAuthError,
    AuthErrorType,
    isGuestToken
} from './auth.errors';
import { AUTH_CONFIG } from './auth.constants';
import { useQueryProfile } from '@/features/profile/hooks/api/useQueryProfile';

export const useProfile = (outletSlug?: string) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const accessToken = useAuthStore((state) => state.access_token);
    const updateUser = useAuthStore((state) => state.updateUser);

    // Get outlet slug from outlet storage if not provided
    const storedOutletSlug = useOutletStore((state) => state.outletSlug);
    const finalOutletSlug = outletSlug || storedOutletSlug || '';

    // Don't fetch profile for guest users
    const isGuest = isGuestToken(accessToken);

    const queryResult = useQueryProfile(finalOutletSlug, {
        enabled: isAuthenticated && !isGuest,
        staleTime: AUTH_CONFIG.STALE_TIME,
        gcTime: AUTH_CONFIG.GC_TIME,
        retry: (failureCount, error) => {
            const status = (error as any)?.response?.status;

            if (status === 401 || status === 403) {
                return false;
            }

            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    const computedProfile = useMemo(() => {
        if (!queryResult.data) {
            return undefined;
        }

        return {
            user: extractUserFromAuthResponse(queryResult.data),
            stats: {
                total_point: queryResult.data.data.total_point,
                total_order: queryResult.data.data.total_order,
                total_user_voucher: queryResult.data.data.total_user_voucher,
            },
        } as const;
    }, [queryResult.data]);

    useEffect(() => {
        if (!computedProfile) {
            return;
        }

        updateUser(computedProfile.user, computedProfile.stats);
    }, [computedProfile, updateUser]);

    const enhancedError = useMemo(() => {
        if (!queryResult.error) {
            return undefined;
        }

        return createAuthError(AuthErrorType.PROFILE_FETCH_FAILED, queryResult.error);
    }, [queryResult.error]);

    useEffect(() => {
        if (enhancedError) {
            console.error('Profile fetch error:', enhancedError.message);
        }
    }, [enhancedError]);

    return {
        ...queryResult,
        data: computedProfile?.user,
        profile: computedProfile,
        profileResponse: queryResult.data,
        error: enhancedError,
    };
};

/**

 * @param config - Optional configuration overrides
 * @returns Query result with user profile data
 */
export const useProfileWithConfig = (config?: Partial<{
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
    refetchIntervalInBackground?: boolean;
    outletSlug?: string;
}>) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const accessToken = useAuthStore((state) => state.access_token);
    const updateUser = useAuthStore((state) => state.updateUser);

    // Get outlet slug from outlet storage if not provided in config
    const storedOutletSlug = useOutletStore((state) => state.outletSlug);
    const finalOutletSlug = config?.outletSlug || storedOutletSlug || '';

    const isGuest = isGuestToken(accessToken);
    const shouldFetch = config?.enabled ?? (isAuthenticated && !isGuest);

    const queryResult = useQueryProfile(finalOutletSlug, {
        enabled: shouldFetch,
        staleTime: config?.staleTime ?? AUTH_CONFIG.STALE_TIME,
        gcTime: config?.gcTime ?? AUTH_CONFIG.GC_TIME,
        refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
        refetchInterval: config?.refetchInterval,
        refetchIntervalInBackground: config?.refetchIntervalInBackground,
        retry: (failureCount, error) => {
            const status = (error as any)?.response?.status;
            if (status === 401 || status === 403) {
                return false;
            }
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    const computedProfile = useMemo(() => {
        if (!queryResult.data) {
            return undefined;
        }

        return {
            user: extractUserFromAuthResponse(queryResult.data),
            stats: {
                total_point: queryResult.data.data.total_point,
                total_order: queryResult.data.data.total_order,
                total_user_voucher: queryResult.data.data.total_user_voucher,
            },
        } as const;
    }, [queryResult.data]);

    useEffect(() => {
        if (!computedProfile) {
            return;
        }

        updateUser(computedProfile.user, computedProfile.stats);
    }, [computedProfile, updateUser]);

    const enhancedError = useMemo(() => {
        if (!queryResult.error) {
            return undefined;
        }

        return createAuthError(AuthErrorType.PROFILE_FETCH_FAILED, queryResult.error);
    }, [queryResult.error]);

    useEffect(() => {
        if (enhancedError) {
            console.error('Profile fetch error:', enhancedError.message);
        }
    }, [enhancedError]);

    return {
        ...queryResult,
        data: computedProfile?.user,
        profile: computedProfile,
        profileResponse: queryResult.data,
        error: enhancedError,
    };
};