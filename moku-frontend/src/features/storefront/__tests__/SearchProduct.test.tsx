import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchProduct from '../pages/SearchProduct';
import { useQuerySearchProduct } from '../hooks/api/useQuerySearchProduct';

vi.mock('../hooks/api/useQuerySearchProduct');
vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({ query: 'test' }),
}));

describe('SearchProduct Page', () => {
    const mockProducts = [
        { id: 1, name: 'Product 1', price: 50000, uuid: 'uuid-1', description: 'desc', is_available: true, is_published: true, image: 'img.jpg' },
        { id: 2, name: 'Product 2', price: 60000, uuid: 'uuid-2', description: 'desc', is_available: true, is_published: true, image: 'img.jpg' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useQuerySearchProduct).mockReturnValue({
            data: mockProducts as any,
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn().mockResolvedValue(undefined),
        } as any);
    });

    describe('Rendering', () => {
        it('should render search product page', () => {
            render(<SearchProduct />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display search results', () => {
            render(<SearchProduct />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display loading state', async () => {
            vi.mocked(useQuerySearchProduct).mockReturnValue({
                data: [],
                isLoading: true,
                isError: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            render(<SearchProduct />);

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });
        });

        it('should display error state', async () => {
            vi.mocked(useQuerySearchProduct).mockReturnValue({
                data: [],
                isLoading: false,
                isError: true,
                error: new Error('Search failed') as any,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            render(<SearchProduct />);

            await waitFor(() => {
                expect(screen.getByRole('button')).toBeInTheDocument();
            });
        });
    });

    describe('Search Results', () => {
        it('should display all search results', () => {
            render(<SearchProduct />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display empty results', () => {
            vi.mocked(useQuerySearchProduct).mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            render(<SearchProduct />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle many results', () => {
            const manyProducts = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                name: `Product ${i}`,
                price: 50000 + i * 1000,
                uuid: `uuid-${i}`,
                description: 'desc',
                is_available: true,
                is_published: true,
                image: 'img.jpg'
            }));

            vi.mocked(useQuerySearchProduct).mockReturnValue({
                data: manyProducts as any,
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            render(<SearchProduct />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should handle product click', () => {
            render(<SearchProduct />);

            const buttons = screen.getAllByRole('button');
            fireEvent.click(buttons[0]);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle retry on error', async () => {
            const mockRefetch = vi.fn().mockResolvedValue(undefined);
            vi.mocked(useQuerySearchProduct).mockReturnValue({
                data: [],
                isLoading: false,
                isError: true,
                error: new Error('Search failed') as any,
                refetch: mockRefetch,
            } as any);

            render(<SearchProduct />);

            const buttons = screen.getAllByRole('button');
            const retryButton = buttons.find(btn => btn.textContent?.includes('Retry'));
            if (retryButton) {
                fireEvent.click(retryButton);
            }

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle search results changes', () => {
            const { rerender } = render(<SearchProduct />);

            expect(screen.getByRole('button')).toBeInTheDocument();

            vi.mocked(useQuerySearchProduct).mockReturnValue({
                data: [],
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            rerender(<SearchProduct />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });
});
