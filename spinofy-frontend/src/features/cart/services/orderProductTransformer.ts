import type { OrderProduct, DuplicateOrderCartItem } from '@/features/cart/types/OrderDuplication';
import { DUPLICATE_ORDER_DEFAULTS } from '@/features/transaction/constants/duplicateOrderConstant';

export class OrderProductTransformer {
    /**
     * Transform single order product ke cart item
     * @param orderProduct - Order product dari API
     * @param index - Index untuk unique notes
     * @returns Cart item
     */
    static transformOrderProductToCartItem(
        orderProduct: OrderProduct,
        index: number
    ): DuplicateOrderCartItem {
        return {
            // Basic cart item properties
            name: orderProduct.product?.name || DUPLICATE_ORDER_DEFAULTS.PRODUCT_NAME,
            price: Number(orderProduct.price) || DUPLICATE_ORDER_DEFAULTS.PRODUCT_PRICE,
            quantity: Number(orderProduct.quantity) || DUPLICATE_ORDER_DEFAULTS.PRODUCT_QUANTITY,
            image: orderProduct.product?.image || '',
            notes: orderProduct.note || `${DUPLICATE_ORDER_DEFAULTS.NOTE_PREFIX}-${index}`,
            options: [],

            // Additional properties untuk duplication tracking
            orderProductId: orderProduct.id,
            productId: orderProduct.product?.id || 0,
            productUuid: orderProduct.product?.uuid || '',
            variantIds: orderProduct.product_variant?.id ? [orderProduct.product_variant.id] : [],

            // Generate unique ID
            id: `${orderProduct.product?.uuid || orderProduct.id}-${index}`,
        };
    }

    /**
     * Transform multiple order products ke cart items
     * @param orderProducts - Array of order products dari API
     * @returns Array of cart items
     */
    static transformOrderProductsToCartItems(
        orderProducts: OrderProduct[]
    ): DuplicateOrderCartItem[] {
        if (!Array.isArray(orderProducts)) {
            return [];
        }

        return orderProducts.map((product, index) =>
            this.transformOrderProductToCartItem(product, index)
        );
    }

    /**
     * Validate order product
     * @param product - Order product untuk di-validate
     * @returns true jika valid, false jika invalid
     */
    static isValidOrderProduct(product: OrderProduct): boolean {
        return (
            !!product &&
            typeof product === 'object' &&
            (typeof product.price === 'number' || typeof product.price === 'string') &&
            (typeof product.quantity === 'number' || typeof product.quantity === 'string')
        );
    }

    /**
     * Filter valid order products
     * @param products - Array of products untuk di-filter
     * @returns Filtered array of valid products
     */
    static getValidOrderProducts(products: OrderProduct[]): OrderProduct[] {
        if (!Array.isArray(products)) {
            return [];
        }

        return products.filter((product) => this.isValidOrderProduct(product));
    }
}

export default OrderProductTransformer;
