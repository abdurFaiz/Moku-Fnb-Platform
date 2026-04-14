import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InvoiceAPI } from '../api/invoice.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/lib/axios');
vi.mock('sonner');

const mockAxiosInstance = vi.mocked(axiosInstance);
const mockToast = vi.mocked(toast);

describe('InvoiceAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getInvoiceOrder', () => {
        const mockSuccessResponse = {
            data: {
                status: 'success',
                message: 'Invoice retrieved successfully',
                data: {
                    outlet: {
                        id: 1,
                        name: 'Test Cafe',
                        address: '123 Test Street',
                        phone: '+1234567890',
                    },
                    order: {
                        id: 1,
                        code: '123',
                        sub_total: 50000,
                        total: 52500,
                        user_meta_data: {
                            name: 'John Doe',
                        },
                        order_products: [
                            {
                                id: 1,
                                quantity: 2,
                                price: 25000,
                                product: {
                                    name: 'Nasi Goreng',
                                },
                                order_product_variants: [
                                    {
                                        id: 1,
                                        product_attribute_value: {
                                            name: 'Large',
                                            extra_price: 5000,
                                            product_attribute: {
                                                name: 'Size',
                                            },
                                        },
                                    },
                                ],
                                order_product_additions: [
                                    {
                                        id: 1,
                                        price: 2000,
                                        addition: {
                                            name: 'Extra Cheese',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            },
        };

        it('should fetch invoice data successfully', async () => {
            (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

            const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/invoice/123?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition'
            );
            expect(result).toEqual(mockSuccessResponse.data);
            expect(mockToast.info).not.toHaveBeenCalled();
        });

        it('should include correct query parameters for relationships', async () => {
            (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

            await InvoiceAPI.getInvoiceOrder('cafe-abc', 456);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                '/outlet/cafe-abc/invoice/456?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition'
            );
        });

        it('should handle different outlet slugs and order codes', async () => {
            (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

            // Test with different parameters
            await InvoiceAPI.getInvoiceOrder('restaurant-xyz', 789);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                '/outlet/restaurant-xyz/invoice/789?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition'
            );
        });

        it('should handle zero order code', async () => {
            (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

            await InvoiceAPI.getInvoiceOrder('test-outlet', 0);

            expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/invoice/0?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition'
            );
        });

        describe('Error Response Handling', () => {
            it('should show toast when response status is error', async () => {
                const errorResponse = {
                    data: {
                        status: 'error',
                        message: 'Invoice not found',
                        data: null,
                    },
                };

                (mockAxiosInstance.get as any).mockResolvedValue(errorResponse);

                const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(mockToast.info).toHaveBeenCalledWith('Invoice not found');
                expect(result).toEqual(errorResponse.data);
            });

            it('should show default error message when no message provided', async () => {
                const errorResponse = {
                    data: {
                        status: 'error',
                        message: '',
                        data: null,
                    },
                };

                (mockAxiosInstance.get as any).mockResolvedValue(errorResponse);

                const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(mockToast.info).toHaveBeenCalledWith(
                    'Failed to get invoice information, refresh the page'
                );
                expect(result).toEqual(errorResponse.data);
            });

            it('should show default error message when message is null', async () => {
                const errorResponse = {
                    data: {
                        status: 'error',
                        message: null,
                        data: null,
                    },
                };

                (mockAxiosInstance.get as any).mockResolvedValue(errorResponse);

                const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(mockToast.info).toHaveBeenCalledWith(
                    'Failed to get invoice information, refresh the page'
                );
                expect(result).toEqual(errorResponse.data);
            });

            it('should show default error message when message is undefined', async () => {
                const errorResponse = {
                    data: {
                        status: 'error',
                        data: null,
                    },
                };

                (mockAxiosInstance.get as any).mockResolvedValue(errorResponse);

                const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(mockToast.info).toHaveBeenCalledWith(
                    'Failed to get invoice information, refresh the page'
                );
                expect(result).toEqual(errorResponse.data);
            });
        });

        describe('Network Error Handling', () => {
            it('should throw error when network request fails', async () => {
                const networkError = new Error('Network Error');
                mockAxiosInstance.get.mockRejectedValue(networkError);

                await expect(
                    InvoiceAPI.getInvoiceOrder('test-outlet', 123)
                ).rejects.toThrow('Failed to fetch invoice information for: test-outlet with Error: Network Error');
            });

            it('should throw error when axios throws', async () => {
                const axiosError = {
                    response: {
                        status: 404,
                        data: { message: 'Not Found' },
                    },
                };
                mockAxiosInstance.get.mockRejectedValue(axiosError);

                await expect(
                    InvoiceAPI.getInvoiceOrder('test-outlet', 123)
                ).rejects.toThrow('Failed to fetch invoice information for: test-outlet with [object Object]');
            });

            it('should include outlet slug in error message', async () => {
                const error = new Error('Timeout');
                mockAxiosInstance.get.mockRejectedValue(error);

                await expect(
                    InvoiceAPI.getInvoiceOrder('special-cafe', 456)
                ).rejects.toThrow('Failed to fetch invoice information for: special-cafe with Error: Timeout');
            });
        });

        describe('Response Data Validation', () => {
            it('should return response data even when status is success', async () => {
                const successResponse = {
                    data: {
                        status: 'success',
                        message: 'Invoice retrieved successfully',
                        data: {
                            outlet: { id: 1, name: 'Test' },
                            order: { id: 1, code: '123' },
                        },
                    },
                };

                (mockAxiosInstance.get as any).mockResolvedValue(successResponse);

                const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(result).toEqual(successResponse.data);
                expect(mockToast.info).not.toHaveBeenCalled();
            });

            it('should handle response with missing data field', async () => {
                const responseWithoutData = {
                    data: {
                        status: 'success',
                        message: 'Invoice retrieved successfully',
                    },
                };

                (mockAxiosInstance.get as any).mockResolvedValue(responseWithoutData);

                const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(result).toEqual(responseWithoutData.data);
                expect(mockToast.info).not.toHaveBeenCalled();
            });

            it('should handle response with null data', async () => {
                const responseWithNullData = {
                    data: {
                        status: 'success',
                        message: 'Invoice retrieved successfully',
                        data: null,
                    },
                };

                (mockAxiosInstance.get as any).mockResolvedValue(responseWithNullData);

                const result = await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(result).toEqual(responseWithNullData.data);
                expect(mockToast.info).not.toHaveBeenCalled();
            });
        });

        describe('URL Construction', () => {
            it('should construct URL correctly with special characters in outlet slug', async () => {
                (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

                await InvoiceAPI.getInvoiceOrder('café-münü', 123);

                expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/café-münü/invoice/123?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition'
                );
            });

            it('should handle large order codes', async () => {
                (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

                await InvoiceAPI.getInvoiceOrder('test-outlet', 999999999);

                expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/test-outlet/invoice/999999999?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition'
                );
            });

            it('should handle negative order codes', async () => {
                (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

                await InvoiceAPI.getInvoiceOrder('test-outlet', -1);

                expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/test-outlet/invoice/-1?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition'
                );
            });
        });

        describe('Include Parameters', () => {
            it('should always include the correct relationships', async () => {
                (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

                await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                const expectedInclude = 'order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition';
                expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                    expect.stringContaining(`include=${expectedInclude}`)
                );
            });

            it('should include product attribute relationships for variants', async () => {
                (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

                await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                    expect.stringContaining('order_product_variants.product_attribute_value.product_attribute')
                );
            });

            it('should include addition relationships', async () => {
                (mockAxiosInstance.get as any).mockResolvedValue(mockSuccessResponse);

                await InvoiceAPI.getInvoiceOrder('test-outlet', 123);

                expect(mockAxiosInstance.get).toHaveBeenCalledWith(
                    expect.stringContaining('order_product_additions.addition')
                );
            });
        });
    });
});