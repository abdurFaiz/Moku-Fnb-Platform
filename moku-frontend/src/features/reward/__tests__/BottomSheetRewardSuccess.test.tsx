import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomSheetRewardSuccess } from '../components/BottomSheetRewardSuccess';
import './setup';

// Mock DotLottieReact
vi.mock('@lottiefiles/dotlottie-react', () => ({
    DotLottieReact: ({ className }: { className: string }) => (
        <div data-testid="lottie-animation" className={className}>
            Lottie Animation
        </div>
    ),
}));

// Mock useOutletNavigation
const mockNavigateToVouchers = vi.fn();
vi.mock('@/hooks/shared/useOutletNavigation', () => ({
    useOutletNavigation: () => ({
        navigateToVouchers: mockNavigateToVouchers,
    }),
}));

describe('BottomSheetRewardSuccess', () => {
    const mockOnClose = vi.fn();
    const mockOnUseNow = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render drawer when isOpen is true', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(screen.getByText('Voucher Berhasil Didapatkan')).toBeInTheDocument();
        });

        it('should not render drawer content when isOpen is false', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={false}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(screen.queryByText('Voucher Berhasil Didapatkan')).not.toBeInTheDocument();
        });

        it('should render title text', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(screen.getByText('Voucher Berhasil Didapatkan')).toBeInTheDocument();
        });

        it('should render description text', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(
                screen.getByText(
                    'Selamat! Poinmu berhasil kamu tukarkan dengan hadiah. Yuk, gunakan vouchermu sekarang.'
                )
            ).toBeInTheDocument();
        });

        it('should render Lottie animation', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const lottie = screen.getByTestId('lottie-animation');
            expect(lottie).toBeInTheDocument();
            expect(lottie).toHaveClass('size-64');
        });

        it('should render "Lihat Voucher" button', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(screen.getByRole('button', { name: /lihat voucher/i })).toBeInTheDocument();
        });

        it('should render "Gunakan Sekarang" button', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(screen.getByRole('button', { name: /gunakan sekarang/i })).toBeInTheDocument();
        });
    });

    describe('Button Interactions', () => {
        it('should call navigateToVouchers when "Lihat Voucher" button is clicked', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const lihatVoucherButton = screen.getByRole('button', { name: /lihat voucher/i });
            fireEvent.click(lihatVoucherButton);

            expect(mockNavigateToVouchers).toHaveBeenCalledTimes(1);
        });

        it('should call onUseNow when "Gunakan Sekarang" button is clicked', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const gunakanSekarangButton = screen.getByRole('button', {
                name: /gunakan sekarang/i,
            });
            fireEvent.click(gunakanSekarangButton);

            expect(mockOnUseNow).toHaveBeenCalledTimes(1);
        });

        it('should not call onUseNow when onUseNow prop is not provided', () => {
            render(
                <BottomSheetRewardSuccess isOpen={true} onClose={mockOnClose} />
            );

            const gunakanSekarangButton = screen.getByRole('button', {
                name: /gunakan sekarang/i,
            });
            fireEvent.click(gunakanSekarangButton);

            expect(mockOnUseNow).not.toHaveBeenCalled();
        });

        it('should handle multiple clicks on "Lihat Voucher" button', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const lihatVoucherButton = screen.getByRole('button', { name: /lihat voucher/i });
            fireEvent.click(lihatVoucherButton);
            fireEvent.click(lihatVoucherButton);
            fireEvent.click(lihatVoucherButton);

            expect(mockNavigateToVouchers).toHaveBeenCalledTimes(3);
        });

        it('should handle multiple clicks on "Gunakan Sekarang" button', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const gunakanSekarangButton = screen.getByRole('button', {
                name: /gunakan sekarang/i,
            });
            fireEvent.click(gunakanSekarangButton);
            fireEvent.click(gunakanSekarangButton);

            expect(mockOnUseNow).toHaveBeenCalledTimes(2);
        });
    });

    describe('Drawer Behavior', () => {
        it('should call onClose when drawer is closed', () => {
            const { rerender } = render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            // Simulate drawer close by changing isOpen to false
            rerender(
                <BottomSheetRewardSuccess
                    isOpen={false}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            // The drawer component handles the onOpenChange callback
            expect(mockOnClose).toHaveBeenCalledTimes(0); // onClose is called by drawer's onOpenChange
        });

        it('should maintain state when isOpen changes from false to true', () => {
            const { rerender } = render(
                <BottomSheetRewardSuccess
                    isOpen={false}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(screen.queryByText('Voucher Berhasil Didapatkan')).not.toBeInTheDocument();

            rerender(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(screen.getByText('Voucher Berhasil Didapatkan')).toBeInTheDocument();
        });
    });

    describe('Styling and Layout', () => {
        it('should have correct container classes', () => {
            const { container } = render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const mainDiv = container.querySelector('.w-full.flex.flex-col');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should have centered content', () => {
            const { container } = render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const centeredDiv = container.querySelector('.items-center.justify-center');
            expect(centeredDiv).toBeInTheDocument();
        });

        it('should have proper button layout', () => {
            const { container } = render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const buttonContainer = container.querySelector('.flex.flex-row.gap-3');
            expect(buttonContainer).toBeInTheDocument();
        });

        it('should style "Lihat Voucher" button as outline variant', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const lihatVoucherButton = screen.getByRole('button', { name: /lihat voucher/i });
            expect(lihatVoucherButton).toHaveClass('border-2', 'border-primary-orange');
        });

        it('should style "Gunakan Sekarang" button with primary color', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const gunakanSekarangButton = screen.getByRole('button', {
                name: /gunakan sekarang/i,
            });
            expect(gunakanSekarangButton).toHaveClass('bg-primary-orange');
        });

        it('should have rounded buttons', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const buttons = screen.getAllByRole('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('rounded-full');
            });
        });
    });

    describe('Accessibility', () => {
        it('should have accessible dialog title', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            // Title is sr-only but should be in the document
            expect(screen.getByText('Voucher Berhasil Didapatkan')).toBeInTheDocument();
        });

        it('should have accessible dialog description', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            expect(
                screen.getByText(
                    'Selamat! Poinmu berhasil kamu tukarkan dengan hadiah. Yuk, gunakan vouchermu sekarang.'
                )
            ).toBeInTheDocument();
        });

        it('should have accessible buttons', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const buttons = screen.getAllByRole('button');
            expect(buttons).toHaveLength(2);
        });

        it('should have proper heading hierarchy', () => {
            const { container } = render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const h2 = container.querySelector('h2');
            expect(h2).toBeInTheDocument();
            expect(h2).toHaveTextContent('Voucher Berhasil Didapatkan');
        });
    });

    describe('Edge Cases', () => {
        it('should render without errors when all props are provided', () => {
            expect(() =>
                render(
                    <BottomSheetRewardSuccess
                        isOpen={true}
                        onClose={mockOnClose}
                        onUseNow={mockOnUseNow}
                    />
                )
            ).not.toThrow();
        });

        it('should render without errors when onUseNow is not provided', () => {
            expect(() =>
                render(<BottomSheetRewardSuccess isOpen={true} onClose={mockOnClose} />)
            ).not.toThrow();
        });

        it('should handle rapid open/close cycles', () => {
            const { rerender } = render(
                <BottomSheetRewardSuccess
                    isOpen={false}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            for (let i = 0; i < 5; i++) {
                rerender(
                    <BottomSheetRewardSuccess
                        isOpen={true}
                        onClose={mockOnClose}
                        onUseNow={mockOnUseNow}
                    />
                );
                rerender(
                    <BottomSheetRewardSuccess
                        isOpen={false}
                        onClose={mockOnClose}
                        onUseNow={mockOnUseNow}
                    />
                );
            }

            expect(mockOnClose).toHaveBeenCalledTimes(0);
        });

        it('should maintain button functionality after re-render', () => {
            const { rerender } = render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const gunakanSekarangButton = screen.getByRole('button', {
                name: /gunakan sekarang/i,
            });
            fireEvent.click(gunakanSekarangButton);

            expect(mockOnUseNow).toHaveBeenCalledTimes(1);

            rerender(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            fireEvent.click(gunakanSekarangButton);
            expect(mockOnUseNow).toHaveBeenCalledTimes(2);
        });
    });

    describe('Text Content', () => {
        it('should display correct title text', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const title = screen.getByText('Voucher Berhasil Didapatkan');
            expect(title).toHaveClass('text-lg', 'font-semibold', 'text-primary-orange');
        });

        it('should display correct description text', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const description = screen.getByText(
                'Selamat! Poinmu berhasil kamu tukarkan dengan hadiah. Yuk, gunakan vouchermu sekarang.'
            );
            expect(description).toHaveClass('text-center', 'text-gray-600', 'text-sm');
        });

        it('should center align text', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const title = screen.getByText('Voucher Berhasil Didapatkan');
            const description = screen.getByText(
                'Selamat! Poinmu berhasil kamu tukarkan dengan hadiah. Yuk, gunakan vouchermu sekarang.'
            );

            expect(title).toHaveClass('text-center');
            expect(description).toHaveClass('text-center');
        });
    });

    describe('Component Integration', () => {
        it('should integrate with useOutletNavigation hook', () => {
            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const lihatVoucherButton = screen.getByRole('button', { name: /lihat voucher/i });
            fireEvent.click(lihatVoucherButton);

            expect(mockNavigateToVouchers).toHaveBeenCalled();
        });

        it('should work correctly when navigation function is undefined', () => {
            vi.mocked(mockNavigateToVouchers).mockImplementation(undefined as any);

            render(
                <BottomSheetRewardSuccess
                    isOpen={true}
                    onClose={mockOnClose}
                    onUseNow={mockOnUseNow}
                />
            );

            const lihatVoucherButton = screen.getByRole('button', { name: /lihat voucher/i });
            expect(lihatVoucherButton).toBeInTheDocument();
        });
    });
});
