
import type { OutletResponse, SingleOutletResponse } from '@/features/outlets/types/Outlet';

export class ApiError extends Error {
    code: string;
    originalError?: unknown;

    constructor(code: string, message: string, originalError?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.originalError = originalError;
    }
}

/**
 * Validates and handles API responses
 * Prevents repetitive validation code across services
 */
export class ApiResponseValidator {
    /**
     * Validate outlet list response
     */
    static validateOutletListResponse(response: unknown): OutletResponse {
        if (!response) {
            throw new ApiError('EMPTY_RESPONSE', 'No response received from API');
        }

        const data = response as OutletResponse;

        if (data.status !== 'success') {
            throw new ApiError(
                'API_ERROR',
                `API Error: ${data.message || 'Unknown error'}`,
                response
            );
        }

        if (!data.data?.outlets) {
            throw new ApiError(
                'MISSING_DATA',
                'No outlets found in API response',
                response
            );
        }

        return data;
    }

    /**
     * Validate single outlet response
     */
    static validateSingleOutletResponse(
        response: unknown,
        outletSlug: string
    ): SingleOutletResponse {
        if (!response) {
            throw new ApiError(
                'EMPTY_RESPONSE',
                `No response received for outlet: ${outletSlug}`
            );
        }

        const data = response as SingleOutletResponse;

        if (data.status !== 'success') {
            throw new ApiError(
                'API_ERROR',
                `API Error for outlet ${outletSlug}: ${data.message || 'Unknown error'}`,
                response
            );
        }

        if (!data.data?.outlet) {
            throw new ApiError(
                'OUTLET_NOT_FOUND',
                `Outlet not found: ${outletSlug}`,
                response
            );
        }

        return data;
    }
}

/**
 * Error handler with logging strategy
 * Follows: Strategy Pattern
 */
export interface ErrorHandlingStrategy {
    handle(error: unknown): void;
}

export class DefaultErrorHandlingStrategy implements ErrorHandlingStrategy {
    handle(error: unknown): void {
        if (error instanceof ApiError) {
            console.error(`[${error.code}] ${error.message}`, error.originalError);
        } else if (error instanceof Error) {
            console.error('Unexpected error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}

/**
 * Factory function to create an error handler
 */
export function createErrorHandler(
    strategy?: ErrorHandlingStrategy
): ErrorHandlingStrategy {
    return strategy || new DefaultErrorHandlingStrategy();
}
