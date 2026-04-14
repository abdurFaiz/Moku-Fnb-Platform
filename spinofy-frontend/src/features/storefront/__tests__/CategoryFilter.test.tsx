import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryFilter } from '../components/CategoryFilter';

describe('CategoryFilter', () => {
    const mockCategories = [
        { id: 1, position: 1, name: 'Category 1', slug: 'category-1', outlet_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, position: 2, name: 'Category 2', slug: 'category-2', outlet_id: 1, created_at: '2024-01-01', updated_at: '2024-01-01' },
    ];

    const defaultProps = {
        categories: mockCategories,
        activeCategory: 'Category 1',
        onCategoryChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render category filter', () => {
            render(<CategoryFilter {...defaultProps} />);

            expect(screen.getAllByRole('button')).toHaveLength(2);
        });

        it('should display selected category', () => {
            render(<CategoryFilter {...defaultProps} />);

            expect(screen.getByText('Category 1')).toBeInTheDocument();
        });

        it('should render all categories', () => {
            render(<CategoryFilter {...defaultProps} />);

            mockCategories.forEach(category => {
                expect(screen.getByText(category.name)).toBeInTheDocument();
            });
        });
    });

    describe('Category Selection', () => {
        it('should call onCategoryChange when category is selected', () => {
            const onCategoryChange = vi.fn();
            render(<CategoryFilter {...defaultProps} onCategoryChange={onCategoryChange} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[1]);

            expect(onCategoryChange).toHaveBeenCalled();
        });

        it('should handle multiple selections', () => {
            const onCategoryChange = vi.fn();
            render(<CategoryFilter {...defaultProps} onCategoryChange={onCategoryChange} />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);
            fireEvent.click(buttons[1]);

            expect(onCategoryChange).toHaveBeenCalledTimes(2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty categories', () => {
            render(<CategoryFilter {...defaultProps} categories={[]} />);

            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });

        it('should handle empty active category', () => {
            render(<CategoryFilter {...defaultProps} activeCategory="" />);

            expect(screen.getAllByRole('button')).toHaveLength(2);
        });
    });
});
