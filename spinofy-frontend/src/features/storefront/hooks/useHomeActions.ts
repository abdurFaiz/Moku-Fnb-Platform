import { useCartBottomSheetState } from '@/features/storefront/hooks/useCartBottomSheetState';
import { useProductNavigation } from '@/features/storefront/hooks/useProductNavigation';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';

export interface HomeActionsReturn {
  isCartBottomSheetOpen: boolean;
  handleCartClick: () => void;
  handleCloseCartBottomSheet: () => void;
  handleProductClick: (productId: string) => void;
}

export const useHomeActions = (): HomeActionsReturn => {
  const outletSlug = useOutletSlug();

  // Get handlers dari sub-hooks
  const { isOpen, handleOpen, handleClose } = useCartBottomSheetState();
  const { navigateToProductDetail } = useProductNavigation();

  const handleProductClick = (productId: string) => {
    navigateToProductDetail(productId, outletSlug ?? null);
  };

  return {
    isCartBottomSheetOpen: isOpen,
    handleCartClick: handleOpen,
    handleCloseCartBottomSheet: handleClose,
    handleProductClick,
  };
};

export default useHomeActions;
