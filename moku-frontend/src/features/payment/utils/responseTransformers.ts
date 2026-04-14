import type { Order } from '@/features/payment/types/PaymentLog';

/**
 *
 * @param response - API response that may contain order data in different formats
 * @returns Order object or null if not found
 */
export const extractOrderFromResponse = (response: any): Order | null => {
    if (!response) {
        return null;
    }

    // Try different response formats
    const orderData = response?.data?.data || response?.data?.order || response?.data;

    if (!orderData) {
        return null;
    }

    // Handle array response - take first item
    if (Array.isArray(orderData)) {
        return orderData[0] || null;
    }

    // Handle object response
    if (typeof orderData === 'object') {
        return orderData as Order;
    }

    return null;
};

/**
 * Extracts outlet slug from API response
 * Handles multiple response formats
 *
 * @param response - API response containing outlets array
 * @returns Outlet slug or null if not found
 */
export const extractOutletSlugFromResponse = (response: any): string | null => {
    try {
        const outlets = response?.data?.outlets;

        if (!Array.isArray(outlets) || outlets.length === 0) {
            return null;
        }

        return outlets[0]?.slug || null;
    } catch {
        return null;
    }
};

/**
 * Gets the current outlet slug from order or fallback
 *
 * @param order - Order object potentially containing outlet info
 * @param fallbackSlug - Fallback slug to use if not found in order
 * @returns Outlet slug or null
 */
export const getOutletSlug = (order: Order | null, fallbackSlug: string | null): string | null => {
    if (!order) {
        return fallbackSlug;
    }

    return order.outlet?.slug || fallbackSlug;
};

/**
 * @param message - Message template with {variable} placeholders
 * @param variables - Object containing variables to interpolate
 * @returns Interpolated message
 */
export const interpolateMessage = (
    message: string,
    variables: Record<string, string | number>
): string => {
    return message.replaceAll(/{(\w+)}/g, (_, key) => {
        return String(variables[key] ?? `{${key}}`);
    });
};

/**

 * @param ms - Milliseconds to wait
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
