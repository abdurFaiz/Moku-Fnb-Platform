import { describe, it, expect } from 'vitest';
import { AUTH_CONFIG, AUTH_ERROR_MESSAGES, AUTH_ROUTES, AUTH_QUERY_KEYS } from '../services/auth.constants';
import './setup';

describe('auth.constants', () => {
    describe('AUTH_CONFIG', () => {
        it('should have STALE_TIME defined', () => {
            expect(AUTH_CONFIG.STALE_TIME).toBeDefined();
            expect(typeof AUTH_CONFIG.STALE_TIME).toBe('number');
        });

        it('should have STALE_TIME of 5 minutes', () => {
            const fiveMinutesInMs = 5 * 60 * 1000;
            expect(AUTH_CONFIG.STALE_TIME).toBe(fiveMinutesInMs);
        });

        it('should have GC_TIME defined', () => {
            expect(AUTH_CONFIG.GC_TIME).toBeDefined();
            expect(typeof AUTH_CONFIG.GC_TIME).toBe('number');
        });

        it('should have GC_TIME of 10 minutes', () => {
            const tenMinutesInMs = 10 * 60 * 1000;
            expect(AUTH_CONFIG.GC_TIME).toBe(tenMinutesInMs);
        });

        it('should have REDIRECT_TIMEOUT defined', () => {
            expect(AUTH_CONFIG.REDIRECT_TIMEOUT).toBeDefined();
            expect(typeof AUTH_CONFIG.REDIRECT_TIMEOUT).toBe('number');
        });

        it('should have GUEST_TOKEN_PREFIX defined', () => {
            expect(AUTH_CONFIG.GUEST_TOKEN_PREFIX).toBeDefined();
            expect(typeof AUTH_CONFIG.GUEST_TOKEN_PREFIX).toBe('string');
        });
    });

    describe('AUTH_ERROR_MESSAGES', () => {
        it('should have REGISTER_FAILED message', () => {
            expect(AUTH_ERROR_MESSAGES.REGISTER_FAILED).toBeDefined();
            expect(typeof AUTH_ERROR_MESSAGES.REGISTER_FAILED).toBe('string');
        });

        it('should have UPDATE_PROFILE_FAILED message', () => {
            expect(AUTH_ERROR_MESSAGES.UPDATE_PROFILE_FAILED).toBeDefined();
            expect(typeof AUTH_ERROR_MESSAGES.UPDATE_PROFILE_FAILED).toBe('string');
        });

        it('should have LOGOUT_FAILED message', () => {
            expect(AUTH_ERROR_MESSAGES.LOGOUT_FAILED).toBeDefined();
            expect(typeof AUTH_ERROR_MESSAGES.LOGOUT_FAILED).toBe('string');
        });

        it('should have PROFILE_FETCH_FAILED message', () => {
            expect(AUTH_ERROR_MESSAGES.PROFILE_FETCH_FAILED).toBeDefined();
            expect(typeof AUTH_ERROR_MESSAGES.PROFILE_FETCH_FAILED).toBe('string');
        });

        it('should have TOKEN_REFRESH_FAILED message', () => {
            expect(AUTH_ERROR_MESSAGES.TOKEN_REFRESH_FAILED).toBeDefined();
            expect(typeof AUTH_ERROR_MESSAGES.TOKEN_REFRESH_FAILED).toBe('string');
        });
    });

    describe('AUTH_ROUTES', () => {
        it('should have ONBOARD route', () => {
            expect(AUTH_ROUTES.ONBOARD).toBeDefined();
            expect(typeof AUTH_ROUTES.ONBOARD).toBe('string');
            expect(AUTH_ROUTES.ONBOARD).toMatch(/^\//);
        });
    });

    describe('AUTH_QUERY_KEYS', () => {
        it('should have ROOT key', () => {
            expect(AUTH_QUERY_KEYS.ROOT).toBeDefined();
            expect(typeof AUTH_QUERY_KEYS.ROOT).toBe('string');
        });
    });
});
