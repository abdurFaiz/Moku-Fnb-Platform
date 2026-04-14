import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Recommend from '../pages/Recommend';

vi.mock('react-router-dom', () => ({
    useNavigate: () => vi.fn(),
    useParams: () => ({}),
}));

vi.mock('@/features/storefront/hooks/useHomePage', () => ({
    useHomePage: () => ({
        isLoading: false,
        error: null,
        data: {},
    }),
}));

describe('Recommend Page', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
    });

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <QueryClientProvider client={queryClient}>
                {component}
            </QueryClientProvider>
        );
    };

    describe('Rendering', () => {
        it('should render recommend page', () => {
            renderWithProviders(<Recommend />);

            expect(screen.queryByRole('button')).toBeInTheDocument();
        });

        it('should display recommendations', async () => {
            renderWithProviders(<Recommend />);

            await waitFor(() => {
                expect(screen.queryByRole('button')).toBeInTheDocument();
            });
        });
    });

    describe('Content Display', () => {
        it('should display page content', () => {
            renderWithProviders(<Recommend />);

            expect(screen.queryByRole('button')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle re-renders', () => {
            const { rerender } = renderWithProviders(<Recommend />);

            expect(screen.queryByRole('button')).toBeInTheDocument();

            rerender(
                <QueryClientProvider client={queryClient}>
                    <Recommend />
                </QueryClientProvider>
            );

            expect(screen.queryByRole('button')).toBeInTheDocument();
        });
    });
});
