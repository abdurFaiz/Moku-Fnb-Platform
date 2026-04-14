import { OutletAPI } from '@/features/outlets/api/outlet.api';
import { OutletError } from '@/utils/errors';
import { extractOutletSlugFromResponse } from '@/features/payment/utils/responseTransformers';
import { PAYMENT_ERRORS } from '@/features/payment/constants/paymentConstant';

export class OutletService {
    /**
     * @throws OutletError when no outlet is available
     * @returns Promise resolving to outlet slug
     */
    async getFirstOutletSlug(): Promise<string> {
        try {
            const response = await OutletAPI.getListOutlets();
            const slug = extractOutletSlugFromResponse(response);

            if (!slug) {
                throw new OutletError(
                    PAYMENT_ERRORS.NO_OUTLET_AVAILABLE,
                    'NO_OUTLET_AVAILABLE'
                );
            }

            return slug;
        } catch (error) {
            if (error instanceof OutletError) {
                throw error;
            }

            throw new OutletError(
                PAYMENT_ERRORS.NO_OUTLET_FROM_API,
                'OUTLET_API_ERROR',
                { originalError: error }
            );
        }
    }

    /**
     * @param slug - Outlet slug to validate
     * @returns Promise resolving to true if valid, false otherwise
     */
    async isValidOutlet(slug: string): Promise<boolean> {
        try {
            return !!slug && slug.length > 0;
        } catch {
            return false;
        }
    }
}

export const outletService = new OutletService();