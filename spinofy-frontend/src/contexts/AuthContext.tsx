import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { useAuthStore } from '@/features/auth/stores/auth.store';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any;
    login: (access_token: string, refresh_token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const auth = useAuth();

    // Initialize auth state from localStorage on app start
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');

        if (token && refreshToken && !auth.isAuthenticated) {
            // User has tokens but store is not initialized
            // This can happen after page refresh
            const userName = localStorage.getItem('user_name');
            const userId = localStorage.getItem('user_id');
            const userEmail = localStorage.getItem('user_email');

            if (userName && userId) {
                // Restore user session
                const user = {
                    id: Number.parseInt(userId, 10),
                    uuid: userId,
                    name: userName,
                    email: userEmail || '',
                    avatar_url: '',
                    short_name: userName.charAt(0).toUpperCase(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    customer_profile: {
                        id: Number.parseInt(userId, 10),
                        uuid: userId,
                        job: null,
                        date_birth: null,
                        gender: null,
                        avatar: null,
                        user_id: Number.parseInt(userId, 10),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                };

                // Use login method to properly set isAuthenticated flag
                const authStore = useAuthStore.getState();
                authStore.login({
                    access_token: token,
                    refresh_token: refreshToken,
                    user: user
                });
            }
        }
    }, [auth.isAuthenticated]);

    const contextValue: AuthContextValue = useMemo(() => ({
        isAuthenticated: auth.isAuthenticated,
        isLoading: auth.isLoadingProfile,
        user: auth.user,
        login: auth.updateTokens,
        logout: auth.logout,
    }), [auth.isAuthenticated, auth.isLoadingProfile, auth.user, auth.updateTokens, auth.logout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};