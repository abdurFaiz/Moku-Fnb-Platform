
// === CORE DATA LAYER ===
export { useCheckoutPageData } from './useCheckoutPageData';

// === ITEM MANAGEMENT LAYER ===
export { useCheckoutItemManagement } from './useCheckoutItemManagement';

// === BUSINESS LOGIC LAYER ===
export { useCheckoutPayment } from './useCheckoutPayment';

// === PAGE INTERACTION LAYER ===
export { useCheckoutPageHandlers } from './useCheckoutPageHandlers';

// === SIDE EFFECTS LAYER ===
export { useCheckoutPageSideEffects } from './useCheckoutPageSideEffects';

// === UI FORMATTING LAYER ===
export { useCheckoutPageDisplayData } from './useCheckoutPageDisplayData';

// ============================================================================
// DEPRECATED HOOKS (kept for backward compatibility, will be removed in v2.0)
// ============================================================================

/** @deprecated Use useCheckoutPageData instead */
export type { CheckoutPageData } from './useCheckoutPageData';
export type { CheckoutItemManagement, FormattedOrderItem } from './useCheckoutItemManagement';
export type { CheckoutPageHandlers } from './useCheckoutPageHandlers';
export type { CheckoutPageDisplayData } from './useCheckoutPageDisplayData';
