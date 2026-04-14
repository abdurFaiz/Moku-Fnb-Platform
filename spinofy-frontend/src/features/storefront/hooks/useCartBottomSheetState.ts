import { useCallback, useState } from 'react';
import { HOME_UI_STATE } from '@/features/storefront/constant/homeConstant';

/**
 * @returns State dan handlers untuk cart bottom sheet
 */
export interface CartBottomSheetState {
    isOpen: boolean;
    handleOpen: () => void;
    handleClose: () => void;
    toggleCartBottomSheet: () => void;
}

export const useCartBottomSheetState = (): CartBottomSheetState => {
    const [isCartBottomSheetOpen, setIsCartBottomSheetOpen] = useState<boolean>(
        HOME_UI_STATE.CART_BOTTOM_SHEET_OPEN
    );

    /**
     * Open cart bottom sheet
     */
    const handleOpen = useCallback(() => {
        setIsCartBottomSheetOpen(true);

    }, []);

    /**
     * Close cart bottom sheet
     */
    const handleClose = useCallback(() => {
        setIsCartBottomSheetOpen(false);

    }, []);

    /**
     * Toggle cart bottom sheet
     */
    const toggleCartBottomSheet = useCallback(() => {
        setIsCartBottomSheetOpen((prev) => !prev);
    }, []);

    return {
        isOpen: isCartBottomSheetOpen,
        handleOpen,
        handleClose,
        toggleCartBottomSheet,
    };
};

export default useCartBottomSheetState;
