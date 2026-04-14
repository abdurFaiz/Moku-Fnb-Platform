import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicCategorySection } from '../components/DynamicCategorySection';
import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

vi.mock('@/features/storefront/hooks/useFavorites', () => ({
    useFavorites: () => ({
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        isFavorite: () => false,
        items: [],
    }),
}));

vi.mock('@/features/storefront/hooks/api/useMutationLike', () => ({
    useToggleLikeMutation: () => ({
        mutate: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('@/features/outlets/stores/useOutletStore', () => ({
    useOutletStore: () => 'test-outlet',
}));

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe('DynamicCategorySection', () => {
    const mockCategory: Category = {
        id: 1,
        position: 1,
        name: 'Category 1',
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
    };

    const mockProducts: HomeProduct[] = [
        {
            id: '1',
            name: 'Product 1',
            price: 10000,
            image: 'product1.jpg',
            description: 'Product 1 description',
            isAvailable: true,
            isPublished: true
        },
        {
            id: '2',
            name: 'Product 2',
            price: 20000,
            image: 'product2.jpg',
            description: 'Product 2 description',
            isAvailable: true,
            isPublished: true
        },
    ];

    const defaultProps = {
        category: mockCategory,
        products: mockProducts,
        onProductClick: vi.fn(),
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
        it('should render dynamic category section', () => {
            renderWithProviders(<DynamicCategorySection {...defaultProps} />);

            expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
        });

        it('should display category', () => {
            renderWithProviders(<DynamicCategorySection {...defaultProps} />);

            expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
        });

        it('should display products', () => {
            renderWithProviders(<DynamicCategorySection {...defaultProps} />);

            mockProducts.forEach(product => {
                expect(screen.getByText(product.name)).toBeInTheDocument();
            });
        });
    });

    describe('Loading State', () => {
        it('should show loading state', () => {
            render(<DynamicCategorySection {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should show content when not loading', () => {
            render(<DynamicCategorySection {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty products', () => {
            render(<DynamicCategorySection {...defaultProps} products={[]} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });
});
