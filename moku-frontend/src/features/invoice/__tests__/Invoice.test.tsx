import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'sonner';
import Invoice from '../pages/Invoice';
import { useQueryInvoice } from '../hooks/api/useQueryInvoice';
import { TableNumberAPI } from '@/features/table/api/tablenum.api';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(() => vi.fn()),
        useParams: vi.fn(() => ({ outletSlug: 'test-outlet', orderCode: '123' })),
    };
});

vi.mock('../hooks/api/useQueryInvoice');
vi.mock('@/features/table/api/tablenum.api');
vi.mock('sonner');
vi.mock('@/utils/imageFormatters', () => ({
    resolveOutletLogoUrl: vi.fn((url) => url),
}));

// Mock lazy imports
vi.mock('../pages/InvoicePDFRenderer', () => ({
    generateInvoiceBlob: vi.fn(() => Promise.resolve(new Blob(['pdf content']))),
}));

vi.mock('html2canvas', () => ({
    default: vi.fn(() => Promise.resolve({
        toBlob: vi.fn((callback) => callback(new Blob(['image content']))),
    })),
}));

// Mock navigator.share and clipboard
Object.defineProperty(navigator, 'share', {
    value: vi.fn(),
    writable: true,
});

Object.defineProperty(navigator, 'canShare', {
    value: vi.fn(),
    writable: true,
});

Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: vi.fn(),
    },
    writable: true,
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock window.open
global.window.open = vi.fn();

const mockInvoiceData = {
    status: 'success',
    message: 'Invoice retrieved successfully',
    data: {
        outlet: {
            id: 1,
            name: 'Test Cafe',
            address: '123 Test Street',
            phone: '+1234567890',
            logo_url: 'https://example.com/logo.png',
            fee_tax: 10,
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

const mockTableData = {
    data: {
        table_numbers: [
            { id: 1, number: 'A1' },
            { id: 2, number: 'B2' },
        ],
    },
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('Invoice Component', () => {
    const mockUseQueryInvoice = vi.mocked(useQueryInvoice);
    const mockTableNumberAPI = vi.mocked(TableNumberAPI);
    const mockToast = vi.mocked(toast);

    beforeEach(() => {
        vi.clearAllMocks();
        mockTableNumberAPI.getListTableNumber.mockResolvedValue(mockTableData);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Loading State', () => {
        it('should display loading spinner when data is loading', () => {
            mockUseQueryInvoice.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should display error message when there is an error', () => {
            mockUseQueryInvoice.mockReturnValue({
                data: undefined,
                isLoading: false,
                error: { message: 'Network error' },
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Network error')).toBeInTheDocument();
        });

        it('should display error message when invoice status is error', () => {
            mockUseQueryInvoice.mockReturnValue({
                data: {
                    status: 'error',
                    message: 'Invoice not found',
                },
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Invoice not found')).toBeInTheDocument();
        });

        it('should display default error message when no specific error is provided', () => {
            mockUseQueryInvoice.mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Invoice not found')).toBeInTheDocument();
        });
    });

    describe('Success State', () => {
        beforeEach(() => {
            mockUseQueryInvoice.mockReturnValue({
                data: mockInvoiceData,
                isLoading: false,
                error: null,
            } as any);
        });

        it('should render invoice details correctly', () => {
            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Test Cafe')).toBeInTheDocument();
            expect(screen.getByText('123 Test Street')).toBeInTheDocument();
            expect(screen.getByText('+1234567890')).toBeInTheDocument();
            expect(screen.getByText('Table • A1')).toBeInTheDocument();
            expect(screen.getByText('Nama Customer: John Doe')).toBeInTheDocument();
            expect(screen.getByText('Order ID #123')).toBeInTheDocument();
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

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithoutTable,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Pickup Service')).toBeInTheDocument();
        });

        it('should render order products with variants and additions', () => {
            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText(/2x Nasi Goreng/)).toBeInTheDocument();
            expect(screen.getByText(/Size: Large/)).toBeInTheDocument();
            expect(screen.getByText(/Extra Cheese/)).toBeInTheDocument();
            expect(screen.getByText('Note: Extra spicy')).toBeInTheDocument();
        });

        it('should display pricing information correctly', () => {
            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Rp 50.000')).toBeInTheDocument(); // sub_total
            expect(screen.getByText('-Rp 5.000')).toBeInTheDocument(); // discount
            expect(screen.getByText('Rp 45.000')).toBeInTheDocument(); // subtotal after discount
            expect(screen.getByText('Rp 2.500')).toBeInTheDocument(); // service fee
            expect(screen.getByText('Rp 52.500')).toBeInTheDocument(); // total
        });

        it('should not display service fee when service_fee_config is not 2', () => {
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

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithoutServiceFee,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.queryByText('Biaya Tambahan')).not.toBeInTheDocument();
        });

        it('should not display discount when discount is 0 or null', () => {
            const dataWithoutDiscount = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        discount: 0,
                        voucher: null,
                    },
                },
            };

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithoutDiscount,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.queryByText('Discount 10%')).not.toBeInTheDocument();
            expect(screen.queryByText('-Rp 5.000')).not.toBeInTheDocument();
        });
    });

    describe('Table Number Resolution', () => {
        it('should fetch table data when table_number is missing but table_number_id exists', async () => {
            const dataWithMissingTableName = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        table_number: null,
                        table_number_id: 1,
                    },
                },
            };

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithMissingTableName,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(mockTableNumberAPI.getListTableNumber).toHaveBeenCalledWith('test-outlet');
            });
        });

        it('should display resolved table name from API', async () => {
            const dataWithMissingTableName = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        table_number: null,
                        table_number_id: 2,
                    },
                },
            };

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithMissingTableName,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByText('Table • B2')).toBeInTheDocument();
            });
        });
    });

    describe('PDF Download Functionality', () => {
        beforeEach(() => {
            mockUseQueryInvoice.mockReturnValue({
                data: mockInvoiceData,
                isLoading: false,
                error: null,
            } as any);
        });

        it('should handle PDF download successfully', async () => {
            const { generateInvoiceBlob } = await import('../pages/InvoicePDFRenderer');
            vi.mocked(generateInvoiceBlob).mockResolvedValue(new Blob(['pdf content']));

            render(<Invoice />, { wrapper: createWrapper() });

            const downloadButton = screen.getByRole('button', { name: /download/i });
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(generateInvoiceBlob).toHaveBeenCalled();
                expect(mockToast.success).toHaveBeenCalledWith('Invoice downloaded successfully!');
            });
        });

        it('should handle PDF download error', async () => {
            const { generateInvoiceBlob } = await import('../pages/InvoicePDFRenderer');
            vi.mocked(generateInvoiceBlob).mockRejectedValue(new Error('PDF generation failed'));

            render(<Invoice />, { wrapper: createWrapper() });

            const downloadButton = screen.getByRole('button', { name: /download/i });
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith('Failed to download invoice.');
            });
        });

        it('should disable download button when downloading', async () => {
            const { generateInvoiceBlob } = await import('../pages/InvoicePDFRenderer');
            vi.mocked(generateInvoiceBlob).mockImplementation(() => new Promise(() => { })); // Never resolves

            render(<Invoice />, { wrapper: createWrapper() });

            const downloadButton = screen.getByRole('button', { name: /download/i });
            fireEvent.click(downloadButton);

            await waitFor(() => {
                expect(screen.getByText('Downloading...')).toBeInTheDocument();
                expect(downloadButton).toBeDisabled();
            });
        });

        it('should not download when no invoice data', () => {
            mockUseQueryInvoice.mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            // Should show error state, not download button
            expect(screen.queryByRole('button', { name: /download/i })).not.toBeInTheDocument();
        });
    });

    describe('Share Functionality', () => {
        beforeEach(() => {
            mockUseQueryInvoice.mockReturnValue({
                data: mockInvoiceData,
                isLoading: false,
                error: null,
            } as any);
        });

        it('should share image when browser supports file sharing', async () => {
            const mockCanShare = vi.fn().mockReturnValue(true);
            const mockShare = vi.fn().mockResolvedValue(undefined);

            Object.defineProperty(navigator, 'canShare', { value: mockCanShare });
            Object.defineProperty(navigator, 'share', { value: mockShare });

            const html2canvas = (await import('html2canvas')).default;
            vi.mocked(html2canvas).mockResolvedValue({
                toBlob: vi.fn((callback) => callback(new Blob(['image content']))),
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            const shareButton = screen.getByRole('button', { name: /share struk/i });
            fireEvent.click(shareButton);

            await waitFor(() => {
                expect(mockShare).toHaveBeenCalled();
                expect(mockToast.success).toHaveBeenCalledWith('Invoice image shared successfully!');
            });
        });

        it('should fallback to PDF sharing when image sharing fails', async () => {
            const mockCanShare = vi.fn().mockReturnValue(false);
            Object.defineProperty(navigator, 'canShare', { value: mockCanShare });

            const html2canvas = (await import('html2canvas')).default;
            vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas failed'));

            const { generateInvoiceBlob } = await import('../pages/InvoicePDFRenderer');
            vi.mocked(generateInvoiceBlob).mockResolvedValue(new Blob(['pdf content']));

            render(<Invoice />, { wrapper: createWrapper() });

            const shareButton = screen.getByRole('button', { name: /share struk/i });
            fireEvent.click(shareButton);

            await waitFor(() => {
                expect(generateInvoiceBlob).toHaveBeenCalled();
            });
        });

        it('should fallback to clipboard when sharing is not supported', async () => {
            const mockCanShare = vi.fn().mockReturnValue(false);
            const mockWriteText = vi.fn().mockResolvedValue(undefined);

            Object.defineProperty(navigator, 'canShare', { value: mockCanShare });
            Object.defineProperty(navigator, 'clipboard', {
                value: { writeText: mockWriteText },
            });

            const html2canvas = (await import('html2canvas')).default;
            vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas failed'));

            const { generateInvoiceBlob } = await import('../pages/InvoicePDFRenderer');
            vi.mocked(generateInvoiceBlob).mockRejectedValue(new Error('PDF failed'));

            render(<Invoice />, { wrapper: createWrapper() });

            const shareButton = screen.getByRole('button', { name: /share struk/i });
            fireEvent.click(shareButton);

            await waitFor(() => {
                expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
                expect(mockToast.success).toHaveBeenCalledWith('Link copied to clipboard!');
            });
        });

        it('should show error when all sharing methods fail', async () => {
            const mockCanShare = vi.fn().mockReturnValue(false);
            const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard failed'));

            Object.defineProperty(navigator, 'canShare', { value: mockCanShare });
            Object.defineProperty(navigator, 'clipboard', {
                value: { writeText: mockWriteText },
            });

            const html2canvas = (await import('html2canvas')).default;
            vi.mocked(html2canvas).mockRejectedValue(new Error('Canvas failed'));

            const { generateInvoiceBlob } = await import('../pages/InvoicePDFRenderer');
            vi.mocked(generateInvoiceBlob).mockRejectedValue(new Error('PDF failed'));

            render(<Invoice />, { wrapper: createWrapper() });

            const shareButton = screen.getByRole('button', { name: /share struk/i });
            fireEvent.click(shareButton);

            await waitFor(() => {
                expect(mockToast.error).toHaveBeenCalledWith(
                    'Your browser does not support sharing files or copying the link automatically.'
                );
            });
        });

        it('should disable share button when sharing', async () => {
            const html2canvas = (await import('html2canvas')).default;
            vi.mocked(html2canvas).mockImplementation(() => new Promise(() => { })); // Never resolves

            render(<Invoice />, { wrapper: createWrapper() });

            const shareButton = screen.getByRole('button', { name: /share struk/i });
            fireEvent.click(shareButton);

            await waitFor(() => {
                expect(screen.getByText('Sharing...')).toBeInTheDocument();
                expect(shareButton).toBeDisabled();
            });
        });
    });

    describe('Currency Formatting', () => {
        beforeEach(() => {
            mockUseQueryInvoice.mockReturnValue({
                data: mockInvoiceData,
                isLoading: false,
                error: null,
            } as any);
        });

        it('should format currency correctly', () => {
            render(<Invoice />, { wrapper: createWrapper() });

            // Check if currency is formatted as Indonesian Rupiah
            expect(screen.getByText('Rp 50.000')).toBeInTheDocument();
            expect(screen.getByText('Rp 52.500')).toBeInTheDocument();
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
                        total_fee_service: 0,
                    },
                },
            };

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithZeroAmounts,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            // Use getAllByText since there are multiple "Rp 0" elements
            const zeroAmountElements = screen.getAllByText('Rp 0');
            expect(zeroAmountElements.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing product data gracefully', () => {
            const dataWithMissingProduct = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        order_products: [
                            {
                                id: 1,
                                quantity: 1,
                                price: 10000,
                                product: null,
                                meta_data: null,
                                order_product_variants: [],
                                order_product_additions: [],
                            },
                        ],
                    },
                },
            };

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithMissingProduct,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText(/1x Product/)).toBeInTheDocument();
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

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithEmptyProducts,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Total: 0')).toBeInTheDocument();
        });

        it('should handle missing customer name', () => {
            const dataWithMissingCustomer = {
                ...mockInvoiceData,
                data: {
                    ...mockInvoiceData.data,
                    order: {
                        ...mockInvoiceData.data.order,
                        user_meta_data: null,
                    },
                },
            };

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithMissingCustomer,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            expect(screen.getByText('Nama Customer: Customer')).toBeInTheDocument();
        });

        it('should handle missing outlet logo', () => {
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

            mockUseQueryInvoice.mockReturnValue({
                data: dataWithoutLogo,
                isLoading: false,
                error: null,
            } as any);

            render(<Invoice />, { wrapper: createWrapper() });

            // Should render without logo (no img element)
            expect(screen.queryByAltText(/logo/i)).not.toBeInTheDocument();
        });
    });
});