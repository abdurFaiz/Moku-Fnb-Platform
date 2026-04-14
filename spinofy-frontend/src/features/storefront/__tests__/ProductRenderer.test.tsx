import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductRenderer from '../components/ProductRenderer';

describe('ProductRenderer', () => {
    const mockProduct = {
        id: '1',
        name: 'Test Product',
        price: 50000,
        image: 'https://example.com/product.jpg',
        description: 'Test Description',
        isAvailable: true,
        isPublished: true,
    };

    const defaultProps = {
        products: [mockProduct],
        onProductClick: vi.fn(),
        onTambahClick: vi.fn(),
        onIncrement: vi.fn(),
        onDecrement: vi.fn(),
        getCartQuantity: vi.fn().mockReturnValue(0),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render product list', () => {
            render(<ProductRenderer {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        it('should display product price', () => {
            render(<ProductRenderer {...defaultProps} />);

            expect(screen.getByText(/50.000/)).toBeInTheDocument();
        });

        it('should display product image', () => {
            render(<ProductRenderer {...defaultProps} />);

            const img = screen.getByRole('img');
            expect(img).toBeInTheDocument();
        });

        it('should display product description when enabled', () => {
            render(<ProductRenderer {...defaultProps} showDescription={true} />);

            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onProductClick when product is clicked', () => {
            const onProductClick = vi.fn();
            render(<ProductRenderer {...defaultProps} onProductClick={onProductClick} />);

            // Click somewhere on the card
            const cardName = screen.getByText('Test Product');
            fireEvent.click(cardName);

            expect(onProductClick).toHaveBeenCalledWith('1');
        });

        it('should call onTambahClick when add button is clicked', () => {
            const onTambahClick = vi.fn();
            render(<ProductRenderer {...defaultProps} onTambahClick={onTambahClick} />);

            const addButton = screen.getByText('Tambah');
            fireEvent.click(addButton);

            expect(onTambahClick).toHaveBeenCalledWith('1');
        });
    });

    describe('Cart Quantity', () => {
        it('should display cart quantity', () => {
            const getCartQuantity = vi.fn().mockReturnValue(3);
            render(<ProductRenderer {...defaultProps} getCartQuantity={getCartQuantity} />);

            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('should display Add button when quantity is zero', () => {
            const getCartQuantity = vi.fn().mockReturnValue(0);
            render(<ProductRenderer {...defaultProps} getCartQuantity={getCartQuantity} />);

            expect(screen.getByText('Tambah')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should render empty state when no products', () => {
            render(<ProductRenderer {...defaultProps} products={[]} />);

            expect(screen.getByText('No products available')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should update when products change', () => {
            const { rerender } = render(<ProductRenderer {...defaultProps} />);

            expect(screen.getByText('Test Product')).toBeInTheDocument();

            const newProduct = { ...mockProduct, id: '2', name: 'New Product' };
            rerender(<ProductRenderer {...defaultProps} products={[newProduct]} />);

            expect(screen.getByText('New Product')).toBeInTheDocument();
        });
    });
});
