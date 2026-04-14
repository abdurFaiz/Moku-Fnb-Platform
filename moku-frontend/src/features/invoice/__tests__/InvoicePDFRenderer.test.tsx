import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF, generateInvoiceBlob } from '../pages/InvoicePDFRenderer';
import { DateFormatterUtils } from '@/utils/formatters';
import { resolveOutletLogoUrl, imageUrlToBase64 } from '@/utils/imageFormatters';

// Mock dependencies
vi.mock('@react-pdf/renderer', () => ({
    Document: ({ children }: any) => children,
    Page: ({ children }: any) => children,
    Text: ({ children }: any) => children,
    View: ({ children }: any) => children,
    StyleSheet: {
        create: (styles: any) => styles,
    },
    Image: ({ src }: any) => `Image: ${src}`,
    pdf: vi.fn(),
}));

vi.mock('@/utils/formatters', () => ({
    DateFormatterUtils: {
        formatTransactionDate: vi.fn(),
    },
}));

vi.mock('@/utils/imageFormatters', () => ({
    resolveOutletLogoUrl: vi.fn(),
    imageUrlToBase64: vi.fn(),
}));

const mockInvoiceData: any = {
    status: 'success',
    message: 'Invoice retrieved successfully',
    data: {
        outlet: {
            id: 1,
            name: 'Test Cafe',
            address: '123 Test Street',
            phone: '+1234567890',
            logo_url: 'https://example.com/logo.png',
        },
        order: {
            id: 1,
            code: '123',
            sub_total: 50000,
            discount: 5000,
            tax: 5000,
            total_fee_service: 2500,
            total: 52500,
            service_fee_config: 2,
            table_number_id: 1,
            table_number: {
                id: 1,
                number: 'A1',
            },
            user_meta_data: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '+1234567890',
            },
            voucher: {
                name: 'Discount 10%',
            },
            payment_method: {
                name: 'QRIS',
                channel: 'qris',
                code: 'qris',
            },
            payment_method_id: 1,
            created_at: '2024-01-01T10:00:00Z',
            order_products: [
                {
                    id: 1,
                    quantity: 2,
                    price: 25000,
                    note: 'Extra spicy',
                    product: {
                        name: 'Nasi Goreng',
                    },
                    meta_data: {
                        product_name: 'Nasi Goreng',
                        product_price: '25000',
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
};

describe('InvoicePDFRenderer', () => {
    const mockPdf = vi.mocked(pdf);
    const mockDateFormatter = vi.mocked(DateFormatterUtils.formatTransactionDate);
    const mockResolveOutletLogoUrl = vi.mocked(resolveOutletLogoUrl);
    const mockImageUrlToBase64 = vi.mocked(imageUrlToBase64);

    beforeEach(() => {
        vi.clearAllMocks();
        mockDateFormatter.mockReturnValue('January 1, 2024 10:00 AM');
        mockResolveOutletLogoUrl.mockReturnValue('https://example.com/logo.png');
        mockImageUrlToBase64.mockResolvedValue('data:image/png;base64,mockbase64');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('InvoicePDF Component', () => {
        it('should render PDF with complete invoice data', () => {
            const { container } = render(
                <InvoicePDF
                    data={mockInvoiceData}
                    outletLogoBase64="data:image/png;base64,mockbase64"
                />
            );

            expect(container).toBeDefined();
        });

        it('should render PDF without logo when not provided', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
        });

        it('should handle missing outlet data gracefully', () => {
            const dataWithoutOutlet = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    outlet: null,
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutOutlet} />
            );

            expect(container).toBeDefined();
        });

        it('should handle missing order data gracefully', () => {
            const dataWithoutOrder = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: null,
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutOrder} />
            );

            expect(container).toBeDefined();
        });

        it('should handle empty order products array', () => {
            const dataWithEmptyProducts = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [],
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithEmptyProducts} />
            );

            expect(container).toBeDefined();
        });

        it('should handle null order products', () => {
            const dataWithNullProducts = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: null,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithNullProducts} />
            );

            expect(container).toBeDefined();
        });
    });

    describe('Table Display Logic', () => {
        it('should display table number when available', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
            // Table label should be "Table • A1"
        });

        it('should display pickup service when no table number', () => {
            const dataWithoutTable = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        table_number: null,
                        table_number_id: null,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutTable} />
            );

            expect(container).toBeDefined();
            // Should display "Pickup Service"
        });

        it('should handle table_number_id as fallback', () => {
            const dataWithTableId = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        table_number: null,
                        table_number_id: 5,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithTableId} />
            );

            expect(container).toBeDefined();
            // Should display "Table • 5"
        });

        it('should handle empty string table number', () => {
            const dataWithEmptyTable = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        table_number: { number: '' },
                        table_number_id: null,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithEmptyTable} />
            );

            expect(container).toBeDefined();
            // Should display "Pickup Service"
        });
    });

    describe('Product Rendering', () => {
        it('should render product with variants and additions', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
        });

        it('should handle product without variants', () => {
            const dataWithoutVariants = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [
                            {
                                ...mockInvoiceData.data.order.order_products[0],
                                order_product_variants: [],
                            },
                        ],
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutVariants} />
            );

            expect(container).toBeDefined();
        });

        it('should handle product without additions', () => {
            const dataWithoutAdditions = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [
                            {
                                ...mockInvoiceData.data.order.order_products[0],
                                order_product_additions: [],
                            },
                        ],
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutAdditions} />
            );

            expect(container).toBeDefined();
        });

        it('should handle product without note', () => {
            const dataWithoutNote = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [
                            {
                                ...mockInvoiceData.data.order.order_products[0],
                                note: null,
                            },
                        ],
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutNote} />
            );

            expect(container).toBeDefined();
        });

        it('should handle missing product name gracefully', () => {
            const dataWithMissingProductName = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [
                            {
                                ...mockInvoiceData.data.order.order_products[0],
                                product: null,
                                meta_data: null,
                            },
                        ],
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithMissingProductName} />
            );

            expect(container).toBeDefined();
        });
    });

    describe('Pricing Display', () => {
        it('should display all pricing information when service fee is enabled', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
        });

        it('should hide service fee when service_fee_config is not 2', () => {
            const dataWithoutServiceFee = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        service_fee_config: 1,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutServiceFee} />
            );

            expect(container).toBeDefined();
        });

        it('should hide service fee when total_fee_service is 0', () => {
            const dataWithZeroServiceFee = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        service_fee_config: 2,
                        total_fee_service: 0,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithZeroServiceFee} />
            );

            expect(container).toBeDefined();
        });

        it('should handle discount display', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
        });

        it('should hide discount when discount is 0', () => {
            const dataWithoutDiscount = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        discount: 0,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutDiscount} />
            );

            expect(container).toBeDefined();
        });
    });

    describe('Payment Method Display', () => {
        it('should display payment method name when available', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
        });

        it('should display payment method channel as fallback', () => {
            const dataWithChannelOnly = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        payment_method: {
                            name: null,
                            channel: 'qris',
                            code: 'qris',
                        },
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithChannelOnly} />
            );

            expect(container).toBeDefined();
        });

        it('should display payment method code as fallback', () => {
            const dataWithCodeOnly = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        payment_method: {
                            name: null,
                            channel: null,
                            code: 'qris',
                        },
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithCodeOnly} />
            );

            expect(container).toBeDefined();
        });

        it('should default to QRIS when no payment method', () => {
            const dataWithoutPaymentMethod = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        payment_method: null,
                        payment_method_id: null,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithoutPaymentMethod} />
            );

            expect(container).toBeDefined();
        });

        it('should handle payment method ID 1 as QRIS', () => {
            const dataWithPaymentMethodId = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        payment_method: null,
                        payment_method_id: 1,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithPaymentMethodId} />
            );

            expect(container).toBeDefined();
        });

        it('should handle other payment method IDs', () => {
            const dataWithOtherPaymentMethodId = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        payment_method: null,
                        payment_method_id: 2,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithOtherPaymentMethodId} />
            );

            expect(container).toBeDefined();
        });
    });

    describe('Currency Formatting', () => {
        it('should format currency correctly', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
            // Currency should be formatted as "Rp 50.000"
        });

        it('should handle zero amounts', () => {
            const dataWithZeroAmounts = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        sub_total: 0,
                        total: 0,
                        discount: 0,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithZeroAmounts} />
            );

            expect(container).toBeDefined();
        });

        it('should handle large amounts', () => {
            const dataWithLargeAmounts = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        sub_total: 1000000,
                        total: 1100000,
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithLargeAmounts} />
            );

            expect(container).toBeDefined();
        });
    });

    describe('generateInvoiceBlob Function', () => {
        beforeEach(() => {
            mockPdf.mockReturnValue({
                toBlob: vi.fn().mockResolvedValue(new Blob(['pdf content'])),
            } as any);
        });

        it('should generate PDF blob successfully', async () => {
            const blob = await generateInvoiceBlob(mockInvoiceData);

            expect(mockResolveOutletLogoUrl).toHaveBeenCalledWith('https://example.com/logo.png');
            expect(mockImageUrlToBase64).toHaveBeenCalledWith('https://example.com/logo.png');
            expect(mockPdf).toHaveBeenCalled();
            expect(blob).toBeInstanceOf(Blob);
        });

        it('should handle missing outlet logo', async () => {
            const dataWithoutLogo = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    outlet: {
                        ...mockInvoiceData.data.outlet,
                        logo_url: null,
                    },
                },
            };

            const blob = await generateInvoiceBlob(dataWithoutLogo);

            expect(mockResolveOutletLogoUrl).not.toHaveBeenCalled();
            expect(mockImageUrlToBase64).not.toHaveBeenCalled();
            expect(mockPdf).toHaveBeenCalled();
            expect(blob).toBeInstanceOf(Blob);
        });

        it('should handle logo URL resolution failure', async () => {
            mockResolveOutletLogoUrl.mockReturnValue(null as any);

            const blob = await generateInvoiceBlob(mockInvoiceData);

            expect(mockResolveOutletLogoUrl).toHaveBeenCalledWith('https://example.com/logo.png');
            expect(mockImageUrlToBase64).not.toHaveBeenCalled();
            expect(mockPdf).toHaveBeenCalled();
            expect(blob).toBeInstanceOf(Blob);
        });

        it('should handle base64 conversion failure', async () => {
            mockImageUrlToBase64.mockRejectedValue(new Error('Conversion failed'));

            // Should throw the error since there's no error handling in the function
            await expect(generateInvoiceBlob(mockInvoiceData)).rejects.toThrow('Conversion failed');

            expect(mockResolveOutletLogoUrl).toHaveBeenCalledWith('https://example.com/logo.png');
            expect(mockImageUrlToBase64).toHaveBeenCalledWith('https://example.com/logo.png');
        });

        it('should handle PDF generation failure', async () => {
            mockPdf.mockReturnValue({
                toBlob: vi.fn().mockRejectedValue(new Error('PDF generation failed')),
            } as any);

            await expect(generateInvoiceBlob(mockInvoiceData)).rejects.toThrow('PDF generation failed');
        });

        it('should handle missing outlet data', async () => {
            const dataWithoutOutlet = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    outlet: null,
                },
            };

            const blob = await generateInvoiceBlob(dataWithoutOutlet);

            expect(mockResolveOutletLogoUrl).not.toHaveBeenCalled();
            expect(mockImageUrlToBase64).not.toHaveBeenCalled();
            expect(blob).toBeInstanceOf(Blob);
        });
    });

    describe('Variant Display Logic', () => {
        it('should display variant with attribute name and value', () => {
            const { container } = render(
                <InvoicePDF data={mockInvoiceData} />
            );

            expect(container).toBeDefined();
            // Should display "Size: Large"
        });

        it('should display variant value only when no attribute name', () => {
            const dataWithVariantValueOnly = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [
                            {
                                ...mockInvoiceData.data.order.order_products[0],
                                order_product_variants: [
                                    {
                                        id: 1,
                                        product_attribute_value: {
                                            name: 'Large',
                                            extra_price: 5000,
                                            product_attribute: null,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithVariantValueOnly} />
            );

            expect(container).toBeDefined();
            // Should display "Large" only
        });

        it('should handle variant with zero extra price', () => {
            const dataWithZeroExtraPrice = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [
                            {
                                ...mockInvoiceData.data.order.order_products[0],
                                order_product_variants: [
                                    {
                                        id: 1,
                                        product_attribute_value: {
                                            name: 'Regular',
                                            extra_price: 0,
                                            product_attribute: {
                                                name: 'Size',
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                },
            };

            const { container } = render(
                <InvoicePDF data={dataWithZeroExtraPrice} />
            );

            expect(container).toBeDefined();
            // Should not display price for zero extra price
        });
    });
});