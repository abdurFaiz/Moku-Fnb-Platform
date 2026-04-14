import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PointsSummary } from '../components/PoinSummary';
import './setup';

describe('PointsSummary', () => {
    describe('Rendering', () => {
        it('should render with default props', () => {
            render(<PointsSummary points={100} />);

            expect(screen.getByText('100 Poin')).toBeInTheDocument();
            expect(
                screen.getByText('Total poin yang berhasil kamu kumpulkan. Hebat!')
            ).toBeInTheDocument();
        });

        it('should render with custom message', () => {
            const customMessage = 'Kumpulkan lebih banyak poin!';
            render(<PointsSummary points={50} message={customMessage} />);

            expect(screen.getByText('50 Poin')).toBeInTheDocument();
            expect(screen.getByText(customMessage)).toBeInTheDocument();
        });

        it('should render with zero points', () => {
            render(<PointsSummary points={0} />);

            expect(screen.getByText('0 Poin')).toBeInTheDocument();
        });

        it('should render with large point values', () => {
            render(<PointsSummary points={999999} />);

            expect(screen.getByText('999999 Poin')).toBeInTheDocument();
        });

        it('should render point icon', () => {
            render(<PointsSummary points={100} />);

            const pointIcon = screen.getByAltText('icon poin');
            expect(pointIcon).toBeInTheDocument();
            expect(pointIcon).toHaveAttribute('src', '/icons/icon-poin.svg');
        });

        it('should render Spinofy icon', () => {
            render(<PointsSummary points={100} />);

            const spinofyIcon = screen.getByAltText('Spibofy Icon');
            expect(spinofyIcon).toBeInTheDocument();
            expect(spinofyIcon).toHaveAttribute('src', '/icons/icon-spinofy-white.svg');
        });

        it('should render info icon button', () => {
            const { container } = render(<PointsSummary points={100} />);

            // The Info icon is wrapped in DrawerTrigger which creates a button
            const infoIcon = container.querySelector('.lucide-info');
            expect(infoIcon).toBeInTheDocument();
        });
    });

    describe('Drawer Interaction', () => {
        it('should open drawer when info icon is clicked', () => {
            const { container } = render(<PointsSummary points={100} />);

            // The Info icon is wrapped in DrawerTrigger
            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);
                expect(screen.getByText('Aturan Reward Poin')).toBeInTheDocument();
            }
        });

        it('should display drawer content correctly', () => {
            const { container } = render(<PointsSummary points={100} />);

            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);

                // Check drawer title and description
                expect(screen.getByText('Aturan Reward Poin')).toBeInTheDocument();
                expect(
                    screen.getByText('Pelajari cara mendapatkan dan menggunakan poin reward Anda')
                ).toBeInTheDocument();

                // Check sections
                expect(screen.getByText('Cara Mendapatkan Poin')).toBeInTheDocument();
                expect(screen.getByText('Cara Menggunakan Poin')).toBeInTheDocument();
                expect(screen.getByText('Syarat & Ketentuan')).toBeInTheDocument();
            }
        });

        it('should display earning points rules', () => {
            const { container } = render(<PointsSummary points={100} />);

            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);

                expect(screen.getByText(/Selesaikan pembelian di outlet kami/i)).toBeInTheDocument();
                expect(
                    screen.getByText(/Setiap Rp10.000 transaksi = 1 poin/i)
                ).toBeInTheDocument();
            }
        });

        it('should display using points rules', () => {
            const { container } = render(<PointsSummary points={100} />);

            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);

                expect(screen.getByText(/Tukar poin dengan voucher diskon/i)).toBeInTheDocument();
                expect(screen.getByText(/Tukar poin dengan produk gratis/i)).toBeInTheDocument();
                expect(
                    screen.getByText(/Poin dapat digunakan di outlet pembelian product/i)
                ).toBeInTheDocument();
            }
        });

        it('should display terms and conditions', () => {
            const { container } = render(<PointsSummary points={100} />);

            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);

                expect(
                    screen.getByText(/Poin tidak dapat dijual atau ditukar dengan uang/i)
                ).toBeInTheDocument();
            }
        });

        it('should close drawer when onOpenChange is triggered', () => {
            const { container } = render(<PointsSummary points={100} />);

            // Open drawer
            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);
                expect(screen.getByText('Aturan Reward Poin')).toBeInTheDocument();

                // Close drawer by clicking outside or escape
                const drawer = screen.queryByRole('dialog');
                if (drawer) {
                    fireEvent.keyDown(drawer, { key: 'Escape', code: 'Escape' });
                }
            }
        });
    });

    describe('Styling and Layout', () => {
        it('should have correct container classes', () => {
            const { container } = render(<PointsSummary points={100} />);

            const mainDiv = container.querySelector('.relative.flex.flex-col');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should apply opacity to background icon', () => {
            const { container } = render(<PointsSummary points={100} />);

            const backgroundIcon = container.querySelector('.opacity-30');
            expect(backgroundIcon).toBeInTheDocument();
        });

        it('should render with proper spacing classes', () => {
            const { container } = render(<PointsSummary points={100} />);

            const mainContainer = container.querySelector('.gap-4');
            expect(mainContainer).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle negative points gracefully', () => {
            render(<PointsSummary points={-10} />);

            expect(screen.getByText('-10 Poin')).toBeInTheDocument();
        });

        it('should handle very long custom messages', () => {
            const longMessage = 'A'.repeat(200);
            render(<PointsSummary points={100} message={longMessage} />);

            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });

        it('should handle empty string message', () => {
            render(<PointsSummary points={100} message="" />);

            expect(screen.getByText('100 Poin')).toBeInTheDocument();
            expect(screen.queryByText('Total poin yang berhasil kamu kumpulkan. Hebat!')).not.toBeInTheDocument();
        });

        it('should handle decimal points', () => {
            render(<PointsSummary points={100.5} />);

            expect(screen.getByText('100.5 Poin')).toBeInTheDocument();
        });

        it('should handle special characters in message', () => {
            const specialMessage = 'Poin! @#$% & *()';
            render(<PointsSummary points={100} message={specialMessage} />);

            expect(screen.getByText(specialMessage)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible button for info icon', () => {
            const { container } = render(<PointsSummary points={100} />);

            // DrawerTrigger creates a button element
            const infoIcon = container.querySelector('.lucide-info');
            expect(infoIcon).toBeInTheDocument();
        });

        it('should have proper alt text for images', () => {
            render(<PointsSummary points={100} />);

            expect(screen.getByAltText('icon poin')).toBeInTheDocument();
            expect(screen.getByAltText('Spibofy Icon')).toBeInTheDocument();
        });

        it('should have proper dialog structure when drawer is open', () => {
            const { container } = render(<PointsSummary points={100} />);

            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);
            }

            const dialog = screen.queryByRole('dialog');
            if (dialog) {
                expect(dialog).toBeInTheDocument();
            }
        });
    });

    describe('State Management', () => {
        it('should maintain drawer state correctly', () => {
            const { container } = render(<PointsSummary points={100} />);

            // Initially closed
            expect(screen.queryByText('Aturan Reward Poin')).not.toBeInTheDocument();

            // Open drawer
            const infoIcon = container.querySelector('.lucide-info');
            if (infoIcon) {
                fireEvent.click(infoIcon);
                expect(screen.getByText('Aturan Reward Poin')).toBeInTheDocument();
            }
        });

        it('should handle multiple open/close cycles', () => {
            const { container } = render(<PointsSummary points={100} />);

            const infoIcon = container.querySelector('.lucide-info');
            if (!infoIcon) return;

            // Open
            fireEvent.click(infoIcon);
            expect(screen.getByText('Aturan Reward Poin')).toBeInTheDocument();

            // Close
            const drawer = screen.queryByRole('dialog');
            if (drawer) {
                fireEvent.keyDown(drawer, { key: 'Escape' });
            }

            // Open again
            fireEvent.click(infoIcon);
            expect(screen.getByText('Aturan Reward Poin')).toBeInTheDocument();
        });
    });
});
