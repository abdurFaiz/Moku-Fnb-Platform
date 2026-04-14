import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuth } from '../hooks/auth.hooks';
import { useAuthStore } from '../stores/auth.store';
import type { User } from '@/features/profile/types/Auth';

const useProfileMock = vi.fn();

vi.mock('@/features/profile/services/auth.queries', () => ({
    useProfile: () => useProfileMock(),
}));

const baseTimestamp = new Date('2024-01-01T00:00:00.000Z').toISOString();

const createUser = (overrides: Partial<User> = {}): User => {
    const baseProfile = {
        id: 1,
        uuid: 'profile-uuid',
        job: null,
        date_birth: null,
        gender: null,
        user_id: 1,
        avatar: null,
        created_at: baseTimestamp,
        updated_at: baseTimestamp,
    };

    return {
        id: 1,
        uuid: 'user-uuid',
        name: 'Primary User',
        phone: '08123456789',
        email: 'user@example.com',
        avatar_url: '',
        short_name: 'P',
        created_at: baseTimestamp,
        updated_at: baseTimestamp,
        customer_profile: baseProfile,
        ...overrides,
    };
};

const TestHarness = () => {
    const auth = useAuth();

    return (
        <div>
            <span data-testid="user-name">{auth.user?.name ?? 'anonymous'}</span>
            <span data-testid="is-logged">{auth.isLoggedIn ? 'yes' : 'no'}</span>
            <span data-testid="has-profile">{auth.hasProfile ? 'yes' : 'no'}</span>
        </div>
    );
};

beforeEach(() => {
    useProfileMock.mockReset();
    useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        access_token: null,
        refresh_token: null,
    });
});

describe('useAuth hook', () => {
    it('falls back to store user when profile query has no data', async () => {
        const storeUser = createUser();
        useAuthStore.setState({
            isAuthenticated: true,
            user: storeUser,
        });

        useProfileMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isPending: false,
            isError: false,
            error: undefined,
        });

        render(<TestHarness />);

        expect(screen.getByTestId('user-name')).toHaveTextContent(storeUser.name);
        expect(screen.getByTestId('is-logged')).toHaveTextContent('yes');
        expect(screen.getByTestId('has-profile')).toHaveTextContent('yes');
    });

    it('prefers profile data when available', async () => {
        const storeUser = createUser({ name: 'Store User' });
        const profileUser = createUser({ name: 'Profile User', uuid: 'profile-user-uuid' });

        useAuthStore.setState({
            isAuthenticated: true,
            user: storeUser,
        });

        useProfileMock.mockReturnValue({
            data: profileUser,
            isLoading: false,
            isPending: false,
            isError: false,
            error: undefined,
        });

        render(<TestHarness />);

        expect(screen.getByTestId('user-name')).toHaveTextContent('Profile User');
        expect(screen.getByTestId('is-logged')).toHaveTextContent('yes');
        expect(screen.getByTestId('has-profile')).toHaveTextContent('yes');
    });
});
