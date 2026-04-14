import { HOME_ERRORS } from '@/features/storefront/constant/homeConstant';

/**
 * @param error - Error dari API atau exception
 * @param fallbackMessage - Fallback message jika error tidak bisa di-parse
 * @returns User-friendly error message
 */
export const getErrorMessage = (
    error: unknown,
    fallbackMessage: string = HOME_ERRORS.UNKNOWN_ERROR
): string => {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as any).message);
    }

    return fallbackMessage;
};