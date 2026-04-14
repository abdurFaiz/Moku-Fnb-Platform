import type { ProductDetail } from '@/features/product/types/DetailProduct';
import type { CartItem } from '@/features/cart/types/Cart';
import { ProductAttributeService } from '@/features/product/services/ProductAttributeService';

export interface EditModeData {
    editMode?: boolean;
    orderProductId?: number;
    cartEditMode?: boolean;
    cartItemId?: string;
    productId?: number;
    productUuid?: string;
    variantIds?: number[];
    quantity?: number;
    note?: string;
}

/**
 * Payload for product operations
 */
export interface ProductOperationPayload {
    product_id: number;
    variant_id: number[];
    quantity: number;
    note: string;
}

/**
 * Result of handling a mode operation
 */
export interface ModeOperationResult {
    type: 'update' | 'store' | 'add-to-cart' | 'none';
    payload?: ProductOperationPayload;
    cartItem?: Omit<CartItem, 'id'>;
    shouldNavigateToCheckout?: boolean;
    shouldNavigateToHome?: boolean;
}

const stripCartItemId = (item: CartItem): Omit<CartItem, 'id'> => {
    const { id: _id, ...rest } = item;
    return rest;
};

export class DetailItemModeHandler {
    /**
     * Determine if component is in edit mode
     */
    static isEditMode(editData: EditModeData | null): boolean {
        return !!editData?.editMode;
    }

    /**
     * Determine if component is in cart-edit mode
     */
    static isCartEditMode(editData: EditModeData | null): boolean {
        return !!editData?.cartEditMode;
    }

    /**
     * Handle mode-specific operation
     * Determines what action to take based on current mode and cart state
     */
    static handleModeOperation(
        product: ProductDetail,
        selections: Map<number, Set<string>>,
        quantity: number,
        notes: string,
        editData: EditModeData | null,
        cartItems: CartItem[],
        outletSlug: string | null
    ): ModeOperationResult {
        const isEditMode = this.isEditMode(editData);
        const isCartEditMode = this.isCartEditMode(editData);

        // Build payload for API
        const payload: ProductOperationPayload = {
            product_id: product.id,
            variant_id: ProductAttributeService.extractVariantIds(product.attributes || [], selections),
            quantity,
            note: notes,
        };

        // Get attribute data for cart storage
        const attributeData = ProductAttributeService.extractAttributeData(
            product.attributes || [],
            selections
        );

        // Calculate base price and extra price separately
        const basePrice = Number.parseInt(product.price);
        const extraPrice = ProductAttributeService.calculateExtraPrice(
            product.attributes || [],
            selections
        );

        // Create cart item object for local storage
        const cartItem: Omit<CartItem, 'id'> = {
            productUuid: product.uuid,
            name: product.name,
            price: basePrice + extraPrice, // Total price (base + extras)
            basePrice: basePrice, // Base product price (for voucher calculation)
            extraPrice: extraPrice, // Extra/topping price (NOT for voucher)
            quantity,
            options: attributeData,
            notes,
            image: product.image_url,
            productId: product.id,
            variantIds: payload.variant_id,
        };

        // Edit existing order product
        if (isEditMode && editData?.orderProductId) {
            const existingCartItem = cartItems.find(
                (item) => item.orderProductId === editData.orderProductId,
            );

            const mergedCartItem: Omit<CartItem, 'id'> = {
                ...(existingCartItem ? stripCartItemId(existingCartItem) : {}),
                ...cartItem,
                orderProductId: editData.orderProductId,
            };

            return {
                type: 'update',
                payload,
                cartItem: mergedCartItem,
                shouldNavigateToCheckout: true,
            };
        }

        // Edit existing cart item
        if (isCartEditMode && editData?.cartItemId) {
            const cartItemId = editData.cartItemId;
            const existingCartItem = cartItems.find(item => item.id === cartItemId);

            if (!existingCartItem) {
                // Fallback: return new cart item if not found
                return {
                    type: 'add-to-cart',
                    cartItem,
                    shouldNavigateToCheckout: true,
                };
            }

            // If cart item has orderProductId, need to sync with backend
            if (existingCartItem?.orderProductId) {
                const mergedCartItem: Omit<CartItem, 'id'> = {
                    ...stripCartItemId(existingCartItem),
                    ...cartItem,
                    orderProductId: existingCartItem.orderProductId,
                };

                return {
                    type: 'update',
                    payload,
                    cartItem: mergedCartItem,
                    shouldNavigateToCheckout: true,
                };
            }

            // Otherwise, just update local cart with merged data
            const updatedCartItem: Omit<CartItem, 'id'> = {
                ...existingCartItem,
                quantity,
                notes,
                price: basePrice + extraPrice, // Total price
                basePrice: basePrice, // For voucher calculation
                extraPrice: extraPrice, // NOT for voucher
                variantIds: payload.variant_id,
                options: attributeData,
            };

            return {
                type: 'add-to-cart',
                cartItem: updatedCartItem,
                shouldNavigateToCheckout: true,
            };
        }

        // Add to empty cart (create first item)
        if (cartItems.length === 0 && outletSlug && !isEditMode && !isCartEditMode) {
            return {
                type: 'store',
                payload,
                cartItem,
                shouldNavigateToHome: true,
            };
        }

        // Add to existing cart
        const operationType = outletSlug ? 'store' : 'add-to-cart';

        return {
            type: operationType,
            payload: outletSlug ? payload : undefined,
            cartItem,
            shouldNavigateToHome: !!outletSlug,
        };
    }
}

export const detailItemModeHandler = new DetailItemModeHandler();
