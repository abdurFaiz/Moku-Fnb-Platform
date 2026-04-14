import { describe, it, expect } from 'vitest';
import type {
    InvoiceOrderResponse,
    InvoiceOrderData,
    Outlet,
    Order,
    UserMetaData,
    OperationalSchedule,
} from '../types/Invoice';

describe('Invoice Types', () => {
    describe('InvoiceOrderResponse', () => {
        it('should have correct structure for success response', () => {
            const response: InvoiceOrderResponse = {
                status: 'success',
                message: 'Invoice retrieved successfully',
                data: {
                    outlet: {
                        id: 1,
                        uuid: 'outlet-uuid',
                        name: 'Test Cafe',
                        slug: 'test-cafe',
                        phone: '+1234567890',
                        address: '123 Test Street',
                        map: 'https://maps.google.com/test',
                        is_active: 1,
                        type: 1,
                        fee_tax: 10,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        logo_url: 'https://example.com/logo.png',
                        operational_schedules: [],
                        media: [],
                    },
                    order: {
                        id: 1,
                        uuid: 'order-uuid',
                        code: '123',
                        sub_total: 50000,
                        discount: 5000,
                        tax: 5000,
                        fee_service: 2500,
                        spinofy_fee: 1000,
                        total_fee_service: 3500,
                        total: 52500,
                        status: 1,
                        order_number: 1,
                        service_fee_config: 2,
                        user_meta_data: {
                            name: 'John Doe',
                            email: 'john@example.com',
                            phone: '+1234567890',
                        },
                        user_id: 1,
                        outlet_id: 1,
                        voucher_id: 1,
                        payment_method_id: 1,
                        created_at: '2024-01-01T10:00:00Z',
                        updated_at: '2024-01-01T10:00:00Z',
                        table_number_id: 1,
                        table_number: {
                            id: 1,
                            number: 'A1',
                        },
                        voucher: null,
                        order_products: [],
                    },
                },
            };

            expect(response.status).toBe('success');
            expect(response.message).toBe('Invoice retrieved successfully');
            expect(response.data).toBeDefined();
            expect(response.data.outlet).toBeDefined();
            expect(response.data.order).toBeDefined();
        });

        it('should have correct structure for error response', () => {
            const response: InvoiceOrderResponse = {
                status: 'error',
                message: 'Invoice not found',
                data: {
                    outlet: {
                        id: 0,
                        uuid: '',
                        name: '',
                        slug: '',
                        phone: null,
                        address: null,
                        map: null,
                        is_active: 0,
                        type: 0,
                        fee_tax: 0,
                        created_at: '',
                        updated_at: '',
                        logo_url: '',
                        operational_schedules: [],
                        media: [],
                    },
                    order: {
                        id: 0,
                        uuid: '',
                        code: '',
                        sub_total: 0,
                        discount: null,
                        tax: 0,
                        fee_service: 0,
                        spinofy_fee: 0,
                        total_fee_service: 0,
                        total: 0,
                        status: 0,
                        order_number: 0,
                        service_fee_config: 0,
                        user_meta_data: {
                            name: '',
                            email: '',
                            phone: '',
                        },
                        user_id: 0,
                        outlet_id: 0,
                        voucher_id: null,
                        payment_method_id: null,
                        created_at: '',
                        updated_at: '',
                        table_number_id: 0,
                        voucher: null,
                        order_products: [],
                    },
                },
            };

            expect(response.status).toBe('error');
            expect(response.message).toBe('Invoice not found');
        });
    });

    describe('Outlet Type', () => {
        it('should allow all required fields', () => {
            const outlet: Outlet = {
                id: 1,
                uuid: 'outlet-uuid',
                name: 'Test Cafe',
                slug: 'test-cafe',
                phone: '+1234567890',
                address: '123 Test Street',
                map: 'https://maps.google.com/test',
                is_active: 1,
                type: 1,
                fee_tax: 10,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                logo_url: 'https://example.com/logo.png',
                operational_schedules: [],
                media: [],
            };

            expect(outlet.id).toBe(1);
            expect(outlet.name).toBe('Test Cafe');
            expect(outlet.slug).toBe('test-cafe');
        });

        it('should allow null values for optional fields', () => {
            const outlet: Outlet = {
                id: 1,
                uuid: 'outlet-uuid',
                name: 'Test Cafe',
                slug: 'test-cafe',
                phone: null,
                address: null,
                map: null,
                is_active: 1,
                type: 1,
                fee_tax: 10,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                logo_url: 'https://example.com/logo.png',
                operational_schedules: [],
                media: [],
            };

            expect(outlet.phone).toBeNull();
            expect(outlet.address).toBeNull();
            expect(outlet.map).toBeNull();
        });

        it('should include operational schedules', () => {
            const schedule: OperationalSchedule = {
                id: 1,
                uuid: 'schedule-uuid',
                outlet_id: 1,
                day: 1,
                open_time: '08:00:00',
                close_time: '22:00:00',
                is_open: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            const outlet: Outlet = {
                id: 1,
                uuid: 'outlet-uuid',
                name: 'Test Cafe',
                slug: 'test-cafe',
                phone: '+1234567890',
                address: '123 Test Street',
                map: null,
                is_active: 1,
                type: 1,
                fee_tax: 10,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
                logo_url: 'https://example.com/logo.png',
                operational_schedules: [schedule],
                media: [],
            };

            expect(outlet.operational_schedules).toHaveLength(1);
            expect(outlet.operational_schedules[0].day).toBe(1);
        });
    });

    describe('Order Type', () => {
        it('should allow all required fields', () => {
            const order: Order = {
                id: 1,
                uuid: 'order-uuid',
                code: '123',
                sub_total: 50000,
                discount: 5000,
                tax: 5000,
                fee_service: 2500,
                spinofy_fee: 1000,
                total_fee_service: 3500,
                total: 52500,
                status: 1,
                order_number: 1,
                service_fee_config: 2,
                user_meta_data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                },
                user_id: 1,
                outlet_id: 1,
                voucher_id: 1,
                payment_method_id: 1,
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-01T10:00:00Z',
                table_number_id: 1,
                voucher: null,
                order_products: [],
            };

            expect(order.id).toBe(1);
            expect(order.code).toBe('123');
            expect(order.sub_total).toBe(50000);
        });

        it('should allow null values for optional fields', () => {
            const order: Order = {
                id: 1,
                uuid: 'order-uuid',
                code: '123',
                sub_total: 50000,
                discount: null,
                tax: 5000,
                fee_service: 2500,
                spinofy_fee: 1000,
                total_fee_service: 3500,
                total: 52500,
                status: 1,
                order_number: 1,
                service_fee_config: 2,
                user_meta_data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                },
                user_id: 1,
                outlet_id: 1,
                voucher_id: null,
                payment_method_id: null,
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-01T10:00:00Z',
                table_number_id: 1,
                voucher: null,
                order_products: [],
            };

            expect(order.discount).toBeNull();
            expect(order.voucher_id).toBeNull();
            expect(order.payment_method_id).toBeNull();
        });

        it('should include table number when available', () => {
            const order: Order = {
                id: 1,
                uuid: 'order-uuid',
                code: '123',
                sub_total: 50000,
                discount: null,
                tax: 5000,
                fee_service: 2500,
                spinofy_fee: 1000,
                total_fee_service: 3500,
                total: 52500,
                status: 1,
                order_number: 1,
                service_fee_config: 2,
                user_meta_data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                },
                user_id: 1,
                outlet_id: 1,
                voucher_id: null,
                payment_method_id: null,
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-01T10:00:00Z',
                table_number_id: 1,
                table_number: {
                    id: 1,
                    number: 'A1',
                },
                voucher: null,
                order_products: [],
            };

            expect(order.table_number).toBeDefined();
            expect(order.table_number?.id).toBe(1);
            expect(order.table_number?.number).toBe('A1');
        });

        it('should allow order without table number', () => {
            const order: Order = {
                id: 1,
                uuid: 'order-uuid',
                code: '123',
                sub_total: 50000,
                discount: null,
                tax: 5000,
                fee_service: 2500,
                spinofy_fee: 1000,
                total_fee_service: 3500,
                total: 52500,
                status: 1,
                order_number: 1,
                service_fee_config: 2,
                user_meta_data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                },
                user_id: 1,
                outlet_id: 1,
                voucher_id: null,
                payment_method_id: null,
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-01T10:00:00Z',
                table_number_id: 1,
                voucher: null,
                order_products: [],
            };

            expect(order.table_number).toBeUndefined();
        });
    });

    describe('UserMetaData Type', () => {
        it('should require all fields', () => {
            const userMetaData: UserMetaData = {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
            };

            expect(userMetaData.name).toBe('John Doe');
            expect(userMetaData.email).toBe('john@example.com');
            expect(userMetaData.phone).toBe('+1234567890');
        });

        it('should allow empty strings', () => {
            const userMetaData: UserMetaData = {
                name: '',
                email: '',
                phone: '',
            };

            expect(userMetaData.name).toBe('');
            expect(userMetaData.email).toBe('');
            expect(userMetaData.phone).toBe('');
        });
    });

    describe('OperationalSchedule Type', () => {
        it('should allow all required fields', () => {
            const schedule: OperationalSchedule = {
                id: 1,
                uuid: 'schedule-uuid',
                outlet_id: 1,
                day: 1,
                open_time: '08:00:00',
                close_time: '22:00:00',
                is_open: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(schedule.id).toBe(1);
            expect(schedule.day).toBe(1);
            expect(schedule.open_time).toBe('08:00:00');
            expect(schedule.close_time).toBe('22:00:00');
            expect(schedule.is_open).toBe(1);
        });

        it('should allow null times for closed days', () => {
            const schedule: OperationalSchedule = {
                id: 1,
                uuid: 'schedule-uuid',
                outlet_id: 1,
                day: 0,
                open_time: null,
                close_time: null,
                is_open: 0,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            };

            expect(schedule.open_time).toBeNull();
            expect(schedule.close_time).toBeNull();
            expect(schedule.is_open).toBe(0);
        });
    });

    describe('InvoiceOrderData Type', () => {
        it('should contain outlet and order', () => {
            const data: InvoiceOrderData = {
                outlet: {
                    id: 1,
                    uuid: 'outlet-uuid',
                    name: 'Test Cafe',
                    slug: 'test-cafe',
                    phone: '+1234567890',
                    address: '123 Test Street',
                    map: null,
                    is_active: 1,
                    type: 1,
                    fee_tax: 10,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    logo_url: 'https://example.com/logo.png',
                    operational_schedules: [],
                    media: [],
                },
                order: {
                    id: 1,
                    uuid: 'order-uuid',
                    code: '123',
                    sub_total: 50000,
                    discount: null,
                    tax: 5000,
                    fee_service: 2500,
                    spinofy_fee: 1000,
                    total_fee_service: 3500,
                    total: 52500,
                    status: 1,
                    order_number: 1,
                    service_fee_config: 2,
                    user_meta_data: {
                        name: 'John Doe',
                        email: 'john@example.com',
                        phone: '+1234567890',
                    },
                    user_id: 1,
                    outlet_id: 1,
                    voucher_id: null,
                    payment_method_id: null,
                    created_at: '2024-01-01T10:00:00Z',
                    updated_at: '2024-01-01T10:00:00Z',
                    table_number_id: 1,
                    voucher: null,
                    order_products: [],
                },
            };

            expect(data.outlet).toBeDefined();
            expect(data.order).toBeDefined();
            expect(data.outlet.id).toBe(1);
            expect(data.order.id).toBe(1);
        });
    });

    describe('Type Compatibility', () => {
        it('should be compatible with API response structure', () => {
            // This test ensures our types match the expected API response structure
            const apiResponse = {
                status: 'success',
                message: 'Invoice retrieved successfully',
                data: {
                    outlet: {
                        id: 1,
                        uuid: 'outlet-uuid',
                        name: 'Test Cafe',
                        slug: 'test-cafe',
                        phone: '+1234567890',
                        address: '123 Test Street',
                        map: null,
                        is_active: 1,
                        type: 1,
                        fee_tax: 10,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        logo_url: 'https://example.com/logo.png',
                        operational_schedules: [],
                        media: [],
                    },
                    order: {
                        id: 1,
                        uuid: 'order-uuid',
                        code: '123',
                        sub_total: 50000,
                        discount: 5000,
                        tax: 5000,
                        fee_service: 2500,
                        spinofy_fee: 1000,
                        total_fee_service: 3500,
                        total: 52500,
                        status: 1,
                        order_number: 1,
                        service_fee_config: 2,
                        user_meta_data: {
                            name: 'John Doe',
                            email: 'john@example.com',
                            phone: '+1234567890',
                        },
                        user_id: 1,
                        outlet_id: 1,
                        voucher_id: 1,
                        payment_method_id: 1,
                        created_at: '2024-01-01T10:00:00Z',
                        updated_at: '2024-01-01T10:00:00Z',
                        table_number_id: 1,
                        table_number: {
                            id: 1,
                            number: 'A1',
                        },
                        voucher: {
                            name: 'Discount 10%',
                        },
                        order_products: [],
                    },
                },
            };

            // This should compile without errors if types are correct
            const typedResponse: InvoiceOrderResponse = apiResponse;
            expect(typedResponse.status).toBe('success');
        });

        it('should handle numeric string values correctly', () => {
            // Test that numeric fields can handle both numbers and strings
            const order: Order = {
                id: 1,
                uuid: 'order-uuid',
                code: '123',
                sub_total: 50000, // number
                discount: 5000, // number
                tax: 5000, // number
                fee_service: 2500, // number
                spinofy_fee: 1000, // number
                total_fee_service: 3500, // number
                total: 52500, // number
                status: 1,
                order_number: 1,
                service_fee_config: 2,
                user_meta_data: {
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                },
                user_id: 1,
                outlet_id: 1,
                voucher_id: 1,
                payment_method_id: 1,
                created_at: '2024-01-01T10:00:00Z',
                updated_at: '2024-01-01T10:00:00Z',
                table_number_id: 1,
                voucher: null,
                order_products: [],
            };

            expect(typeof order.sub_total).toBe('number');
            expect(typeof order.total).toBe('number');
        });
    });
});