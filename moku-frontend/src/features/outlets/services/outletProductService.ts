import OutletAPI from '@/features/outlets/api/outlet.api';
import type { Outlet } from '@/features/outlets/types/Outlet';
import { ProductTransformer, createProductTransformer } from './productTransformer';
import {
    ApiResponseValidator,
    createErrorHandler,
    type ErrorHandlingStrategy,
} from './apiResponseValidator';

/**
 * Export types for external use
 */
export type { HomeProduct } from './productTransformer';
export { ApiError } from './apiResponseValidator';

/**
 * Main service for outlet products
 * Orchestrates transformers, organizers, and validators
 */
export class OutletProductService {
    readonly transformer: ProductTransformer;
    readonly errorHandler: ErrorHandlingStrategy;

    constructor(
        transformer?: ProductTransformer,
        errorHandler?: ErrorHandlingStrategy
    ) {
        this.transformer = transformer || createProductTransformer();
        this.errorHandler = errorHandler || createErrorHandler();
    }

    /**
     * Get all products from all outlets
     */
    async getAllOutletsWithProducts(): Promise<{
        outlets: Outlet[];
    }> {
        try {
            const response = await OutletAPI.getListOutlets();
            const validatedResponse = ApiResponseValidator.validateOutletListResponse(response);
            const outlets = validatedResponse.data.outlets;

            // Collect all products from all outlets



            return {
                outlets,
            };
        } catch (error) {
            this.errorHandler.handle(error);

            // Return empty data instead of throwing to prevent app crash
            return this.getEmptyOutletResponse();
        }
    }

    /**
     * Get products from a specific outlet by slug
     */
    async getOutletProducts(outletSlug: string): Promise<{
        outlet: Outlet;
    }> {
        try {
            const response = await OutletAPI.getOutlet(outletSlug);
            const validatedResponse = ApiResponseValidator.validateSingleOutletResponse(
                response,
                outletSlug
            );

            const outlet = validatedResponse.data.outlet;

            return {
                outlet,
            };
        } catch (error) {
            this.errorHandler.handle(error);
            throw error; // Re-throw for this method since it's more specific
        }
    }

    /**
     * Get list of available outlets (without products)
     */
    async getOutletsList(): Promise<Outlet[]> {
        try {
            const response = await OutletAPI.getListOutlets();
            const validatedResponse = ApiResponseValidator.validateOutletListResponse(response);
            return validatedResponse.data.outlets;
        } catch (error) {
            this.errorHandler.handle(error);
            throw error;
        }
    }

    /**
     * Get empty response structure
     */
    private getEmptyOutletResponse(): {
        outlets: Outlet[];
    } {
        return {
            outlets: [],
        };
    }
}

/**
 * Factory function to create a preconfigured OutletProductService
 */
export function createOutletProductService(): OutletProductService {
    const transformer = createProductTransformer();
    const errorHandler = createErrorHandler();

    return new OutletProductService(transformer, errorHandler);
}

/**
 * Create a default singleton instance
 */
const defaultService = createOutletProductService();

export default defaultService;