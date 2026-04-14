import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../stores/auth.store';
import type { User } from '@/features/profile/types/Auth';

const createUser = (overrides: Partial<User> = {}): User => {
  const baseTimestamp = new Date('2024-01-01T00:00:00.000Z').toISOString();

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
    name: 'Test User',
    phone: '08123456789',
    email: 'test@example.com',
    avatar_url: '',
    short_name: 'T',
    created_at: baseTimestamp,
    updated_at: baseTimestamp,
    customer_profile: baseProfile,
    ...overrides,
  };
};

const resetAuthStore = () => {
  const initialState = {
    isAuthenticated: false,
    user: null,
    access_token: null,
    refresh_token: null,
    total_point: 0,
    total_order: 0,
    total_user_voucher: 0,
  };

  useAuthStore.setState(initialState);
  localStorage.clear();
  sessionStorage.clear();
};

const setPersistedAuthState = async (persistedState: Partial<{
  isAuthenticated: boolean;
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
}>) => {
  const encoded = JSON.stringify({
    state: {
      isAuthenticated: persistedState.isAuthenticated ?? false,
      user: persistedState.user ?? null,
      access_token: persistedState.access_token ?? null,
      refresh_token: persistedState.refresh_token ?? null,
    },
    version: 0,
  });

  localStorage.setItem('auth-store', encoded);

  if (useAuthStore.persist?.rehydrate) {
    await useAuthStore.persist.rehydrate();
  }
};

beforeEach(() => {
  resetAuthStore();
});

afterEach(() => {
  resetAuthStore();
});

describe('auth.store login', () => {
  it('stores credentials and updates state', () => {
    const user = createUser();

    useAuthStore.getState().login({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user,
    });

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.access_token).toBe('access-token');
    expect(state.refresh_token).toBe('refresh-token');

    expect(localStorage.getItem('access_token')).toBe('access-token');
    expect(localStorage.getItem('refresh_token')).toBe('refresh-token');
    expect(localStorage.getItem('user_name')).toBe(user.name);
    expect(localStorage.getItem('user_id')).toBe(String(user.id));
  });
});

describe('auth.store logout', () => {
  it('clears state and browser storage', () => {
    const user = createUser();

    localStorage.setItem('access_token', 'old-token');
    localStorage.setItem('refresh_token', 'old-refresh');
    sessionStorage.setItem('token_timestamp', '123');

    useAuthStore.setState({
      isAuthenticated: true,
      user,
      access_token: 'old-token',
      refresh_token: 'old-refresh',
      total_point: 10,
      total_order: 2,
      total_user_voucher: 1,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.access_token).toBeNull();
    expect(state.refresh_token).toBeNull();
    expect(state.total_point).toBe(0);
    expect(state.total_order).toBe(0);
    expect(state.total_user_voucher).toBe(0);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user_name')).toBeNull();
    expect(sessionStorage.getItem('token_timestamp')).toBeNull();
  });
});

describe('auth.store updateTokens', () => {
  it('updates tokens and flags user as authenticated', () => {
    useAuthStore.getState().updateTokens('new-access', 'new-refresh');

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.access_token).toBe('new-access');
    expect(state.refresh_token).toBe('new-refresh');
    expect(localStorage.getItem('access_token')).toBe('new-access');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
  });
});

describe('auth.store updateUser', () => {
  it('updates user profile and statistics', () => {
    const originalUser = createUser({ name: 'Original User' });
    const updatedUser = createUser({ id: 2, uuid: 'updated-uuid', name: 'Updated User' });

    useAuthStore.setState({
      user: originalUser,
      isAuthenticated: false,
      total_point: 5,
      total_order: 1,
      total_user_voucher: 0,
    });

    useAuthStore.getState().updateUser(updatedUser, {
      total_point: 20,
      total_order: 3,
      total_user_voucher: 2,
    });

    const state = useAuthStore.getState();

    expect(state.user).toEqual(updatedUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.total_point).toBe(20);
    expect(state.total_order).toBe(3);
    expect(state.total_user_voucher).toBe(2);
    expect(localStorage.getItem('user_name')).toBe(updatedUser.name);
    expect(localStorage.getItem('user_id')).toBe(String(updatedUser.id));
  });
});

describe('auth.store updateStats', () => {
  it('updates provided stats while keeping other state intact', () => {
    const user = createUser();

    useAuthStore.setState({
      user,
      isAuthenticated: true,
      total_point: 5,
      total_order: 1,
      total_user_voucher: 2,
    });

    useAuthStore.getState().updateStats({
      total_point: 50,
      total_order: 10,
    });

    const state = useAuthStore.getState();

    expect(state.total_point).toBe(50);
    expect(state.total_order).toBe(10);
    expect(state.total_user_voucher).toBe(2);
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });
});

describe('auth.store clearAuth', () => {
  it('removes persisted credentials without wiping other storage', () => {
    localStorage.setItem('access_token', 'token');
    localStorage.setItem('refresh_token', 'refresh');
    localStorage.setItem('user_name', 'Name');
    localStorage.setItem('user_id', '1');
    localStorage.setItem('other_key', 'keep-me');

    useAuthStore.setState({
      isAuthenticated: true,
      user: createUser(),
      access_token: 'token',
      refresh_token: 'refresh',
    });

    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.access_token).toBeNull();
    expect(state.refresh_token).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('user_name')).toBeNull();
    expect(localStorage.getItem('user_id')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('keep-me');
  });
});

describe('auth.store hydration reconciliation', () => {
  it('marks state authenticated when tokens exist but persisted flag is false', async () => {
    localStorage.setItem('access_token', 'token-abc');
    localStorage.setItem('refresh_token', 'refresh-xyz');

    await setPersistedAuthState({
      isAuthenticated: false,
      user: createUser(),
      access_token: 'token-abc',
      refresh_token: 'refresh-xyz',
    });

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.access_token).toBe('token-abc');
    expect(state.refresh_token).toBe('refresh-xyz');
  });

  it('clears stale authenticated state when tokens are missing', async () => {
    await setPersistedAuthState({
      isAuthenticated: true,
      user: createUser(),
      access_token: 'stale-access',
      refresh_token: 'stale-refresh',
    });

    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.access_token).toBeNull();
    expect(state.refresh_token).toBeNull();
  });
});
