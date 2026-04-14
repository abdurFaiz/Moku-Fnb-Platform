import { describe, expect, it } from 'vitest';
import type { CartItem } from '../types/Cart';
import type { Order, OrderProduct, Product } from '../types/Order';
import type {
    DuplicatedOrderData,
    OrderProduct as DuplicationOrderProduct,
    DuplicateOrderCartItem
} from '../types/OrderDuplication';

describe('Cart Types', () => {
    describe('CartItem', () => {
        it('should have all required properties', () => {
            const cartItem: CartItem = {
                id: 'item-1',
                productUuid: 'product-uuid-123',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                options: ['Extra Cheese'],
            };

            expect(cartItem).toBeDefined();
            expect(typeof cartItem.id).toBe('string');
            expect(typeof cartItem.productUuid).toBe('string');
            expect(typeof cartItem.name).toBe('string');
            expect(typeof cartItem.price).toBe('number');
            expect(typeof cartItem.quantity).toBe('number');
            expect(Array.isArray(cartItem.options)).toBe(true);
        });

        it('should support optional properties', () => {
            const cartItemWithOptionals: CartItem = {
                id: 'item-1',
                productUuid: 'product-uuid-123',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                options: [],
                notes: 'Special instructions',
                image: 'https://example.com/image.jpg',
                basePrice: 20000,
                extraPrice: 5000,
                orderProductId: 123,
                productId: 456,
                variantIds: [1, 2, 3],
                appliedVoucherId: 789,
                appliedVoucherCode: 'DISCOUNT10',
                orderCode: 'ORDER123',
            };

            expect(cartItemWithOptionals.notes).toBe('Special instructions');
            expect(cartItemWithOptionals.image).toBe('https://example.com/image.jpg');
            expect(cartItemWithOptionals.basePrice).toBe(20000);
            expect(cartItemWithOptionals.extraPrice).toBe(5000);
            expect(cartItemWithOptionals.orderProductId).toBe(123);
            expect(cartItemWithOptionals.productId).toBe(456);
            expect(cartItemWithOptionals.variantIds).toEqual([1, 2, 3]);
            expect(cartItemWithOptionals.appliedVoucherId).toBe(789);
            expect(cartItemWithOptionals.appliedVoucherCode).toBe('DISCOUNT10');
            expect(cartItemWithOptionals.orderCode).toBe('ORDER123');
        });

        it('should allow null voucher values', () => {
            const cartItemWithNullVoucher: CartItem = {
                id: 'item-1',
                productUuid: 'product-uuid-123',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                options: [],
                appliedVoucherId: null,
                appliedVoucherCode: null,
            };

            expect(cartItemWithNullVoucher.appliedVoucherId).toBeNull();
            expect(cartItemWithNullVoucher.appliedVoucherCode).toBeNull();
        });
    });

    describe('Order Types', () => {
        it('should support Order interface', () => {
            const mockDate = '2024-01-01T00:00:00.000Z';

            const order: Partial<Order> = {
                id: 1,
                uuid: 'order-uuid',
                code: 'ORDER123',
                sub_total: 50000,
                discount: 5000,
                tax: 4500,
                total: 49500,
                status: 1,
                user_meta_data: {
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '08123456789',
                },
                created_at: mockDate,
                updated_at: mockDate,
            };

            expect(order.id).toBe(1);
            expect(order.uuid).toBe('order-uuid');
            expect(order.code).toBe('ORDER123');
            expect(order.user_meta_data?.name).toBe('Test User');
        });

        it('should support OrderProduct interface', () => {
            const mockDate = '2024-01-01T00:00:00.000Z';

            const orderProduct: OrderProduct = {
                id: 1,
                price: 25000,
                quantity: 2,
                extra_price: 0,
                total: 50000,
                note: 'Test note',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: mockDate,
                updated_at: mockDate,
                product: {
                    id: 1,
                    uuid: 'product-uuid',
                    name: 'Test Product',
                    price: '25000',
                    description: 'Test Description',
                    is_available: 1,
                    is_recommended: 0,
                    image: 'product-image.jpg',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: mockDate,
                    updated_at: mockDate,
                },
                order_product_variants: [],
            };

            expect(orderProduct.id).toBe(1);
            expect(orderProduct.price).toBe(25000);
            expect(orderProduct.product.name).toBe('Test Product');
        });

        it('should support Product interface', () => {
            const mockDate = '2024-01-01T00:00:00.000Z';

            const product: Product = {
                id: 1,
                uuid: 'product-uuid',
                name: 'Test Product',
                price: '25000',
                description: 'Test Description',
                is_available: 1,
                is_recommended: 0,
                image: 'product-image.jpg',
                product_category_id: 1,
                outlet_id: 1,
                created_at: mockDate,
                updated_at: mockDate,
            };

            expect(product.id).toBe(1);
            expect(product.uuid).toBe('product-uuid');
            expect(product.name).toBe('Test Product');
            expect(typeof product.price).toBe('string');
        });
    });

    describe('OrderDuplication Types', () => {
        it('should support DuplicatedOrderData interface', () => {
            const duplicatedOrder: DuplicatedOrderData = {
                id: 1,
                uuid: 'order-uuid',
                code: 'ORDER123',
                sub_total: 50000,
                tax: 5000,
                total: 55000,
                status: 1,
                order_products: [
                    {
                        id: 1,
                        price: 25000,
                        quantity: 2,
                        note: 'Test note',
                        product: {
                            id: 1,
                            uuid: 'product-uuid',
                            name: 'Test Product',
                        },
                    },
                ],
            };

            expect(duplicatedOrder.id).toBe(1);
            expect(duplicatedOrder.order_products).toHaveLength(1);
            expect(duplicatedOrder.order_products[0].product?.name).toBe('Test Product');
        });

        it('should support DuplicationOrderProduct interface', () => {
            const orderProduct: DuplicationOrderProduct = {
                id: 1,
                price: 25000,
                quantity: 2,
                note: 'Test note',
                product: {
                    id: 1,
                    uuid: 'product-uuid',
                    name: 'Test Product',
                    image: 'product-image.jpg',
                },
                product_variant: {
                    id: 1,
                    name: 'Regular',
                },
            };

            expect(orderProduct.id).toBe(1);
            expect(typeof orderProduct.price).toBe('number');
            expect(orderProduct.product?.uuid).toBe('product-uuid');
            expect(orderProduct.product_variant?.name).toBe('Regular');
        });

        it('should support string price and quantity in DuplicationOrderProduct', () => {
            const orderProduct: DuplicationOrderProduct = {
                id: 1,
                price: '25000',
                quantity: '2',
                note: 'Test note',
            };

            expect(typeof orderProduct.price).toBe('string');
            expect(typeof orderProduct.quantity).toBe('string');
        });

        it('should support DuplicateOrderCartItem interface', () => {
            const cartItem: DuplicateOrderCartItem = {
                id: 'cart-item-1',
                productUuid: 'product-uuid-123',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                options: [],
                orderProductId: 1,
                productId: 1,
                variantIds: [1, 2],
            };

            expect(cartItem.orderProductId).toBe(1);
            expect(cartItem.productId).toBe(1);
            expect(cartItem.variantIds).toEqual([1, 2]);
            expect(typeof cartItem.productUuid).toBe('string');
        });
    });

    describe('Type Compatibility', () => {
        it('should allow DuplicateOrderCartItem to extend CartItem', () => {
            const duplicateCartItem: DuplicateOrderCartItem = {
                id: 'item-1',
                productUuid: 'product-uuid-123',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                options: [],
                orderProductId: 1,
                productId: 1,
                variantIds: [1, 2],
                // CartItem optional properties
                notes: 'Test notes',
                image: 'https://example.com/image.jpg',
                appliedVoucherId: null,
                appliedVoucherCode: null,
            };

            // Should be assignable to CartItem
            const cartItem: CartItem = duplicateCartItem;

            expect(cartItem.id).toBe('item-1');
            expect(cartItem.notes).toBe('Test notes');
        });

        it('should handle optional properties correctly', () => {
            const minimalCartItem: CartItem = {
                id: 'item-1',
                productUuid: 'product-uuid-123',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                options: [],
            };

            expect(minimalCartItem.notes).toBeUndefined();
            expect(minimalCartItem.image).toBeUndefined();
            expect(minimalCartItem.orderProductId).toBeUndefined();
        });
    });
});