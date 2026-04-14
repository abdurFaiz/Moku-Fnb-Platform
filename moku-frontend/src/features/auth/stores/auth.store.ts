import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/features/profile/types/Auth';

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  total_point: number;
  total_order: number;
  total_user_voucher: number;

  // Actions
  login: (authData: { access_token: string; refresh_token: string; user: User }) => void;
  logout: () => void;
  updateUser: (user: User, stats?: { total_point?: number; total_order?: number; total_user_voucher?: number }) => void;
  updateTokens: (access_token: string, refresh_token: string) => void;
  updateStats: (stats: { total_point?: number; total_order?: number; total_user_voucher?: number }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      access_token: null,
      refresh_token: null,
      total_point: 0,
      total_order: 0,
      total_user_voucher: 0,

      login: (authData: { access_token: string; refresh_token: string; user: User }) => {
        // Update localStorage
        localStorage.setItem('access_token', authData.access_token);
        localStorage.setItem('refresh_token', authData.refresh_token);
        localStorage.setItem('user_name', authData.user.name);
        localStorage.setItem('user_id', authData.user.id.toString());
        set({
          isAuthenticated: true,
          user: authData.user,
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
        });
      },

      logout: () => {
        // Clear localStorage completely
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear ALL cookies (including backend cookies)
        const clearCookies = () => {
          const domains = [
            '',
            '.' + globalThis.location.hostname,
            globalThis.location.hostname,
            'localhost',
            '127.0.0.1',
            '.localhost',
            '.127.0.0.1'
          ];

          const paths = ['/', '/api', '/auth', '/webhook'];

          // Get all cookies
          const cookies = document.cookie.split(';');

          // Clear cookies for all possible combinations
          for (const cookie of cookies) {
            const cookieName = cookie.trim().split('=')[0];
            if (cookieName) {
              for (const domain of domains) {
                for (const path of paths) {
                  // Clear with different configurations
                  const configurations = [
                    `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`,
                    `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain}`,
                    `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain};secure`,
                  ];

                  for (const config of configurations) {
                    try {
                      document.cookie = config;
                    } catch (e) {
                      // Ignore errors
                    }
                  }
                }
              }
            }
          }
        };

        clearCookies();

        // Clear Service Worker caches
        if ('caches' in globalThis) {
          caches.keys().then((cacheNames) => {
            for (const cacheName of cacheNames) {
              caches.delete(cacheName);
            }
          });
        }

        // Send message to service worker to clear cache
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE'
          });
        }

        set({
          isAuthenticated: false,
          user: null,
          access_token: null,
          refresh_token: null,
          total_point: 0,
          total_order: 0,
          total_user_voucher: 0,
        });


      },

      updateUser: (user: User, stats?: { total_point?: number; total_order?: number; total_user_voucher?: number }) => {
        // Update localStorage with new user data
        localStorage.setItem('user_name', user.name);
        localStorage.setItem('user_id', user.id.toString());

        const updateState: any = {
          user,
          isAuthenticated: true // Ensure isAuthenticated is true when updating user
        };

        // Update stats if provided
        if (stats?.total_point !== undefined) updateState.total_point = stats.total_point;
        if (stats?.total_order !== undefined) updateState.total_order = stats.total_order;
        if (stats?.total_user_voucher !== undefined) updateState.total_user_voucher = stats.total_user_voucher;

        set(updateState);
      },

      updateStats: (stats: { total_point?: number; total_order?: number; total_user_voucher?: number }) => {
        const updateState: any = {};

        if (stats.total_point !== undefined) updateState.total_point = stats.total_point;
        if (stats.total_order !== undefined) updateState.total_order = stats.total_order;
        if (stats.total_user_voucher !== undefined) updateState.total_user_voucher = stats.total_user_voucher;

        set(updateState);
      },

      updateTokens: (access_token: string, refresh_token: string) => {
        // Update localStorage
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        set({
          access_token,
          refresh_token,
          isAuthenticated: true, // Set isAuthenticated when tokens are updated
        });
      },

      clearAuth: () => {
        // Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_id');

        set({
          isAuthenticated: false,
          user: null,
          access_token: null,
          refresh_token: null,
        });
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        access_token: state.access_token,
        refresh_token: state.refresh_token,
      }),
      // Hydrate state from storage on initialization
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sync with localStorage after hydration
          const token = localStorage.getItem('access_token');
          const refreshToken = localStorage.getItem('refresh_token');

          // If tokens exist in localStorage but state is not authenticated, fix it
          if (token && refreshToken && !state.isAuthenticated) {
            state.isAuthenticated = true;
          }
          // If no tokens in localStorage but state says authenticated, clear it
          if ((!token || !refreshToken) && state.isAuthenticated) {
            state.isAuthenticated = false;
            state.user = null;
            state.access_token = null;
            state.refresh_token = null;
          }
        }
      },
    }
  )
);