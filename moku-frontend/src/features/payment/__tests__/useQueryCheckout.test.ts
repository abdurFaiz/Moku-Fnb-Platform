import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useQueryCheckout, checkoutQueryKeys, checkoutQueryOptions, prefetchCheckout } from '../hooks/api/useQueryCheckout';
import { CheckoutAPI } from '../api/checkout.api';

// Mock the CheckoutAPI
vi.mock('../api/checkout.api');

const mockCheckoutResponse = {
    status: 'success',
    message: 'Checkout data retrieved successfully',
    data: {
        order: {
            id: 1,
            uuid: 'order-uuid-123',
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
            payment_method_id: 1,
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z',
            table_number_id: 1,
            payment_log: {
                id: 1,
                order_id: 1,
                raw_response: {
                    Data: {
                        QrString: 'mock-qr-string',
                        QrImage: 'https://example.com/qr.png',
                        Total: 52500,
                        Expired: '2024-01-01T11:00:00Z',
                    },
                },
            },
            order_products: [],
        },
    },
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => {
        return createElement(QueryClientProvider, { client: queryClient }, children);
    };

    return Wrapper;
};

describe('useQueryCheckout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(CheckoutAPI.getDataCheckoutOrders).mockResolvedValue(mockCheckoutResponse as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Query Keys', () => {
        it('should generate correct query keys', () => {
            expect(checkoutQueryKeys.root()).toEqual(['checkout']);
            expect(checkoutQueryKeys.detail('test-outlet', 123)).toEqual(['checkout', 'test-outlet', 123]);
            expect(checkoutQueryKeys.detail('cafe-abc', '456')).toEqual(['checkout', 'cafe-abc', '456']);
        });
    });

    describe('Successful Data Fetching', () => {
        it('should fetch checkout data successfully', async () => {
            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockCheckoutResponse);
            expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).toHaveBeenCalledWith('test-outlet', 123);
        });

        it('should handle numeric order codes', async () => {
            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 456),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).toHaveBeenCalledWith('test-outlet', 456);
        });

        it('should use custom query options', async () => {
            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 123, {
                    staleTime: 10000,
                    refetchOnWindowFocus: true
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockCheckoutResponse);
        });
    });

    describe('Error Handling', () => {
        it('should handle API error responses', async () => {
            const errorResponse = new Error('Order not found');

            vi.mocked(CheckoutAPI.getDataCheckoutOrders).mockRejectedValue(errorResponse);

            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 3000 });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe('Order not found');
        });

        it('should handle network errors', async () => {
            vi.mocked(CheckoutAPI.getDataCheckoutOrders).mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 3000 });

            expect(result.current.error?.message).toBe('Network error');
        });

        it('should handle missing error message', async () => {
            const errorResponse = {
                status: 'error',
                message: '',
                data: null,
            };

            vi.mocked(CheckoutAPI.getDataCheckoutOrders).mockResolvedValue(errorResponse as any);

            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 3000 });

            expect(result.current.error?.message).toBe('Failed to load checkout data for test-outlet/123');
        });
    });

    describe('Parameter Validation', () => {
        it('should not execute query when slug is missing', () => {
            const { result } = renderHook(
                () => useQueryCheckout(null, 123),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).not.toHaveBeenCalled();
        });

        it('should not execute query when orderCode is missing', () => {
            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', null),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).not.toHaveBeenCalled();
        });

        it('should handle undefined parameters gracefully', () => {
            const { result } = renderHook(
                () => useQueryCheckout(undefined, undefined),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).not.toHaveBeenCalled();
        });

        it('should handle empty string slug', () => {
            const { result } = renderHook(
                () => useQueryCheckout('', 123),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).not.toHaveBeenCalled();
        });

        it('should handle zero as valid order code', async () => {
            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 0),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(CheckoutAPI.getDataCheckoutOrders).toHaveBeenCalledWith('test-outlet', 0);
        });
    });

    describe('Query Options', () => {
        it('should create query options with correct configuration', () => {
            const options = checkoutQueryOptions('test-outlet', 123);

            expect(options.queryKey).toEqual(['checkout', 'test-outlet', 123]);
            expect(options.staleTime).toBe(60000); // 1 minute
            expect(options.gcTime).toBe(600000); // 10 minutes
            expect(options.refetchOnWindowFocus).toBe(false);
            expect(options.retry).toBe(1);
        });

        it('should have a queryFn that calls the API', async () => {
            const options = checkoutQueryOptions('test-outlet', 123);
            if (options.queryFn) {
                const mockContext = {
                    queryKey: options.queryKey,
                    signal: new AbortController().signal,
                    meta: undefined,
                };
                const result = await options.queryFn(mockContext as any);

                expect(result).toEqual(mockCheckoutResponse);
                expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).toHaveBeenCalledWith('test-outlet', 123);
            }
        });
    });

    describe('Prefetch Function', () => {
        it('should prefetch checkout data', async () => {
            const queryClient = new QueryClient();
            const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery');

            await prefetchCheckout(queryClient, 'test-outlet', 123);

            expect(prefetchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['checkout', 'test-outlet', 123],
                })
            );
        });
    });

    describe('Loading States', () => {
        it('should show loading state initially', () => {
            vi.mocked(CheckoutAPI.getDataCheckoutOrders).mockImplementation(
                () => new Promise(() => { })
            );

            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();
        });

        it('should handle enabled option correctly', () => {
            const { result } = renderHook(
                () => useQueryCheckout('test-outlet', 123, { enabled: false }),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(CheckoutAPI.getDataCheckoutOrders)).not.toHaveBeenCalled();
        });
    });

    describe('Caching Behavior', () => {
        it('should use cached data for same parameters', async () => {
            const wrapper = createWrapper();

            const { result: result1 } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper }
            );

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
            });

            const { result: result2 } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper }
            );

            expect(result2.current.data).toEqual(mockCheckoutResponse);
            expect(CheckoutAPI.getDataCheckoutOrders).toHaveBeenCalledTimes(1);
        });

        it('should make separate requests for different parameters', async () => {
            const wrapper = createWrapper();

            const { result: result1 } = renderHook(
                () => useQueryCheckout('test-outlet', 123),
                { wrapper }
            );

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
            });

            const { result: result2 } = renderHook(
                () => useQueryCheckout('different-outlet', 456),
                { wrapper }
            );

            await waitFor(() => {
                expect(result2.current.isSuccess).toBe(true);
            });

            expect(CheckoutAPI.getDataCheckoutOrders).toHaveBeenCalledTimes(2);
            expect(CheckoutAPI.getDataCheckoutOrders).toHaveBeenCalledWith('test-outlet', 123);
            expect(CheckoutAPI.getDataCheckoutOrders).toHaveBeenCalledWith('different-outlet', 456);
        });
    });
});
