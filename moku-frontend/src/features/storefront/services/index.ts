// Individual Services
export { HomeUIService } from './homeUIService';

// Re-export constants
export {
  HOME_ERRORS,
  SCROLL_CONFIG,
} from '@/features/storefront/constant/homeConstant';


// Re-export types for convenience
export type {
  HomeUserData,
  HomeProduct,
  UserAction,
  ApiResponse,
  ProductCategory,
  ProductCollection,
  HomeData,
  CartVisibilityState,
  ScrollState,
  NavigationState,
  UIState,
  HomeConfig,
  ActionType,
} from '@/features/storefront/types/Home';