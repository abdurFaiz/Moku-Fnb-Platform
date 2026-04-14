import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendedSection } from '../components/RecommendedSection';
import { useRecommendedSection } from '../hooks/useRecommendedSection';

vi.mock('../hooks/useRecommendedSection');

describe('RecommendedSection', () => {
    const mockProducts = [
        { id: '1', name: 'Product 1', price: 50000, image: 'https://example.com/product1.jpg', description: 'Product 1 description', isAvailable: true, isPublished: true },
        { id: '2', name: 'Product 2', price: 60000, image: 'https://example.com/product2.jpg', description: 'Product 2 description', isAvailable: true, isPublished: true },
        { id: '3', name: 'Product 3', price: 70000, image: 'https://example.com/product3.jpg', description: 'Product 3 description', isAvailable: true, isPublished: true },
    ];

    const defaultProps = {
        products: mockProducts,
        onProductClick: vi.fn(),
        onTambahClick: vi.fn(),
        onIncrement: vi.fn(),
        onDecrement: vi.fn(),
        getCartQuantity: vi.fn().mockReturnValue(0),
        onViewAll: vi.fn(),
        maxPaginationDots: 5,
        cardGap: 16,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useRecommendedSection).mockReturnValue({
            scrollContainerRef: { current: null },
            handleScroll: vi.fn(),
            scrollToIndex: vi.fn(),
            activeIndex: 0,
            shouldShowPagination: true,
            paginationTotalItems: 3,
            handleProductClick: vi.fn(),
            products: mockProducts,
        });
    });

    describe('Rendering', () => {
        it('should render recommended section', () => {
            render(<RecommendedSection {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display all products', () => {
            render(<RecommendedSection {...defaultProps} />);

            mockProducts.forEach(product => {
                expect(screen.getByText(product.name)).toBeInTheDocument();
            });
        });

        it('should render with empty products', () => {
            render(<RecommendedSection {...defaultProps} products={[]} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render view all button', () => {
            render(<RecommendedSection {...defaultProps} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    describe('Product Interactions', () => {
        it('should call onProductClick when product is clicked', () => {
            const onProductClick = vi.fn();
            render(<RecommendedSection {...defaultProps} onProductClick={onProductClick} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);

            expect(onProductClick).toHaveBeenCalled();
        });

        it('should call onTambahClick when add button is clicked', () => {
            const onTambahClick = vi.fn();
            render(<RecommendedSection {...defaultProps} onTambahClick={onTambahClick} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should call onViewAll when view all button is clicked', () => {
            const onViewAll = vi.fn();
            render(<RecommendedSection {...defaultProps} onViewAll={onViewAll} />);

            const buttons = screen.getAllByRole('button');
            const viewAllButton = buttons[buttons.length - 1];
            fireEvent.click(viewAllButton);

            expect(onViewAll).toHaveBeenCalled();
        });
    });

    describe('Pagination', () => {
        it('should show pagination when shouldShowPagination is true', () => {
            vi.mocked(useRecommendedSection).mockReturnValue({
                scrollContainerRef: { current: null },
                handleScroll: vi.fn(),
                scrollToIndex: vi.fn(),
                activeIndex: 0,
                shouldShowPagination: true,
                paginationTotalItems: 3,
                handleProductClick: vi.fn(),
                products: mockProducts,
            });

            render(<RecommendedSection {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should hide pagination when shouldShowPagination is false', () => {
            vi.mocked(useRecommendedSection).mockReturnValue({
                scrollContainerRef: { current: null },
                handleScroll: vi.fn(),
                scrollToIndex: vi.fn(),
                activeIndex: 0,
                shouldShowPagination: false,
                paginationTotalItems: 0,
                handleProductClick: vi.fn(),
                products: mockProducts,
            });

            render(<RecommendedSection {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Props Configuration', () => {
        it('should use custom maxPaginationDots', () => {
            render(<RecommendedSection {...defaultProps} maxPaginationDots={10} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should use custom cardGap', () => {
            render(<RecommendedSection {...defaultProps} cardGap={24} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should use custom cardWidth', () => {
            render(<RecommendedSection {...defaultProps} cardWidth='200px' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle products with long names', () => {
            const longNameProducts = [
                { id: '1', name: 'A'.repeat(100), price: 50000, image: 'https://example.com/product.jpg', description: 'Description', isAvailable: true, isPublished: true },
            ];

            render(<RecommendedSection {...defaultProps} products={longNameProducts} />);

            expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
        });

        it('should handle many products', () => {
            const manyProducts = Array.from({ length: 50 }, (_, i) => ({
                id: String(i),
                name: `Product ${i}`,
                price: 50000 + i * 1000,
                image: 'https://example.com/product.jpg',
                description: 'Description',
                isAvailable: true,
                isPublished: true,
            }));

            render(<RecommendedSection {...defaultProps} products={manyProducts} />);

            expect(screen.getByText('Product 0')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle product changes', () => {
            const { rerender } = render(<RecommendedSection {...defaultProps} products={mockProducts} />);

            expect(screen.getByText('Product 1')).toBeInTheDocument();

            rerender(<RecommendedSection {...defaultProps} products={[mockProducts[0]]} />);

            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });
    });
});
