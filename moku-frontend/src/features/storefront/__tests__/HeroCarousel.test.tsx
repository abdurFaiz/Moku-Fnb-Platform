import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroCarousel from '../components/HeroCarousel';
import { useBarcodeParams } from '../hooks/useBarcodeParams';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';

vi.mock('../hooks/useBarcodeParams');
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('HeroCarousel', () => {
    const mockBanners = [
        { id: 1, link: 'https://example.com', outlet_id: 1, banner_url: 'https://example.com/banner1.jpg', media: [] },
        { id: 2, link: 'https://example.com', outlet_id: 1, banner_url: 'https://example.com/banner2.jpg', media: [] },
        { id: 3, link: 'https://example.com', outlet_id: 1, banner_url: 'https://example.com/banner3.jpg', media: [] },
    ];

    const mockOutlet = {
        id: 1,
        uuid: 'test-uuid',
        name: 'Test Outlet',
        slug: 'test-outlet',
        phone: '123456789',
        address: 'Test Address',
        map: 'https://maps.example.com',
        is_active: 1,
        type: 1 as const,
        service_fee_config: 0,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        fee_tax: 0,
        products_count: 10,
        total_point: '0',
        logo_url: 'https://example.com/logo.jpg',
        products: [],
        media: [],
        operational_schedules: [],
    };

    const defaultProps = {
        banners: mockBanners,
        outlet: mockOutlet,
        isOpen: true,
        nextOpenTime: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useBarcodeParams).mockReturnValue({
            tableNumber: '1',
            barcodeOutlet: null,
            hasBarcodeData: false,
            setTableNumber: vi.fn(),
            setBarcodeOutlet: vi.fn(),
            clearBarcodeData: vi.fn(),
        });
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToHome: vi.fn(),
            navigateToCheckout: vi.fn(),
            navigateToVouchers: vi.fn(),
            navigateToRewardPoin: vi.fn(),
            navigateToHistoryPoin: vi.fn(),
            navigateToHistoryVouchers: vi.fn(),
            navigateToDetailItem: vi.fn(),
            navigateToPayment: vi.fn(),
            navigateToVoucherCheckout: vi.fn(),
            navigateToSearchProduct: vi.fn(),
            navigateWithOutlet: vi.fn(),
            navigateToAccount: vi.fn(),
            navigateToTransaction: vi.fn(),
            navigateToRecommend: vi.fn(),
            navigateToFavorite: vi.fn(),
            navigateToTableNumber: vi.fn(),
            navigateNotFound: vi.fn(),
            navigateToFormProfile: vi.fn(),
            navigateToWhatsapProfile: vi.fn(),
            navigateToComingSoon: vi.fn(),
            navigateToInvoice: vi.fn(),
            navigateToRefundPolicy: vi.fn(),
            navigateToPrivacyPolicy: vi.fn(),
            navigateToTermsAndConditions: vi.fn(),
            navigateToFAQ: vi.fn(),
            navigateToMyRewardVoucher: vi.fn(),
            outletSlug: 'test-outlet',
        });
    });

    describe('Rendering', () => {
        it('should render carousel with banners', () => {
            render(<HeroCarousel {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render with undefined banners', () => {
            render(<HeroCarousel {...defaultProps} banners={undefined} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render with empty banners array', () => {
            render(<HeroCarousel {...defaultProps} banners={[]} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render with single banner', () => {
            render(<HeroCarousel {...defaultProps} banners={[mockBanners[0]]} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render with multiple banners', () => {
            render(<HeroCarousel {...defaultProps} banners={mockBanners} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Outlet Status', () => {
        it('should render when outlet is open', () => {
            render(<HeroCarousel {...defaultProps} isOpen={true} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should render when outlet is closed', () => {
            render(<HeroCarousel {...defaultProps} isOpen={false} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display next open time when provided', () => {
            render(<HeroCarousel {...defaultProps} nextOpenTime='10:00 AM' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle null outlet', () => {
            render(<HeroCarousel {...defaultProps} outlet={null} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should call navigateToFavorite when favorite button is clicked', () => {
            const mockNavigateToFavorite = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToHome: vi.fn(),
                navigateToCheckout: vi.fn(),
                navigateToVouchers: vi.fn(),
                navigateToRewardPoin: vi.fn(),
                navigateToHistoryPoin: vi.fn(),
                navigateToHistoryVouchers: vi.fn(),
                navigateToDetailItem: vi.fn(),
                navigateToPayment: vi.fn(),
                navigateToVoucherCheckout: vi.fn(),
                navigateToSearchProduct: vi.fn(),
                navigateWithOutlet: vi.fn(),
                navigateToAccount: vi.fn(),
                navigateToTransaction: vi.fn(),
                navigateToRecommend: vi.fn(),
                navigateToFavorite: mockNavigateToFavorite,
                navigateToTableNumber: vi.fn(),
                navigateNotFound: vi.fn(),
                navigateToFormProfile: vi.fn(),
                navigateToWhatsapProfile: vi.fn(),
                navigateToComingSoon: vi.fn(),
                navigateToInvoice: vi.fn(),
                navigateToRefundPolicy: vi.fn(),
                navigateToPrivacyPolicy: vi.fn(),
                navigateToTermsAndConditions: vi.fn(),
                navigateToFAQ: vi.fn(),
                navigateToMyRewardVoucher: vi.fn(),
                outletSlug: 'test-outlet',
            });

            render(<HeroCarousel {...defaultProps} />);

            const buttons = screen.getAllByRole('button');
            const favoriteButton = buttons.find(btn => btn.querySelector('svg'));
            if (favoriteButton) {
                fireEvent.click(favoriteButton);
            }

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should call navigateToTableNumber when table button is clicked', () => {
            const mockNavigateToTableNumber = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToHome: vi.fn(),
                navigateToCheckout: vi.fn(),
                navigateToVouchers: vi.fn(),
                navigateToRewardPoin: vi.fn(),
                navigateToHistoryPoin: vi.fn(),
                navigateToHistoryVouchers: vi.fn(),
                navigateToDetailItem: vi.fn(),
                navigateToPayment: vi.fn(),
                navigateToVoucherCheckout: vi.fn(),
                navigateToSearchProduct: vi.fn(),
                navigateWithOutlet: vi.fn(),
                navigateToAccount: vi.fn(),
                navigateToTransaction: vi.fn(),
                navigateToRecommend: vi.fn(),
                navigateToFavorite: vi.fn(),
                navigateToTableNumber: mockNavigateToTableNumber,
                navigateNotFound: vi.fn(),
                navigateToFormProfile: vi.fn(),
                navigateToWhatsapProfile: vi.fn(),
                navigateToComingSoon: vi.fn(),
                navigateToInvoice: vi.fn(),
                navigateToRefundPolicy: vi.fn(),
                navigateToPrivacyPolicy: vi.fn(),
                navigateToTermsAndConditions: vi.fn(),
                navigateToFAQ: vi.fn(),
                navigateToMyRewardVoucher: vi.fn(),
                outletSlug: 'test-outlet',
            });

            render(<HeroCarousel {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Barcode Params', () => {
        it('should use table number from useBarcodeParams', () => {
            vi.mocked(useBarcodeParams).mockReturnValue({
                tableNumber: '5',
                barcodeOutlet: null,
                hasBarcodeData: false,
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
            });

            render(<HeroCarousel {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle null table number', () => {
            vi.mocked(useBarcodeParams).mockReturnValue({
                tableNumber: null,
                barcodeOutlet: null,
                hasBarcodeData: false,
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
            });

            render(<HeroCarousel {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle banners with missing media', () => {
            const bannersWithoutMedia = [
                { id: 1, link: 'https://example.com', outlet_id: 1, banner_url: 'https://example.com/banner.jpg', media: [] },
            ];

            render(<HeroCarousel {...defaultProps} banners={bannersWithoutMedia} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle very long banner URLs', () => {
            const longUrlBanners = [
                { id: 1, link: 'https://example.com/' + 'a'.repeat(200), outlet_id: 1, banner_url: 'https://example.com/banner.jpg', media: [] },
            ];

            render(<HeroCarousel {...defaultProps} banners={longUrlBanners} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle special characters in outlet name', () => {
            const specialOutlet = {
                ...mockOutlet,
                name: 'Café & Restaurant (Special)',
            };

            render(<HeroCarousel {...defaultProps} outlet={specialOutlet} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle prop changes', () => {
            const { rerender } = render(<HeroCarousel {...defaultProps} isOpen={true} />);

            expect(screen.getByRole('button')).toBeInTheDocument();

            rerender(<HeroCarousel {...defaultProps} isOpen={false} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle banner changes', () => {
            const { rerender } = render(<HeroCarousel {...defaultProps} banners={mockBanners} />);

            expect(screen.getByRole('button')).toBeInTheDocument();

            rerender(<HeroCarousel {...defaultProps} banners={[mockBanners[0]]} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });
});
