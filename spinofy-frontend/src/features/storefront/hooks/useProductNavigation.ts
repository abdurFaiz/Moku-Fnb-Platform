import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { HOME_ROUTE_BUILDERS, HOME_ERRORS } from '@/features/storefront/constant/homeConstant';
import { toast } from 'sonner';

/**
 * @returns Callback untuk navigate ke product detail
 */
export interface ProductNavigationHandlers {
    navigateToProductDetail: (productId: string, outletSlug: string | null) => void;
}

export const useProductNavigation = (): ProductNavigationHandlers => {
    const navigate = useNavigate();

    /**
     * Validate product ID
     * @param productId - Product ID to validate
     * @returns true jika valid, false jika invalid
     */
    const isValidProductId = useCallback((productId: string): boolean => {
        if (!productId || typeof productId !== 'string' || productId.trim() === '') {
            return false;
        }
        return true;
    }, []);

    /**
     * Navigate ke product detail page
     * @param productId - Product ID
     * @param outletSlug - Outlet slug (required)
     */
    const navigateToProductDetail = useCallback(
        (productId: string, outletSlug: string | null) => {
            try {
                // Validate inputs
                if (!isValidProductId(productId)) {
                    toast.error(HOME_ERRORS.INVALID_PRODUCT_ID);
                    return;
                }

                // Check outlet availability
                if (!outletSlug) {
                    toast.warning(HOME_ERRORS.NO_OUTLET);
                    navigate(HOME_ROUTE_BUILDERS.home('onboard'));
                    return;
                }

                // Build route dan navigate
                const route = HOME_ROUTE_BUILDERS.home(outletSlug);
                navigate(route);

            } catch (error) {
                console.error('❌ Error navigating to product detail:', error);
                toast.error(HOME_ERRORS.NAVIGATION_FAILED);
            }
        },
        [navigate, isValidProductId]
    );

    return {
        navigateToProductDetail,
    };
};

export default useProductNavigation;
