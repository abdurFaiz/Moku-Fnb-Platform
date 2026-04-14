import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuItem from '../components/MenuItem';

describe('MenuItem', () => {
    const mockItems = [
        { name: 'Category 1', count: 10 },
        { name: 'Category 2', count: 5 },
    ];

    const defaultProps = {
        items: mockItems,
        onClose: vi.fn(),
        activeItem: 'Category 1',
        onItemSelect: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render menu title', () => {
            render(<MenuItem {...defaultProps} />);

            expect(screen.getByText('Pilih Menu')).toBeInTheDocument();
        });

        it('should render all items', () => {
            render(<MenuItem {...defaultProps} />);

            expect(screen.getByText('Category 1')).toBeInTheDocument();
            expect(screen.getByText('Category 2')).toBeInTheDocument();
        });

        it('should render item counts', () => {
            render(<MenuItem {...defaultProps} />);

            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should highlight active item', () => {
            render(<MenuItem {...defaultProps} />);

            // Category 1 is active, should have primary orange text
            const activeItem = screen.getByText('Category 1');
            expect(activeItem).toHaveClass('font-medium');
        });
    });

    describe('Interactions', () => {
        it('should call onItemSelect and onClose when item is clicked', () => {
            const onItemSelect = vi.fn();
            const onClose = vi.fn();
            render(<MenuItem {...defaultProps} onItemSelect={onItemSelect} onClose={onClose} />);

            const itemButton = screen.getByText('Category 2').closest('button');
            fireEvent.click(itemButton!);

            expect(onItemSelect).toHaveBeenCalledWith('Category 2');
            expect(onClose).toHaveBeenCalled();
        });

        it('should call onClose when close button is clicked', () => {
            const onClose = vi.fn();
            render(<MenuItem {...defaultProps} onClose={onClose} />);

            // Find close button by icon (or the button wrapping it)
            // Since we can't easily find by icon, let's look for the button in the header (first button usually)
            const buttons = screen.getAllByRole('button');
            const closeButton = buttons[0];
            fireEvent.click(closeButton);

            expect(onClose).toHaveBeenCalled();
        });
    });
});
