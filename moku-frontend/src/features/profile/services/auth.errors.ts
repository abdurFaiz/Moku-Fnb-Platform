import { AUTH_ERROR_MESSAGES, AUTH_ROUTES, AUTH_CONFIG } from './auth.constants';

/**
 * Error handling utilities for authentication operations
 * Following Single Responsibility Principle for error handling
 */

export interface AuthError {
    message: string;
    originalError?: any;
}

/**
 * Extract error message from API error response
 * Provides consistent error message extraction
 */
export const extractErrorMessage = (error: any, fallbackMessage: string): string => {
    return error?.response?.data?.message || fallbackMessage;
};

/**
 * Handle authentication errors with consistent logging
 * Centralizes error handling logic
 */
export const handleAuthError = (error: any, operation: string, fallbackMessage: string): AuthError => {
    const message = extractErrorMessage(error, fallbackMessage);
    console.error(`${operation} error:`, message);

    return {
        message,
        originalError: error,
    };
};

/**
 * Handle redirect after authentication operations
 * Separated navigation logic for better testability
 */
export const handleAuthRedirect = (path: string = AUTH_ROUTES.ONBOARD): void => {
    const frontendUrl = import.meta.env.VITE_APP_URL || globalThis.location.origin;

    setTimeout(() => {
        globalThis.location.href = `${frontendUrl}${path}`;
    }, AUTH_CONFIG.REDIRECT_TIMEOUT);
};

/**
 * Check if token is a guest token
 * Single responsibility for token type checking
 */
export const isGuestToken = (token: string | null | undefined): boolean => {
    return token?.startsWith(AUTH_CONFIG.GUEST_TOKEN_PREFIX) ?? false;
};

/**
 * Auth error types for better type safety
 */
export const AuthErrorType = {
    REGISTER_FAILED: 'REGISTER_FAILED',
    UPDATE_PROFILE_FAILED: 'UPDATE_PROFILE_FAILED',
    LOGOUT_FAILED: 'LOGOUT_FAILED',
    PROFILE_FETCH_FAILED: 'PROFILE_FETCH_FAILED',
    TOKEN_REFRESH_FAILED: 'TOKEN_REFRESH_FAILED',
} as const;

export type AuthErrorType = typeof AuthErrorType[keyof typeof AuthErrorType];

/**
 * Create typed auth error
 */
export const createAuthError = (type: AuthErrorType, originalError?: any): AuthError => {
    const messageMap = {
        [AuthErrorType.REGISTER_FAILED]: AUTH_ERROR_MESSAGES.REGISTER_FAILED,
        [AuthErrorType.UPDATE_PROFILE_FAILED]: AUTH_ERROR_MESSAGES.UPDATE_PROFILE_FAILED,
        [AuthErrorType.LOGOUT_FAILED]: AUTH_ERROR_MESSAGES.LOGOUT_FAILED,
        [AuthErrorType.PROFILE_FETCH_FAILED]: AUTH_ERROR_MESSAGES.PROFILE_FETCH_FAILED,
        [AuthErrorType.TOKEN_REFRESH_FAILED]: AUTH_ERROR_MESSAGES.TOKEN_REFRESH_FAILED,
    };

    return {
        message: extractErrorMessage(originalError, messageMap[type]),
        originalError,
    };
};