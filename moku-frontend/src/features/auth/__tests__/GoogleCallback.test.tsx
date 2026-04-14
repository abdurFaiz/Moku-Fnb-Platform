import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import GoogleCallback from '../pages/GoogleCallback';
import { useAuthStore } from '../stores/auth.store';

const navigateMock = vi.fn();
let searchParams = new URLSearchParams();

vi.mock('react-router-dom', () => ({
    useNavigate: () => navigateMock,
    useSearchParams: () => [searchParams] as const,
}));

vi.mock('@/components/layout/ScreenWrapper', () => ({
    ScreenWrapper: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="screen-wrapper">{children}</div>
    ),
}));

vi.mock('@/components', () => ({
    SkeletonLoader: () => <div data-testid="skeleton-loader">loading</div>,
}));

const resetAuthStore = () => {
    useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        access_token: null,
        refresh_token: null,
    });
    localStorage.clear();
    sessionStorage.clear();
};

beforeEach(() => {
    searchParams = new URLSearchParams();
    navigateMock.mockReset();
    resetAuthStore();
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    resetAuthStore();
});

describe('GoogleCallback page', () => {
    it('logs user in and navigates to outlet selection when tokens are present', async () => {
        searchParams = new URLSearchParams(
            'access_token=token-123&refresh_token=refresh-456&user_id=10&user_name=Abdurrahman%20Faiz&user_email=test%40example.com'
        );

        const loginSpy = vi.spyOn(useAuthStore.getState(), 'login');

        vi.useFakeTimers();
        render(<GoogleCallback />);

        await vi.runAllTimersAsync();

        expect(loginSpy).toHaveBeenCalledTimes(1);
        expect(loginSpy.mock.calls[0][0]).toMatchObject({
            access_token: 'token-123',
            refresh_token: 'refresh-456',
        });
        expect(loginSpy.mock.calls[0][0].user).toMatchObject({
            id: 10,
            name: 'Abdurrahman Faiz',
        });

        expect(navigateMock).toHaveBeenCalledWith('/outlet-selection', { replace: true });
    });

    it('shows error message and redirects to onboard when tokens are missing', async () => {
        searchParams = new URLSearchParams('error=access_denied');

        const loginSpy = vi.spyOn(useAuthStore.getState(), 'login');

        vi.useFakeTimers();
        render(<GoogleCallback />);

        await vi.runAllTimersAsync();

        expect(screen.getByText('Login Gagal')).toBeInTheDocument();
        expect(loginSpy).not.toHaveBeenCalled();
        expect(navigateMock).toHaveBeenCalledWith('/onboard?error=oauth_failed', { replace: true });
    });
});
