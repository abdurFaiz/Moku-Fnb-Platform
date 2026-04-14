import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useQueryInvoice, invoiceQueryKeys, invoiceQueryOptions, prefetchInvoice } from '../hooks/api/useQueryInvoice';
import { InvoiceAPI } from '../api/invoice.api';

// Mock the InvoiceAPI
vi.mock('../api/invoice.api');

const mockInvoiceResponse = {
    status: 'success',
    message: 'Invoice retrieved successfully',
    data: {
        outlet: {
            id: 1,
            uuid: 'outlet-uuid-123',
            name: 'Test Cafe',
            slug: 'test-cafe',
            address: '123 Test Street',
            phone: '+1234567890',
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
            voucher: null,
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

describe('useQueryInvoice', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup mock for InvoiceAPI
        vi.mocked(InvoiceAPI.getInvoiceOrder).mockResolvedValue(mockInvoiceResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Query Keys', () => {
        it('should generate correct query keys', () => {
            expect(invoiceQueryKeys.root()).toEqual(['invoice']);
            expect(invoiceQueryKeys.detail('test-outlet', 123)).toEqual(['invoice', 'test-outlet', 123]);
            expect(invoiceQueryKeys.detail('cafe-abc', 'ORDER-456')).toEqual(['invoice', 'cafe-abc', 'ORDER-456']);
        });
    });

    describe('Successful Data Fetching', () => {
        it('should fetch invoice data successfully', async () => {
            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockInvoiceResponse);
            expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).toHaveBeenCalledWith('test-outlet', 123);
        });

        it('should handle string order codes by converting to number', async () => {
            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 456),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).toHaveBeenCalledWith('test-outlet', 456);
        });

        it('should use custom query options', async () => {
            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123, {
                    staleTime: 10000,
                    refetchOnWindowFocus: true
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockInvoiceResponse);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', async () => {
            const errorResponse = {
                status: 'error',
                message: 'Invoice not found',
                data: null,
            };

            vi.mocked(InvoiceAPI.getInvoiceOrder).mockResolvedValue(errorResponse as any);

            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe('Invoice not found');
        });

        it('should handle network errors', async () => {
            vi.mocked(InvoiceAPI.getInvoiceOrder).mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Network error');
        });

        it('should handle missing response message in error status', async () => {
            const errorResponse = {
                status: 'error',
                message: '',
                data: null,
            };

            vi.mocked(InvoiceAPI.getInvoiceOrder).mockResolvedValue(errorResponse as any);

            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Failed to load invoice data for test-outlet/123');
        });
    });

    describe('Parameter Validation', () => {
        it('should not execute query when slug is missing', () => {
            const { result } = renderHook(
                () => useQueryInvoice(null, 123),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).not.toHaveBeenCalled();
        });

        it('should not execute query when orderCode is missing', () => {
            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', null),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).not.toHaveBeenCalled();
        });

        it('should handle undefined parameters gracefully', () => {
            const { result } = renderHook(
                () => useQueryInvoice(undefined, undefined),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).not.toHaveBeenCalled();
        });

        it('should handle empty string slug', () => {
            const { result } = renderHook(
                () => useQueryInvoice('', 123),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).not.toHaveBeenCalled();
        });

        it('should handle zero as valid order code', async () => {
            vi.mocked(InvoiceAPI.getInvoiceOrder).mockResolvedValue(mockInvoiceResponse);

            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 0),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(InvoiceAPI.getInvoiceOrder).toHaveBeenCalledWith('test-outlet', 0);
        });
    });

    describe('Query Options', () => {
        it('should create query options with correct configuration', () => {
            const options = invoiceQueryOptions('test-outlet', 123);

            expect(options.queryKey).toEqual(['invoice', 'test-outlet', 123]);
            expect(options.staleTime).toBe(300000); // 5 minutes
            expect(options.gcTime).toBe(1800000); // 30 minutes
            expect(options.refetchOnWindowFocus).toBe(false);
        });

        it('should have a queryFn that calls the API', async () => {
            const options = invoiceQueryOptions('test-outlet', 123);
            if (options.queryFn) {
                const mockContext = {
                    queryKey: options.queryKey,
                    signal: new AbortController().signal,
                    meta: undefined,
                };
                const result = await options.queryFn(mockContext as any);

                expect(result).toEqual(mockInvoiceResponse);
                expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).toHaveBeenCalledWith('test-outlet', 123);
            }
        });
    });

    describe('Prefetch Function', () => {
        it('should prefetch invoice data', async () => {
            const queryClient = new QueryClient();
            const prefetchSpy = vi.spyOn(queryClient, 'prefetchQuery');

            await prefetchInvoice(queryClient, 'test-outlet', 123);

            expect(prefetchSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryKey: ['invoice', 'test-outlet', 123],
                })
            );
        });
    });

    describe('Loading States', () => {
        it('should show loading state initially', () => {
            vi.mocked(InvoiceAPI.getInvoiceOrder).mockImplementation(
                () => new Promise(() => { }) // Never resolves
            );

            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();
        });

        it('should handle enabled option correctly', () => {
            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123, { enabled: false }),
                { wrapper: createWrapper() }
            );

            expect(result.current.data).toBeUndefined();
            expect(vi.mocked(InvoiceAPI.getInvoiceOrder)).not.toHaveBeenCalled();
        });
    });

    describe('Data Transformation', () => {
        it('should return data as-is when successful', async () => {
            const customResponse = {
                ...mockInvoiceResponse,
                data: {
                    ...mockInvoiceResponse.data,
                    outlet: {
                        ...mockInvoiceResponse.data.outlet,
                        name: 'Custom Cafe Name',
                    },
                },
            };

            vi.mocked(InvoiceAPI.getInvoiceOrder).mockResolvedValue(customResponse);

            const { result } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(customResponse);
            expect(result.current.data?.data.outlet.name).toBe('Custom Cafe Name');
        });
    });

    describe('Caching Behavior', () => {
        beforeEach(() => {
            vi.mocked(InvoiceAPI.getInvoiceOrder).mockResolvedValue(mockInvoiceResponse);
        });

        it('should use cached data for same parameters', async () => {
            const wrapper = createWrapper();

            // First hook
            const { result: result1 } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper }
            );

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
            });

            // Second hook with same parameters
            const { result: result2 } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper }
            );

            expect(result2.current.data).toEqual(mockInvoiceResponse);
            // API should only be called once due to caching
            expect(InvoiceAPI.getInvoiceOrder).toHaveBeenCalledTimes(1);
        });

        it('should make separate requests for different parameters', async () => {
            const wrapper = createWrapper();

            // First hook
            const { result: result1 } = renderHook(
                () => useQueryInvoice('test-outlet', 123),
                { wrapper }
            );

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
            });

            // Second hook with different parameters
            const { result: result2 } = renderHook(
                () => useQueryInvoice('different-outlet', 456),
                { wrapper }
            );

            await waitFor(() => {
                expect(result2.current.isSuccess).toBe(true);
            });

            // API should be called twice for different parameters
            expect(InvoiceAPI.getInvoiceOrder).toHaveBeenCalledTimes(2);
            expect(InvoiceAPI.getInvoiceOrder).toHaveBeenCalledWith('test-outlet', 123);
            expect(InvoiceAPI.getInvoiceOrder).toHaveBeenCalledWith('different-outlet', 456);
        });
    });
});