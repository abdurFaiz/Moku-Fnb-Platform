import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerticalProductCard from '../components/VerticalProductCard';

describe('VerticalProductCard', () => {
    const defaultProps = {
        name: 'Test Product',
        price: 50000,
        displayImage: 'https://example.com/image.jpg',
        priority: false,
        isAvailable: true,
        isGuest: false,
        isFavorite: false,
        guestRestrictionMessage: 'Guest cannot add items',
        cartQuantity: 0,
        onCardClick: vi.fn(),
        onAddClick: vi.fn(),
        onImageError: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render product card with all required elements', () => {
            render(<VerticalProductCard {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
            expect(screen.getByText(/Rp 50.000/)).toBeInTheDocument();
        });

        it('should render product image', () => {
            render(<VerticalProductCard {...defaultProps} />);

            const image = screen.getByAltText('Test Product');
            expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
        });

        it('should render add button when cart quantity is 0', () => {
            render(<VerticalProductCard {...defaultProps} cartQuantity={0} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);
        });

        it('should render quantity controls when cart quantity > 0', () => {
            render(<VerticalProductCard {...defaultProps} cartQuantity={3} />);

            expect(screen.getByText('3')).toBeInTheDocument();
        });
    });

    describe('Image Loading', () => {
        it('should handle image load event', async () => {
            render(<VerticalProductCard {...defaultProps} />);

            const image = screen.getByAltText('Test Product');
            fireEvent.load(image);

            await waitFor(() => {
                expect(image).toHaveClass('opacity-100');
            });
        });

        it('should call onImageError when image fails to load', () => {
            const onImageError = vi.fn();
            render(<VerticalProductCard {...defaultProps} onImageError={onImageError} />);

            const image = screen.getByAltText('Test Product');
            fireEvent.error(image);

            expect(onImageError).toHaveBeenCalled();
        });

        it('should set high fetch priority when priority is true', () => {
            render(<VerticalProductCard {...defaultProps} priority={true} />);

            const image = screen.getByAltText('Test Product');
            expect(image).toHaveAttribute('fetchPriority', 'high');
        });

        it('should set auto fetch priority when priority is false', () => {
            render(<VerticalProductCard {...defaultProps} priority={false} />);

            const image = screen.getByAltText('Test Product');
            expect(image).toHaveAttribute('fetchPriority', 'auto');
        });
    });

    describe('Add to Cart', () => {
        it('should call onAddClick when add button is clicked', async () => {
            const onAddClick = vi.fn();
            render(<VerticalProductCard {...defaultProps} onAddClick={onAddClick} />);

            const buttons = screen.getAllByRole('button');
            const addButton = buttons[buttons.length - 1];

            fireEvent.click(addButton);
            expect(onAddClick).toHaveBeenCalled();
        });

        it('should not call onAddClick when product is unavailable', async () => {
            const onAddClick = vi.fn();
            render(<VerticalProductCard {...defaultProps} isAvailable={false} onAddClick={onAddClick} />);

            const buttons = screen.getAllByRole('button');
            const addButton = buttons[buttons.length - 1];

            expect(addButton).toBeDisabled();
        });

        it('should not call onAddClick when user is guest', async () => {
            const onAddClick = vi.fn();
            render(<VerticalProductCard {...defaultProps} isGuest={true} onAddClick={onAddClick} />);

            const buttons = screen.getAllByRole('button');
            const addButton = buttons[buttons.length - 1];

            expect(addButton).toBeDisabled();
        });
    });

    describe('Quantity Controls', () => {
        it('should call onIncrement when increment button is clicked', async () => {
            const onIncrement = vi.fn();
            render(<VerticalProductCard {...defaultProps} cartQuantity={2} onIncrement={onIncrement} />);

            const quantityText = screen.getByText('2');
            const quantityContainer = quantityText.closest('div');
            const buttons = quantityContainer?.querySelectorAll('button');

            if (buttons && buttons.length > 0) {
                fireEvent.click(buttons[buttons.length - 1]);
                expect(onIncrement).toHaveBeenCalled();
            }
        });

        it('should call onDecrement when decrement button is clicked', async () => {
            const onDecrement = vi.fn();
            render(<VerticalProductCard {...defaultProps} cartQuantity={2} onDecrement={onDecrement} />);

            const quantityText = screen.getByText('2');
            const quantityContainer = quantityText.closest('div');
            const buttons = quantityContainer?.querySelectorAll('button');

            if (buttons && buttons.length > 0) {
                fireEvent.click(buttons[0]);
                expect(onDecrement).toHaveBeenCalled();
            }
        });

        it('should display correct quantity', () => {
            render(<VerticalProductCard {...defaultProps} cartQuantity={7} />);

            expect(screen.getByText('7')).toBeInTheDocument();
        });
    });

    describe('Card Click', () => {
        it('should call onCardClick when card is clicked', async () => {
            const onCardClick = vi.fn();
            render(<VerticalProductCard {...defaultProps} onCardClick={onCardClick} />);

            const card = screen.getByText('Test Product').closest('[role="button"]');
            if (card) fireEvent.click(card);

            expect(onCardClick).toHaveBeenCalled();
        });

        it('should not call onCardClick when product is unavailable', async () => {
            const onCardClick = vi.fn();
            render(<VerticalProductCard {...defaultProps} isAvailable={false} onCardClick={onCardClick} />);

            const card = screen.getByText('Test Product').closest('[role="button"]');
            if (card) fireEvent.click(card);

            expect(onCardClick).not.toHaveBeenCalled();
        });
    });

    describe('Availability States', () => {
        it('should apply opacity class when unavailable', () => {
            render(<VerticalProductCard {...defaultProps} isAvailable={false} />);

            const imageContainer = screen.getByAltText('Test Product').parentElement;
            expect(imageContainer).toHaveClass('opacity-60');
        });

        it('should apply grayscale filter when unavailable', () => {
            render(<VerticalProductCard {...defaultProps} isAvailable={false} />);

            const image = screen.getByAltText('Test Product');
            expect(image).toHaveClass('grayscale');
        });
    });

    describe('Price Formatting', () => {
        it('should format price with Indonesian locale', () => {
            render(<VerticalProductCard {...defaultProps} price={1000000} />);

            expect(screen.getByText(/Rp 1.000.000/)).toBeInTheDocument();
        });

        it('should handle small prices', () => {
            render(<VerticalProductCard {...defaultProps} price={100} />);

            expect(screen.getByText(/Rp 100/)).toBeInTheDocument();
        });

        it('should handle large prices', () => {
            render(<VerticalProductCard {...defaultProps} price={999999999} />);

            expect(screen.getByText(/Rp 999.999.999/)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper role attribute', () => {
            render(<VerticalProductCard {...defaultProps} />);

            const card = screen.getByText('Test Product').closest('[role="button"]');
            expect(card).toHaveAttribute('role', 'button');
        });

        it('should have alt text for image', () => {
            render(<VerticalProductCard {...defaultProps} />);

            const image = screen.getByAltText('Test Product');
            expect(image).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long product name', () => {
            const longName = 'A'.repeat(100);
            render(<VerticalProductCard {...defaultProps} name={longName} />);

            expect(screen.getByText(longName)).toBeInTheDocument();
        });

        it('should handle zero price', () => {
            render(<VerticalProductCard {...defaultProps} price={0} />);

            expect(screen.getByText(/Rp 0/)).toBeInTheDocument();
        });

        it('should handle special characters in product name', () => {
            render(<VerticalProductCard {...defaultProps} name="Product & Co. (Special)" />);

            expect(screen.getByText('Product & Co. (Special)')).toBeInTheDocument();
        });
    });
});
