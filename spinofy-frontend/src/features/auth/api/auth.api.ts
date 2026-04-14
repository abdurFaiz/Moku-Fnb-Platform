import { axiosInstance } from "@/lib/axios";
import type { AuthResponse } from "@/features/profile/types/Auth";
import type { FormValues } from "@/features/profile/schemas/profile.schemas";

export interface LoginRequest {
  phone: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    user?: {
      id: number;
      uuid: string;
      name: string;
      email: string;
      phone: string;
      email_verified_at: string | null;
      pin: string | null;
      outlet_id: string | null;
      google_id: string | null;
      created_at: string;
      updated_at: string;
      roles?: Array<{
        id: number;
        name: string;
        guard_name: string;
        created_at: string;
        updated_at: string;
      }>;
    };
  };
}

// Helper function to convert gender string to number for API
const genderToNumber = (gender: string | undefined): number | undefined => {
  if (!gender) return undefined;
  return gender === 'male' ? 1 : 2;
};

class AuthAPI {
  async register(data: FormValues): Promise<AuthResponse> {
    const formData = new FormData();

    // Add required fields
    formData.append('name', data.name);
    formData.append('phone', data.phone);

    // Only include optional fields if they have values
    if (data.date_birth) {
      formData.append('date_birth', data.date_birth);
    }
    if (data.gender) {
      formData.append('gender', genderToNumber(data.gender)!.toString());
    }
    if (data.job) {
      formData.append('job', data.job);
    }
    if (data.avatar instanceof File) {
      formData.append('avatar', data.avatar);
    }

    const response = await axiosInstance.post("register", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Refresh access token
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await axiosInstance.post("refresh-token");
    return response.data;
  }

  // Initiate Google OAuth login (redirect to Google)
  async loginWithGoogle(): Promise<void> {

    // Get base URL from environment, normalize it
    const apiUrl = import.meta.env.VITE_API_URL;
    const baseUrl = apiUrl.replace('/api', '');

    const callbackUrl = `${apiUrl}/auth/callback`;

    // Add timestamp to prevent caching of OAuth flow
    const timestamp = Date.now();
    const googleAuthUrl = `${baseUrl}/webhook/google/redirect?callback=${encodeURIComponent(callbackUrl)}&_t=${timestamp}`;
    await this.clearAllBrowserData();

    globalThis.location.href = googleAuthUrl;
  }

  // Clear all browser data like incognito mode
  private async clearAllBrowserData(): Promise<void> {
    try {

      // 1. Clear Local & Session Storage
      localStorage.clear();
      sessionStorage.clear();

      // 2. Clear ALL cookies (comprehensive approach)
      await this.clearAllCookies();

      // 3. Clear Service Worker Caches
      await this.clearServiceWorkerCache();

    } catch (error) {
      throw new Error(`Failed to clear browser data: ${error}`);
    }
  }

  // Enhanced cookie clearing
  private async clearAllCookies(): Promise<void> {
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
              `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain};secure;samesite=none`
            ];

            for (const config of configurations) {
              try {
                document.cookie = config;
              } catch (error) {
                throw new Error(`Failed to clear cookie ${cookieName} with config: ${config}`);
              }
            }
          }
        }
      }
    }
  }

  // Clear Service Worker cache
  private async clearServiceWorkerCache(): Promise<void> {
    if ('serviceWorker' in navigator && 'caches' in globalThis) {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();

        // Delete all caches
        await Promise.all(
          cacheNames.map(cacheName => {
            return caches.delete(cacheName);
          })
        );

        // Send message to service worker to clear cache
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE'
          });
        }
      } catch (error) {
        console.warn('Failed to clear service worker cache:', error);
      }
    }
  }

  // Handle Google OAuth callback (after user returns from Google)
  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await axiosInstance.post("/webhook/google/callback", {
      code: code
    });
    return response.data;
  }
}

export const authAPI = new AuthAPI();
