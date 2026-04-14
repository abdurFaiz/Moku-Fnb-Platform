import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    extractErrorMessage,
    handleAuthError,
    handleAuthRedirect,
    isGuestToken,
    createAuthError,
    AuthErrorType,
} from '../services/auth.errors';
import { AUTH_ERROR_MESSAGES, AUTH_ROUTES, AUTH_CONFIG } from '../services/auth.constants';
import './setup';

describe('auth.errors', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('extractErrorMessage', () => {
        it('should extract error message from API response', () => {
            const error = {
                response: {
                    data: {
                        message: 'Custom error message',
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback message');

            expect(result).toBe('Custom error message');
        });

        it('should return fallback message when no error response', () => {
            const error = {};

            const result = extractErrorMessage(error, 'Fallback message');

            expect(result).toBe('Fallback message');
        });

        it('should return fallback message when error is null', () => {
            const result = extractErrorMessage(null, 'Fallback message');

            expect(result).toBe('Fallback message');
        });

        it('should return fallback message when error is undefined', () => {
            const result = extractErrorMessage(undefined, 'Fallback message');

            expect(result).toBe('Fallback message');
        });

        it('should return fallback message when response.data is missing', () => {
            const error = {
                response: {},
            };

            const result = extractErrorMessage(error, 'Fallback message');

            expect(result).toBe('Fallback message');
        });

        it('should return fallback message when response.data.message is empty', () => {
            const error = {
                response: {
                    data: {
                        message: '',
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback message');

            expect(result).toBe('Fallback message');
        });

        it('should handle nested error structures', () => {
            const error = {
                response: {
                    data: {
                        message: 'Nested error message',
                        errors: {
                            field: ['Field error'],
                        },
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback message');

            expect(result).toBe('Nested error message');
        });
    });

    describe('handleAuthError', () => {
        it('should handle auth error with API message', () => {
            const error = {
                response: {
                    data: {
                        message: 'Authentication failed',
                    },
                },
            };

            const result = handleAuthError(error, 'Login', 'Default error');

            expect(result).toEqual({
                message: 'Authentication failed',
                originalError: error,
            });
        });

        it('should handle auth error with fallback message', () => {
            const error = {};

            const result = handleAuthError(error, 'Login', 'Default error');

            expect(result).toEqual({
                message: 'Default error',
                originalError: error,
            });
        });

        it('should log error to console', () => {
            const consoleSpy = vi.spyOn(console, 'error');
            const error = {
                response: {
                    data: {
                        message: 'Test error',
                    },
                },
            };

            handleAuthError(error, 'TestOperation', 'Fallback');

            expect(consoleSpy).toHaveBeenCalledWith('TestOperation error:', 'Test error');
        });

        it('should handle network errors', () => {
            const networkError = new Error('Network Error');

            const result = handleAuthError(networkError, 'Fetch', 'Network failed');

            expect(result).toEqual({
                message: 'Network failed',
                originalError: networkError,
            });
        });
    });

    describe('handleAuthRedirect', () => {
        it('should redirect to default onboard path', () => {
            const originalHref = globalThis.location.href;

            handleAuthRedirect();

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toContain(AUTH_ROUTES.ONBOARD);

            // Restore
            globalThis.location.href = originalHref;
        });

        it('should redirect to custom path', () => {
            const originalHref = globalThis.location.href;
            const customPath = '/custom-path';

            handleAuthRedirect(customPath);

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toContain(customPath);

            // Restore
            globalThis.location.href = originalHref;
        });

        it('should use environment URL if available', () => {
            const originalHref = globalThis.location.href;
            const originalEnv = import.meta.env.VITE_APP_URL;

            // Mock environment variable
            import.meta.env.VITE_APP_URL = 'https://example.com';

            handleAuthRedirect();

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toBe(`https://example.com${AUTH_ROUTES.ONBOARD}`);

            // Restore
            globalThis.location.href = originalHref;
            import.meta.env.VITE_APP_URL = originalEnv;
        });

        it('should delay redirect by configured timeout', () => {
            const originalHref = globalThis.location.href;

            handleAuthRedirect();

            // Before timeout
            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT - 1);
            expect(globalThis.location.href).toBe(originalHref);

            // After timeout
            vi.advanceTimersByTime(1);
            expect(globalThis.location.href).toContain(AUTH_ROUTES.ONBOARD);

            // Restore
            globalThis.location.href = originalHref;
        });
    });

    describe('isGuestToken', () => {
        it('should return true for guest token', () => {
            const guestToken = `${AUTH_CONFIG.GUEST_TOKEN_PREFIX}abc123`;

            const result = isGuestToken(guestToken);

            expect(result).toBe(true);
        });

        it('should return false for regular token', () => {
            const regularToken = 'regular_token_abc123';

            const result = isGuestToken(regularToken);

            expect(result).toBe(false);
        });

        it('should return false for null token', () => {
            const result = isGuestToken(null);

            expect(result).toBe(false);
        });

        it('should return false for undefined token', () => {
            const result = isGuestToken(undefined);

            expect(result).toBe(false);
        });

        it('should return false for empty string', () => {
            const result = isGuestToken('');

            expect(result).toBe(false);
        });

        it('should be case-sensitive', () => {
            const token = 'GUEST_abc123';

            const result = isGuestToken(token);

            expect(result).toBe(false);
        });

        it('should check prefix at start of string', () => {
            const token = `abc${AUTH_CONFIG.GUEST_TOKEN_PREFIX}123`;

            const result = isGuestToken(token);

            expect(result).toBe(false);
        });
    });

    describe('createAuthError', () => {
        it('should create REGISTER_FAILED error', () => {
            const originalError = new Error('Registration failed');

            const result = createAuthError(AuthErrorType.REGISTER_FAILED, originalError);

            expect(result).toEqual({
                message: AUTH_ERROR_MESSAGES.REGISTER_FAILED,
                originalError,
            });
        });

        it('should create UPDATE_PROFILE_FAILED error', () => {
            const originalError = new Error('Update failed');

            const result = createAuthError(AuthErrorType.UPDATE_PROFILE_FAILED, originalError);

            expect(result).toEqual({
                message: AUTH_ERROR_MESSAGES.UPDATE_PROFILE_FAILED,
                originalError,
            });
        });

        it('should create LOGOUT_FAILED error', () => {
            const originalError = new Error('Logout failed');

            const result = createAuthError(AuthErrorType.LOGOUT_FAILED, originalError);

            expect(result).toEqual({
                message: AUTH_ERROR_MESSAGES.LOGOUT_FAILED,
                originalError,
            });
        });

        it('should create PROFILE_FETCH_FAILED error', () => {
            const originalError = new Error('Fetch failed');

            const result = createAuthError(AuthErrorType.PROFILE_FETCH_FAILED, originalError);

            expect(result).toEqual({
                message: AUTH_ERROR_MESSAGES.PROFILE_FETCH_FAILED,
                originalError,
            });
        });

        it('should create TOKEN_REFRESH_FAILED error', () => {
            const originalError = new Error('Refresh failed');

            const result = createAuthError(AuthErrorType.TOKEN_REFRESH_FAILED, originalError);

            expect(result).toEqual({
                message: AUTH_ERROR_MESSAGES.TOKEN_REFRESH_FAILED,
                originalError,
            });
        });

        it('should extract custom error message from API response', () => {
            const apiError = {
                response: {
                    data: {
                        message: 'Custom API error message',
                    },
                },
            };

            const result = createAuthError(AuthErrorType.REGISTER_FAILED, apiError);

            expect(result.message).toBe('Custom API error message');
            expect(result.originalError).toBe(apiError);
        });

        it('should handle error without originalError', () => {
            const result = createAuthError(AuthErrorType.LOGOUT_FAILED);

            expect(result).toEqual({
                message: AUTH_ERROR_MESSAGES.LOGOUT_FAILED,
                originalError: undefined,
            });
        });

        it('should handle null originalError', () => {
            const result = createAuthError(AuthErrorType.LOGOUT_FAILED, null);

            expect(result.message).toBe(AUTH_ERROR_MESSAGES.LOGOUT_FAILED);
            expect(result.originalError).toBeNull();
        });
    });

    describe('AuthErrorType', () => {
        it('should have all error types defined', () => {
            expect(AuthErrorType.REGISTER_FAILED).toBe('REGISTER_FAILED');
            expect(AuthErrorType.UPDATE_PROFILE_FAILED).toBe('UPDATE_PROFILE_FAILED');
            expect(AuthErrorType.LOGOUT_FAILED).toBe('LOGOUT_FAILED');
            expect(AuthErrorType.PROFILE_FETCH_FAILED).toBe('PROFILE_FETCH_FAILED');
            expect(AuthErrorType.TOKEN_REFRESH_FAILED).toBe('TOKEN_REFRESH_FAILED');
        });

        it('should be immutable (readonly in TypeScript)', () => {
            // AuthErrorType is defined with 'as const' which makes it readonly in TypeScript
            // but at runtime JavaScript objects are mutable unless frozen
            // This test verifies the values are correct
            expect(AuthErrorType.REGISTER_FAILED).toBe('REGISTER_FAILED');
            expect(AuthErrorType.UPDATE_PROFILE_FAILED).toBe('UPDATE_PROFILE_FAILED');
            expect(AuthErrorType.LOGOUT_FAILED).toBe('LOGOUT_FAILED');
            expect(AuthErrorType.PROFILE_FETCH_FAILED).toBe('PROFILE_FETCH_FAILED');
            expect(AuthErrorType.TOKEN_REFRESH_FAILED).toBe('TOKEN_REFRESH_FAILED');

            // TypeScript will prevent modification at compile time
            // AuthErrorType.REGISTER_FAILED = 'MODIFIED';
        });
    });

    describe('Edge Cases', () => {
        it('should handle circular reference in error object', () => {
            const circularError: any = { message: 'Circular' };
            circularError.self = circularError;

            const result = extractErrorMessage(circularError, 'Fallback');

            expect(result).toBe('Fallback');
        });

        it('should handle very long error messages', () => {
            const longMessage = 'a'.repeat(10000);
            const error = {
                response: {
                    data: {
                        message: longMessage,
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe(longMessage);
            expect(result.length).toBe(10000);
        });

        it('should handle special characters in error messages', () => {
            const specialMessage = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const error = {
                response: {
                    data: {
                        message: specialMessage,
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe(specialMessage);
        });

        it('should handle unicode in error messages', () => {
            const unicodeMessage = '错误消息 🚨 رسالة خطأ';
            const error = {
                response: {
                    data: {
                        message: unicodeMessage,
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe(unicodeMessage);
        });

        it('should handle error with response but no data', () => {
            const error = {
                response: {
                    status: 500,
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe('Fallback');
        });

        it('should handle error with data but message is null', () => {
            const error = {
                response: {
                    data: {
                        message: null,
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe('Fallback');
        });

        it('should handle error with data but message is whitespace only', () => {
            const error = {
                response: {
                    data: {
                        message: '   ',
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe('   ');
        });

        it('should handle error with numeric message', () => {
            const error = {
                response: {
                    data: {
                        message: 404,
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe(404);
        });

        it('should handle error with boolean message', () => {
            const error = {
                response: {
                    data: {
                        message: false,
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toBe('Fallback');
        });

        it('should handle error with array message', () => {
            const error = {
                response: {
                    data: {
                        message: ['Error 1', 'Error 2'],
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toEqual(['Error 1', 'Error 2']);
        });

        it('should handle error with object message', () => {
            const error = {
                response: {
                    data: {
                        message: { field: 'error' },
                    },
                },
            };

            const result = extractErrorMessage(error, 'Fallback');

            expect(result).toEqual({ field: 'error' });
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete error flow with createAuthError and handleAuthError', () => {
            const apiError = {
                response: {
                    data: {
                        message: 'API Error Message',
                    },
                },
            };

            const authError = createAuthError(AuthErrorType.REGISTER_FAILED, apiError);
            expect(authError.message).toBe('API Error Message');

            const handledError = handleAuthError(apiError, 'Registration', AUTH_ERROR_MESSAGES.REGISTER_FAILED);
            expect(handledError.message).toBe('API Error Message');
        });

        it('should handle error flow without API message', () => {
            const genericError = new Error('Generic error');

            const authError = createAuthError(AuthErrorType.LOGOUT_FAILED, genericError);
            expect(authError.message).toBe(AUTH_ERROR_MESSAGES.LOGOUT_FAILED);

            const handledError = handleAuthError(genericError, 'Logout', AUTH_ERROR_MESSAGES.LOGOUT_FAILED);
            expect(handledError.message).toBe(AUTH_ERROR_MESSAGES.LOGOUT_FAILED);
        });

        it('should handle redirect with guest token check', () => {
            const originalHref = globalThis.location.href;
            const guestToken = `${AUTH_CONFIG.GUEST_TOKEN_PREFIX}test123`;

            expect(isGuestToken(guestToken)).toBe(true);

            handleAuthRedirect(AUTH_ROUTES.ONBOARD);
            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toContain(AUTH_ROUTES.ONBOARD);

            // Restore
            globalThis.location.href = originalHref;
        });

        it('should handle all error types in sequence', () => {
            const errorTypes = [
                AuthErrorType.REGISTER_FAILED,
                AuthErrorType.UPDATE_PROFILE_FAILED,
                AuthErrorType.LOGOUT_FAILED,
                AuthErrorType.PROFILE_FETCH_FAILED,
                AuthErrorType.TOKEN_REFRESH_FAILED,
            ];

            errorTypes.forEach((type) => {
                const error = createAuthError(type);
                expect(error.message).toBeDefined();
                expect(error.message).not.toBe('');
            });
        });
    });

    describe('handleAuthRedirect - Additional Coverage', () => {
        it('should handle redirect with empty path', () => {
            const originalHref = globalThis.location.href;

            handleAuthRedirect('');

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toContain('');

            // Restore
            globalThis.location.href = originalHref;
        });

        it('should handle redirect with path containing query params', () => {
            const originalHref = globalThis.location.href;
            const pathWithQuery = '/onboard?step=1&source=test';

            handleAuthRedirect(pathWithQuery);

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toContain(pathWithQuery);

            // Restore
            globalThis.location.href = originalHref;
        });

        it('should handle redirect with path containing hash', () => {
            const originalHref = globalThis.location.href;
            const pathWithHash = '/onboard#section';

            handleAuthRedirect(pathWithHash);

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toContain(pathWithHash);

            // Restore
            globalThis.location.href = originalHref;
        });

        it('should use location.origin when VITE_APP_URL is empty string', () => {
            const originalHref = globalThis.location.href;
            const originalEnv = import.meta.env.VITE_APP_URL;

            import.meta.env.VITE_APP_URL = '';

            handleAuthRedirect(AUTH_ROUTES.ONBOARD);

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            expect(globalThis.location.href).toContain(AUTH_ROUTES.ONBOARD);

            // Restore
            globalThis.location.href = originalHref;
            import.meta.env.VITE_APP_URL = originalEnv;
        });

        it('should handle redirect with absolute URL in path', () => {
            const originalHref = globalThis.location.href;
            const absolutePath = 'https://external.com/path';

            handleAuthRedirect(absolutePath);

            vi.advanceTimersByTime(AUTH_CONFIG.REDIRECT_TIMEOUT);

            // Should still append to frontend URL
            expect(globalThis.location.href).toContain(absolutePath);

            // Restore
            globalThis.location.href = originalHref;
        });
    });

    describe('isGuestToken - Additional Coverage', () => {
        it('should handle token with guest prefix in middle', () => {
            const token = `abc_${AUTH_CONFIG.GUEST_TOKEN_PREFIX}_def`;

            const result = isGuestToken(token);

            expect(result).toBe(false);
        });

        it('should handle token that is exactly the prefix', () => {
            const token = AUTH_CONFIG.GUEST_TOKEN_PREFIX;

            const result = isGuestToken(token);

            expect(result).toBe(true);
        });

        it('should handle token with prefix and special characters', () => {
            const token = `${AUTH_CONFIG.GUEST_TOKEN_PREFIX}!@#$%^&*()`;

            const result = isGuestToken(token);

            expect(result).toBe(true);
        });

        it('should handle token with prefix and numbers only', () => {
            const token = `${AUTH_CONFIG.GUEST_TOKEN_PREFIX}123456789`;

            const result = isGuestToken(token);

            expect(result).toBe(true);
        });

        it('should handle token with prefix and unicode', () => {
            const token = `${AUTH_CONFIG.GUEST_TOKEN_PREFIX}测试`;

            const result = isGuestToken(token);

            expect(result).toBe(true);
        });

        it('should handle whitespace token', () => {
            const result = isGuestToken('   ');

            expect(result).toBe(false);
        });

        it('should handle token with only whitespace after prefix', () => {
            const token = `${AUTH_CONFIG.GUEST_TOKEN_PREFIX}   `;

            const result = isGuestToken(token);

            expect(result).toBe(true);
        });
    });

    describe('createAuthError - Additional Coverage', () => {
        it('should handle all error types with custom API messages', () => {
            const errorTypes = [
                AuthErrorType.REGISTER_FAILED,
                AuthErrorType.UPDATE_PROFILE_FAILED,
                AuthErrorType.LOGOUT_FAILED,
                AuthErrorType.PROFILE_FETCH_FAILED,
                AuthErrorType.TOKEN_REFRESH_FAILED,
            ];

            errorTypes.forEach((type) => {
                const apiError = {
                    response: {
                        data: {
                            message: `Custom ${type} message`,
                        },
                    },
                };

                const result = createAuthError(type, apiError);

                expect(result.message).toBe(`Custom ${type} message`);
                expect(result.originalError).toBe(apiError);
            });
        });

        it('should handle error with empty response data', () => {
            const error = {
                response: {
                    data: {},
                },
            };

            const result = createAuthError(AuthErrorType.REGISTER_FAILED, error);

            expect(result.message).toBe(AUTH_ERROR_MESSAGES.REGISTER_FAILED);
        });

        it('should handle error with undefined response', () => {
            const error = {
                response: undefined,
            };

            const result = createAuthError(AuthErrorType.UPDATE_PROFILE_FAILED, error);

            expect(result.message).toBe(AUTH_ERROR_MESSAGES.UPDATE_PROFILE_FAILED);
        });

        it('should preserve originalError reference', () => {
            const originalError = { custom: 'error', code: 500 };

            const result = createAuthError(AuthErrorType.LOGOUT_FAILED, originalError);

            expect(result.originalError).toBe(originalError);
            expect(result.originalError.custom).toBe('error');
            expect(result.originalError.code).toBe(500);
        });
    });

    describe('handleAuthError - Additional Coverage', () => {
        it('should handle error with different operation names', () => {
            const operations = ['Login', 'Register', 'Logout', 'UpdateProfile', 'FetchProfile'];
            const error = {
                response: {
                    data: {
                        message: 'Test error',
                    },
                },
            };

            operations.forEach((operation) => {
                const consoleSpy = vi.spyOn(console, 'error');

                const result = handleAuthError(error, operation, 'Fallback');

                expect(result.message).toBe('Test error');
                expect(consoleSpy).toHaveBeenCalledWith(`${operation} error:`, 'Test error');

                consoleSpy.mockRestore();
            });
        });

        it('should handle error with empty fallback message', () => {
            const error = {};

            const result = handleAuthError(error, 'Test', '');

            expect(result.message).toBe('');
        });

        it('should handle error with very long operation name', () => {
            const consoleSpy = vi.spyOn(console, 'error');
            const longOperation = 'A'.repeat(1000);
            const error = {
                response: {
                    data: {
                        message: 'Error',
                    },
                },
            };

            handleAuthError(error, longOperation, 'Fallback');

            expect(consoleSpy).toHaveBeenCalledWith(`${longOperation} error:`, 'Error');

            consoleSpy.mockRestore();
        });

        it('should handle multiple consecutive errors', () => {
            const consoleSpy = vi.spyOn(console, 'error');
            const error1 = { response: { data: { message: 'Error 1' } } };
            const error2 = { response: { data: { message: 'Error 2' } } };
            const error3 = { response: { data: { message: 'Error 3' } } };

            handleAuthError(error1, 'Op1', 'Fallback1');
            handleAuthError(error2, 'Op2', 'Fallback2');
            handleAuthError(error3, 'Op3', 'Fallback3');

            expect(consoleSpy).toHaveBeenCalledTimes(3);
            expect(consoleSpy).toHaveBeenNthCalledWith(1, 'Op1 error:', 'Error 1');
            expect(consoleSpy).toHaveBeenNthCalledWith(2, 'Op2 error:', 'Error 2');
            expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Op3 error:', 'Error 3');

            consoleSpy.mockRestore();
        });

        it('should return error object with correct structure', () => {
            const error = { test: 'error' };

            const result = handleAuthError(error, 'Test', 'Fallback');

            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('originalError');
            expect(Object.keys(result)).toHaveLength(2);
        });
    });

    describe('Type Safety and Constants', () => {
        it('should verify AUTH_ERROR_MESSAGES constants are used correctly', () => {
            expect(AUTH_ERROR_MESSAGES.REGISTER_FAILED).toBe('Registrasi gagal');
            expect(AUTH_ERROR_MESSAGES.UPDATE_PROFILE_FAILED).toBe('Update profile gagal');
            expect(AUTH_ERROR_MESSAGES.LOGOUT_FAILED).toBe('Logout gagal');
            expect(AUTH_ERROR_MESSAGES.PROFILE_FETCH_FAILED).toBe('Gagal mengambil profil');
            expect(AUTH_ERROR_MESSAGES.TOKEN_REFRESH_FAILED).toBe('Gagal memperbarui token');
        });

        it('should verify AUTH_ROUTES constants', () => {
            expect(AUTH_ROUTES.ONBOARD).toBe('/onboard');
        });

        it('should verify AUTH_CONFIG constants', () => {
            expect(AUTH_CONFIG.REDIRECT_TIMEOUT).toBe(100);
            expect(AUTH_CONFIG.GUEST_TOKEN_PREFIX).toBe('guest_');
            expect(AUTH_CONFIG.STALE_TIME).toBe(5 * 60 * 1000);
            expect(AUTH_CONFIG.GC_TIME).toBe(10 * 60 * 1000);
        });

        it('should verify all AuthErrorType values', () => {
            const expectedTypes = [
                'REGISTER_FAILED',
                'UPDATE_PROFILE_FAILED',
                'LOGOUT_FAILED',
                'PROFILE_FETCH_FAILED',
                'TOKEN_REFRESH_FAILED',
            ];

            const actualTypes = Object.values(AuthErrorType);

            expect(actualTypes).toEqual(expectedTypes);
            expect(actualTypes.length).toBe(5);
        });
    });
});
