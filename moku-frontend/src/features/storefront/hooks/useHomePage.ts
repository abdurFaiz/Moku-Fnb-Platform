import { useCartSummary } from "./useCartSummary";
import { useCartVisibility } from "./useCartVisibility";
import { useHomeActions } from "./useHomeActions";
import { useHomeData } from "./useHomeData";

// hooks/useHomePage.ts
export const useHomePage = () => {
  const homeData = useHomeData();
  const cartVisibility = useCartVisibility();
  const cartSummary = useCartSummary();
  const homeActions = useHomeActions();

  return {
    // Data
    ...homeData,
    banners: homeData.banners,

    // Cart
    ...cartVisibility,
    ...cartSummary,

    // Actions
    ...homeActions,
  };
};