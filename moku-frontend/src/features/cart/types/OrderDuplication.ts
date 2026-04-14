import type { CartItem } from '@/features/cart/types/Cart';

/**
 * Order Product dari API response
 */
export interface OrderProduct {
    id: number;
    price: number | string;
    quantity: number | string;
    note?: string;
    product?: {
        id: number;
        uuid: string;
        name: string;
        image?: string;
    };
    product_variant?: {
        id: number;
        name: string;
    };
}

/**
 * Duplicated Order Data
 */
export interface DuplicatedOrderData {
    id: number;
    uuid: string;
    code: string;
    sub_total: number;
    tax: number;
    total: number;
    status: number;
    order_products: OrderProduct[];
}

/**
 * Duplicate Order API Response
 */
export interface DuplicateOrderResponse {
    data?: {
        order?: DuplicatedOrderData | DuplicatedOrderData[];
    };
}

/**
 * Parameters untuk duplicate order mutation
 */
export interface DuplicateOrderParams {
    orderCode: string;
}

/**
 * Result dari order duplication
 */
export interface OrderDuplicationResult {
    orderData: DuplicatedOrderData;
    outletSlug: string;
}

/**
 * Cart Item untuk duplication
 */
export interface DuplicateOrderCartItem extends CartItem {
    orderProductId: number;
    productId: number;
    productUuid: string;
    variantIds: number[];
}
