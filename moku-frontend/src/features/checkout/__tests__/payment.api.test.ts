import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { PaymentAPI } from '../api/payment.api';
import type { OrderResponse, StoreOrderPayload, StoreProductResponse } from '@/features/cart/types/Order';
import type { CheckoutRequestPayload } from '../types/Checkout';

// Mock dependencies
vi.mock('@/lib/axios', () => ({
    axiosInstance: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock('sonner', () => ({
    toast: {
        info: vi.fn(),
    },
}));

const mockAxios = axiosInstance as any;
const mockToast = toast as any;

describe('PaymentAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getListPayment', () => {
        it('should fetch payment list successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Payment retrieved',
                data: {
                    outlet: {
                        id: 1,
                        uuid: 'outlet-uuid',
                        name: 'Test Outlet',
                        slug: 'test-outlet',
                        phone: null,
                        address: null,
                        map: null,
                        is_active: 1,
                        type: 1,
                        fee_tax: 10,
                        created_at: '2024-01-01',
                        updated_at: '2024-01-01'
                    },
                    order: [],
                    payment_methods: []
                }
            };

            mockAxios.get.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.getListPayment('test-outlet');

            expect(mockAxios.get).toHaveBeenCalledWith('/outlet/test-outlet/payment');
            expect(result).toEqual(mockResponse);
        });

        it('should handle error response and show toast', async () => {
            const mockErrorResponse: OrderResponse = {
                status: 'error',
                message: 'Payment not found',
                data: {}
            };

            mockAxios.get.mockResolvedValue({ data: mockErrorResponse });

            const result = await PaymentAPI.getListPayment('test-outlet');

            expect(mockToast.info).toHaveBeenCalledWith('Payment not found');
            expect(result).toEqual(mockErrorResponse);
        });

        it('should handle network error', async () => {
            mockAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(PaymentAPI.getListPayment('test-outlet'))
                .rejects.toThrow('Failed to fetch outlets information: Error: Network error');
        });
    });

    describe('updateStatusPayment', () => {
        it('should update payment status successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Status updated',
                data: {}
            };

            const payload = { method_id: 1, table_number_id: 5 };

            mockAxios.put.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.updateStatusPayment('test-outlet', 'ORDER123', payload);

            expect(mockAxios.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/payment/ORDER123',
                payload
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle error response', async () => {
            const mockErrorResponse: OrderResponse = {
                status: 'error',
                message: 'Update failed',
                data: {}
            };

            mockAxios.put.mockResolvedValue({ data: mockErrorResponse });

            const result = await PaymentAPI.updateStatusPayment('test-outlet', 'ORDER123', { method_id: 1 });

            expect(mockToast.info).toHaveBeenCalledWith('Update failed');
            expect(result).toEqual(mockErrorResponse);
        });

        it('should handle network error', async () => {
            mockAxios.put.mockRejectedValue(new Error('Network error'));

            await expect(PaymentAPI.updateStatusPayment('test-outlet', 'ORDER123', { method_id: 1 }))
                .rejects.toThrow('Failed to update order status for: test-outlet with Error: Network error');
        });
    });

    describe('storeProduct', () => {
        it('should store product successfully', async () => {
            const mockResponse: StoreProductResponse = {
                status: 'success',
                message: 'Product stored',
                data: {
                    message: 'Product added',
                    data: {
                        id: 1,
                        uuid: 'order-uuid',
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
                        }
                    }
                }
            };

            const payload: StoreOrderPayload = {
                product_id: 1,
                variant_id: [1, 2],
                quantity: 2,
                note: 'Test note',
                table_number_id: '5'
            };

            mockAxios.post.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.storeProduct('test-outlet', payload);

            expect(mockAxios.post).toHaveBeenCalledWith(
                '/outlet/test-outlet/payment/product',
                payload
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle store product error', async () => {
            const mockErrorResponse: StoreProductResponse = {
                status: 'error',
                message: 'Product store failed',
                data: {
                    message: 'Error occurred',
                    data: {} as any
                }
            };

            mockAxios.post.mockResolvedValue({ data: mockErrorResponse });

            const payload: StoreOrderPayload = {
                product_id: 1,
                variant_id: [1],
                quantity: 1,
                note: 'Test'
            };

            const result = await PaymentAPI.storeProduct('test-outlet', payload);

            expect(mockToast.info).toHaveBeenCalledWith('Product store failed');
            expect(result).toEqual(mockErrorResponse);
        });
    });

    describe('storeQuantityProduct', () => {
        it('should store quantity product successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Quantity updated',
                data: {}
            };

            const payload = { order_product_ids: [1, 2], quantities: [3, 4] };

            mockAxios.post.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.storeQuantityProduct('test-outlet', 'ORDER123', payload);

            expect(mockAxios.post).toHaveBeenCalledWith(
                '/outlet/test-outlet/payment/ORDER123/store',
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateOrderProduct', () => {
        it('should update order product successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Product updated',
                data: {}
            };

            const payload: StoreOrderPayload = {
                product_id: 1,
                variant_id: [1],
                quantity: 2,
                note: 'Updated note'
            };

            mockAxios.put.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.updateOrderProduct('test-outlet', 123, payload);

            expect(mockAxios.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/payment/product/123',
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('updateQuantityPaymentProduct', () => {
        it('should update product quantity successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Quantity updated',
                data: {}
            };

            const payload = { quantity: 5 };

            mockAxios.put.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.updateQuantityPaymentProduct('test-outlet', 123, payload);

            expect(mockAxios.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/payment/product/123/quantity',
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteOrder', () => {
        it('should delete order successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Order deleted',
                data: {}
            };

            mockAxios.delete.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.deleteOrder('test-outlet', 'ORDER123');

            expect(mockAxios.delete).toHaveBeenCalledWith('/outlet/test-outlet/payment/ORDER123');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteProduct', () => {
        it('should delete product successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Product deleted',
                data: {}
            };

            mockAxios.delete.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.deleteProduct('test-outlet', 123);

            expect(mockAxios.delete).toHaveBeenCalledWith('/outlet/test-outlet/payment/product/123');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('useVoucher', () => {
        it('should use voucher successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Voucher applied',
                data: {}
            };

            mockAxios.put.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.useVoucher('test-outlet', 'VOUCHER123');

            expect(mockAxios.put).toHaveBeenCalledWith('/outlet/test-outlet/payment/VOUCHER123/voucher');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('deleteUseVoucher', () => {
        it('should delete voucher usage successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Voucher removed',
                data: {}
            };

            mockAxios.delete.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.deleteUseVoucher('test-outlet', 'ORDER123');

            expect(mockAxios.delete).toHaveBeenCalledWith('/outlet/test-outlet/payment/ORDER123/voucher');
            expect(result).toEqual(mockResponse);
        });
    });

    describe('useInputCodeVoucher', () => {
        it('should use input code voucher successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Voucher code applied',
                data: {}
            };

            const payload = { voucher_code: 'CODE123' };

            mockAxios.put.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.useInputCodeVoucher('test-outlet', payload);

            expect(mockAxios.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/payment/voucher/input-code',
                payload
            );
            expect(result).toEqual(mockResponse);
        });
    });

    describe('storeCheckoutRequest', () => {
        it('should store checkout request successfully', async () => {
            const mockResponse: OrderResponse = {
                status: 'success',
                message: 'Checkout successful',
                data: {}
            };

            const payload: CheckoutRequestPayload = {
                product_ids: [1],
                variant_ids: [1, 2],
                quantities: [2],
                notes: ['Test note'],
                voucher_type: null,
                voucher_code: 'DISCOUNT10',
                table_number_id: '5',
                method_id: 1
            };

            mockAxios.post.mockResolvedValue({ data: mockResponse });

            const result = await PaymentAPI.storeCheckoutRequest('test-outlet', payload);

            expect(mockAxios.post).toHaveBeenCalledWith(
                '/outlet/test-outlet/payment-all',
                payload
            );
            expect(result).toEqual(mockResponse);
        });

        it('should handle checkout error', async () => {
            const mockErrorResponse: OrderResponse = {
                status: 'error',
                message: 'Checkout failed',
                data: {}
            };

            mockAxios.post.mockResolvedValue({ data: mockErrorResponse });

            const payload: CheckoutRequestPayload = {
                product_ids: [1],
                variant_ids: [1],
                quantities: [1],
                notes: [''],
                voucher_type: null,
                voucher_code: null,
                table_number_id: null,
                method_id: 1
            };

            const result = await PaymentAPI.storeCheckoutRequest('test-outlet', payload);

            expect(mockToast.info).toHaveBeenCalledWith('Checkout failed');
            expect(result).toEqual(mockErrorResponse);
        });

        it('should handle network error', async () => {
            mockAxios.post.mockRejectedValue(new Error('Network error'));

            const payload: CheckoutRequestPayload = {
                product_ids: [1],
                variant_ids: [1],
                quantities: [1],
                notes: [''],
                voucher_type: null,
                voucher_code: null,
                table_number_id: null,
                method_id: 1
            };

            await expect(PaymentAPI.storeCheckoutRequest('test-outlet', payload))
                .rejects.toThrow('Failed to post checkout request for: test-outlet with Error: Network error');
        });
    });
});