import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DetailItemModeHandler } from '../services/DetailItemModeHandler';
import type { EditModeData } from '../services/DetailItemModeHandler';
import type { CartItem } from '@/features/cart/types/Cart';
import { mockProductDetail } from './mockData';
import { ProductAttributeService } from '../services/ProductAttributeService';

// Mock ProductAttributeService
vi.mock('../services/ProductAttributeService', () => ({
    ProductAttributeService: {
        extractVariantIds: vi.fn(),
        extractAttributeData: vi.fn(),
        calculateExtraPrice: vi.fn(),
    },
}));

describe('DetailItemModeHandler', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        vi.mocked(ProductAttributeService.extractVariantIds).mockReturnValue([1, 2]);
        vi.mocked(ProductAttributeService.extractAttributeData).mockReturnValue(['Size: Large', 'Topping: Extra Shot']);
        vi.mocked(ProductAttributeService.calculateExtraPrice).mockReturnValue(10000);
    });

    describe('isEditMode', () => {
        it('should return true when editMode is true', () => {
            const editData: EditModeData = { editMode: true };
            expect(DetailItemModeHandler.isEditMode(editData)).toBe(true);
        });

        it('should return false when editMode is false', () => {
            const editData: EditModeData = { editMode: false };
            expect(DetailItemModeHandler.isEditMode(editData)).toBe(false);
        });

        it('should return false when editMode is undefined', () => {
            const editData: EditModeData = {};
            expect(DetailItemModeHandler.isEditMode(editData)).toBe(false);
        });

        it('should return false when editData is null', () => {
            expect(DetailItemModeHandler.isEditMode(null)).toBe(false);
        });
    });

    describe('isCartEditMode', () => {
        it('should return true when cartEditMode is true', () => {
            const editData: EditModeData = { cartEditMode: true };
            expect(DetailItemModeHandler.isCartEditMode(editData)).toBe(true);
        });

        it('should return false when cartEditMode is false', () => {
            const editData: EditModeData = { cartEditMode: false };
            expect(DetailItemModeHandler.isCartEditMode(editData)).toBe(false);
        });

        it('should return false when cartEditMode is undefined', () => {
            const editData: EditModeData = {};
            expect(DetailItemModeHandler.isCartEditMode(editData)).toBe(false);
        });

        it('should return false when editData is null', () => {
            expect(DetailItemModeHandler.isCartEditMode(null)).toBe(false);
        });
    });

    describe('handleModeOperation', () => {
        const selections = new Map<number, Set<string>>();
        selections.set(1, new Set(['1-3'])); // Large
        selections.set(2, new Set(['2-4'])); // Extra Shot

        const quantity = 2;
        const notes = 'Extra hot';
        const outletSlug = 'test-cafe';

        describe('Edit existing order product', () => {
            it('should return update operation with orderProductId', () => {
                const editData: EditModeData = {
                    editMode: true,
                    orderProductId: 123,
                };

                const existingCartItem: CartItem = {
                    id: 'cart-1',
                    productUuid: 'product-uuid-1',
                    name: 'Espresso',
                    price: 30000,
                    quantity: 1,
                    options: ['Size: Medium'],
                    notes: 'Old note',
                    orderProductId: 123,
                    productId: 1,
                    variantIds: [1],
                    basePrice: 25000,
                    extraPrice: 5000,
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [existingCartItem],
                    outletSlug
                );

                expect(result.type).toBe('update');
                expect(result.payload).toBeDefined();
                expect(result.payload?.product_id).toBe(mockProductDetail.id);
                expect(result.payload?.quantity).toBe(quantity);
                expect(result.payload?.note).toBe(notes);
                expect(result.cartItem?.orderProductId).toBe(123);
                expect(result.shouldNavigateToCheckout).toBe(true);
                expect(result.shouldNavigateToHome).toBeUndefined();
            });

            it('should handle edit mode without existing cart item', () => {
                const editData: EditModeData = {
                    editMode: true,
                    orderProductId: 999, // Non-existent
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [],
                    outletSlug
                );

                expect(result.type).toBe('update');
                expect(result.cartItem?.orderProductId).toBe(999);
                expect(result.shouldNavigateToCheckout).toBe(true);
            });

            it('should merge existing cart item data with new data', () => {
                const editData: EditModeData = {
                    editMode: true,
                    orderProductId: 123,
                };

                const existingCartItem: CartItem = {
                    id: 'cart-1',
                    productUuid: 'product-uuid-1',
                    name: 'Espresso',
                    price: 30000,
                    quantity: 1,
                    options: ['Size: Medium'],
                    notes: 'Old note',
                    orderProductId: 123,
                    productId: 1,
                    variantIds: [1],
                    basePrice: 25000,
                    extraPrice: 5000,
                    orderCode: 'ORDER-123',
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [existingCartItem],
                    outletSlug
                );

                // Should preserve orderCode from existing item
                expect(result.cartItem?.orderCode).toBe('ORDER-123');
                // Should update with new values
                expect(result.cartItem?.quantity).toBe(quantity);
                expect(result.cartItem?.notes).toBe(notes);
            });
        });

        describe('Edit existing cart item', () => {
            it('should return update operation when cart item has orderProductId', () => {
                const editData: EditModeData = {
                    cartEditMode: true,
                    cartItemId: 'cart-1',
                };

                const existingCartItem: CartItem = {
                    id: 'cart-1',
                    productUuid: 'product-uuid-1',
                    name: 'Espresso',
                    price: 30000,
                    quantity: 1,
                    options: ['Size: Medium'],
                    orderProductId: 123, // Has orderProductId - needs backend sync
                    productId: 1,
                    variantIds: [1],
                    basePrice: 25000,
                    extraPrice: 5000,
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [existingCartItem],
                    outletSlug
                );

                expect(result.type).toBe('update');
                expect(result.payload).toBeDefined();
                expect(result.cartItem?.orderProductId).toBe(123);
                expect(result.shouldNavigateToCheckout).toBe(true);
            });

            it('should return add-to-cart operation when cart item has no orderProductId', () => {
                const editData: EditModeData = {
                    cartEditMode: true,
                    cartItemId: 'cart-1',
                };

                const existingCartItem: CartItem = {
                    id: 'cart-1',
                    productUuid: 'product-uuid-1',
                    name: 'Espresso',
                    price: 30000,
                    quantity: 1,
                    options: ['Size: Medium'],
                    productId: 1,
                    variantIds: [1],
                    basePrice: 25000,
                    extraPrice: 5000,
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [existingCartItem],
                    outletSlug
                );

                expect(result.type).toBe('add-to-cart');
                expect(result.payload).toBeUndefined();
                expect(result.cartItem?.quantity).toBe(quantity);
                expect(result.cartItem?.notes).toBe(notes);
                expect(result.shouldNavigateToCheckout).toBe(true);
            });

            it('should fallback to add-to-cart when cart item not found', () => {
                const editData: EditModeData = {
                    cartEditMode: true,
                    cartItemId: 'non-existent',
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [],
                    outletSlug
                );

                expect(result.type).toBe('add-to-cart');
                expect(result.shouldNavigateToCheckout).toBe(true);
            });

            it('should preserve existing cart item fields when updating', () => {
                const editData: EditModeData = {
                    cartEditMode: true,
                    cartItemId: 'cart-1',
                };

                const existingCartItem: CartItem = {
                    id: 'cart-1',
                    productUuid: 'product-uuid-1',
                    name: 'Espresso',
                    price: 30000,
                    quantity: 1,
                    options: ['Size: Medium'],
                    productId: 1,
                    variantIds: [1],
                    basePrice: 25000,
                    extraPrice: 5000,
                    appliedVoucherId: 5,
                    appliedVoucherCode: 'DISCOUNT10',
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [existingCartItem],
                    outletSlug
                );

                // Should preserve voucher data
                expect(result.cartItem?.appliedVoucherId).toBe(5);
                expect(result.cartItem?.appliedVoucherCode).toBe('DISCOUNT10');
            });
        });

        describe('Add to empty cart', () => {
            it('should return store operation when cart is empty and has outletSlug', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.type).toBe('store');
                expect(result.payload).toBeDefined();
                expect(result.payload?.product_id).toBe(mockProductDetail.id);
                expect(result.cartItem).toBeDefined();
                expect(result.shouldNavigateToHome).toBe(true);
                expect(result.shouldNavigateToCheckout).toBeUndefined();
            });

            it('should not return store when in edit mode', () => {
                const editData: EditModeData = { editMode: true, orderProductId: 999 };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [],
                    outletSlug
                );

                // Should be 'update' because editMode is true with orderProductId
                expect(result.type).toBe('update');
                expect(result.type).not.toBe('store');
            });

            it('should not return store when in cart edit mode', () => {
                const editData: EditModeData = { cartEditMode: true, cartItemId: 'cart-1' };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [],
                    outletSlug
                );

                // Should fallback to add-to-cart because cart item not found
                expect(result.type).toBe('add-to-cart');
            });
        });

        describe('Add to existing cart', () => {
            const existingCartItem: CartItem = {
                id: 'cart-1',
                productUuid: 'other-product',
                name: 'Cappuccino',
                price: 35000,
                quantity: 1,
                options: [],
                productId: 2,
                variantIds: [],
                basePrice: 35000,
                extraPrice: 0,
            };

            it('should return store operation when has outletSlug', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [existingCartItem],
                    outletSlug
                );

                expect(result.type).toBe('store');
                expect(result.payload).toBeDefined();
                expect(result.shouldNavigateToHome).toBe(true);
            });

            it('should return add-to-cart operation when no outletSlug', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [existingCartItem],
                    null
                );

                expect(result.type).toBe('add-to-cart');
                expect(result.payload).toBeUndefined();
                expect(result.shouldNavigateToHome).toBe(false);
            });
        });

        describe('Cart item creation', () => {
            it('should create cart item with correct structure', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem).toBeDefined();
                expect(result.cartItem?.productUuid).toBe(mockProductDetail.uuid);
                expect(result.cartItem?.name).toBe(mockProductDetail.name);
                expect(result.cartItem?.quantity).toBe(quantity);
                expect(result.cartItem?.notes).toBe(notes);
                expect(result.cartItem?.image).toBe(mockProductDetail.image_url);
                expect(result.cartItem?.productId).toBe(mockProductDetail.id);
            });

            it('should calculate prices correctly', () => {
                const basePrice = Number.parseInt(mockProductDetail.price);
                const extraPrice = 10000; // Mocked value

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.basePrice).toBe(basePrice);
                expect(result.cartItem?.extraPrice).toBe(extraPrice);
                expect(result.cartItem?.price).toBe(basePrice + extraPrice);
            });

            it('should include variant IDs from selections', () => {
                const mockVariantIds = [1, 2, 3];
                vi.mocked(ProductAttributeService.extractVariantIds).mockReturnValue(mockVariantIds);

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.variantIds).toEqual(mockVariantIds);
                expect(result.payload?.variant_id).toEqual(mockVariantIds);
            });

            it('should include attribute data as options', () => {
                const mockOptions = ['Size: Large', 'Topping: Extra Shot', 'Sugar: Less'];
                vi.mocked(ProductAttributeService.extractAttributeData).mockReturnValue(mockOptions);

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.options).toEqual(mockOptions);
            });
        });

        describe('Payload creation', () => {
            it('should create payload with correct structure', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.payload).toBeDefined();
                expect(result.payload?.product_id).toBe(mockProductDetail.id);
                expect(result.payload?.quantity).toBe(quantity);
                expect(result.payload?.note).toBe(notes);
            });

            it('should not include payload for local-only cart operations', () => {
                const editData: EditModeData = {
                    cartEditMode: true,
                    cartItemId: 'cart-1',
                };

                const existingCartItem: CartItem = {
                    id: 'cart-1',
                    productUuid: 'product-uuid-1',
                    name: 'Espresso',
                    price: 30000,
                    quantity: 1,
                    options: [],
                    productId: 1,
                    variantIds: [],
                    basePrice: 25000,
                    extraPrice: 5000,
                };

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    notes,
                    editData,
                    [existingCartItem],
                    outletSlug
                );

                // Local cart update - no payload needed
                expect(result.type).toBe('add-to-cart');
                expect(result.payload).toBeUndefined();
            });
        });

        describe('Edge cases', () => {
            it('should handle product with no attributes', () => {
                const productNoAttrs = { ...mockProductDetail, attributes: [] };
                vi.mocked(ProductAttributeService.calculateExtraPrice).mockReturnValue(0);

                const result = DetailItemModeHandler.handleModeOperation(
                    productNoAttrs,
                    new Map(),
                    1,
                    '',
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.extraPrice).toBe(0);
                expect(result.cartItem?.price).toBe(Number.parseInt(productNoAttrs.price));
            });

            it('should handle empty notes', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    quantity,
                    '',
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.notes).toBe('');
                expect(result.payload?.note).toBe('');
            });

            it('should handle quantity 0', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    0,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.quantity).toBe(0);
                expect(result.payload?.quantity).toBe(0);
            });

            it('should handle large quantities', () => {
                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    selections,
                    999,
                    notes,
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.quantity).toBe(999);
            });

            it('should handle empty selections', () => {
                vi.mocked(ProductAttributeService.extractVariantIds).mockReturnValue([]);
                vi.mocked(ProductAttributeService.extractAttributeData).mockReturnValue([]);
                vi.mocked(ProductAttributeService.calculateExtraPrice).mockReturnValue(0);

                const result = DetailItemModeHandler.handleModeOperation(
                    mockProductDetail,
                    new Map(),
                    1,
                    '',
                    null,
                    [],
                    outletSlug
                );

                expect(result.cartItem?.variantIds).toEqual([]);
                expect(result.cartItem?.options).toEqual([]);
                expect(result.cartItem?.extraPrice).toBe(0);
            });
        });
    });
});
