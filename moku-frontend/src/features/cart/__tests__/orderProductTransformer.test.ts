import { describe, expect, it, vi } from 'vitest';
import { OrderProductTransformer } from '../services/orderProductTransformer';
import type { OrderProduct, DuplicateOrderCartItem } from '../types/OrderDuplication';

// Mock constants
vi.mock('@/features/transaction/constants/duplicateOrderConstant', () => ({
    DUPLICATE_ORDER_DEFAULTS: {
        PRODUCT_NAME: 'Unknown Product',
        PRODUCT_PRICE: 0,
        PRODUCT_QUANTITY: 1,
        NOTE_PREFIX: 'duplicated-order-note',
    },
}));

const createMockOrderProduct = (overrides: Partial<OrderProduct> = {}): OrderProduct => ({
    id: 1,
    price: 25000,
    quantity: 2,
    note: 'Test note',
    product: {
        id: 1,
        uuid: 'product-uuid-123',
        name: 'Test Product',
        image: 'https://example.com/image.jpg',
    },
    product_variant: {
        id: 1,
        name: 'Regular',
    },
    ...overrides,
});

describe('OrderProductTransformer', () => {
    describe('isValidOrderProduct', () => {
        it('should return true for valid order product', () => {
            const validProduct = createMockOrderProduct();

            expect(OrderProductTransformer.isValidOrderProduct(validProduct)).toBe(true);
        });

        it('should return true for product with string price and quantity', () => {
            const validProduct = createMockOrderProduct({
                price: '25000',
                quantity: '2',
            } as any);

            expect(OrderProductTransformer.isValidOrderProduct(validProduct)).toBe(true);
        });

        it('should return false for null product', () => {
            expect(OrderProductTransformer.isValidOrderProduct(null as any)).toBe(false);
        });

        it('should return false for undefined product', () => {
            expect(OrderProductTransformer.isValidOrderProduct(undefined as any)).toBe(false);
        });

        it('should return false for product without price', () => {
            const invalidProduct = createMockOrderProduct();
            delete (invalidProduct as any).price;

            expect(OrderProductTransformer.isValidOrderProduct(invalidProduct)).toBe(false);
        });

        it('should return false for product without quantity', () => {
            const invalidProduct = createMockOrderProduct();
            delete (invalidProduct as any).quantity;

            expect(OrderProductTransformer.isValidOrderProduct(invalidProduct)).toBe(false);
        });

        it('should return false for non-object product', () => {
            expect(OrderProductTransformer.isValidOrderProduct('invalid' as any)).toBe(false);
            expect(OrderProductTransformer.isValidOrderProduct(123 as any)).toBe(false);
        });

        it('should return false for product with null price', () => {
            const invalidProduct = createMockOrderProduct({
                price: null as any,
            });

            expect(OrderProductTransformer.isValidOrderProduct(invalidProduct)).toBe(false);
        });

        it('should return false for product with undefined quantity', () => {
            const invalidProduct = createMockOrderProduct({
                quantity: undefined as any,
            });

            expect(OrderProductTransformer.isValidOrderProduct(invalidProduct)).toBe(false);
        });
    });

    describe('getValidOrderProducts', () => {
        it('should filter valid products', () => {
            const products = [
                createMockOrderProduct({ id: 1 }),
                createMockOrderProduct({ id: 2, price: null as any }), // invalid
                createMockOrderProduct({ id: 3 }),
            ];

            const validProducts = OrderProductTransformer.getValidOrderProducts(products);

            expect(validProducts).toHaveLength(2);
            expect(validProducts.map(p => p.id)).toEqual([1, 3]);
        });

        it('should return empty array for null input', () => {
            const validProducts = OrderProductTransformer.getValidOrderProducts(null as any);

            expect(validProducts).toEqual([]);
        });

        it('should return empty array for undefined input', () => {
            const validProducts = OrderProductTransformer.getValidOrderProducts(undefined as any);

            expect(validProducts).toEqual([]);
        });

        it('should return empty array for non-array input', () => {
            const validProducts = OrderProductTransformer.getValidOrderProducts('invalid' as any);

            expect(validProducts).toEqual([]);
        });

        it('should return empty array when all products are invalid', () => {
            const products = [
                createMockOrderProduct({ price: null as any }),
                createMockOrderProduct({ quantity: null as any }),
            ];

            const validProducts = OrderProductTransformer.getValidOrderProducts(products);

            expect(validProducts).toEqual([]);
        });
    });

    describe('transformOrderProductToCartItem', () => {
        it('should transform order product to cart item', () => {
            const orderProduct = createMockOrderProduct();
            const index = 0;

            const cartItem = OrderProductTransformer.transformOrderProductToCartItem(orderProduct, index);

            expect(cartItem).toEqual({
                id: 'product-uuid-123-0',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                image: 'https://example.com/image.jpg',
                notes: 'Test note',
                options: [],
                orderProductId: 1,
                productId: 1,
                productUuid: 'product-uuid-123',
                variantIds: [1],
            });
        });

        it('should handle product without product data', () => {
            const orderProduct = createMockOrderProduct({
                product: undefined,
            });
            const index = 1;

            const cartItem = OrderProductTransformer.transformOrderProductToCartItem(orderProduct, index);

            expect(cartItem).toEqual({
                id: '1-1',
                name: 'Unknown Product',
                price: 25000,
                quantity: 2,
                image: '',
                notes: 'Test note',
                options: [],
                orderProductId: 1,
                productId: 0,
                productUuid: '',
                variantIds: [1], // Still has variant from orderProduct
            });
        }); it('should handle product without variant data', () => {
            const orderProduct = createMockOrderProduct({
                product_variant: undefined,
            });
            const index = 2;

            const cartItem = OrderProductTransformer.transformOrderProductToCartItem(orderProduct, index);

            expect(cartItem).toEqual({
                id: 'product-uuid-123-2',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                image: 'https://example.com/image.jpg',
                notes: 'Test note',
                options: [],
                orderProductId: 1,
                productId: 1,
                productUuid: 'product-uuid-123',
                variantIds: [],
            });
        });

        it('should use default values when data is missing', () => {
            const orderProduct = createMockOrderProduct({
                price: 0,
                quantity: 0,
                note: '',
                product: {
                    id: 0,
                    uuid: '',
                    name: '',
                    image: '',
                },
            });
            const index = 3;

            const cartItem = OrderProductTransformer.transformOrderProductToCartItem(orderProduct, index);

            expect(cartItem).toEqual({
                id: '1-3', // Uses orderProduct.id instead of empty uuid
                name: 'Unknown Product',
                price: 0,
                quantity: 1,
                image: '',
                notes: 'duplicated-order-note-3',
                options: [],
                orderProductId: 1,
                productId: 0,
                productUuid: '',
                variantIds: [1], // Still has variant from orderProduct
            });
        }); it('should handle string price and quantity', () => {
            const orderProduct = createMockOrderProduct({
                price: '30000',
                quantity: '3',
            } as any);
            const index = 4;

            const cartItem = OrderProductTransformer.transformOrderProductToCartItem(orderProduct, index);

            expect(cartItem.price).toBe(30000);
            expect(cartItem.quantity).toBe(3);
        });

        it('should handle null/undefined note', () => {
            const orderProduct = createMockOrderProduct({
                note: undefined,
            });
            const index = 5;

            const cartItem = OrderProductTransformer.transformOrderProductToCartItem(orderProduct, index);

            expect(cartItem.notes).toBe('duplicated-order-note-5');
        });
    });

    describe('transformOrderProductsToCartItems', () => {
        it('should transform multiple order products to cart items', () => {
            const orderProducts = [
                createMockOrderProduct({ id: 1, product: { id: 1, uuid: 'uuid-1', name: 'Product 1' } }),
                createMockOrderProduct({ id: 2, product: { id: 2, uuid: 'uuid-2', name: 'Product 2' } }),
            ];

            const cartItems = OrderProductTransformer.transformOrderProductsToCartItems(orderProducts);

            expect(cartItems).toHaveLength(2);
            expect(cartItems[0].name).toBe('Product 1');
            expect(cartItems[0].id).toBe('uuid-1-0');
            expect(cartItems[1].name).toBe('Product 2');
            expect(cartItems[1].id).toBe('uuid-2-1');
        });

        it('should return empty array for non-array input', () => {
            const cartItems = OrderProductTransformer.transformOrderProductsToCartItems(null as any);

            expect(cartItems).toEqual([]);
        });

        it('should return empty array for undefined input', () => {
            const cartItems = OrderProductTransformer.transformOrderProductsToCartItems(undefined as any);

            expect(cartItems).toEqual([]);
        });

        it('should return empty array for string input', () => {
            const cartItems = OrderProductTransformer.transformOrderProductsToCartItems('invalid' as any);

            expect(cartItems).toEqual([]);
        });

        it('should handle empty array', () => {
            const cartItems = OrderProductTransformer.transformOrderProductsToCartItems([]);

            expect(cartItems).toEqual([]);
        });

        it('should preserve order and assign correct indices', () => {
            const orderProducts = [
                createMockOrderProduct({ id: 1, product: { id: 1, uuid: 'uuid-1', name: 'First' } }),
                createMockOrderProduct({ id: 2, product: { id: 2, uuid: 'uuid-2', name: 'Second' } }),
                createMockOrderProduct({ id: 3, product: { id: 3, uuid: 'uuid-3', name: 'Third' } }),
            ];

            const cartItems = OrderProductTransformer.transformOrderProductsToCartItems(orderProducts);

            expect(cartItems[0].id).toBe('uuid-1-0');
            expect(cartItems[1].id).toBe('uuid-2-1');
            expect(cartItems[2].id).toBe('uuid-3-2');
        });
    });
});