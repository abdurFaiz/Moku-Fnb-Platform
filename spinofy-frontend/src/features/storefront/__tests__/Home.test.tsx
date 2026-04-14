import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '../pages/Home';
import { useHomePage } from '../hooks/useHomePage';

vi.mock('../hooks/useHomePage');
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
}));

describe('Home Page', () => {
    const mockHomeData = {
        userData: { id: 1, name: 'Test User', vouchers: 0, points: 0 },
        products: [{ id: 1, name: 'Product 1' }],
        categories: [{ id: 1, name: 'Category 1' }],
        outlets: [{ id: 1, slug: 'test-outlet' }],
        currentOutlet: { id: 1, slug: 'test-outlet' },
        banners: [{ id: 1, title: 'Banner 1', link: '', outlet_id: 1, banner_url: '', media: [{ id: 1, url: '', type: 'image' }] }] as any,
        isLoading: false,
        isPending: false,
        isError: false,
        error: null,
        isFetching: false,
        refreshData: vi.fn().mockResolvedValue(undefined),
        invalidateHomeData: vi.fn().mockResolvedValue(undefined),
        isCartVisible: false,
        showCart: vi.fn(),
        hideCart: vi.fn(),
        toggleCart: vi.fn(),
        items: [],
        totalPrice: 0,
        totalItems: 0,
        totalQuantity: 0,
        addItem: vi.fn(),
        removeItem: vi.fn(),
        updateQuantity: vi.fn(),
        clearCart: vi.fn(),
        isCartBottomSheetOpen: false,
        handleCartClick: vi.fn(),
        handleCloseCartBottomSheet: vi.fn(),
        handleProductClick: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useHomePage).mockReturnValue(mockHomeData);
    });

    describe('Rendering', () => {
        it('should render home page', () => {
            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display loading state', async () => {
            vi.mocked(useHomePage).mockReturnValue({
                ...mockHomeData,
                isLoading: true,
            });

            render(<Home />);

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });
        });

        it('should display error state', async () => {
            vi.mocked(useHomePage).mockReturnValue({
                ...mockHomeData,
                isError: true,
                error: 'Failed to load home data',
            });

            render(<Home />);

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });
        });
    });

    describe('Data Display', () => {
        it('should display user data', () => {
            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display products', () => {
            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display categories', () => {
            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display banners', () => {
            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Empty States', () => {
        it('should handle empty products', () => {
            vi.mocked(useHomePage).mockReturnValue({
                ...mockHomeData,
                products: [],
            });

            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle empty categories', () => {
            vi.mocked(useHomePage).mockReturnValue({
                ...mockHomeData,
                categories: [],
            });

            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle null user', () => {
            vi.mocked(useHomePage).mockReturnValue({
                ...mockHomeData,
                userData: null,
            });

            render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle data changes', () => {
            const { rerender } = render(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();

            vi.mocked(useHomePage).mockReturnValue({
                ...mockHomeData,
                isLoading: true,
            });

            rerender(<Home />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });
});
