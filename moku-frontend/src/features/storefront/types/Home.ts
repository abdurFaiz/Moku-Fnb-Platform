// Home page related types

export interface HomeUserData {
    name: string;
    vouchers: number;
    points: number;
    avatar?: string;
    memberSince?: string;
}

export interface HomeProduct {
    id: string;
    name: string;
    price: string | number;
    description?: string;
    image: string;
    isAvailable?: boolean;
    isRecommended?: boolean;
    categoryId?: number;
}

export interface ProductRecommendation {
    id: string;
    productId: string;
    reason?: string;
    score?: number;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
}

export interface ProductCollection {
    recommendations: HomeProduct[];
    kopiSusu: HomeProduct[];
    americano: HomeProduct[];
    cruasan: HomeProduct[];
}

export interface HomeData {
    user: HomeUserData;
    products: ProductCollection;
    categories: ProductCategory[];
    recommendations: ProductRecommendation[];
}

export interface CartVisibilityState {
    totalItems: number;
    isScrollingDown: boolean;
    isScrollingStopped: boolean;
    shouldShow: boolean;
}

export interface ScrollState {
    isScrolling: boolean;
    direction: "up" | "down" | "none";
    lastScrollTop: number;
    scrollStoppedTimeout?: number;
}

export interface UserAction {
    type: ActionType;
    payload?: Record<string, any>;
    timestamp?: string;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    error?: string;
}

// Navigation types
export interface NavigationState {
    currentRoute: string;
    previousRoute?: string;
    canGoBack: boolean;
}

// UI State types
export interface UIState {
    isLoading: boolean;
    error: string | null;
    cartVisibility: CartVisibilityState;
    scroll: ScrollState;
    navigation: NavigationState;
}

// Configuration types
export interface HomeConfig {
    apiDelay: number;
    cacheTimeout: number;
    maxRetries?: number;
    debounceDelay?: number;
    scrollThreshold?: number;
    scrollStopDelay?: number;
}

// Cache types
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiry?: number;
}

// Action types for user interactions
export const ACTION_TYPES = {
    ADD_TO_CART: 'addToCart',
    REMOVE_FROM_CART: 'removeFromCart',
    REDEEM: 'redeem',
    TOGGLE_FAVORITE: 'toggleFavorite',
    VIEW_PRODUCT: 'viewProduct',
    VIEW_PROFILE: 'viewProfile',
    SHARE_PRODUCT: 'shareProduct',
    SEARCH: 'search',
    FILTER: 'filter',
    NAVIGATE: 'navigate',
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];