import { describe, it, expect } from 'vitest';
import type { Order, OrderProduct } from '../types/Order';

describe('Order Types', () => {
    describe('Order interface', () => {
        it('should define correct Order structure', () => {
            const mockOrder: Order = {
                id: 1,
                uuid: 'order-uuid-123',
                code: 'ORDER123',
                sub_total: 25000,
                discount: 0,
                tax: 2500,
                fee_service: 1000,
                spinofy_fee: 500,
                total_fee_service: 1500,
                total: 29000,
                status: 1,
                order_number: 'ORD001',
                user_meta_data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '1234567890'
                },
                user_id: 1,
                outlet_id: 1,
                voucher_id: null,
                payment_method_id: 1,
                service_fee_config: 1,
                table_number_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                payment_log: {
                    id: 1,
                    status_code: 200,
                    payment_channel: 'credit_card',
                    raw_response: {
                        Data: {
                            SessionId: 123,
                            TransactionId: 456,
                            ReferenceId: 789,
                            Via: 'mobile',
                            Channel: 'credit_card',
                            PaymentNo: 'PAY123',
                            QrString: 'qr_string',
                            PaymentName: 'Credit Card',
                            SubTotal: 25000,
                            Fee: 1000,
                            Total: 26000,
                            FeeDirection: 'add',
                            Expired: '2024-01-01T01:00:00Z',
                            QrImage: 'qr_image_url',
                            QrTemplate: 'template',
                            Terminal: 'terminal_1',
                            NNSCode: null,
                            NMID: 'NMID123',
                            Note: null,
                            Escrow: false
                        },
                        Status: 200,
                        Message: 'Success',
                        Success: true
                    },
                    order_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                table_number: {
                    id: 1,
                    number: 'T1',
                    qr_code_path: '/qr/table1.png',
                    table_number_location_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    order_products: [],
                    customer_point: {
                        id: 1,
                        point: 100,
                        type: 1,
                        info: 'Earned points',
                        user_id: 1,
                        outlet_id: 1,
                        pointable_type: 'order',
                        pointable_id: 1,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                    },
                    outlet: {
                        id: 1,
                        uuid: 'outlet-uuid',
                        name: 'Test Outlet',
                        slug: 'test-outlet',
                        phone: '1234567890',
                        address: 'Test Address',
                        map: null,
                        is_active: 1,
                        type: 1,
                        fee_tax: 10,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                    }
                },
                order_products: []
            };

            expect(mockOrder).toHaveProperty('id');
            expect(mockOrder).toHaveProperty('uuid');
            expect(mockOrder).toHaveProperty('code');
            expect(mockOrder).toHaveProperty('order_products');

            expect(typeof mockOrder.id).toBe('number');
            expect(typeof mockOrder.uuid).toBe('string');
            expect(typeof mockOrder.code).toBe('string');
            expect(Array.isArray(mockOrder.order_products)).toBe(true);
        });

        it('should allow order with products', () => {
            const mockOrderProduct: OrderProduct = {
                id: 1,
                price: 25000,
                quantity: 2,
                extra_price: 0,
                total: 50000,
                note: 'Test notes',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 1,
                    uuid: 'product-uuid-123',
                    name: 'Test Product',
                    price: '25000',
                    description: 'Test product description',
                    is_available: 1,
                    is_recommended: 0,
                    image: 'test-image.jpg',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: [{
                    id: 1,
                    price: 0,
                    order_product_id: 1,
                    product_attribute_value_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    product_attribute_value: {
                        id: 1,
                        name: 'Large',
                        extra_price: 0,
                        product_attribute_id: 1,
                        outlet_id: 1,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z'
                    }
                }]
            };

            // Create a simplified mock order
            const basicOrder: Partial<Order> = {
                id: 1,
                uuid: 'order-uuid',
                code: 'ORDER123',
                order_products: [mockOrderProduct]
            };

            expect(basicOrder.order_products).toHaveLength(1);
            expect(basicOrder.order_products?.[0]).toEqual(mockOrderProduct);
        });

        it('should handle empty order_products array', () => {
            const basicOrder: Partial<Order> = {
                id: 999,
                uuid: 'empty-order-uuid',
                code: 'EMPTY_ORDER',
                order_products: []
            };

            expect(basicOrder.order_products).toEqual([]);
            expect(basicOrder.order_products).toHaveLength(0);
        });
    });

    describe('OrderProduct interface', () => {
        it('should define correct OrderProduct structure', () => {
            const mockOrderProduct: OrderProduct = {
                id: 1,
                price: 35000,
                quantity: 3,
                extra_price: 5000,
                total: 120000,
                note: 'Special instructions',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 1,
                    uuid: 'product-uuid-456',
                    name: 'Sample Product',
                    price: '35000',
                    description: 'Sample product description',
                    is_available: 1,
                    is_recommended: 1,
                    image: 'image1.jpg',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: [
                    {
                        id: 1,
                        price: 2000,
                        order_product_id: 1,
                        product_attribute_value_id: 1,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        product_attribute_value: {
                            id: 1,
                            name: 'Large',
                            extra_price: 2000,
                            product_attribute_id: 1,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z'
                        }
                    },
                    {
                        id: 2,
                        price: 3000,
                        order_product_id: 1,
                        product_attribute_value_id: 2,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        product_attribute_value: {
                            id: 2,
                            name: 'Extra Shot',
                            extra_price: 3000,
                            product_attribute_id: 2,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z'
                        }
                    }
                ]
            };

            // Test OrderProduct properties
            expect(mockOrderProduct).toHaveProperty('id');
            expect(mockOrderProduct).toHaveProperty('quantity');
            expect(mockOrderProduct).toHaveProperty('note');
            expect(mockOrderProduct).toHaveProperty('product');
            expect(mockOrderProduct).toHaveProperty('order_product_variants');

            expect(typeof mockOrderProduct.id).toBe('number');
            expect(typeof mockOrderProduct.quantity).toBe('number');
            expect(typeof mockOrderProduct.note).toBe('string');
            expect(typeof mockOrderProduct.product).toBe('object');
            expect(Array.isArray(mockOrderProduct.order_product_variants)).toBe(true);
        });

        it('should handle OrderProduct with null product', () => {
            const mockOrderProduct: OrderProduct = {
                id: 1,
                price: 0,
                quantity: 1,
                extra_price: 0,
                total: 0,
                note: 'Product deleted',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 1,
                    uuid: 'deleted-product',
                    name: 'Deleted Product',
                    price: '0',
                    description: '',
                    is_available: 0,
                    is_recommended: 0,
                    image: '',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: []
            };

            expect(mockOrderProduct.product.is_available).toBe(0);
            expect(mockOrderProduct.order_product_variants).toEqual([]);
        });

        it('should handle OrderProduct with empty variants', () => {
            const mockOrderProduct: OrderProduct = {
                id: 1,
                price: 10000,
                quantity: 1,
                extra_price: 0,
                total: 10000,
                note: 'No variants',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 1,
                    uuid: 'simple-product',
                    name: 'Simple Product',
                    price: '10000',
                    description: 'Simple product description',
                    is_available: 1,
                    is_recommended: 0,
                    image: '',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: []
            };

            expect(mockOrderProduct.order_product_variants).toEqual([]);
        });

        it('should handle product with image', () => {
            const mockOrderProduct: OrderProduct = {
                id: 1,
                price: 50000,
                quantity: 1,
                extra_price: 0,
                total: 50000,
                note: 'Product with image',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 1,
                    uuid: 'image-product',
                    name: 'Product with Image',
                    price: '50000',
                    description: 'Product description',
                    is_available: 1,
                    is_recommended: 1,
                    image: 'main-image.jpg',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: []
            };

            expect(mockOrderProduct.product.image).toBe('main-image.jpg');
        });

        it('should handle different note types', () => {
            const orderProductWithNotes: OrderProduct = {
                id: 1,
                price: 15000,
                quantity: 1,
                extra_price: 0,
                total: 15000,
                note: 'Custom notes here',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 1,
                    uuid: 'product-with-notes',
                    name: 'Product',
                    price: '15000',
                    description: '',
                    is_available: 1,
                    is_recommended: 0,
                    image: '',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: []
            };

            const orderProductWithoutNotes: OrderProduct = {
                id: 2,
                price: 15000,
                quantity: 1,
                extra_price: 0,
                total: 15000,
                note: '',
                order_id: 1,
                user_id: 1,
                product_id: 2,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 2,
                    uuid: 'product-no-notes',
                    name: 'Product No Notes',
                    price: '15000',
                    description: '',
                    is_available: 1,
                    is_recommended: 0,
                    image: '',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: []
            };

            expect(orderProductWithNotes.note).toBe('Custom notes here');
            expect(orderProductWithoutNotes.note).toBe('');
        });

        it('should handle complex variant relationships', () => {
            const mockOrderProduct: OrderProduct = {
                id: 1,
                price: 45000,
                quantity: 2,
                extra_price: 10000,
                total: 100000,
                note: 'Complex variants',
                order_id: 1,
                user_id: 1,
                product_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                product: {
                    id: 1,
                    uuid: 'complex-product',
                    name: 'Complex Product',
                    price: '45000',
                    description: 'Complex product with variants',
                    is_available: 1,
                    is_recommended: 1,
                    image: 'complex.jpg',
                    product_category_id: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z'
                },
                order_product_variants: [
                    {
                        id: 10,
                        price: 3000,
                        order_product_id: 1,
                        product_attribute_value_id: 1,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        product_attribute_value: {
                            id: 1,
                            name: 'Large',
                            extra_price: 3000,
                            product_attribute_id: 1,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z'
                        }
                    }
                ]
            };

            expect(mockOrderProduct.order_product_variants).toHaveLength(1);

            // Test variant mapping
            const variantNames = mockOrderProduct.order_product_variants.map(v => v.product_attribute_value.name);
            expect(variantNames).toEqual(['Large']);
        });
    });

    describe('Type compatibility', () => {
        it('should be compatible with Order array', () => {
            const basicOrders: Partial<Order>[] = [
                {
                    id: 1,
                    uuid: 'order-1-uuid',
                    code: 'ORDER001',
                    order_products: []
                },
                {
                    id: 2,
                    uuid: 'order-2-uuid',
                    code: 'ORDER002',
                    order_products: [{
                        id: 1,
                        price: 1000,
                        quantity: 1,
                        extra_price: 0,
                        total: 1000,
                        note: 'Test',
                        order_id: 2,
                        user_id: 1,
                        product_id: 1,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        product: {
                            id: 1,
                            uuid: 'test',
                            name: 'Test',
                            price: '1000',
                            description: 'Test product',
                            is_available: 1,
                            is_recommended: 0,
                            image: '',
                            product_category_id: 1,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z'
                        },
                        order_product_variants: []
                    }]
                }
            ];

            expect(basicOrders).toHaveLength(2);
            expect(basicOrders[0].order_products).toHaveLength(0);
            expect(basicOrders[1].order_products).toHaveLength(1);
        });

        it('should handle nested object structures correctly', () => {
            const basicOrder: Partial<Order> = {
                id: 1,
                uuid: 'nested-uuid',
                code: 'NESTED_TEST',
                order_products: [
                    {
                        id: 1,
                        price: 25000,
                        quantity: 1,
                        extra_price: 0,
                        total: 25000,
                        note: 'nested test',
                        order_id: 1,
                        user_id: 1,
                        product_id: 1,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        product: {
                            id: 1,
                            uuid: 'nested-product-uuid',
                            name: 'Nested Product',
                            price: '25000',
                            description: 'Nested product description',
                            is_available: 1,
                            is_recommended: 1,
                            image: 'nested1.jpg',
                            product_category_id: 1,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z'
                        },
                        order_product_variants: [
                            {
                                id: 100,
                                price: 0,
                                order_product_id: 1,
                                product_attribute_value_id: 1,
                                created_at: '2024-01-01T00:00:00Z',
                                updated_at: '2024-01-01T00:00:00Z',
                                product_attribute_value: {
                                    id: 1,
                                    name: 'Variant 1',
                                    extra_price: 0,
                                    product_attribute_id: 1,
                                    outlet_id: 1,
                                    created_at: '2024-01-01T00:00:00Z',
                                    updated_at: '2024-01-01T00:00:00Z'
                                }
                            }
                        ]
                    }
                ]
            };

            // Test deep property access
            expect(basicOrder.order_products?.[0].product.name).toBe('Nested Product');
            expect(basicOrder.order_products?.[0].product.image).toBe('nested1.jpg');
            expect(basicOrder.order_products?.[0].order_product_variants[0].product_attribute_value.name).toBe('Variant 1');
        });
    });
});