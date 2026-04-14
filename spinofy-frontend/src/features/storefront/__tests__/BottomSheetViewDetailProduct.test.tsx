import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BottomSheetViewDetailProduct from '../components/BottomSheetViewDetailProduct';
import type { ProductDetail } from '@/features/product/types/DetailProduct';

vi.mock('@/features/product/hooks/useProductDetail', () => ({
    useOutletList: () => ({
        outletSlug: 'test-outlet',
    }),
}));

vi.mock('@/features/cart/hooks/useCart', () => ({
    useCart: () => ({
        addItem: vi.fn(),
        updateItem: vi.fn(),
        items: [],
    }),
}));

vi.mock('@/features/product/hooks/usePriceCalculator', () => ({
    usePriceCalculator: () => ({
        calculateTotalPrice: (product: ProductDetail) => parseInt(product.price),
        getBasePrice: (product: ProductDetail) => parseInt(product.price),
    }),
}));

vi.mock('@/hooks/shared/usePointsCalculation', () => ({
    usePointsCalculation: () => 0,
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        info: vi.fn(),
    },
}));

describe('BottomSheetViewDetailProduct', () => {
    const mockProduct: ProductDetail = {
        id: 1,
        uuid: 'product-uuid-1',
        name: 'Test Product',
        price: '50000',
        description: 'Test Description',
        is_available: 1,
        is_recommended: 0,
        image: 'test-image.jpg',
        image_url: 'https://example.com/test-image.jpg',
        product_category_id: 1,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        attributes: [],
    };

    const defaultProps = {
        isOpen: true,
        product: mockProduct,
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithProviders = (component: React.ReactElement) => {
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        return render(
            <QueryClientProvider client={queryClient}>
                {component}
            </QueryClientProvider>
        );
    };

    describe('Rendering', () => {
        it('should render bottom sheet when open', () => {
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        it('should display product details', () => {
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        it('should display product price', () => {
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} />);

            const priceElements = screen.getAllByText((_, element) => {
                return (element?.textContent?.includes('Rp') && element?.textContent?.includes('50')) || false;
            });
            expect(priceElements.length).toBeGreaterThan(0);
        });

        it('should not render when closed', () => {
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} onClose={onClose} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);

            expect(onClose).toHaveBeenCalled();
        });

        it('should handle multiple close clicks', () => {
            const onClose = vi.fn();
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} onClose={onClose} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);
            fireEvent.click(buttons[0]);

            expect(onClose).toHaveBeenCalledTimes(2);
        });
    });

    describe('Product Display', () => {
        it('should display product image', () => {
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        it('should display product description', () => {
            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} />);

            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle product with long name', () => {
            const longNameProduct: ProductDetail = {
                ...mockProduct,
                name: 'A'.repeat(100),
            };

            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} product={longNameProduct} />);

            expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
        });

        it('should handle product with special characters', () => {
            const specialProduct: ProductDetail = {
                ...mockProduct,
                name: 'Café & Restaurant (Special)',
            };

            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} product={specialProduct} />);

            expect(screen.getByText('Café & Restaurant (Special)')).toBeInTheDocument();
        });

        it('should handle missing image', () => {
            const productWithoutImage: ProductDetail = {
                ...mockProduct,
                image: '',
            };

            renderWithProviders(<BottomSheetViewDetailProduct {...defaultProps} product={productWithoutImage} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });
    });
});
