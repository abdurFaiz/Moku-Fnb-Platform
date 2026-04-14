import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryBottomSheet from '../components/CategoryBottomSheet';
import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

describe('CategoryBottomSheet', () => {
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
    ];

    const mockProducts: Record<string, HomeProduct[]> = {
        category1: [],
        category2: [],
    };

    const defaultProps = {
        isOpen: true,
        categories: mockCategories,
        products: mockProducts,
        activeCategory: 'category1',
        onClose: vi.fn(),
        onCategorySelect: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render bottom sheet when open', () => {
            render(<CategoryBottomSheet {...defaultProps} />);

            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            render(<CategoryBottomSheet {...defaultProps} isOpen={false} />);

            expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
        });

        it('should display categories', () => {
            render(<CategoryBottomSheet {...defaultProps} />);

            mockCategories.forEach(category => {
                expect(screen.getByText(category.name)).toBeInTheDocument();
            });
        });
    });

    describe('Interactions', () => {
        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            render(<CategoryBottomSheet {...defaultProps} onClose={onClose} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);

            expect(onClose).toHaveBeenCalled();
        });

        it('should call onCategorySelect when category is selected', () => {
            const onCategorySelect = vi.fn();
            render(<CategoryBottomSheet {...defaultProps} onCategorySelect={onCategorySelect} />);

            // Find and click on a category text (which should be clickable)
            const categoryText = screen.getByText('Category 1');
            fireEvent.click(categoryText);

            expect(onCategorySelect).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty categories', () => {
            render(<CategoryBottomSheet {...defaultProps} categories={[]} />);

            expect(screen.queryByText('Category 1')).not.toBeInTheDocument();
        });

        it('should handle many categories', () => {
            const manyCategories: Category[] = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                name: `Category ${i}`,
                position: i,
                outlet_id: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            }));

            render(<CategoryBottomSheet {...defaultProps} categories={manyCategories} />);

            expect(screen.getByText('Category 0')).toBeInTheDocument();
        });
    });
});
