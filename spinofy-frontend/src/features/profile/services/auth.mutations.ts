import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI, type RefreshTokenResponse } from "@/features/auth/api/auth.api";
import {ProfileApi} from '../api/profile.api'
import { useAuthStore } from "@/features/auth/stores/auth.store";
import type { FormValues } from "@/features/profile/schemas/profile.schemas";
import type { AuthResponse } from "@/features/profile/types/Auth";
import {
    transformAuthResponse,
    extractUserFromAuthResponse
} from './auth.transformers';
import {
    createAuthError,
    AuthErrorType,
    handleAuthRedirect
} from './auth.errors';
import { authQueryKeys } from './auth.keys';


export const useRegister = () => {
    const login = useAuthStore((state) => state.login);

    return useMutation({
        mutationFn: (data: FormValues) => authAPI.register(data),
        onSuccess: (responseData: AuthResponse) => {
            try {
                const authData = transformAuthResponse(responseData);
                // Ensure tokens exist before login
                if (authData.access_token && authData.refresh_token) {
                    login({
                        access_token: authData.access_token,
                        refresh_token: authData.refresh_token,
                        user: authData.user
                    });
                } else {
                    throw new Error('Missing authentication tokens in response');
                }
            } catch (error) {
                console.error('Error transforming auth data:', error);
                throw createAuthError(AuthErrorType.REGISTER_FAILED, error);
            }
        },
        onError: (error: any) => {
            const authError = createAuthError(AuthErrorType.REGISTER_FAILED, error);
            console.error('Register error:', authError.message);
            throw authError;
        },
    });
};

/**
 * Update profile mutation hook
 * Single responsibility: Handle profile updates
 */
export const useUpdateProfile = () => {
    const updateUser = useAuthStore((state) => state.updateUser);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: FormValues) => ProfileApi.updateProfile(data),
        onSuccess: (responseData: AuthResponse) => {
            try {
                const user = extractUserFromAuthResponse(responseData);
                updateUser(user);

                // Invalidate profile query to refetch
                queryClient.invalidateQueries({
                    queryKey: authQueryKeys.profile()
                });
            } catch (error) {
                console.error('Error transforming profile data:', error);
                throw createAuthError(AuthErrorType.UPDATE_PROFILE_FAILED, error);
            }
        },
        onError: (error: any) => {
            const authError = createAuthError(AuthErrorType.UPDATE_PROFILE_FAILED, error);
            console.error('Update profile error:', authError.message);
            throw authError;
        },
    });
};

/**
 * Logout mutation hook
 * Single responsibility: Handle user logout
 */
export const useLogout = () => {
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => ProfileApi.logout(),
        onSuccess: () => {
            logout();
            queryClient.clear(); // Clear all queries
            handleAuthRedirect();
        },
        onError: (error: any) => {
            // Even if logout fails on server, we should clear local state
            logout();
            queryClient.clear();

            const authError = createAuthError(AuthErrorType.LOGOUT_FAILED, error);
            console.error('Logout error:', authError.message);

            // Still redirect to onboard even on error
            handleAuthRedirect();
        },
    });
};

/**
 * Refresh token mutation hook
 * Single responsibility: Handle token refresh
 */
export const useRefreshToken = () => {
    const updateTokens = useAuthStore((state) => state.updateTokens);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    return useMutation({
        mutationFn: () => authAPI.refreshToken(),
        onSuccess: (response: RefreshTokenResponse) => {
            try {
                updateTokens(
                    response.data.access_token,
                    response.data.refresh_token
                );
            } catch (error) {
                console.error('Error updating tokens:', error);
                clearAuth();
                throw createAuthError(AuthErrorType.TOKEN_REFRESH_FAILED, error);
            }
        },
        onError: (error: any) => {
            // If refresh fails, clear auth state
            clearAuth();
            const authError = createAuthError(AuthErrorType.TOKEN_REFRESH_FAILED, error);
            console.error('Token refresh error:', authError.message);
            throw authError;
        },
    });
};