import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Favorite from '../pages/Favorite';
import { useFavorites } from '../hooks/useFavorites';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { useToggleLikeMutation } from '@/features/storefront/hooks/api/useMutationLike';

// Mock dependencies
vi.mock('../hooks/useFavorites');
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('@/features/outlets/stores/useOutletStore');
vi.mock('@/features/storefront/hooks/api/useMutationLike');

// Mock components
vi.mock('@/components', () => ({
    HeaderBar: ({ title, onBack }: any) => (
        <div data-testid="header-bar">
            <span>{title}</span>
            <button onClick={onBack}>Back</button>
        </div>
    ),
    ScreenWrapper: ({ children }: any) => <div data-testid="screen-wrapper">{children}</div>,
}));

vi.mock('@/features/storefront/components/ProductItem', () => ({
    ProductCard: ({ name, price, onToggleFavorite }: any) => (
        <div data-testid="product-card">
            <span>{name}</span>
            <span>{price}</span>
            <button onClick={onToggleFavorite}>Toggle Favorite</button>
        </div>
    ),
}));

describe('Favorite Page', () => {
    const mockFavorites = [
        { id: '1', name: 'Favorite 1', price: 50000, image: 'img1.jpg' },
        { id: '2', name: 'Favorite 2', price: 60000, image: 'img2.jpg' },
    ];

    const mockNavigateToHome = vi.fn();
    const mockMutate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock useFavorites
        vi.mocked(useFavorites).mockReturnValue({
            items: mockFavorites,
            isFavorite: vi.fn().mockReturnValue(true),
            addFavorite: vi.fn(),
            removeFavorite: vi.fn(),
            clearFavorites: vi.fn(),
            getFavoriteCount: vi.fn().mockReturnValue(mockFavorites.length),
        } as any);

        // Mock useOutletNavigation
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToHome: mockNavigateToHome,
        } as any);

        // Mock useOutletStore
        vi.mocked(useOutletStore).mockReturnValue({
            outletSlug: 'test-outlet',
        } as any);

        // Mock useToggleLikeMutation
        vi.mocked(useToggleLikeMutation).mockReturnValue({
            mutate: mockMutate,
        } as any);
    });

    describe('Rendering', () => {
        it('should render favorite page', () => {
            render(<Favorite />);

            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
            expect(screen.getByText('Favorite')).toBeInTheDocument();
        });

        it('should display favorites', () => {
            render(<Favorite />);

            const cards = screen.getAllByTestId('product-card');
            expect(cards).toHaveLength(2);
            expect(screen.getByText('Favorite 1')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should display empty state when no favorites', () => {
            vi.mocked(useFavorites).mockReturnValue({
                items: [],
                isFavorite: vi.fn(),
                addFavorite: vi.fn(),
                removeFavorite: vi.fn(),
                clearFavorites: vi.fn(),
                getFavoriteCount: vi.fn().mockReturnValue(0),
            } as any);

            render(<Favorite />);

            expect(screen.getByText('No favorite products yet')).toBeInTheDocument();
        });
    });

    describe('Favorite Management', () => {
        it('should call navigateToHome when back button is clicked', () => {
            render(<Favorite />);

            const backButton = screen.getByText('Back');
            backButton.click();

            expect(mockNavigateToHome).toHaveBeenCalled();
        });

        it('should remove favorite and call mutation when toggled', () => {
            const mockRemoveFavorite = vi.fn();
            vi.mocked(useFavorites).mockReturnValue({
                items: mockFavorites,
                isFavorite: vi.fn().mockReturnValue(true),
                addFavorite: vi.fn(),
                removeFavorite: mockRemoveFavorite,
                clearFavorites: vi.fn(),
                getFavoriteCount: vi.fn().mockReturnValue(mockFavorites.length),
            } as any);

            render(<Favorite />);

            const toggleButtons = screen.getAllByText('Toggle Favorite');
            toggleButtons[0].click();

            expect(mockRemoveFavorite).toHaveBeenCalledWith('1');
            expect(mockMutate).toHaveBeenCalledWith(
                { outletSlug: 'test-outlet', uuidProduct: '1' },
                expect.any(Object)
            );
        });
    });
});
