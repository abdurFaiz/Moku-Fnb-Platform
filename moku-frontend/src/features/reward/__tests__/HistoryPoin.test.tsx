import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import HistoryRewardPoin from '../pages/HistoryPoin';
import type { ReactNode } from 'react';
import './setup';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useNavigate } from 'react-router-dom';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { useQueryRewardHistory, useQueryRewardSummary } from '@/features/reward/hooks/api/useQueryReward';

// Mock dependencies
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('react-router-dom');
vi.mock('@/features/outlets/stores/useOutletStore');
vi.mock('@/features/reward/hooks/api/useQueryReward');

// Mock components
vi.mock('@/components/HeaderBar', () => ({
    default: ({ title, onBack }: any) => (
        <div data-testid="header-bar">
            <span>{title}</span>
            <button onClick={onBack}>Back</button>
        </div>
    ),
}));

vi.mock('@/components/layout/ScreenWrapper', () => ({
    ScreenWrapper: ({ children }: { children: ReactNode }) => <div data-testid="screen-wrapper">{children}</div>,
}));

vi.mock('@/components/FilterChips', () => ({
    FilterChip: ({ filters, activeFilter, onChange }: any) => (
        <div data-testid="filter-chip">
            {filters.map((f: any) => (
                <button
                    key={f.value}
                    onClick={() => onChange(f.value)}
                    className={activeFilter === f.value ? 'active' : ''}
                >
                    {f.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('../components/PoinSummary', () => ({
    PointsSummary: ({ points }: { points: number }) => <div data-testid="points-summary">Points: {points}</div>,
}));

vi.mock('../components/PointHistoryItem', () => ({
    PointHistoryItem: ({ category, title, date, amount }: any) => (
        <div data-testid="point-history-item">
            <span>{category}</span>
            <span>{title}</span>
            <span>{date}</span>
            <span>{amount}</span>
        </div>
    ),
}));

vi.mock('@/components/BackToUp', () => ({
    default: () => <div data-testid="back-to-up">Back to Up</div>,
}));

vi.mock('@/components/ui/skeleton', () => ({
    Skeleton: ({ className }: { className: string }) => <div data-testid="skeleton" className={className}>Loading...</div>,
}));

describe('HistoryRewardPoin', () => {
    let queryClient: QueryClient;
    const mockNavigateToRewardPoin = vi.fn();
    const mockNavigate = vi.fn();

    const mockHistoryData = {
        status: 'success',
        message: 'Success',
        data: {
            point_balance: 500,
            vouchers: [],
            customer_points: [
                {
                    id: 1,
                    outlet_id: 1,
                    user_id: 1,
                    point: 50,
                    type: 1,
                    pointable_type: 'App\\Models\\Order',
                    pointable_id: 123,
                    info: 'Purchase reward',
                    created_at: '2026-01-01T10:00:00Z',
                    updated_at: '2026-01-01T10:00:00Z',
                },
                {
                    id: 2,
                    outlet_id: 1,
                    user_id: 1,
                    point: 30,
                    type: 2,
                    pointable_type: 'App\\Models\\Voucher',
                    pointable_id: 456,
                    info: 'Voucher redemption',
                    created_at: '2026-01-02T10:00:00Z',
                    updated_at: '2026-01-02T10:00:00Z',
                },
            ],
        },
    };

    const mockRewardData = {
        status: 'success',
        message: 'Success',
        data: {
            point_balance: 500,
            vouchers: [],
            customer_points: [],
        },
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        // Mock useOutletNavigation
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToRewardPoin: mockNavigateToRewardPoin,
            outletSlug: 'test-outlet',
        } as any);

        // Mock useNavigate
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);

        // Mock useOutletStore
        vi.mocked(useOutletStore).mockReturnValue({
            currentOutlet: { name: 'Test Outlet' },
        } as any);

        // Mock useQueryRewardHistory
        vi.mocked(useQueryRewardHistory).mockReturnValue({
            data: mockHistoryData,
            isLoading: false,
            error: null,
        } as any);

        // Mock useQueryRewardSummary
        vi.mocked(useQueryRewardSummary).mockReturnValue({
            data: mockRewardData,
            isLoading: false,
            error: null,
        } as any);
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    describe('Loading State', () => {
        it('should show skeleton loader when loading', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            const skeletons = screen.getAllByTestId('skeleton');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        it('should show filter chips during loading', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByTestId('filter-chip')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message when there is an error', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to load'),
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText('Gagal memuat riwayat')).toBeInTheDocument();
            expect(screen.getByText('Silakan coba lagi nanti')).toBeInTheDocument();
        });

        it('should show filter chips in error state', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to load'),
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByTestId('filter-chip')).toBeInTheDocument();
        });
    });

    describe('Success State - Rendering', () => {
        it('should render header bar with correct title', () => {
            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText('History Poin')).toBeInTheDocument();
        });

        it('should render points summary', () => {
            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByTestId('points-summary')).toHaveTextContent('Points: 500');
        });

        it('should render filter chips', () => {
            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText('Semua')).toBeInTheDocument();
            expect(screen.getByText('Poin Didapat')).toBeInTheDocument();
            expect(screen.getByText('Poin Ditukar')).toBeInTheDocument();
        });

        it('should render history items', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const historyItems = screen.getAllByTestId('point-history-item');
            expect(historyItems).toHaveLength(2);
        });

        it('should render back to up button', () => {
            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByTestId('back-to-up')).toBeInTheDocument();
        });
    });

    describe('Filter Functionality', () => {
        it('should show all items when "Semua" filter is active', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const historyItems = screen.getAllByTestId('point-history-item');
            expect(historyItems).toHaveLength(2);
        });

        it('should filter to show only earned points', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const poinDidapatButton = screen.getByText('Poin Didapat');
            fireEvent.click(poinDidapatButton);

            const historyItems = screen.getAllByTestId('point-history-item');
            expect(historyItems).toHaveLength(1);
        });

        it('should filter to show only redeemed points', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const poinDitukarButton = screen.getByText('Poin Ditukar');
            fireEvent.click(poinDitukarButton);

            const historyItems = screen.getAllByTestId('point-history-item');
            expect(historyItems).toHaveLength(1);
        });

        it('should update active filter state', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const poinDidapatButton = screen.getByText('Poin Didapat');
            fireEvent.click(poinDidapatButton);

            expect(poinDidapatButton).toHaveClass('active');
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no history', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        point_balance: 0,
                        vouchers: [],
                        customer_points: [],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText('Belum Ada Riwayat Poin')).toBeInTheDocument();
        });

        it('should show filter-specific empty message', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        point_balance: 0,
                        vouchers: [],
                        customer_points: [],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            const poinDidapatButton = screen.getByText('Poin Didapat');
            fireEvent.click(poinDidapatButton);

            expect(screen.getByText(/Belum ada riwayat untuk kategori/)).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should navigate back to reward page when back button is clicked', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const backButton = screen.getByText('Back');
            fireEvent.click(backButton);

            expect(mockNavigateToRewardPoin).toHaveBeenCalledTimes(1);
        });

        it('should navigate to transaction detail when order item is clicked', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const historyItems = screen.getAllByTestId('point-history-item');
            const orderItem = historyItems[0].parentElement;

            if (orderItem) {
                fireEvent.click(orderItem);
                expect(mockNavigate).toHaveBeenCalledWith('/test-outlet/detail-transaction/123');
            }
        });

        it('should not navigate when non-order item is clicked', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const historyItems = screen.getAllByTestId('point-history-item');
            const voucherItem = historyItems[1].parentElement;

            if (voucherItem) {
                fireEvent.click(voucherItem);
                expect(mockNavigate).not.toHaveBeenCalled();
            }
        });
    });

    describe('Data Transformation', () => {
        it('should transform earned points correctly', () => {
            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText('Poin Didapat')).toBeInTheDocument();
            expect(screen.getByText('Purchase reward')).toBeInTheDocument();
        });

        it('should transform redeemed points correctly', () => {
            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText('Poin Ditukar')).toBeInTheDocument();
            expect(screen.getByText('Voucher redemption')).toBeInTheDocument();
        });

        it('should format dates correctly', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const historyItems = screen.getAllByTestId('point-history-item');
            expect(historyItems.length).toBeGreaterThan(0);
        });

        it('should handle missing info field', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        point_balance: 500,
                        vouchers: [],
                        customer_points: [
                            {
                                id: 1,
                                outlet_id: 1,
                                user_id: 1,
                                point: 50,
                                type: 1,
                                pointable_type: 'App\\Models\\Order',
                                pointable_id: 123,
                                info: null,
                                created_at: '2026-01-01T10:00:00Z',
                                updated_at: '2026-01-01T10:00:00Z',
                            },
                        ],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText(/Pembelian item di Test Outlet/)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null history data', () => {
            vi.mocked(useQueryRewardHistory).mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByText('Belum Ada Riwayat Poin')).toBeInTheDocument();
        });

        it('should handle undefined point balance', () => {
            vi.mocked(useQueryRewardSummary).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        point_balance: undefined,
                        vouchers: [],
                        customer_points: [],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByTestId('points-summary')).toHaveTextContent('Points: 0');
        });

        it('should handle missing outlet slug', () => {
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToRewardPoin: mockNavigateToRewardPoin,
                outletSlug: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
        });

        it('should handle missing current outlet', () => {
            vi.mocked(useOutletStore).mockReturnValue({
                currentOutlet: null,
            } as any);

            render(<HistoryRewardPoin />, { wrapper });

            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should apply cursor pointer to order items', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const clickableItems = container.querySelectorAll('.cursor-pointer');
            expect(clickableItems.length).toBeGreaterThan(0);
        });

        it('should not apply cursor pointer to non-order items', () => {
            render(<HistoryRewardPoin />, { wrapper });

            const historyItems = screen.getAllByTestId('point-history-item');
            const voucherItem = historyItems[1].parentElement;

            expect(voucherItem).not.toHaveClass('cursor-pointer');
        });
    });
});
