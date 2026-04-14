import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// Guest token prefix for identification
const GUEST_TOKEN_PREFIX = 'guest_';

// Track if we're already refreshing to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<(token: string) => void> = [];
let refreshPromise: Promise<string> | null = null;

const processQueue = (token: string) => {
  for (const callback of failedQueue) {
    callback(token);
  }
  failedQueue = [];
};

const clearAuthSession = () => {
  localStorage.clear();
  sessionStorage.clear();

  if (globalThis?.location) {
    globalThis.location.href = '/onboard';
  }
};

const shouldForceLogout = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;
  return status === 401 || status === 403 || status === 422;
};

const handleRefreshFailure = (error: unknown) => {
  if (shouldForceLogout(error)) {
    clearAuthSession();
  }
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refresh_token');

  if (!refreshToken) {
    throw new Error('Try to login again');
  }

  const response = await axios.post(
    `${baseURL}/refresh-token`,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
        'Cache-Control': 'no-cache',
      },
    }
  );

  const newAccessToken = response.data?.data?.access_token;
  const newRefreshToken = response.data?.data?.refresh_token;

  if (!newAccessToken) {
    throw new Error('Failed to refresh access token');
  }

  localStorage.setItem('access_token', newAccessToken);

  if (newRefreshToken) {
    localStorage.setItem('refresh_token', newRefreshToken);
  }

  const now = Date.now();
  sessionStorage.setItem('token_timestamp', now.toString());
  sessionStorage.setItem('token_expiry_time', (now + 14 * 24 * 60 * 60 * 1000).toString());

  return newAccessToken;
};

const getFreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        const newToken = await refreshAccessToken();
        processQueue(newToken);
        return newToken;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

// Check if token is a guest token
const isGuestToken = (token: string | null): boolean => {
  return token?.startsWith(GUEST_TOKEN_PREFIX) ?? false;
};

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  withCredentials: true,
});

// Request Interceptor - Add token to all requests (except refresh-token endpoint and guest tokens)
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem('refresh_token');

    const shouldAttemptRefresh = (!token || token === 'null' || token === 'undefined') && !!refreshToken;

    if (shouldAttemptRefresh) {
      try {
        token = await getFreshAccessToken();
      } catch (error) {
        handleRefreshFailure(error);
        throw error;
      }
    }

    // Don't send guest tokens to backend - they are frontend-only
    // Only send real authentication tokens from the backend
    if (token && !isGuestToken(token) && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor - Handle 401 and refresh token automatically
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Get current tokens
    const accessToken = localStorage.getItem('access_token');
    const isGuest = isGuestToken(accessToken);

    // Only handle 401 errors and don't retry if already retried
    // BUT: Skip token refresh for guest users (guest tokens are frontend-only and can't be refreshed)
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest && !isGuest) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          failedQueue.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await getFreshAccessToken();

        if (originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        return axiosInstance(originalRequest);
      } catch (refreshError: any) {


        failedQueue = [];
        handleRefreshFailure(refreshError);
        throw refreshError;
      }
    }

    throw error;
  },
);