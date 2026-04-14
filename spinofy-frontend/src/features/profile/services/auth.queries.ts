export { authQueryKeys } from './auth.keys';

// Re-export all mutation hooks
export {
  useRegister,
  useUpdateProfile,
  useLogout,
  useRefreshToken
} from './auth.mutations';

// Re-export all query hooks
export {
  useProfile,
  useProfileWithConfig
} from './auth.queries.hooks';

// Re-export utilities that might be needed by consumers
export {
  transformAuthResponse,
  transformUserData,
  extractUserFromAuthResponse
} from './auth.transformers';

export {
  isGuestToken,
  handleAuthRedirect,
  createAuthError,
  AuthErrorType
} from './auth.errors';

export { AUTH_CONFIG, AUTH_ERROR_MESSAGES } from './auth.constants';

// Legacy export for backward compatibility
export const authKeys = {
  all: ["auth"] as const,
  profile: () => ["auth", "profile"] as const,
};