import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authAPI } from '../api/auth.api';
import { axiosInstance } from '@/lib/axios';
import type { FormValues } from '@/features/profile/schemas/profile.schemas';

const buildFormValues = (overrides: Partial<FormValues> = {}): FormValues => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });

    return {
        name: 'John Doe',
        phone: '08123456789',
        date_birth: '1990-01-01',
        gender: 'male',
        job: 'Engineer',
        avatar: file,
        ...overrides,
    } as FormValues;
};

const restoreLocation = (original: Location) => {
    Object.defineProperty(globalThis, 'location', {
        configurable: true,
        value: original,
    });
};

beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    vi.useRealTimers();
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.useRealTimers();
    localStorage.clear();
    sessionStorage.clear();
});

describe('authAPI.register', () => {
    it('sends expected form data payload', async () => {
        const postSpy = vi.spyOn(axiosInstance, 'post');
        const backendResponse = { data: { status: 'success' } } as any;
        postSpy.mockResolvedValueOnce(backendResponse);

        const payload = buildFormValues();

        const response = await authAPI.register(payload);

        expect(postSpy).toHaveBeenCalledTimes(1);
        const [endpoint, body, config] = postSpy.mock.calls[0];

        expect(endpoint).toBe('register');
        expect(config?.headers?.['Content-Type']).toBe('multipart/form-data');

        const form = body as FormData;
        expect(form.get('name')).toBe(payload.name);
        expect(form.get('phone')).toBe(payload.phone);
        expect(form.get('date_birth')).toBe(payload.date_birth);
        expect(form.get('gender')).toBe('1');
        expect(form.get('job')).toBe(payload.job);
        expect(form.get('avatar')).toBeInstanceOf(File);

        expect(response).toEqual(backendResponse.data);
    });
});

describe('authAPI.refreshToken', () => {
    it('delegates to backend and returns payload', async () => {
        const postSpy = vi.spyOn(axiosInstance, 'post');
        const backendResponse = { data: { data: { access_token: 'new-access', refresh_token: 'new-refresh' } } } as any;
        postSpy.mockResolvedValueOnce(backendResponse);

        const response = await authAPI.refreshToken();

        expect(postSpy).toHaveBeenCalledWith('refresh-token');
        expect(response).toEqual(backendResponse.data);
    });
});

describe('authAPI.loginWithGoogle', () => {
    it('clears browser data and navigates to google redirect link', async () => {
        const originalLocation = globalThis.location;

        try {
            Object.defineProperty(globalThis, 'location', {
                configurable: true,
                value: {
                    href: 'http://localhost:5173',
                    hostname: 'localhost',
                },
            });

            localStorage.setItem('access_token', 'existing');
            sessionStorage.setItem('some', 'value');
            document.cookie = 'test=value';

            vi.stubEnv('VITE_API_URL', 'https://api.example.com/api');
            vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));

            await authAPI.loginWithGoogle();

            expect(localStorage.getItem('access_token')).toBeNull();
            expect(sessionStorage.length).toBe(0);
            expect(globalThis.location.href).toContain('/webhook/google/redirect?');
            expect(globalThis.location.href).toContain('callback=https%3A%2F%2Fapi.example.com%2Fapi%2Fauth%2Fcallback');
            expect(globalThis.location.href).toContain('_t=1704067200000');
        } finally {
            restoreLocation(originalLocation);
        }
    });
});

describe('authAPI.handleGoogleCallback', () => {
    it('posts authorization code to backend', async () => {
        const postSpy = vi.spyOn(axiosInstance, 'post');
        const backendResponse = { data: { status: 'ok' } } as any;
        postSpy.mockResolvedValueOnce(backendResponse);

        const response = await authAPI.handleGoogleCallback('sample-code');

        expect(postSpy).toHaveBeenCalledWith('/webhook/google/callback', { code: 'sample-code' });
        expect(response).toEqual(backendResponse.data);
    });
});
