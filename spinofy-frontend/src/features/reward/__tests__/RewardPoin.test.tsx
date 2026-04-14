import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useQueryRewardSummary } from '@/features/reward/hooks/api/useQueryReward';
import { useQueryRewardVouchers } from '@/features/vouchers/hooks/api/useQueryVocher';
import { useClaimVoucherPointMutation } from '@/features/vouchers/hooks/api/useMutationVoucher';
import { useVoucherStore } from '@/features/vouchers/stores/voucherStore';
import { useCartStore } from '@/features/cart/stores/cartStore';
import { toast } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import RewardPoin from '../pages/RewardPoin';
import type { ReactNode } from 'react';
import './setup';

// Mock dependencies
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('@/features/reward/hooks/api/useQueryReward');
vi.mock('@/features/vouchers/hooks/api/useQueryVocher');
vi.mock('@/features/vouchers/hooks/api/useMutationVoucher');
vi.mock('@/features/vouchers/stores/voucherStore');
vi.mock('@/features/cart/stores/cartStore');
vi.mock('sonner');

// ... (keep mock components as is)

// ...


// Mock components
vi.mock('@/components/HeaderBar', () => ({
    default: ({ title, onBack, onHistory }: any) => (
        <div data-testid="header-bar">
            <span>{title}</span>
            <button onClick={onBack}>Back</button>
            <button onClick={onHistory}>History</button>
        </div>
    ),
}));

vi.mock('@/components/layout/ScreenWrapper', () => ({
    ScreenWrapper: ({ children }: { children: ReactNode }) => <div data-testid="screen-wrapper">{children}</div>,
}));

vi.mock('../components/PoinSummary', () => ({
    PointsSummary: ({ points }: { points: number }) => <div data-testid="points-summary">Points: {points}</div>,
}));

vi.mock('../components/RewardVoucherCard', () => ({
    default: () => <div data-testid="reward-voucher-card">Reward Voucher Card</div>,
}));

vi.mock('@/features/vouchers/components/VoucherListSection', () => ({
    VoucherListSection: ({ title, vouchers, onVoucherClick }: any) => (
        <div data-testid="voucher-list-section">
            <h3>{title}</h3>
            {vouchers.map((v: any) => (
                <button key={v.voucherId} onClick={() => onVoucherClick(v)}>
                    {v.title}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('@/components/ProductListSection', () => ({
    ProductListSection: ({ title, products, onProductClick }: any) => (
        <div data-testid="product-list-section">
            <h3>{title}</h3>
            {products.map((p: any) => (
                <button key={p.voucherId} onClick={() => onProductClick(p)}>
                    {p.name}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('../components/EmptyVouchersState', () => ({
    EmptyVouchersState: () => <div data-testid="empty-vouchers-state">No vouchers available</div>,
}));

vi.mock('@/components/Separator', () => ({
    Separator: () => <div data-testid="separator">---</div>,
}));

vi.mock('@/components/skeletons', () => ({
    SkeltonReward: () => <div data-testid="skeleton-reward">Loading...</div>,
}));

vi.mock('@/components/BackToUp', () => ({
    default: () => <div data-testid="back-to-up">Back to Up</div>,
}));

vi.mock('../components/BottomSheetRewardDetail', () => ({
    BottomSheetRewardDetail: ({ isOpen, onClose, reward, onClaim, isClaimLoading }: any) =>
        isOpen ? (
            <div data-testid="bottom-sheet-reward-detail">
                <span>Reward Detail: {reward?.name}</span>
                <button onClick={() => onClaim(reward?.id)} disabled={isClaimLoading}>
                    Claim
                </button>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

vi.mock('../components/BottomSheetRewardSuccess', () => ({
    BottomSheetRewardSuccess: ({ isOpen, onClose, onUseNow }: any) =>
        isOpen ? (
            <div data-testid="bottom-sheet-reward-success">
                <span>Success!</span>
                <button onClick={onUseNow}>Use Now</button>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

describe('RewardPoin', () => {
    let queryClient: QueryClient;
    const mockNavigateToHome = vi.fn();
    const mockNavigateToHistoryPoin = vi.fn();
    const mockNavigateToCheckout = vi.fn();
    const mockNavigateToVouchers = vi.fn();
    const mockMutateAsync = vi.fn();
    const mockApplyVoucher = vi.fn();
    const mockAddItem = vi.fn();
    const mockToastError = vi.fn();

    const mockRewardData = {
        status: 'success',
        message: 'Success',
        data: {
            point_balance: 500,
            vouchers: [],
            customer_points: [],
        },
    };

    const mockVouchersData = {
        status: 'success',
        message: 'Success',
        data: {
            vouchers: [
                {
                    id: 1,
                    name: 'Test Voucher',
                    point: 100,
                    valid_until: new Date(Date.now() + 86400000).toISOString(),
                    is_product_reward: false,
                    voucher: {
                        id: 1,
                        name: 'Test Voucher',
                        code: 'TEST123',
                        description: 'Test description',
                        max_usage: 10,
                        discount_percent: 10,
                        min_transaction: 50000,
                    },
                },
                {
                    id: 2,
                    name: 'Test Product Reward',
                    point: 200,
                    valid_until: new Date(Date.now() + 86400000).toISOString(),
                    is_product_reward: true,
                    voucher: {
                        id: 2,
                        name: 'Test Product',
                        code: 'PROD123',
                        description: 'Product description',
                        max_usage: 5,
                        discount_fixed: 50000,
                        min_transaction: 0,
                    },
                    voucher_products: [
                        {
                            id: 1,
                            uuid: 'prod-uuid',
                            name: 'Free Coffee',
                            price: '50000',
                            image_url: 'https://example.com/coffee.jpg',
                        },
                    ],
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
            navigateToHome: mockNavigateToHome,
            navigateToHistoryPoin: mockNavigateToHistoryPoin,
            navigateToCheckout: mockNavigateToCheckout,
            navigateToVouchers: mockNavigateToVouchers,
            outletSlug: 'test-outlet',
        } as any);

        // Mock useQueryRewardSummary
        vi.mocked(useQueryRewardSummary).mockReturnValue({
            data: mockRewardData,
            isLoading: false,
            error: null,
        } as any);

        // Mock useQueryRewardVouchers
        vi.mocked(useQueryRewardVouchers).mockReturnValue({
            data: mockVouchersData,
            isLoading: false,
            error: null,
        } as any);

        // Mock useClaimVoucherPointMutation
        vi.mocked(useClaimVoucherPointMutation).mockReturnValue({
            mutateAsync: mockMutateAsync,
            isPending: false,
        } as any);

        // Mock voucher store
        vi.mocked(useVoucherStore).getState = vi.fn(() => ({
            applyVoucher: mockApplyVoucher,
        })) as any;

        // Mock cart store
        vi.mocked(useCartStore).getState = vi.fn(() => ({
            addItem: mockAddItem,
        })) as any;

        // Mock toast
        vi.mocked(toast).error = mockToastError;

        // Mock localStorage
        Storage.prototype.setItem = vi.fn();
        Storage.prototype.getItem = vi.fn();

        // Mock setTimeout
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    describe('Loading State', () => {
        it('should show loading skeleton when reward data is loading', () => {
            vi.mocked(useQueryRewardSummary).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('skeleton-reward')).toBeInTheDocument();
        });

        it('should show loading skeleton when vouchers data is loading', () => {
            vi.mocked(useQueryRewardVouchers).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('skeleton-reward')).toBeInTheDocument();
        });
    });

    describe('Error State', () => {
        it('should show error message when there is an error', () => {
            vi.mocked(useQueryRewardVouchers).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to load'),
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByText('Gagal memuat data')).toBeInTheDocument();
            expect(screen.getByText('Silakan coba lagi nanti')).toBeInTheDocument();
        });
    });

    describe('Success State - Rendering', () => {
        it('should render header bar with correct title', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByText('Reward Poin')).toBeInTheDocument();
        });

        it('should render points summary with correct balance', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('points-summary')).toHaveTextContent('Points: 500');
        });

        it('should render reward voucher card', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('reward-voucher-card')).toBeInTheDocument();
        });

        it('should render product list section when products exist', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('product-list-section')).toBeInTheDocument();
            expect(screen.getByText('Tukarkan Dengan Produk')).toBeInTheDocument();
        });

        it('should render voucher list section when vouchers exist', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('voucher-list-section')).toBeInTheDocument();
            expect(screen.getByText('Tukarkan Dengan Vouchers')).toBeInTheDocument();
        });

        it('should render separator when both products and vouchers exist', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('separator')).toBeInTheDocument();
        });

        it('should render back to up button', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('back-to-up')).toBeInTheDocument();
        });
    });

    describe('Empty State', () => {
        it('should show empty state when no vouchers or products', () => {
            vi.mocked(useQueryRewardVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: { vouchers: [] },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('empty-vouchers-state')).toBeInTheDocument();
        });

        it('should not show product section when no products', () => {
            vi.mocked(useQueryRewardVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        vouchers: [
                            {
                                id: 1,
                                name: 'Test Voucher',
                                point: 100,
                                valid_until: new Date(Date.now() + 86400000).toISOString(),
                                is_product_reward: false,
                                voucher: {
                                    id: 1,
                                    name: 'Test',
                                    code: 'TEST',
                                    description: 'Test',
                                    max_usage: 10,
                                    discount_percent: 10,
                                    min_transaction: 0,
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.queryByTestId('product-list-section')).not.toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should navigate to home when back button is clicked', () => {
            render(<RewardPoin />, { wrapper });

            const backButton = screen.getByText('Back');
            fireEvent.click(backButton);

            expect(mockNavigateToHome).toHaveBeenCalledTimes(1);
        });

        it('should navigate to history when history button is clicked', () => {
            render(<RewardPoin />, { wrapper });

            const historyButton = screen.getByText('History');
            fireEvent.click(historyButton);

            expect(mockNavigateToHistoryPoin).toHaveBeenCalledTimes(1);
        });
    });

    describe('Voucher Click Handling', () => {
        it('should open bottom sheet when voucher is clicked', () => {
            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            expect(screen.getByTestId('bottom-sheet-reward-detail')).toBeInTheDocument();
        });

        it('should display correct reward in bottom sheet', () => {
            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            expect(screen.getByText('Reward Detail: Test Voucher')).toBeInTheDocument();
        });

        it('should close bottom sheet when close button is clicked', () => {
            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const closeButton = screen.getByText('Close');
            fireEvent.click(closeButton);

            expect(screen.queryByTestId('bottom-sheet-reward-detail')).not.toBeInTheDocument();
        });
    });

    describe('Product Click Handling', () => {
        it('should open bottom sheet when product is clicked', () => {
            render(<RewardPoin />, { wrapper });

            const productButton = screen.getByText('Test Product Reward');
            fireEvent.click(productButton);

            expect(screen.getByTestId('bottom-sheet-reward-detail')).toBeInTheDocument();
        });

        it('should display correct product in bottom sheet', () => {
            render(<RewardPoin />, { wrapper });

            const productButton = screen.getByText('Test Product Reward');
            fireEvent.click(productButton);

            expect(screen.getByText('Reward Detail: Test Product Reward')).toBeInTheDocument();
        });
    });

    describe('Claim Reward Flow', () => {
        it('should call claim mutation when claim button is clicked', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalledWith({
                    outletSlug: 'test-outlet',
                    voucherId: 1,
                });
            });
        });

        it('should show success sheet after successful claim', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-reward-success')).toBeInTheDocument();
            });
        });

        it('should close detail sheet after successful claim', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(screen.queryByTestId('bottom-sheet-reward-detail')).not.toBeInTheDocument();
            });
        });

        it('should show error toast when claim fails', async () => {
            mockMutateAsync.mockRejectedValue(new Error('Claim failed'));

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(mockToastError).toHaveBeenCalledWith('❌ Gagal mengklaim reward', {
                    description: 'Claim failed',
                });
            });
        });

        it('should show error when outlet slug is missing', async () => {
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToHome: mockNavigateToHome,
                navigateToHistoryPoin: mockNavigateToHistoryPoin,
                navigateToCheckout: mockNavigateToCheckout,
                navigateToVouchers: mockNavigateToVouchers,
                outletSlug: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(mockToastError).toHaveBeenCalledWith('Informasi outlet tidak tersedia');
            });
        });
    });

    describe('Use Now Flow', () => {
        it('should apply voucher to store when use now is clicked', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-reward-success')).toBeInTheDocument();
            });

            const useNowButton = screen.getByText('Use Now');
            fireEvent.click(useNowButton);

            expect(mockApplyVoucher).toHaveBeenCalled();
        });

        it('should store voucher in localStorage', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-reward-success')).toBeInTheDocument();
            });

            const useNowButton = screen.getByText('Use Now');
            fireEvent.click(useNowButton);

            expect(localStorage.setItem).toHaveBeenCalledWith('autoApplyVoucherOnCheckout', 'true');
        });

        it('should navigate to checkout after delay', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-reward-success')).toBeInTheDocument();
            });

            const useNowButton = screen.getByText('Use Now');
            fireEvent.click(useNowButton);

            vi.advanceTimersByTime(100);

            expect(mockNavigateToCheckout).toHaveBeenCalled();
        });

        it('should add product to cart for product rewards', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const productButton = screen.getByText('Test Product Reward');
            fireEvent.click(productButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-reward-success')).toBeInTheDocument();
            });

            const useNowButton = screen.getByText('Use Now');
            fireEvent.click(useNowButton);

            expect(mockAddItem).toHaveBeenCalledWith(
                expect.objectContaining({
                    productId: 1,
                    productUuid: 'prod-uuid',
                    name: 'Free Coffee',
                    quantity: 1,
                })
            );
        });

        it('should close success sheet after use now', async () => {
            mockMutateAsync.mockResolvedValue({});

            render(<RewardPoin />, { wrapper });

            const voucherButton = screen.getByText('Test Voucher');
            fireEvent.click(voucherButton);

            const claimButton = screen.getByText('Claim');
            fireEvent.click(claimButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-reward-success')).toBeInTheDocument();
            });

            const useNowButton = screen.getByText('Use Now');
            fireEvent.click(useNowButton);

            expect(screen.queryByTestId('bottom-sheet-reward-success')).not.toBeInTheDocument();
        });
    });

    describe('Data Transformation', () => {
        it('should correctly transform vouchers to card props', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByText('Test Voucher')).toBeInTheDocument();
        });

        it('should correctly transform products to card props', () => {
            render(<RewardPoin />, { wrapper });

            expect(screen.getByText('Test Product Reward')).toBeInTheDocument();
        });

        it('should handle expired vouchers', () => {
            vi.mocked(useQueryRewardVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        vouchers: [
                            {
                                id: 1,
                                name: 'Expired Voucher',
                                point: 100,
                                valid_until: new Date(Date.now() - 86400000).toISOString(),
                                is_product_reward: false,
                                voucher: {
                                    id: 1,
                                    name: 'Expired',
                                    code: 'EXP',
                                    description: 'Expired',
                                    max_usage: 10,
                                    discount_percent: 10,
                                    min_transaction: 0,
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByText('Expired Voucher')).toBeInTheDocument();
        });

        it('should handle insufficient points', () => {
            vi.mocked(useQueryRewardSummary).mockReturnValue({
                data: {
                    ...mockRewardData,
                    data: {
                        ...mockRewardData.data,
                        point_balance: 50,
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('points-summary')).toHaveTextContent('Points: 50');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null voucher data', () => {
            vi.mocked(useQueryRewardVouchers).mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('empty-vouchers-state')).toBeInTheDocument();
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

            render(<RewardPoin />, { wrapper });

            expect(screen.getByTestId('points-summary')).toHaveTextContent('Points: 0');
        });

        it('should handle voucher without description', () => {
            vi.mocked(useQueryRewardVouchers).mockReturnValue({
                data: {
                    status: 'success',
                    data: {
                        vouchers: [
                            {
                                id: 1,
                                name: 'No Description',
                                point: 100,
                                valid_until: new Date(Date.now() + 86400000).toISOString(),
                                is_product_reward: false,
                                voucher: {
                                    id: 1,
                                    name: 'No Desc',
                                    code: 'NODESC',
                                    description: null,
                                    max_usage: 10,
                                    discount_percent: 10,
                                    min_transaction: 0,
                                },
                            },
                        ],
                    },
                },
                isLoading: false,
                error: null,
            } as any);

            render(<RewardPoin />, { wrapper });

            expect(screen.getByText('No Description')).toBeInTheDocument();
        });
    });
});
