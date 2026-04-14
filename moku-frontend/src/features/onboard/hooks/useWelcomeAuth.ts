import { useCallback, useState, useEffect } from 'react';
import { authAPI } from '@/features/auth/api/auth.api';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { isGuestToken } from '@/features/profile/services/auth.errors';
import type { User } from '@/features/profile/types/Auth';

interface UseWelcomeAuthReturn {
    isInitialized: boolean;
    isLoading: boolean;
    isAuthenticated: boolean;
    handleGoogleLogin: () => Promise<void>;
    handleGuestLogin: () => void;
    isAuthProcessing: boolean;
    authError: string | null;
}

export const useWelcomeAuth = (): UseWelcomeAuthReturn => {
    const { isAuthenticated, isLoadingProfile } = useAuth();
    const { login: authLogin, access_token } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthProcessing, setIsAuthProcessing] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // Check if user is a guest
    const isGuest = isGuestToken(access_token);

    useEffect(() => {
        if (!isInitialized) {
            if (isGuest || !isLoadingProfile) {
                setIsInitialized(true);
            }
        }
    }, [isInitialized, isGuest, isLoadingProfile]);

    /**
     * Handles Google login with proper error handling
     * Separated from UI to allow easy testing and reuse
     */
    const handleGoogleLogin = useCallback(async (): Promise<void> => {
        try {
            setIsAuthProcessing(true);
            setAuthError(null);
            await authAPI.loginWithGoogle();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Google login failed';
            setAuthError(errorMessage);
            console.error('Error during Google login:', error);
        } finally {
            setIsAuthProcessing(false);
        }
    }, []);

    /**
     * Handles guest session creation
     * Pure function - generates guest credentials and updates store
     */
    const handleGuestLogin = useCallback((): void => {
        try {
            setAuthError(null);
            const guestUser = generateGuestUser();
            localStorage.setItem('access_token', guestUser.access_token);
            localStorage.setItem('refresh_token', guestUser.refresh_token);
            localStorage.setItem('user_id', guestUser.user.uuid);
            localStorage.setItem('user_name', guestUser.user.name);
            localStorage.setItem('is_guest', 'true');
            authLogin({
                access_token: guestUser.access_token,
                refresh_token: guestUser.refresh_token,
                user: guestUser.user,
            });

            // Force initialization for guest users immediately
            setIsInitialized(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Guest login failed';
            setAuthError(errorMessage);
            console.error('Error during guest login:', error);
        }
    }, [authLogin]);

    return {
        isInitialized,
        isLoading: isLoadingProfile,
        isAuthenticated,
        handleGoogleLogin,
        handleGuestLogin,
        isAuthProcessing,
        authError,
    };
};

/**
 * Pure function to generate guest user credentials
 * Extracted for testability (can be unit tested independently)
 * No side effects or dependencies
 */
export const generateGuestUser = () => {
    const timestamp = Date.now().toString();
    const now = new Date().toISOString();

    const user: User = {
        id: 0,
        uuid: `guest_${timestamp}`,
        name: 'Guest',
        phone: '',
        email: '',
        avatar_url: '',
        created_at: now,
        updated_at: now,
        short_name: '-',
        customer_profile: {
            id: 0,
            uuid: `guest_${timestamp}`,
            job: null,
            date_birth: null,
            gender: null,
            user_id: 0,
            avatar: null,
            created_at: now,
            updated_at: now,
        },
    };

    return {
        access_token: `guest_${timestamp}`,
        refresh_token: `guest_${timestamp}`,
        user,
    };
};
