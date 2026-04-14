import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BottomSheetAddDetailProduct from '../components/BottomSheetAddDetailProduct';
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

vi.mock('@/features/product/hooks/useAttributeSelections', () => ({
    useAttributeSelections: () => ({
        selections: new Map(),
        toggleSelection: vi.fn(),
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

describe('BottomSheetAddDetailProduct', () => {
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
            renderWithProviders(<BottomSheetAddDetailProduct {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        it('should display product details', () => {
            renderWithProviders(<BottomSheetAddDetailProduct {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            renderWithProviders(<BottomSheetAddDetailProduct {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            renderWithProviders(<BottomSheetAddDetailProduct {...defaultProps} onClose={onClose} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);

            expect(onClose).toHaveBeenCalled();
        });

        it('should call onAdd when add button is clicked', () => {
            renderWithProviders(<BottomSheetAddDetailProduct {...defaultProps} />);

            const addButton = screen.getByRole('button', { name: /Tambah/i });
            fireEvent.click(addButton);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle product with long name', () => {
            const longNameProduct: ProductDetail = {
                ...mockProduct,
                name: 'A'.repeat(100),
            };

            renderWithProviders(<BottomSheetAddDetailProduct {...defaultProps} product={longNameProduct} />);

            expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
        });

        it('should handle product with special characters', () => {
            const specialProduct: ProductDetail = {
                ...mockProduct,
                name: 'Café & Restaurant (Special)',
            };

            renderWithProviders(<BottomSheetAddDetailProduct {...defaultProps} product={specialProduct} />);

            expect(screen.getByText('Café & Restaurant (Special)')).toBeInTheDocument();
        });
    });
});
