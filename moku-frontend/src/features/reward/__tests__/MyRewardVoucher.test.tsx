import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { useQueryUserVouchers } from '@/features/vouchers/hooks/api/useQueryVocher';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import MyRewardVoucher from '../pages/MyRewardVoucher';
import type { ReactNode } from 'react';
import './setup';

// Mock dependencies
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('@/features/outlets/stores/useOutletStore');
vi.mock('@/features/vouchers/hooks/api/useQueryVocher');

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

vi.mock('@/features/vouchers/components/VoucherListSection', () => ({
    VoucherListSection: ({ title, totalItems, vouchers }: any) => (
        <div data-testid="voucher-list-section">
            <h3>{title}</h3>
            <span>Total: {totalItems}</span>
            {vouchers.map((v: any) => (
                <div key={v.voucherId} data-testid="voucher-item">
                    {v.title}
                </div>
            ))}
        </div>
    ),
}));

vi.mock('@/components/skeletons', () => ({
    SkeltonReward: () => <div data-testid="skeleton-reward">Loading...</div>,
}));

describe('MyRewardVoucher', () => {
    let queryClient: QueryClient;
    const mockNavigateToRewardPoin = vi.fn();

    const mockVouchersData = {
        status: 'success',
        message: 'Success',
        data: {
            user_vouchers: [
                {
                    id: 1,
                    name: 'Discount 10%',
                    description: 'Get 10% off',
                    start_date: '2026-01-01',
                    end_date: '2026-12-31',
                    discount_percent: 10,
                    discount_fixed: null,
                    min_transaction: 50000,
                    max_usage: 10,
                },
                {
                    id: 2,
                    name: 'Free Coffee',
                    description: 'Get a free coffee',
                    start_date: '2026-01-01',
                    end_date: '2026-06-30',
                    discount_percent: null,
                    discount_fixed: 25000,
                    min_transaction: 0,
                    max_usage: 1,
                },
            ],
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
        } as any);

        // Mock useOutletStore
        vi.mocked(useOutletStore).mockReturnValue({
            currentOutlet: { slug: 'test-outlet', name: 'Test Outlet' },
        } as any);

        // Mock useQueryUserVouchers
        vi.mocked(useQueryUserVouchers).mockReturnValue({
            data: mockVouchersData,
            isLoading: false,
            error: null,
        } as any);
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    describe('Loading State', () => {
        it('should show loading skeleton when data is loading', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByTestId('skeleton-reward')).toBeInTheDocument();
        });

        it('should show header during loading', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Reward Voucher Saya')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message when there is an error', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to load'),
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Failed to load vouchers')).toBeInTheDocument();
        });

        it('should show header in error state', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to load'),
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Reward Voucher Saya')).toBeInTheDocument();
        });
    });

    describe('Success State - Rendering', () => {
        it('should render header bar with correct title', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Reward Voucher Saya')).toBeInTheDocument();
        });

        it('should render voucher list section', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByTestId('voucher-list-section')).toBeInTheDocument();
        });

        it('should render correct number of vouchers', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Total: 2')).toBeInTheDocument();
        });

        it('should render voucher titles', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Discount 10%')).toBeInTheDocument();
            expect(screen.getByText('Free Coffee')).toBeInTheDocument();
        });

        it('should render section title', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Voucher Saya')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty message when no vouchers', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        user_vouchers: [],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('No vouchers available')).toBeInTheDocument();
        });

        it('should show header in empty state', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        user_vouchers: [],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Reward Voucher Saya')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should navigate back to reward page when back button is clicked', () => {
            render(<MyRewardVoucher />, { wrapper });

            const backButton = screen.getByText('Back');
            fireEvent.click(backButton);

            expect(mockNavigateToRewardPoin).toHaveBeenCalledTimes(1);
        });
    });

    describe('Data Transformation', () => {
        it('should transform vouchers with all fields', () => {
            render(<MyRewardVoucher />, { wrapper });

            const voucherItems = screen.getAllByTestId('voucher-item');
            expect(voucherItems).toHaveLength(2);
        });

        it('should handle vouchers with discount percent', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Discount 10%')).toBeInTheDocument();
        });

        it('should handle vouchers with discount fixed', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Free Coffee')).toBeInTheDocument();
        });

        it('should handle vouchers without description', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        user_vouchers: [
                            {
                                id: 1,
                                name: 'No Description',
                                description: null,
                                start_date: '2026-01-01',
                                end_date: '2026-12-31',
                                discount_percent: 10,
                                min_transaction: 0,
                                max_usage: 10,
                            },
                        ],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('No Description')).toBeInTheDocument();
        });

        it('should handle vouchers without min_transaction', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        user_vouchers: [
                            {
                                id: 1,
                                name: 'No Min Transaction',
                                description: 'Test',
                                start_date: '2026-01-01',
                                end_date: '2026-12-31',
                                discount_percent: 10,
                                min_transaction: null,
                                max_usage: 10,
                            },
                        ],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('No Min Transaction')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null data', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('No vouchers available')).toBeInTheDocument();
        });

        it('should handle undefined user_vouchers', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        user_vouchers: undefined,
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('No vouchers available')).toBeInTheDocument();
        });

        it('should handle missing outlet slug', () => {
            vi.mocked(useOutletStore).mockReturnValue({
                currentOutlet: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByTestId('skeleton-reward')).toBeInTheDocument();
        });

        it('should handle vouchers with missing optional fields', () => {
            vi.mocked(useQueryUserVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        user_vouchers: [
                            {
                                id: 1,
                                name: 'Minimal Voucher',
                                start_date: '2026-01-01',
                                end_date: '2026-12-31',
                            },
                        ],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByText('Minimal Voucher')).toBeInTheDocument();
        });
    });

    describe('Query Configuration', () => {
        it('should only fetch when outlet slug is available', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(useQueryUserVouchers).toHaveBeenCalledWith(
                'test-outlet',
                expect.objectContaining({
                    enabled: true,
                })
            );
        });

        it('should not fetch when outlet slug is missing', () => {
            vi.mocked(useOutletStore).mockReturnValue({
                currentOutlet: null,
            } as any);

            render(<MyRewardVoucher />, { wrapper });

            expect(useQueryUserVouchers).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    enabled: false,
                })
            );
        });
    });

    describe('Component Structure', () => {
        it('should wrap content in ScreenWrapper', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByTestId('screen-wrapper')).toBeInTheDocument();
        });

        it('should render header bar', () => {
            render(<MyRewardVoucher />, { wrapper });

            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
        });

        it('should have proper layout structure', () => {
            const { container } = render(<MyRewardVoucher />, { wrapper });

            expect(container.querySelector('[data-testid="screen-wrapper"]')).toBeInTheDocument();
            expect(container.querySelector('[data-testid="header-bar"]')).toBeInTheDocument();
        });
    });
});
