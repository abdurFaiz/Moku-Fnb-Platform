import { describe, it, expect } from 'vitest';
import {
    authQueryKeys,
    useRegister,
    useUpdateProfile,
    useLogout,
    useRefreshToken,
    useProfile,
    useProfileWithConfig,
    transformAuthResponse,
    transformUserData,
    extractUserFromAuthResponse,
    isGuestToken,
    handleAuthRedirect,
    createAuthError,
    AuthErrorType,
    AUTH_CONFIG,
    AUTH_ERROR_MESSAGES,
    authKeys,
} from '../services/auth.queries';
import './setup';

describe('auth.queries - Re-exports', () => {
    describe('Query Keys', () => {
        it('should export authQueryKeys', () => {
            expect(authQueryKeys).toBeDefined();
            expect(authQueryKeys.all).toBeDefined();
            expect(authQueryKeys.profile).toBeDefined();
        });

        it('should export legacy authKeys for backward compatibility', () => {
            expect(authKeys).toBeDefined();
            expect(authKeys.all).toEqual(['auth']);
            expect(authKeys.profile()).toEqual(['auth', 'profile']);
        });
    });

    describe('Mutation Hooks', () => {
        it('should export useRegister', () => {
            expect(useRegister).toBeDefined();
            expect(typeof useRegister).toBe('function');
        });

        it('should export useUpdateProfile', () => {
            expect(useUpdateProfile).toBeDefined();
            expect(typeof useUpdateProfile).toBe('function');
        });

        it('should export useLogout', () => {
            expect(useLogout).toBeDefined();
            expect(typeof useLogout).toBe('function');
        });

        it('should export useRefreshToken', () => {
            expect(useRefreshToken).toBeDefined();
            expect(typeof useRefreshToken).toBe('function');
        });
    });

    describe('Query Hooks', () => {
        it('should export useProfile', () => {
            expect(useProfile).toBeDefined();
            expect(typeof useProfile).toBe('function');
        });

        it('should export useProfileWithConfig', () => {
            expect(useProfileWithConfig).toBeDefined();
            expect(typeof useProfileWithConfig).toBe('function');
        });
    });

    describe('Transformers', () => {
        it('should export transformAuthResponse', () => {
            expect(transformAuthResponse).toBeDefined();
            expect(typeof transformAuthResponse).toBe('function');
        });

        it('should export transformUserData', () => {
            expect(transformUserData).toBeDefined();
            expect(typeof transformUserData).toBe('function');
        });

        it('should export extractUserFromAuthResponse', () => {
            expect(extractUserFromAuthResponse).toBeDefined();
            expect(typeof extractUserFromAuthResponse).toBe('function');
        });
    });

    describe('Error Utilities', () => {
        it('should export isGuestToken', () => {
            expect(isGuestToken).toBeDefined();
            expect(typeof isGuestToken).toBe('function');
        });

        it('should export handleAuthRedirect', () => {
            expect(handleAuthRedirect).toBeDefined();
            expect(typeof handleAuthRedirect).toBe('function');
        });

        it('should export createAuthError', () => {
            expect(createAuthError).toBeDefined();
            expect(typeof createAuthError).toBe('function');
        });

        it('should export AuthErrorType', () => {
            expect(AuthErrorType).toBeDefined();
            expect(AuthErrorType.REGISTER_FAILED).toBe('REGISTER_FAILED');
        });
    });

    describe('Constants', () => {
        it('should export AUTH_CONFIG', () => {
            expect(AUTH_CONFIG).toBeDefined();
            expect(AUTH_CONFIG.STALE_TIME).toBeDefined();
            expect(AUTH_CONFIG.GC_TIME).toBeDefined();
        });

        it('should export AUTH_ERROR_MESSAGES', () => {
            expect(AUTH_ERROR_MESSAGES).toBeDefined();
            expect(AUTH_ERROR_MESSAGES.REGISTER_FAILED).toBeDefined();
        });
    });

    describe('Module Structure', () => {
        it('should have all expected exports', () => {
            const exports = {
                authQueryKeys,
                useRegister,
                useUpdateProfile,
                useLogout,
                useRefreshToken,
                useProfile,
                useProfileWithConfig,
                transformAuthResponse,
                transformUserData,
                extractUserFromAuthResponse,
                isGuestToken,
                handleAuthRedirect,
                createAuthError,
                AuthErrorType,
                AUTH_CONFIG,
                AUTH_ERROR_MESSAGES,
                authKeys,
            };

            Object.values(exports).forEach(exportedItem => {
                expect(exportedItem).toBeDefined();
            });
        });
    });
});
