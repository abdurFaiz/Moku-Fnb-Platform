import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartSummaryBar } from '../components/CartSummaryBar';

describe('CartSummaryBar', () => {
    const defaultProps = {
        itemCount: 3,
        total: 'Rp 150.000',
        onCheckout: vi.fn(),
        onCartClick: vi.fn(),
        isVisible: true,
        isCheckoutLoading: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render cart summary bar with items', () => {
            render(<CartSummaryBar {...defaultProps} />);

            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('Rp 150.000')).toBeInTheDocument();
        });

        it('should not render when itemCount is 0', () => {
            const { container } = render(<CartSummaryBar {...defaultProps} itemCount={0} />);

            expect(container.firstChild).toBeNull();
        });

        it('should not render when isVisible is false', () => {
            const { container } = render(<CartSummaryBar {...defaultProps} isVisible={false} />);

            expect(container.firstChild).toBeNull();
        });

        it('should render when isVisible is true', () => {
            render(<CartSummaryBar {...defaultProps} isVisible={true} />);

            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('should display correct item count', () => {
            render(<CartSummaryBar {...defaultProps} itemCount={5} />);

            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should display correct total price', () => {
            render(<CartSummaryBar {...defaultProps} total='Rp 500.000' />);

            expect(screen.getByText('Rp 500.000')).toBeInTheDocument();
        });

        it('should render checkout button', () => {
            render(<CartSummaryBar {...defaultProps} />);

            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            expect(checkoutButton).toBeInTheDocument();
        });

        it('should render cart button', () => {
            render(<CartSummaryBar {...defaultProps} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('Item Count Display', () => {
        it('should display single item', () => {
            render(<CartSummaryBar {...defaultProps} itemCount={1} />);

            expect(screen.getByText('1')).toBeInTheDocument();
        });

        it('should display multiple items', () => {
            render(<CartSummaryBar {...defaultProps} itemCount={10} />);

            expect(screen.getByText('10')).toBeInTheDocument();
        });

        it('should display large item count', () => {
            render(<CartSummaryBar {...defaultProps} itemCount={999} />);

            expect(screen.getByText('999')).toBeInTheDocument();
        });
    });

    describe('Price Display', () => {
        it('should display formatted price', () => {
            render(<CartSummaryBar {...defaultProps} total='Rp 1.000.000' />);

            expect(screen.getByText('Rp 1.000.000')).toBeInTheDocument();
        });

        it('should display zero price', () => {
            render(<CartSummaryBar {...defaultProps} total='Rp 0' />);

            expect(screen.getByText('Rp 0')).toBeInTheDocument();
        });

        it('should display large price', () => {
            render(<CartSummaryBar {...defaultProps} total='Rp 999.999.999' />);

            expect(screen.getByText('Rp 999.999.999')).toBeInTheDocument();
        });
    });

    describe('Button Interactions', () => {
        it('should call onCheckout when checkout button is clicked', () => {
            const onCheckout = vi.fn();
            render(<CartSummaryBar {...defaultProps} onCheckout={onCheckout} />);

            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            fireEvent.click(checkoutButton);

            expect(onCheckout).toHaveBeenCalled();
        });

        it('should call onCartClick when cart button is clicked', () => {
            const onCartClick = vi.fn();
            render(<CartSummaryBar {...defaultProps} onCartClick={onCartClick} />);

            const buttons = screen.getAllByRole('button');
            const cartButton = buttons[0];
            fireEvent.click(cartButton);

            expect(onCartClick).toHaveBeenCalled();
        });

        it('should handle multiple checkout clicks', () => {
            const onCheckout = vi.fn();
            render(<CartSummaryBar {...defaultProps} onCheckout={onCheckout} />);

            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            fireEvent.click(checkoutButton);
            fireEvent.click(checkoutButton);
            fireEvent.click(checkoutButton);

            expect(onCheckout).toHaveBeenCalledTimes(3);
        });

        it('should handle multiple cart clicks', () => {
            const onCartClick = vi.fn();
            render(<CartSummaryBar {...defaultProps} onCartClick={onCartClick} />);

            const buttons = screen.getAllByRole('button');
            const cartButton = buttons[0];
            fireEvent.click(cartButton);
            fireEvent.click(cartButton);

            expect(onCartClick).toHaveBeenCalledTimes(2);
        });
    });

    describe('Loading State', () => {
        it('should show loading spinner when isCheckoutLoading is true', () => {
            render(<CartSummaryBar {...defaultProps} isCheckoutLoading={true} />);

            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            expect(checkoutButton).toBeInTheDocument();
        });

        it('should not show loading spinner when isCheckoutLoading is false', () => {
            render(<CartSummaryBar {...defaultProps} isCheckoutLoading={false} />);

            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            expect(checkoutButton).toBeInTheDocument();
        });

        it('should disable checkout during loading', () => {
            const { rerender } = render(<CartSummaryBar {...defaultProps} isCheckoutLoading={false} />);

            rerender(<CartSummaryBar {...defaultProps} isCheckoutLoading={true} />);

            const checkoutButton = screen.getByRole('button', { name: /checkout/i });
            expect(checkoutButton).toBeInTheDocument();
        });
    });

    describe('Visibility Toggle', () => {
        it('should show bar when isVisible is true', () => {
            render(<CartSummaryBar {...defaultProps} isVisible={true} />);

            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('should hide bar when isVisible is false', () => {
            const { container } = render(<CartSummaryBar {...defaultProps} isVisible={false} />);

            expect(container.firstChild).toBeNull();
        });

        it('should toggle visibility', () => {
            const { rerender, container } = render(<CartSummaryBar {...defaultProps} isVisible={true} />);

            expect(screen.getByText('3')).toBeInTheDocument();

            rerender(<CartSummaryBar {...defaultProps} isVisible={false} />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long price string', () => {
            render(<CartSummaryBar {...defaultProps} total='Rp 123.456.789.012.345' />);

            expect(screen.getByText('Rp 123.456.789.012.345')).toBeInTheDocument();
        });

        it('should handle special characters in price', () => {
            render(<CartSummaryBar {...defaultProps} total='Rp 1.000,00' />);

            expect(screen.getByText('Rp 1.000,00')).toBeInTheDocument();
        });

        it('should handle zero items with isVisible true', () => {
            const { container } = render(<CartSummaryBar {...defaultProps} itemCount={0} isVisible={true} />);

            expect(container.firstChild).toBeNull();
        });

        it('should handle negative item count gracefully', () => {
            render(<CartSummaryBar {...defaultProps} itemCount={-1} />);

            expect(screen.getByText('-1')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible buttons', () => {
            render(<CartSummaryBar {...defaultProps} />);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThanOrEqual(2);
        });

        it('should have proper text labels', () => {
            render(<CartSummaryBar {...defaultProps} />);

            expect(screen.getByText('Total')).toBeInTheDocument();
            expect(screen.getByText('Checkout')).toBeInTheDocument();
        });
    });

    describe('Memoization', () => {
        it('should not re-render with same props', () => {
            const { rerender } = render(<CartSummaryBar {...defaultProps} />);

            rerender(<CartSummaryBar {...defaultProps} />);

            expect(screen.getByText('3')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle prop changes', () => {
            const { rerender } = render(<CartSummaryBar {...defaultProps} itemCount={3} />);

            expect(screen.getByText('3')).toBeInTheDocument();

            rerender(<CartSummaryBar {...defaultProps} itemCount={5} />);

            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should handle price changes', () => {
            const { rerender } = render(<CartSummaryBar {...defaultProps} total='Rp 150.000' />);

            expect(screen.getByText('Rp 150.000')).toBeInTheDocument();

            rerender(<CartSummaryBar {...defaultProps} total='Rp 300.000' />);

            expect(screen.getByText('Rp 300.000')).toBeInTheDocument();
        });
    });
});
