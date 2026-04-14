import type { Outlet } from '@/features/product/types/ProductQuery';
import { PRODUCT_ERROR_MESSAGES } from '@/features/product/constant/productQueryConstant';

export class OutletDataService {
    /**
     * Finds current outlet by slug
     *
     * @param outlets - Array of available outlets
     * @param slug - Outlet slug to search for
     * @returns Outlet matching the slug or null
     */
    findOutletBySlug(outlets: Outlet[], slug: string | null | undefined): Outlet | null {
        if (!slug || !Array.isArray(outlets) || outlets.length === 0) {
            return null;
        }

        return outlets.find(outlet => outlet.slug === slug) || null;
    }

    /**
     * Gets the first available outlet
     *
     * @param outlets - Array of available outlets
     * @throws Error if no outlets available
     * @returns First outlet
     */
    getFirstOutlet(outlets: Outlet[]): Outlet {
        if (!Array.isArray(outlets) || outlets.length === 0) {
            throw new Error(PRODUCT_ERROR_MESSAGES.NO_OUTLETS_AVAILABLE);
        }

        return outlets[0];
    }

    /**
     * Validates if an outlet is valid
     *
     * @param outlet - Outlet to validate
     * @returns True if outlet is valid
     */
    isValidOutlet(outlet: Outlet | null): boolean {
        return !!outlet && !!outlet.slug && outlet.slug.length > 0;
    }

    /**
     * Gets outlet slug safely
     *
     * @param outlet - Outlet object
     * @returns Outlet slug or null
     */
    getOutletSlug(outlet: Outlet | null): string | null {
        return outlet?.slug || null;
    }
}

export const outletDataService = new OutletDataService();
