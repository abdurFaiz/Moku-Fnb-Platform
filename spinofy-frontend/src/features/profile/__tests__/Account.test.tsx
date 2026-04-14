import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import Account from '../pages/Account';
import { useLogout } from '../services/auth.queries';
import { useUserStats } from '../hooks/useUserStats';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import './setup';

// Mock dependencies
vi.mock('../services/auth.queries');
vi.mock('../hooks/useUserStats');
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('../pages/Components/UserInfoCard', () => ({
    default: () => createElement('div', { 'data-testid': 'user-info-card' }, 'User Info Card'),
}));
vi.mock('../pages/Components/UserStatsCard', () => ({
    default: ({ stats }: any) => createElement('div', { 'data-testid': 'user-stats-card' },
        stats.map((stat: any, i: number) => createElement('div', { key: i }, `${stat.title}: ${stat.value}`))
    ),
}));
vi.mock('../pages/Components/ItemLink', () => ({
    default: ({ label, onClick }: any) =>
        createElement('button', { onClick, 'data-testid': `link-${label}` }, label),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Account', () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                createElement(BrowserRouter, null, children)
            );
        return wrapper;
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        vi.clearAllMocks();

        // Default mocks
        vi.mocked(useUserStats).mockReturnValue({
            stats: {
                total_point: 100,
                total_order: 5,
                total_voucher: 3,
            },
        } as any);

        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToFormProfile: vi.fn(),
            navigateToWhatsapProfile: vi.fn(),
            navigateToFAQ: vi.fn(),
            navigateToRefundPolicy: vi.fn(),
            navigateToPrivacyPolicy: vi.fn(),
            navigateToTermsAndConditions: vi.fn(),
            navigateToVouchers: vi.fn(),
            navigateToTransaction: vi.fn(),
            navigateToRewardPoin: vi.fn(),
        } as any);

        vi.mocked(useLogout).mockReturnValue({
            mutateAsync: vi.fn().mockResolvedValue({}),
            isPending: false,
        } as any);
    });

    describe('Page Rendering', () => {
        it('should render account page', () => {
            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByTestId('user-info-card')).toBeInTheDocument();
            expect(screen.getByTestId('user-stats-card')).toBeInTheDocument();
        });

        it('should render user stats with correct values', () => {
            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText(/Vouchers: 3/)).toBeInTheDocument();
            expect(screen.getByText(/Point: 100 Poin/)).toBeInTheDocument();
            expect(screen.getByText(/Transaksi: 5/)).toBeInTheDocument();
        });

        it('should render account settings section', () => {
            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText('Pengaturan Akun')).toBeInTheDocument();
            expect(screen.getByTestId('link-Lihat Profil')).toBeInTheDocument();
            expect(screen.getByTestId('link-Nomor WhatsApp')).toBeInTheDocument();
            expect(screen.getByTestId('link-Outlet Lainnya')).toBeInTheDocument();
        });

        it('should render other section with legal links', () => {
            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText('Lainnya')).toBeInTheDocument();
            expect(screen.getByTestId('link-Syarat & Ketentuan')).toBeInTheDocument();
            expect(screen.getByTestId('link-Kebijakan Privasi')).toBeInTheDocument();
            expect(screen.getByTestId('link-Kebijakan Pengembalian Dana')).toBeInTheDocument();
            expect(screen.getByTestId('link-FAQ')).toBeInTheDocument();
        });

        it('should render social media links', () => {
            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText('Temukan Kami')).toBeInTheDocument();

            const whatsappLink = screen.getByRole('link', { name: /whatsapp/i });
            expect(whatsappLink).toHaveAttribute('href', 'http://wa.me/082164599911');

            const instagramLink = screen.getByRole('link', { name: /instagram/i });
            expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/spinofy.id/');
        });

        it('should render logout button', () => {
            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText('Keluar')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should navigate to profile form when clicking Lihat Profil', () => {
            const mockNavigateToFormProfile = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToFormProfile: mockNavigateToFormProfile,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByTestId('link-Lihat Profil'));

            expect(mockNavigateToFormProfile).toHaveBeenCalled();
        });

        it('should navigate to WhatsApp profile when clicking Nomor WhatsApp', () => {
            const mockNavigateToWhatsapProfile = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToWhatsapProfile: mockNavigateToWhatsapProfile,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByTestId('link-Nomor WhatsApp'));

            expect(mockNavigateToWhatsapProfile).toHaveBeenCalled();
        });

        it('should navigate to FAQ when clicking FAQ link', () => {
            const mockNavigateToFAQ = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToFAQ: mockNavigateToFAQ,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByTestId('link-FAQ'));

            expect(mockNavigateToFAQ).toHaveBeenCalled();
        });

        it('should navigate to terms when clicking Syarat & Ketentuan', () => {
            const mockNavigateToTermsAndConditions = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToTermsAndConditions: mockNavigateToTermsAndConditions,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByTestId('link-Syarat & Ketentuan'));

            expect(mockNavigateToTermsAndConditions).toHaveBeenCalled();
        });

        it('should navigate to privacy policy when clicking Kebijakan Privasi', () => {
            const mockNavigateToPrivacyPolicy = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToPrivacyPolicy: mockNavigateToPrivacyPolicy,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByTestId('link-Kebijakan Privasi'));

            expect(mockNavigateToPrivacyPolicy).toHaveBeenCalled();
        });

        it('should navigate to refund policy when clicking Kebijakan Pengembalian Dana', () => {
            const mockNavigateToRefundPolicy = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToRefundPolicy: mockNavigateToRefundPolicy,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByTestId('link-Kebijakan Pengembalian Dana'));

            expect(mockNavigateToRefundPolicy).toHaveBeenCalled();
        });
    });

    describe('User Stats', () => {
        it('should display zero values correctly', () => {
            vi.mocked(useUserStats).mockReturnValue({
                stats: {
                    total_point: 0,
                    total_order: 0,
                    total_voucher: 0,
                },
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText(/Vouchers: 0/)).toBeInTheDocument();
            expect(screen.getByText(/Point: 0 Poin/)).toBeInTheDocument();
            expect(screen.getByText(/Transaksi: 0/)).toBeInTheDocument();
        });

        it('should display large numbers correctly', () => {
            vi.mocked(useUserStats).mockReturnValue({
                stats: {
                    total_point: 10000,
                    total_order: 999,
                    total_voucher: 50,
                },
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText(/Vouchers: 50/)).toBeInTheDocument();
            expect(screen.getByText(/Point: 10000 Poin/)).toBeInTheDocument();
            expect(screen.getByText(/Transaksi: 999/)).toBeInTheDocument();
        });
    });

    describe('Logout Functionality', () => {
        it('should call logout mutation when clicking logout button', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useLogout).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByText('Keluar'));

            await waitFor(() => {
                expect(mockMutateAsync).toHaveBeenCalled();
            });
        });

        it('should navigate to onboard after successful logout', async () => {
            const mockMutateAsync = vi.fn().mockResolvedValue({});
            vi.mocked(useLogout).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByText('Keluar'));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/onboard');
            });
        });

        it('should show loading state during logout', () => {
            vi.mocked(useLogout).mockReturnValue({
                mutateAsync: vi.fn(),
                isPending: true,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByText('Keluar...')).toBeInTheDocument();
            expect(screen.getByText('Keluar...')).toBeDisabled();
        });

        it('should handle logout error gracefully', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const mockError = new Error('Logout failed');
            const mockMutateAsync = vi.fn().mockRejectedValue(mockError);

            vi.mocked(useLogout).mockReturnValue({
                mutateAsync: mockMutateAsync,
                isPending: false,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            fireEvent.click(screen.getByText('Keluar'));

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Logout error:', mockError);
                expect(mockNavigate).toHaveBeenCalledWith('/onboard');
            });

            consoleErrorSpy.mockRestore();
        });

        it('should disable logout button during logout', () => {
            vi.mocked(useLogout).mockReturnValue({
                mutateAsync: vi.fn(),
                isPending: true,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            const logoutButton = screen.getByText('Keluar...');
            expect(logoutButton).toBeDisabled();
        });
    });

    describe('External Links', () => {
        it('should have correct WhatsApp link', () => {
            render(<Account />, { wrapper: createWrapper() });

            const whatsappLink = screen.getByRole('link', { name: /whatsapp/i });
            expect(whatsappLink).toHaveAttribute('href', 'http://wa.me/082164599911');
            expect(whatsappLink).toHaveAttribute('target', '_blank');
        });

        it('should have correct Instagram link', () => {
            render(<Account />, { wrapper: createWrapper() });

            const instagramLink = screen.getByRole('link', { name: /instagram/i });
            expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/spinofy.id/');
            expect(instagramLink).toHaveAttribute('target', '_blank');
        });

        it('should have correct website link', () => {
            render(<Account />, { wrapper: createWrapper() });

            const websiteLink = screen.getByRole('link', { name: /web/i });
            expect(websiteLink).toHaveAttribute('href', 'https://www.spinofy.com');
            expect(websiteLink).toHaveAttribute('target', '_blank');
        });

        it('should have correct email link', () => {
            render(<Account />, { wrapper: createWrapper() });

            const emailLink = screen.getByRole('link', { name: /mail/i });
            expect(emailLink).toHaveAttribute('href', 'mailto:info@spinotek.com');
            expect(emailLink).toHaveAttribute('target', '_blank');
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing user stats gracefully', () => {
            vi.mocked(useUserStats).mockReturnValue({
                stats: {
                    total_point: 0,
                    total_order: 0,
                    total_voucher: 0,
                },
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            expect(screen.getByTestId('user-stats-card')).toBeInTheDocument();
        });

        it('should handle navigation function errors', () => {
            const mockNavigateToFormProfile = vi.fn().mockImplementation(() => {
                throw new Error('Navigation error');
            });

            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToFormProfile: mockNavigateToFormProfile,
            } as any);

            render(<Account />, { wrapper: createWrapper() });

            expect(() => {
                fireEvent.click(screen.getByTestId('link-Lihat Profil'));
            }).toThrow('Navigation error');
        });
    });
});
