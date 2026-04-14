import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentAPI } from '../api/payment.api';
import { OrderAPI } from '@/features/transaction/api/order.api';
import { CheckoutPaymentService } from '../services/checkoutPaymentService';

// Mock dependencies
vi.mock('../api/payment.api', () => ({
    PaymentAPI: {
        updateStatusPayment: vi.fn(),
        getListPayment: vi.fn(),
    },
}));

vi.mock('@/features/transaction/api/order.api', () => ({
    OrderAPI: {
        getOrderDetails: vi.fn(),
        getListOrders: vi.fn(),
        storeDuplicateOrder: vi.fn(),
    },
}));

const mockPaymentAPI = PaymentAPI as any;
const mockOrderAPI = OrderAPI as any;

describe('CheckoutPaymentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('processCheckout', () => {
        it('should throw error if no outlet available', async () => {
            await expect(
                CheckoutPaymentService.processCheckout(
                    null,
                    'ORDER123',
                    1,
                    5,
                    {
                        subtotal: 25000,
                        tax: 2500,
                        discount: 0,
                        finalPrice: 27500,
                        appliedVoucher: null,
                        paymentMethodFee: 0,
                        platformFee: 0,
                    }
                )
            ).rejects.toThrow('No outlet available');
        });

        it('should process checkout successfully', async () => {
            const mockOrder = {
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
            };

            // Mock payment update API response
            mockPaymentAPI.updateStatusPayment.mockResolvedValue({
                status: 'success',
                message: 'Payment updated',
                data: {
                    order: [mockOrder]
                }
            });

            // Mock order detail API response
            mockOrderAPI.getOrderDetails.mockResolvedValue({
                status: 'success',
                message: 'Order retrieved',
                data: {
                    order: [mockOrder]
                }
            });

            const result = await CheckoutPaymentService.processCheckout(
                'test-outlet',
                'ORDER123',
                1,
                5,
                {
                    subtotal: 25000,
                    tax: 2500,
                    discount: 0,
                    finalPrice: 27500,
                    appliedVoucher: null,
                    paymentMethodFee: 0,
                    platformFee: 0,
                }
            );

            // No longer calls updateStatusPayment - relies on store checkout payload
            expect(mockPaymentAPI.updateStatusPayment).not.toHaveBeenCalled();

            expect(mockOrderAPI.getOrderDetails).toHaveBeenCalledWith(
                'test-outlet',
                NaN
            );

            expect(result).toEqual({
                order: mockOrder,
                orderCode: 'ORDER123',
                subtotal: 25000,
                tax: 2500,
                discount: 0,
                finalPrice: 27500,
                appliedVoucher: null,
                paymentMethodFee: 0,
                platformFee: 0,
            });
        });

        it('should handle payment API error', async () => {
            mockPaymentAPI.updateStatusPayment.mockRejectedValue(
                new Error('Payment API error')
            );

            const result = await CheckoutPaymentService.processCheckout(
                'test-outlet',
                'ORDER123',
                1,
                5,
                {
                    subtotal: 25000,
                    tax: 2500,
                    discount: 0,
                    finalPrice: 27500,
                    appliedVoucher: null,
                    paymentMethodFee: 0,
                    platformFee: 0,
                }
            );

            // Should still return result with orderCode even if order fetch fails
            expect(result.orderCode).toBe('ORDER123');
            expect(result.subtotal).toBe(25000);
        });

        it('should handle order not found after payment update', async () => {
            mockOrderAPI.getOrderDetails.mockResolvedValue({
                status: 'success',
                message: 'Order not found',
                data: {
                    order: []
                }
            });

            mockPaymentAPI.getListPayment.mockResolvedValue({
                status: 'success',
                message: 'No orders',
                data: {
                    orders: []
                }
            }); const result = await CheckoutPaymentService.processCheckout(
                'test-outlet',
                'ORDER123',
                1,
                5,
                {
                    subtotal: 25000,
                    tax: 2500,
                    discount: 0,
                    finalPrice: 27500,
                    appliedVoucher: null,
                    paymentMethodFee: 0,
                    platformFee: 0,
                }
            );

            // Should return result with orderCode even if order is not found
            expect(result.orderCode).toBe('ORDER123');
            expect(result.order).toBeNull();
        });

        it('should handle order detail API error', async () => {
            const mockOrder = {
                id: 1,
                uuid: 'order-uuid',
                code: 'ORDER123',
                total: 27500
            };

            mockPaymentAPI.updateStatusPayment.mockResolvedValue({
                status: 'success',
                message: 'Payment updated',
                data: {
                    order: [mockOrder]
                }
            });

            mockOrderAPI.getOrderDetails.mockRejectedValue(
                new Error('Order API error')
            );

            const result = await CheckoutPaymentService.processCheckout(
                'test-outlet',
                'ORDER123',
                1,
                5,
                {
                    subtotal: 25000,
                    tax: 2500,
                    discount: 0,
                    finalPrice: 27500,
                    appliedVoucher: null,
                    paymentMethodFee: 0,
                    platformFee: 0,
                }
            );

            // Should return result with orderCode even if order detail fetch fails
            expect(result.orderCode).toBe('ORDER123');
            expect(result.order).toBeNull();
        });

        it('should handle different order response formats', async () => {
            const mockOrder = {
                id: 1,
                code: 'ORDER123',
                total: 27500
            };

            // Test with order as object instead of array
            mockPaymentAPI.updateStatusPayment.mockResolvedValue({
                status: 'success',
                message: 'Payment updated',
                data: {
                    order: mockOrder // Single object instead of array
                }
            });

            mockOrderAPI.getOrderDetails.mockResolvedValue({
                status: 'success',
                message: 'Order retrieved',
                data: {
                    order: mockOrder
                }
            });

            const result = await CheckoutPaymentService.processCheckout(
                'test-outlet',
                'ORDER123',
                1,
                5,
                {
                    subtotal: 25000,
                    tax: 2500,
                    discount: 0,
                    finalPrice: 27500,
                    appliedVoucher: null,
                    paymentMethodFee: 0,
                    platformFee: 0,
                }
            );

            expect(result.order).toEqual(mockOrder);
        });

        it('should handle missing table number', async () => {
            const mockOrder = {
                id: 1,
                code: 'ORDER123',
                total: 27500
            };

            mockPaymentAPI.updateStatusPayment.mockResolvedValue({
                status: 'success',
                message: 'Payment updated',
                data: {
                    order: [mockOrder]
                }
            });

            mockOrderAPI.getOrderDetails.mockResolvedValue({
                status: 'success',
                message: 'Order retrieved',
                data: {
                    order: [mockOrder]
                }
            });

            const result = await CheckoutPaymentService.processCheckout(
                'test-outlet',
                'ORDER123',
                1,
                undefined, // No table number
                {
                    subtotal: 25000,
                    tax: 2500,
                    discount: 0,
                    finalPrice: 27500,
                    appliedVoucher: null,
                    paymentMethodFee: 0,
                    platformFee: 0,
                }
            );

            // No longer calls updateStatusPayment - relies on store checkout payload
            expect(mockPaymentAPI.updateStatusPayment).not.toHaveBeenCalled();
            expect(result.order).toEqual(mockOrder);
        });
    });
});