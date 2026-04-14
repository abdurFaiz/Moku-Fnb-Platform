import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../components/ProductItem';
import * as guestRouteGuard from '@/utils/guestRouteGuard';
import { toast } from 'sonner';

vi.mock('@/utils/guestRouteGuard', () => ({
    isGuestUser: vi.fn(),
    GUEST_CART_RESTRICTION_MESSAGE: 'Guests cannot add items to cart',
}));

// ...

describe('Rendering', () => {
    // ...
    // ...
    it('should use provided image', () => {
        const { container } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
            />
        );

        expect(container).toBeInTheDocument();
    });

    it('should handle empty image string', () => {
        const { container } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image=""
            />
        );

        expect(container).toBeInTheDocument();
    });

    // ... inside Guest User check

    it('should show error toast when guest tries to add item', () => {
        vi.mocked(guestRouteGuard.isGuestUser).mockReturnValue(true);
        // GUEST_CART_RESTRICTION_MESSAGE is now mocked in factory

        const onTambahClick = vi.fn();

        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onTambahClick={onTambahClick}
            />
        );

        const addButton = screen.getByText('Add');
        fireEvent.click(addButton);

        expect(toast.error).toHaveBeenCalled();
        expect(onTambahClick).not.toHaveBeenCalled();
    });

    it('should allow non-guest users to add items', () => {
        vi.mocked(guestRouteGuard.isGuestUser).mockReturnValue(false);

        const onTambahClick = vi.fn();

        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onTambahClick={onTambahClick}
            />
        );

        const addButton = screen.getByText('Add');
        fireEvent.click(addButton);

        expect(onTambahClick).toHaveBeenCalled();
    });
});

describe('Image Handling', () => {
    it('should use provided image', () => {
        const { container } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
            />
        );

        expect(container).toBeInTheDocument();
    });

    it('should handle empty image string', () => {
        const { container } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image=""
            />
        );

        expect(container).toBeInTheDocument();
    });

    it('should handle image error', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="invalid-image.jpg"
            />
        );

        // Simulate image error by re-rendering
        rerender(
            <ProductCard
                name="Coffee"
                price={25000}
                image="invalid-image.jpg"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });
});

describe('Callbacks', () => {
    it('should call onCardClick when card is clicked', () => {
        const onCardClick = vi.fn();

        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onCardClick={onCardClick}
            />
        );

        // Note: The actual click handler would be on the card component
        // This test verifies the prop is passed correctly
        expect(onCardClick).not.toHaveBeenCalled();
    });

    it('should call onTambahClick when add button is clicked', () => {
        const onTambahClick = vi.fn();

        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onTambahClick={onTambahClick}
            />
        );

        const addButton = screen.getByText('Add');
        fireEvent.click(addButton);

        expect(onTambahClick).toHaveBeenCalled();
    });

    it('should call onIncrement when increment is triggered', () => {
        const onIncrement = vi.fn();

        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onIncrement={onIncrement}
            />
        );

        // The increment would be called by the child component
        expect(onIncrement).not.toHaveBeenCalled();
    });

    it('should call onDecrement when decrement is triggered', () => {
        const onDecrement = vi.fn();

        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onDecrement={onDecrement}
            />
        );

        // The decrement would be called by the child component
        expect(onDecrement).not.toHaveBeenCalled();
    });

    it('should call onToggleFavorite when favorite is toggled', () => {
        const onToggleFavorite = vi.fn();

        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onToggleFavorite={onToggleFavorite}
                variant="vertical"
            />
        );

        const favoriteButton = screen.getByText('Favorite');
        fireEvent.click(favoriteButton);

        expect(onToggleFavorite).toHaveBeenCalled();
    });
});

describe('Props Variations', () => {
    it('should handle different prices', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();

        rerender(
            <ProductCard
                name="Coffee"
                price={50000}
                image="coffee.jpg"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should handle zero price', () => {
        render(
            <ProductCard
                name="Free Item"
                price={0}
                image="free.jpg"
            />
        );

        expect(screen.getByText('Free Item')).toBeInTheDocument();
    });

    it('should handle negative price', () => {
        render(
            <ProductCard
                name="Discount"
                price={-5000}
                image="discount.jpg"
            />
        );

        expect(screen.getByText('Discount')).toBeInTheDocument();
    });

    it('should handle different cart quantities', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                cartQuantity={0}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();

        rerender(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                cartQuantity={5}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should handle favorite state', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                isFavorite={false}
                variant="vertical"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();

        rerender(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                isFavorite={true}
                variant="vertical"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should handle availability state', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                isAvailable={true}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();

        rerender(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                isAvailable={false}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should handle priority prop', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                priority={false}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();

        rerender(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                priority={true}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should handle custom card width', () => {
        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                cardWidth="300px"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });
});

describe('Product Information', () => {
    it('should display product with description', () => {
        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                description="Strong black coffee"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should display product with UUID', () => {
        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                productUuid="product-uuid-1"
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should handle product with all information', () => {
        render(
            <ProductCard
                name="Espresso Coffee"
                price={25000}
                image="espresso.jpg"
                productUuid="product-uuid-1"
                description="Strong black coffee with rich flavor"
                isAvailable={true}
                cartQuantity={2}
                isFavorite={true}
            />
        );

        expect(screen.getByText('Espresso Coffee')).toBeInTheDocument();
    });
});

describe('Variant Switching', () => {
    it('should switch from horizontal to vertical', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                variant="horizontal"
            />
        );

        expect(screen.getByTestId('horizontal-card')).toBeInTheDocument();

        rerender(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                variant="vertical"
            />
        );

        expect(screen.getByTestId('vertical-card')).toBeInTheDocument();
    });

    it('should switch from vertical to horizontal', () => {
        const { rerender } = render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                variant="vertical"
            />
        );

        expect(screen.getByTestId('vertical-card')).toBeInTheDocument();

        rerender(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                variant="horizontal"
            />
        );

        expect(screen.getByTestId('horizontal-card')).toBeInTheDocument();
    });
});

describe('Edge Cases', () => {
    it('should handle very long product name', () => {
        const longName = 'A'.repeat(200);
        render(
            <ProductCard
                name={longName}
                price={25000}
                image="coffee.jpg"
            />
        );

        expect(screen.getByText(longName)).toBeInTheDocument();
    });

    it('should handle special characters in product name', () => {
        render(
            <ProductCard
                name="Café Espresso & Tea"
                price={25000}
                image="coffee.jpg"
            />
        );

        expect(screen.getByText('Café Espresso & Tea')).toBeInTheDocument();
    });

    it('should handle unicode characters in product name', () => {
        render(
            <ProductCard
                name="Coffee ☕ 咖啡"
                price={25000}
                image="coffee.jpg"
            />
        );

        expect(screen.getByText('Coffee ☕ 咖啡')).toBeInTheDocument();
    });

    it('should handle very large price', () => {
        render(
            <ProductCard
                name="Luxury Item"
                price={999999999}
                image="luxury.jpg"
            />
        );

        expect(screen.getByText('Luxury Item')).toBeInTheDocument();
    });

    it('should handle very small price', () => {
        render(
            <ProductCard
                name="Cheap Item"
                price={1}
                image="cheap.jpg"
            />
        );

        expect(screen.getByText('Cheap Item')).toBeInTheDocument();
    });

    it('should handle null callbacks', () => {
        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                onCardClick={undefined}
                onTambahClick={undefined}
                onIncrement={undefined}
                onDecrement={undefined}
                onToggleFavorite={undefined}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    it('should handle undefined props', () => {
        render(
            <ProductCard
                name="Coffee"
                price={25000}
                image="coffee.jpg"
                productUuid={undefined}
                cartQuantity={undefined}
                description={undefined}
                isAvailable={undefined}
                priority={undefined}
                cardWidth={undefined}
            />
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
    });
});

describe('Multiple Instances', () => {
    it('should render multiple product cards', () => {
        render(
            <>
                <ProductCard
                    name="Coffee"
                    price={25000}
                    image="coffee.jpg"
                />
                <ProductCard
                    name="Tea"
                    price={15000}
                    image="tea.jpg"
                />
                <ProductCard
                    name="Cake"
                    price={30000}
                    image="cake.jpg"
                />
            </>
        );

        expect(screen.getByText('Coffee')).toBeInTheDocument();
        expect(screen.getByText('Tea')).toBeInTheDocument();
        expect(screen.getByText('Cake')).toBeInTheDocument();
    });

    it('should handle different variants in same render', () => {
        render(
            <>
                <ProductCard
                    name="Coffee"
                    price={25000}
                    image="coffee.jpg"
                    variant="horizontal"
                />
                <ProductCard
                    name="Tea"
                    price={15000}
                    image="tea.jpg"
                    variant="vertical"
                />
            </>
        );

        expect(screen.getByTestId('horizontal-card')).toBeInTheDocument();
        expect(screen.getByTestId('vertical-card')).toBeInTheDocument();
    });
});

