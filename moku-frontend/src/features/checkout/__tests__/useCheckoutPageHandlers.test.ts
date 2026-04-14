import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCheckoutPageHandlers, type CheckoutPageHandlers } from '../hooks/useCheckoutPageHandlers';

// Mock all external dependencies
vi.mock('react-router-dom');
vi.mock('sonner');
vi.mock('@/features/checkout/hooks/useCheckoutPayment');
vi.mock('@/features/storefront/stores/useBarcodeStore');

// Import mocked modules
import { useCheckoutPayment } from '@/features/checkout/hooks/useCheckoutPayment';
import { useBarcodeStore } from '@/features/storefront/stores/useBarcodeStore';

// Mock types
import type { Order } from '@/features/cart/types/Order';
import type { Voucher } from '@/features/vouchers/hooks/useVoucherCalculation';

const mockNavigate = vi.mocked(useNavigate);
const mockToast = vi.mocked(toast);
const mockUseCheckoutPayment = vi.mocked(useCheckoutPayment);
const mockUseBarcodeStore = vi.mocked(useBarcodeStore);

// Test data setup
const mockOrder: Order = {
    id: 1,
    uuid: 'order-uuid-123',
    code: 'ORD-12345',
    sub_total: 50000,
    discount: 0,
    tax: 5000,
    fee_service: 0,
    spinofy_fee: 1000,
    total_fee_service: 1000,
    total: 56000,
    status: 1,
    order_number: 'ORD-12345',
    user_meta_data: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890'
    },
    user_id: 1,
    outlet_id: 1,
    voucher_id: null,
    payment_method_id: 1,
    service_fee_config: 1,
    table_number_id: 5,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    payment_log: {} as any,
    table_number: {} as any,
    order_products: [
        {
            id: 1,
            order_id: 1,
            product_id: 1,
            product_name: 'Test Product',
            quantity: 2,
            price: 25000,
            total: 50000
        } as any
    ]
};

const mockVoucher: Voucher = {
    id: 'voucher-uuid-123',
    code: 'DISCOUNT10',
    name: 'Discount 10%',
    type: 'percentage',
    value: 10,
    isActive: true
};

const mockUnpaidOrder: Order = {
    ...mockOrder,
    id: 2,
    uuid: 'unpaid-order-uuid',
    code: 'ORD-67890',
    status: 0 // unpaid status
};

describe('useCheckoutPageHandlers Hook', () => {
    const mockNavigateFn = vi.fn();
    const mockCheckoutPayment = vi.fn();
    const mockOnNavigateToHome = vi.fn();
    const mockOnUnpaidOrderAttempt = vi.fn();

    const defaultProps = {
        orderCode: 'ORD-12345',
        currentOrder: mockOrder,
        outletSlug: 'test-cafe',
        isCheckoutPaymentLoading: false,
        onNavigateToHome: mockOnNavigateToHome,
        subtotal: 50000,
        tax: 5000,
        discount: 0,
        finalPrice: 55000,
        appliedVoucher: null,
        paymentMethodFee: 0,
        platformFee: 1000,
        paymentMethodId: 1,
        unpaidOrder: undefined,
        onUnpaidOrderAttempt: mockOnUnpaidOrderAttempt,
        isOrdersLoading: false
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        mockNavigate.mockReturnValue(mockNavigateFn);

        mockUseCheckoutPayment.mockReturnValue({
            checkoutPayment: mockCheckoutPayment,
            isLoading: false,
            isSuccess: false,
            error: null
        });

        mockUseBarcodeStore.mockReturnValue({
            tableNumber: '5',
            setTableNumber: vi.fn(),
            clearTableNumber: vi.fn(),
            isValidTableNumber: true
        });

        // Mock toast methods
        mockToast.info = vi.fn();
        mockToast.error = vi.fn();
        mockToast.success = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic functionality', () => {
        it('should return all required handlers', () => {
            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            expect(result.current).toHaveProperty('handleCheckoutSubmit');
            expect(result.current).toHaveProperty('handleAddMoreItems');
            expect(result.current).toHaveProperty('handleNavigateToVouchers');
            expect(result.current).toHaveProperty('isLoading');
            expect(typeof result.current.handleCheckoutSubmit).toBe('function');
            expect(typeof result.current.handleAddMoreItems).toBe('function');
            expect(typeof result.current.handleNavigateToVouchers).toBe('function');
            expect(typeof result.current.isLoading).toBe('boolean');
        });

        it('should return correct loading state', () => {
            mockUseCheckoutPayment.mockReturnValue({
                checkoutPayment: mockCheckoutPayment,
                isLoading: true,
                isSuccess: false,
                error: null
            });

            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            expect(result.current.isLoading).toBe(true);
        });
    });

    describe('handleCheckoutSubmit function', () => {
        it('should submit checkout successfully', () => {
            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith({
                orderCode: 'ORD-12345',
                paymentMethodId: 1,
                tableNumberId: 5,
                subtotal: 50000,
                tax: 5000,
                discount: 0,
                finalPrice: 55000,
                appliedVoucher: null,
                paymentMethodFee: 0,
                platformFee: 1000
            });
        });

        it('should handle checkout with voucher applied', () => {
            const propsWithVoucher = {
                ...defaultProps,
                appliedVoucher: mockVoucher,
                discount: 5000,
                finalPrice: 50000
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(propsWithVoucher));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith({
                orderCode: 'ORD-12345',
                paymentMethodId: 1,
                tableNumberId: 5,
                subtotal: 50000,
                tax: 5000,
                discount: 5000,
                finalPrice: 50000,
                appliedVoucher: mockVoucher,
                paymentMethodFee: 0,
                platformFee: 1000
            });
        });

        it('should handle checkout without table number', () => {
            mockUseBarcodeStore.mockReturnValue({
                tableNumber: null,
                setTableNumber: vi.fn(),
                clearTableNumber: vi.fn(),
                isValidTableNumber: false
            });

            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    tableNumberId: null
                })
            );
        });

        it('should prevent submit when checkout payment is loading', () => {
            const loadingProps = {
                ...defaultProps,
                isCheckoutPaymentLoading: true
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(loadingProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).not.toHaveBeenCalled();
        });

        it('should prevent submit when hook is loading', () => {
            mockUseCheckoutPayment.mockReturnValue({
                checkoutPayment: mockCheckoutPayment,
                isLoading: true,
                isSuccess: false,
                error: null
            });

            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).not.toHaveBeenCalled();
        });

        it('should prevent submit when orders are loading', () => {
            const loadingOrdersProps = {
                ...defaultProps,
                isOrdersLoading: true
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(loadingOrdersProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockToast.info).toHaveBeenCalledWith('Mohon tunggu, sedang memeriksa status pesanan...');
            expect(mockCheckoutPayment).not.toHaveBeenCalled();
        });

        it('should handle unpaid order validation', () => {
            const unpaidOrderProps = {
                ...defaultProps,
                unpaidOrder: mockUnpaidOrder
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(unpaidOrderProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockToast.error).toHaveBeenCalledWith(
                'Anda memiliki pesanan yang belum dibayar. Silakan selesaikan pembayaran terlebih dahulu.'
            );
            expect(mockOnUnpaidOrderAttempt).toHaveBeenCalledWith(mockUnpaidOrder);
            expect(mockCheckoutPayment).not.toHaveBeenCalled();
        });

        it('should handle missing order code', () => {
            const noOrderCodeProps = {
                ...defaultProps,
                orderCode: undefined
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(noOrderCodeProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockToast.info).toHaveBeenCalledWith(
                'Order tidak ditemukan. Silakan tambahkan produk ke cart terlebih dahulu.'
            );
            expect(mockCheckoutPayment).not.toHaveBeenCalled();
        });

        it('should handle empty order products', () => {
            const emptyOrderProps = {
                ...defaultProps,
                currentOrder: {
                    ...mockOrder,
                    order_products: []
                }
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(emptyOrderProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockToast.info).toHaveBeenCalledWith(
                'Tidak ada produk dalam pesanan. Silakan tambahkan produk ke cart terlebih dahulu.'
            );
            expect(mockCheckoutPayment).not.toHaveBeenCalled();
        });

        it('should handle missing order products array', () => {
            const noProductsProps = {
                ...defaultProps,
                currentOrder: {
                    ...mockOrder,
                    order_products: undefined
                } as any
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(noProductsProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockToast.info).toHaveBeenCalledWith(
                'Tidak ada produk dalam pesanan. Silakan tambahkan produk ke cart terlebih dahulu.'
            );
            expect(mockCheckoutPayment).not.toHaveBeenCalled();
        });

        it('should handle checkout payment error', () => {
            mockCheckoutPayment.mockImplementation(() => {
                throw new Error('Payment error');
            });

            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockToast.error).toHaveBeenCalledWith('Gagal memproses checkout');
        });

        it('should use default payment method when not provided', () => {
            const noPaymentMethodProps = {
                ...defaultProps,
                paymentMethodId: undefined
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(noPaymentMethodProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    paymentMethodId: 1 // Default to QRIS
                })
            );
        });
    });

    describe('handleAddMoreItems function', () => {
        it('should navigate to home when adding more items', () => {
            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleAddMoreItems();
            });

            expect(mockOnNavigateToHome).toHaveBeenCalled();
        });
    });

    describe('handleNavigateToVouchers function', () => {
        it('should navigate to vouchers page', () => {
            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleNavigateToVouchers();
            });

            expect(mockNavigateFn).toHaveBeenCalledWith('/test-cafe/voucher-checkout');
        });

        it('should navigate to onboard when outlet slug is missing', () => {
            const noOutletProps = {
                ...defaultProps,
                outletSlug: undefined
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(noOutletProps));

            act(() => {
                result.current.handleNavigateToVouchers();
            });

            expect(mockNavigateFn).toHaveBeenCalledWith('/onboard');
        });
    });

    describe('Edge cases', () => {
        it('should handle all optional props with default values', () => {
            const minimalProps = {
                orderCode: 'ORD-12345',
                currentOrder: mockOrder,
                outletSlug: 'test-cafe',
                isCheckoutPaymentLoading: false,
                onNavigateToHome: mockOnNavigateToHome
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(minimalProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith({
                orderCode: 'ORD-12345',
                paymentMethodId: 1,
                tableNumberId: 5,
                subtotal: 0,
                tax: 0,
                discount: 0,
                finalPrice: 0,
                appliedVoucher: null,
                paymentMethodFee: 0,
                platformFee: 0
            });
        });

        it('should handle string orderCode conversion', () => {
            const numericOrderCodeProps = {
                ...defaultProps,
                orderCode: 12345 as any // Simulate numeric order code
            };

            const { result } = renderHook(() => useCheckoutPageHandlers(numericOrderCodeProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderCode: '12345'
                })
            );
        });

        it('should handle non-numeric table number', () => {
            mockUseBarcodeStore.mockReturnValue({
                tableNumber: 'invalid',
                setTableNumber: vi.fn(),
                clearTableNumber: vi.fn(),
                isValidTableNumber: false
            });

            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    tableNumberId: NaN
                })
            );
        });

        it('should handle empty string table number', () => {
            mockUseBarcodeStore.mockReturnValue({
                tableNumber: '',
                setTableNumber: vi.fn(),
                clearTableNumber: vi.fn(),
                isValidTableNumber: false
            });

            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            act(() => {
                result.current.handleCheckoutSubmit();
            });

            expect(mockCheckoutPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    tableNumberId: null
                })
            );
        });
    });

    describe('Type safety', () => {
        it('should provide correct TypeScript types', () => {
            const { result } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            // Test that the hook returns the correct interface
            const handlers: CheckoutPageHandlers = result.current;
            expect(handlers).toBeDefined();
            expect(typeof handlers.handleCheckoutSubmit).toBe('function');
            expect(typeof handlers.handleAddMoreItems).toBe('function');
            expect(typeof handlers.handleNavigateToVouchers).toBe('function');
            expect(typeof handlers.isLoading).toBe('boolean');
        });
    });

    describe('Memoization', () => {
        it('should memoize handlers correctly', () => {
            const { result, rerender } = renderHook(() => useCheckoutPageHandlers(defaultProps));

            const firstHandlers = result.current;

            // Re-render with same props
            rerender();

            const secondHandlers = result.current;

            // Functions should be the same reference (memoized)
            expect(firstHandlers.handleAddMoreItems).toBe(secondHandlers.handleAddMoreItems);
            expect(firstHandlers.handleNavigateToVouchers).toBe(secondHandlers.handleNavigateToVouchers);
        });

        it('should update handlers when dependencies change', () => {
            const { result, rerender } = renderHook(
                (props) => useCheckoutPageHandlers(props),
                { initialProps: defaultProps }
            );

            const firstSubmitHandler = result.current.handleCheckoutSubmit;

            // Re-render with different order code
            const newProps = { ...defaultProps, orderCode: 'ORD-67890' };
            rerender(newProps);

            const secondSubmitHandler = result.current.handleCheckoutSubmit;

            // Submit handler should be different due to dependency change
            expect(firstSubmitHandler).not.toBe(secondSubmitHandler);
        });
    });
});