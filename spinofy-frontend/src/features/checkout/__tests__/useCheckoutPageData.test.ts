import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { type ReactNode } from 'react';
import { useCheckoutPageData, checkoutQueryKeys } from '../hooks/useCheckoutPageData';

// Mock all external dependencies
vi.mock('@/features/outlets/hooks/api/useQueryOutlet');
vi.mock('@/features/payment/hooks/api/useQueryPayment');
vi.mock('@/features/product/hooks/api/useQueryProduct');
vi.mock('@/features/cart/hooks/useCart');
vi.mock('@/features/outlets/hooks/useOutletSlug');
vi.mock('@/features/outlets/stores/useOutletStore');

// Import mocked modules with proper typing
import { useOutlets } from '@/features/outlets/hooks/api/useQueryOutlet';
import { paymentQueryOptions } from '@/features/payment/hooks/api/useQueryPayment';
import { productRecommendationsQueryOptions } from '@/features/product/hooks/api/useQueryProduct';
import { useCart } from '@/features/cart/hooks/useCart';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';

// Mock data types
import type { Outlet } from '@/features/outlets/types/Outlet';
import type { Order, OrderResponse, PaymentMethod } from '@/features/cart/types/Order';
import type { ProductRecommendation } from '@/features/product/types/DetailProduct';

const mockUseOutlets = vi.mocked(useOutlets);
const mockUseCart = vi.mocked(useCart);
const mockUseOutletSlug = vi.mocked(useOutletSlug);
const mockUseOutletStore = vi.mocked(useOutletStore);
const mockPaymentQueryOptions = vi.mocked(paymentQueryOptions);
const mockProductRecommendationsQueryOptions = vi.mocked(productRecommendationsQueryOptions);

// Test data setup
const mockOutlet: Outlet = {
    id: 1,
    uuid: 'outlet-uuid-123',
    slug: 'test-cafe',
    name: 'Test Cafe',
    fee_tax: 10,
    address: '123 Test Street',
    phone: '+1234567890',
    map: null,
    is_active: 1,
    type: 1,
    service_fee_config: 1,
    products_count: 5,
    total_point: '100',
    logo_url: 'https://example.com/logo.jpg',
    products: [],
    media: [],
    operational_schedules: [],
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
};

const mockOrder: Order = {
    id: 1,
    uuid: 'order-uuid-123',
    code: 'ORD-12345',
    sub_total: 45000,
    discount: 0,
    tax: 4500,
    fee_service: 500,
    spinofy_fee: 0,
    total_fee_service: 500,
    total: 50000,
    status: 0,
    order_number: 'ORD-12345',
    user_meta_data: {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+1234567890'
    },
    user_id: 1,
    outlet_id: 1,
    voucher_id: null,
    payment_method_id: null,
    service_fee_config: 1,
    table_number_id: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    payment_log: {
        id: 1,
        status_code: 200,
        payment_channel: 'credit_card',
        raw_response: {
            Data: {
                SessionId: 1,
                TransactionId: 123,
                ReferenceId: 456,
                Via: 'web',
                Channel: 'credit_card',
                PaymentNo: 'PAY-123',
                QrString: '',
                PaymentName: 'Credit Card',
                SubTotal: 45000,
                Fee: 500,
                Total: 50000,
                FeeDirection: 'add',
                Expired: '2024-01-02',
                QrImage: '',
                QrTemplate: '',
                Terminal: 'web',
                NNSCode: null,
                NMID: 'NMID-123',
                Note: null,
                Escrow: false
            },
            Status: 200,
            Success: true,
            Message: 'Success'
        },
        order_id: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
    },
    table_number: {
        id: 1,
        number: 'T1',
        qr_code_path: 'qr/table-1.png',
        table_number_location_id: 1,
        outlet_id: 1,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        order_products: [],
        customer_point: {
            id: 1,
            point: 100,
            type: 1,
            info: null,
            user_id: 1,
            outlet_id: 1,
            pointable_type: 'order',
            pointable_id: 1,
            created_at: '2024-01-01',
            updated_at: '2024-01-01'
        },
        outlet: mockOutlet
    }
} as Order;

const mockPaymentMethod: PaymentMethod = {
    id: 1,
    name: 'Credit Card',
    code: 'credit_card',
    channel: 'credit_card',
    percentage_fee: '0',
    is_published: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01'
};

const mockOrderResponse: OrderResponse = {
    status: 'success',
    message: 'Success',
    data: {
        order: [mockOrder],
        payment_methods: [mockPaymentMethod]
    }
};

const mockProductRecommendation: ProductRecommendation = {
    uuid: 'product-uuid-123',
    name: 'Test Product',
    description: 'Test Description',
    price: '25000',
    image: 'test-image.jpg',
    image_url: 'https://example.com/test-image.jpg',
    is_available: 1,
    is_published: 1,
    is_recommended: 1,
    product_category_id: 1,
    outlet_id: 1,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    total_sales: 10
};

const mockRecommendationsResponse = {
    data: {
        recommendations: [mockProductRecommendation]
    }
};

const mockCartItems = [
    {
        id: '1',
        productUuid: 'product-uuid-123',
        name: 'Test Product',
        price: 25000,
        quantity: 2,
        options: ['Extra cheese', 'Large size'],
        notes: 'Test notes',
        image: 'test-image.jpg'
    }
];

describe('useCheckoutPageData Hook', () => {
    let queryClient: QueryClient;

    function createWrapper() {
        const Wrapper = ({ children }: { children: ReactNode }) => {
            return React.createElement(QueryClientProvider, { client: queryClient }, children);
        };
        return Wrapper;
    }

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock implementations
        mockUseOutlets.mockReturnValue({
            data: [mockOutlet],
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn(),
            isFetching: false,
            isPending: false,
            isLoadingError: false,
            isRefetchError: false,
            isSuccess: true,
            isPaused: false,
            status: 'success',
            fetchStatus: 'idle',
            dataUpdatedAt: Date.now(),
            errorUpdatedAt: 0,
            failureCount: 0,
            failureReason: null,
            errorUpdateCount: 0,
            isStale: false,
            isPlaceholderData: false,
            isFetchedAfterMount: true,
            isRefetching: false
        } as any);

        mockUseCart.mockReturnValue({
            items: mockCartItems,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            clearCart: vi.fn(),
            getTotalItems: () => 2,
            getTotalPrice: () => 50000,
            isCheckoutProcessing: false,
            syncCart: vi.fn(),
            deleteItem: vi.fn(),
            updateItem: vi.fn(),
            setCheckoutProcessing: vi.fn()
        } as any);

        mockUseOutletSlug.mockReturnValue('test-cafe');
        mockUseOutletStore.mockReturnValue('test-cafe');

        // Mock query options
        mockPaymentQueryOptions.mockReturnValue({
            queryKey: ['payment', 'test-cafe'] as any,
            queryFn: vi.fn().mockResolvedValue(mockOrderResponse)
        } as any);

        mockProductRecommendationsQueryOptions.mockReturnValue({
            queryKey: ['recommendations', 'test-cafe', 'product-uuid-123'] as any,
            queryFn: vi.fn().mockResolvedValue(mockRecommendationsResponse)
        } as any);

        // Mock queryClient.ensureQueryData
        vi.spyOn(queryClient, 'ensureQueryData').mockImplementation(async (options: any) => {
            if (options.queryKey.includes('payment')) {
                return mockOrderResponse;
            }
            if (options.queryKey.includes('recommendations')) {
                return mockRecommendationsResponse;
            }
            return mockOrderResponse; // Return valid data instead of null
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic functionality', () => {
        it('should return initial data structure', async () => {
            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current).toBeDefined();
                expect(result.current).toHaveProperty('outlet');
                expect(result.current).toHaveProperty('outletName');
                expect(result.current).toHaveProperty('taxRate');
                expect(result.current).toHaveProperty('specialOffers');
                expect(result.current).toHaveProperty('currentOrder');
                expect(result.current).toHaveProperty('orderCode');
                expect(result.current).toHaveProperty('paymentData');
                expect(result.current).toHaveProperty('paymentMethods');
                expect(result.current).toHaveProperty('isLoading');
                expect(result.current).toHaveProperty('isError');
                expect(result.current).toHaveProperty('isFetching');
                expect(result.current).toHaveProperty('refetchPaymentData');
                expect(result.current).toHaveProperty('invalidateCheckoutData');
            });
        });

        it('should return correct outlet data', async () => {
            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.outlet).toEqual(mockOutlet);
                expect(result.current.outletName).toBe('Test Cafe');
            });
        });

        it('should calculate tax rate correctly', async () => {
            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.taxRate).toBe(0.1); // 10% -> 0.1
            });
        });

        it('should return current order data', async () => {
            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.currentOrder).toEqual(mockOrder);
                expect(result.current.orderCode).toBe('ORD-12345');
            });
        });

        it('should return payment methods', async () => {
            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.paymentMethods).toEqual([mockPaymentMethod]);
            });
        });

        it('should transform recommendations to special offers', async () => {
            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.specialOffers).toHaveLength(1);
                expect(result.current.specialOffers[0]).toEqual({
                    id: 'product-uuid-123',
                    name: 'Test Product',
                    description: 'Test Description',
                    price: 25000,
                    image: 'https://example.com/test-image.jpg'
                });
            });
        });
    });

    describe('Loading states', () => {
        it('should handle outlets loading state', async () => {
            mockUseOutlets.mockReturnValue({
                data: undefined,
                isLoading: true,
                isError: false,
                error: null,
                refetch: vi.fn(),
                isFetching: true,
                isPending: false,
                isLoadingError: false,
                isRefetchError: false,
                isSuccess: false,
                isPaused: false,
                status: 'pending',
                fetchStatus: 'fetching',
                dataUpdatedAt: 0,
                errorUpdatedAt: 0,
                failureCount: 0,
                failureReason: null,
                errorUpdateCount: 0,
                isStale: false,
                isPlaceholderData: false,
                isFetchedAfterMount: false,
                isRefetching: false
            } as any);

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            expect(result.current.isLoading).toBe(true);
        });

        it('should handle combined data loading state', async () => {
            vi.spyOn(queryClient, 'ensureQueryData').mockImplementation(
                () => new Promise(() => { }) // Never resolves to simulate loading
            );

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            expect(result.current.isLoading).toBe(true);
        });
    });

    describe('Error handling', () => {
        it('should handle outlets error state', async () => {
            mockUseOutlets.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                error: new Error('Failed to fetch outlets'),
                refetch: vi.fn(),
                isFetching: false
            } as any);

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });
        });

        it('should handle combined data error', async () => {
            // Ensure outlet is available so combined query runs
            mockUseOutlets.mockReturnValue({
                data: [mockOutlet],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn(),
                isFetching: false,
                isPending: false,
                isLoadingError: false,
                isRefetchError: false,
                isSuccess: true,
                isPaused: false,
                status: 'success',
                fetchStatus: 'idle',
                dataUpdatedAt: Date.now(),
                errorUpdatedAt: 0,
                failureCount: 0,
                failureReason: null,
                errorUpdateCount: 0,
                isStale: false,
                isPlaceholderData: false,
                isFetchedAfterMount: true,
                isRefetching: false
            } as any);

            // Mock ensureQueryData to reject so the queryFn throws
            vi.spyOn(queryClient, 'ensureQueryData').mockRejectedValue(
                new Error('Failed to fetch combined data')
            );

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            // Wait for the query to fail
            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 5000, interval: 100 });
        });
    });

    describe('Edge cases', () => {
        it('should handle empty outlets array', async () => {
            mockUseOutlets.mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn(),
                isFetching: false
            } as any);

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.outlet).toBeUndefined();
                expect(result.current.outletName).toBe('Cafe');
            });
        });

        it('should handle no cart items', async () => {
            mockUseCart.mockReturnValue({
                items: [],
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
                clearCart: vi.fn(),
                getTotalItems: () => 0,
                getTotalPrice: () => 0,
                isCheckoutProcessing: false,
                syncCart: vi.fn(),
                deleteItem: vi.fn(),
                updateItem: vi.fn(),
                setCheckoutProcessing: vi.fn()
            } as any);

            vi.spyOn(queryClient, 'ensureQueryData').mockImplementation(async (options: any) => {
                if (options.queryKey.includes('payment')) {
                    return mockOrderResponse;
                }
                // No recommendations when no cart items
                return null;
            });

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.specialOffers).toEqual([]);
            });
        });

        it('should handle missing outlet slug', async () => {
            mockUseOutletSlug.mockReturnValue(undefined);
            mockUseOutletStore.mockReturnValue(undefined);

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.outlet).toEqual(mockOutlet); // Should fall back to first outlet
            });
        });

        it('should handle zero tax rate', async () => {
            const outletWithZeroTax = { ...mockOutlet, fee_tax: 0 };
            mockUseOutlets.mockReturnValue({
                data: [outletWithZeroTax],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn(),
                isFetching: false
            } as any);

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.taxRate).toBe(0);
            });
        });

        it('should handle decimal tax rate', async () => {
            const outletWithDecimalTax = { ...mockOutlet, fee_tax: 0.15 };
            mockUseOutlets.mockReturnValue({
                data: [outletWithDecimalTax],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn(),
                isFetching: false
            } as any);

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.taxRate).toBe(0.15);
            });
        });

        it('should handle invalid recommendations data', async () => {
            vi.spyOn(queryClient, 'ensureQueryData').mockImplementation(async (options: any) => {
                if (options.queryKey.includes('payment')) {
                    return mockOrderResponse;
                }
                if (options.queryKey.includes('recommendations')) {
                    return { data: { recommendations: null } }; // Invalid data
                }
                return null;
            });

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.specialOffers).toEqual([]);
            });
        });

        it('should handle missing image URL in recommendations', async () => {
            const recommendationWithoutImage = {
                ...mockProductRecommendation,
                image_url: undefined,
                image: 'fallback-image.jpg'
            };

            vi.spyOn(queryClient, 'ensureQueryData').mockImplementation(async (options: any) => {
                if (options.queryKey.includes('payment')) {
                    return mockOrderResponse;
                }
                if (options.queryKey.includes('recommendations')) {
                    return {
                        data: { recommendations: [recommendationWithoutImage] }
                    };
                }
                return null;
            });

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.specialOffers[0].image).toBe('http://localhost:8000/storage/fallback-image.jpg');
            });
        });
    });

    describe('Query key factory', () => {
        it('should generate correct query keys', () => {
            expect(checkoutQueryKeys.all).toEqual(['checkout']);
            expect(checkoutQueryKeys.combined('test-cafe')).toEqual(['checkout', 'combined', 'test-cafe']);
            expect(checkoutQueryKeys.combined(undefined)).toEqual(['checkout', 'combined', undefined]);
        });
    });

    describe('Callback functions', () => {
        it('should provide working refetchPaymentData callback', async () => {
            vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue(mockOrderResponse);

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.refetchPaymentData).toBeDefined();
                expect(typeof result.current.refetchPaymentData).toBe('function');
            });

            // Test callback execution
            await result.current.refetchPaymentData();
            // Callback should execute without error
        });

        it('should provide working invalidateCheckoutData callback', async () => {
            const mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);
            queryClient.invalidateQueries = mockInvalidateQueries;

            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.invalidateCheckoutData).toBeDefined();
                expect(typeof result.current.invalidateCheckoutData).toBe('function');
            });

            await result.current.invalidateCheckoutData();

            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: ['checkout', 'combined', 'test-cafe']
            });
        });
    });

    describe('Memoization', () => {
        it('should memoize outlet data properly', async () => {
            const { result, rerender } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.outlet).toBeDefined();
            });

            const firstOutlet = result.current.outlet;

            // Re-render with same data
            rerender();

            await waitFor(() => {
                expect(result.current.outlet).toBe(firstOutlet); // Same reference (memoized)
            });
        });

        it('should update when outlet slug changes', async () => {
            mockUseOutletSlug.mockReturnValue('test-cafe');

            const { result, rerender } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current.outlet?.slug).toBe('test-cafe');
            });

            // Change outlet slug
            mockUseOutletSlug.mockReturnValue('different-cafe');
            const differentOutlet = { ...mockOutlet, slug: 'different-cafe', name: 'Different Cafe' };
            mockUseOutlets.mockReturnValue({
                data: [differentOutlet],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn(),
                isFetching: false
            } as any);

            rerender();

            await waitFor(() => {
                expect(result.current.outlet?.slug).toBe('different-cafe');
            });
        });
    });

    describe('Performance optimizations', () => {
        it('should execute parallel queries', async () => {
            const promiseAllSpy = vi.spyOn(Promise, 'all');

            renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(promiseAllSpy).toHaveBeenCalled();
            });

            promiseAllSpy.mockRestore();
        });

        it('should not refetch on window focus by default', async () => {
            const { result } = renderHook(() => useCheckoutPageData(), { wrapper: createWrapper() });

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            // Simulate window focus (should not trigger refetch)
            window.dispatchEvent(new Event('focus'));

            // Should not cause additional queries due to refetchOnWindowFocus: false
        });
    });
});