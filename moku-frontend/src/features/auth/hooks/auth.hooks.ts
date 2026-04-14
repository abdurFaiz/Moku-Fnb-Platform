import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useProfile } from '@/features/profile/services/auth.queries';

export const useAuth = () => {
  const {
    isAuthenticated,
    user: storeUser,
    access_token,
    refresh_token,
    logout,
    updateUser,
    updateTokens,
    clearAuth,
  } = useAuthStore();

  // Get fresh profile data when authenticated
  const {
    data: profileUser,
    isLoading: isLoadingProfile,
    error: profileError,
    isPending: isProfilePending,
    isError: isProfileError,
  } = useProfile();

  // Use profile data if available, fallback to store user
  const user = profileUser || storeUser;

  // Memoize computed states to prevent unnecessary recalculations
  const computedStates = useMemo(() => ({
    isLoggedIn: isAuthenticated && !!user,
    hasProfile: !!user?.customer_profile,
  }), [isAuthenticated, user]);

  return {
    // Auth state
    isAuthenticated,
    user,
    access_token,
    refresh_token,

    isLoadingProfile,
    isProfilePending,
    isProfileError,
    profileError,

    // Actions
    logout,
    updateUser,
    updateTokens,
    clearAuth,

    // Computed states (memoized)
    ...computedStates,
  };
};
