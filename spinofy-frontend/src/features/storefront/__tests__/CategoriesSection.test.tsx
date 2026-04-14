import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoriesSection from '../components/CategoriesSection';
import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

vi.mock('@/hooks/shared/useOutletNavigation', () => ({
    useOutletNavigation: () => ({
        navigateToCategory: vi.fn(),
    }),
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: vi.fn(),
});

describe('CategoriesSection', () => {
    const mockCategories: Category[] = [
        {
            id: 1,
            name: 'Category 1',
            position: 1,
            outlet_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            id: 2,
            name: 'Category 2',
            position: 2,
            outlet_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            id: 3,
            name: 'Category 3',
            position: 3,
            outlet_id: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
    ];

    const mockProducts: Record<string, HomeProduct[]> = {
        category1: [],
        category2: [],
        category3: [],
    };

    const defaultProps = {
        categories: mockCategories,
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
        it('should render categories section', () => {
            renderWithProviders(<CategoriesSection {...defaultProps} />);

            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });

        it('should render all categories', () => {
            renderWithProviders(<CategoriesSection {...defaultProps} />);

            mockCategories.forEach(category => {
                expect(screen.getByText(category.name)).toBeInTheDocument();
            });
        });

        it('should render with empty categories', () => {
            renderWithProviders(<CategoriesSection {...defaultProps} categories={[]} />);

            expect(screen.queryByText('Belum ada product tersedia')).toBeInTheDocument();
        });

        it('should render with single category', () => {
            renderWithProviders(<CategoriesSection {...defaultProps} categories={[mockCategories[0]]} />);

            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });
    });

    describe('Category Selection', () => {
        it('should render categories with products', () => {
            const productsWithItems: Record<string, HomeProduct[]> = {
                category1: [
                    {
                        id: '1',
                        name: 'Product 1',
                        price: 10000,
                        description: 'Test product',
                        image: 'test.jpg',
                        isAvailable: true,
                        isPublished: true,
                        isRecommended: false,
                        categoryId: 1,
                    },
                ],
                category2: [],
                category3: [],
            };

            renderWithProviders(<CategoriesSection {...defaultProps} products={productsWithItems} />);

            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });

        it('should handle empty product lists', () => {
            renderWithProviders(<CategoriesSection {...defaultProps} />);

            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle categories with long names', () => {
            const longNameCategories: Category[] = [
                {
                    id: 1,
                    name: 'A'.repeat(100),
                    position: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ];

            renderWithProviders(<CategoriesSection {...defaultProps} categories={longNameCategories} />);

            expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
        });

        it('should handle special characters in category names', () => {
            const specialCategories: Category[] = [
                {
                    id: 1,
                    name: 'Café & Restaurant',
                    position: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            ];

            renderWithProviders(<CategoriesSection {...defaultProps} categories={specialCategories} />);

            expect(screen.getByText('Café & Restaurant')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle category changes', () => {
            const queryClient = new QueryClient({
                defaultOptions: {
                    queries: { retry: false },
                    mutations: { retry: false },
                },
            });

            const { rerender } = render(
                <QueryClientProvider client={queryClient}>
                    <CategoriesSection {...defaultProps} categories={mockCategories} />
                </QueryClientProvider>
            );

            expect(screen.getByText('Category 1')).toBeInTheDocument();

            rerender(
                <QueryClientProvider client={queryClient}>
                    <CategoriesSection {...defaultProps} categories={[mockCategories[0]]} />
                </QueryClientProvider>
            );

            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });
    });
});
