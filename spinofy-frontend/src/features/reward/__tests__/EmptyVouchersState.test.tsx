import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyVouchersState } from '../components/EmptyVouchersState';
import './setup';

describe('EmptyVouchersState', () => {
    describe('Rendering', () => {
        it('should render with default message', () => {
            render(<EmptyVouchersState />);

            expect(screen.getByText('Kamu belum memiliki voucher yang dapat ditukarkan.')).toBeInTheDocument();
        });

        it('should render with custom message', () => {
            const customMessage = 'Tidak ada voucher tersedia saat ini.';
            render(<EmptyVouchersState message={customMessage} />);

            expect(screen.getByText(customMessage)).toBeInTheDocument();
        });

        it('should render title', () => {
            render(<EmptyVouchersState />);

            expect(screen.getByText('Tukarkan Dengan Vouchers')).toBeInTheDocument();
        });

        it('should render voucher count', () => {
            render(<EmptyVouchersState />);

            expect(screen.getByText('0 voucher')).toBeInTheDocument();
        });

        it('should render empty state heading', () => {
            render(<EmptyVouchersState />);

            expect(screen.getByText('Belum Ada Voucher')).toBeInTheDocument();
        });

        it('should render voucher icon', () => {
            render(<EmptyVouchersState />);

            const icon = screen.getByRole('img');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveAttribute('src', '/icons/icon-voucher.svg');
        });
    });

    describe('Custom Messages', () => {
        it('should handle empty string message', () => {
            render(<EmptyVouchersState message="" />);

            expect(screen.queryByText('Kamu belum memiliki voucher yang dapat ditukarkan.')).not.toBeInTheDocument();
        });

        it('should handle long custom messages', () => {
            const longMessage = 'This is a very long message that explains in detail why there are no vouchers available at this moment and what the user should do next.';
            render(<EmptyVouchersState message={longMessage} />);

            expect(screen.getByText(longMessage)).toBeInTheDocument();
        });

        it('should handle special characters in message', () => {
            const specialMessage = 'Voucher tidak tersedia! @#$%^&*()';
            render(<EmptyVouchersState message={specialMessage} />);

            expect(screen.getByText(specialMessage)).toBeInTheDocument();
        });

        it('should handle HTML entities in message', () => {
            const htmlMessage = 'Voucher &amp; rewards tidak tersedia';
            render(<EmptyVouchersState message={htmlMessage} />);

            expect(screen.getByText(htmlMessage)).toBeInTheDocument();
        });

        it('should handle unicode characters in message', () => {
            const unicodeMessage = 'Tidak ada voucher 🎁 tersedia';
            render(<EmptyVouchersState message={unicodeMessage} />);

            expect(screen.getByText(unicodeMessage)).toBeInTheDocument();
        });
    });

    describe('Styling and Layout', () => {
        it('should have correct container classes', () => {
            const { container } = render(<EmptyVouchersState />);

            const mainContainer = container.querySelector('.mx-4');
            expect(mainContainer).toBeInTheDocument();
        });

        it('should have header with flex layout', () => {
            const { container } = render(<EmptyVouchersState />);

            const header = container.querySelector('.flex.items-center.justify-between');
            expect(header).toBeInTheDocument();
        });

        it('should have rounded empty state container', () => {
            const { container } = render(<EmptyVouchersState />);

            const emptyContainer = container.querySelector('.rounded-3xl');
            expect(emptyContainer).toBeInTheDocument();
        });

        it('should have centered text', () => {
            const { container } = render(<EmptyVouchersState />);

            const centeredContainer = container.querySelector('.text-center');
            expect(centeredContainer).toBeInTheDocument();
        });

        it('should have proper padding', () => {
            const { container } = render(<EmptyVouchersState />);

            const paddedContainer = container.querySelector('.p-8');
            expect(paddedContainer).toBeInTheDocument();
        });

        it('should have white background', () => {
            const { container } = render(<EmptyVouchersState />);

            const whiteBackground = container.querySelector('.bg-white');
            expect(whiteBackground).toBeInTheDocument();
        });

        it('should have border', () => {
            const { container } = render(<EmptyVouchersState />);

            const borderedElement = container.querySelector('.border');
            expect(borderedElement).toBeInTheDocument();
        });
    });

    describe('Icon Container', () => {
        it('should have circular icon container', () => {
            const { container } = render(<EmptyVouchersState />);

            const iconContainer = container.querySelector('.rounded-full');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should have correct icon container size', () => {
            const { container } = render(<EmptyVouchersState />);

            const iconContainer = container.querySelector('.w-16.h-16');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should center icon within container', () => {
            const { container } = render(<EmptyVouchersState />);

            const iconContainer = container.querySelector('.flex.items-center.justify-center');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should have gray background for icon container', () => {
            const { container } = render(<EmptyVouchersState />);

            const iconContainer = container.querySelector('.bg-gray-100');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should center icon container horizontally', () => {
            const { container } = render(<EmptyVouchersState />);

            const iconContainer = container.querySelector('.mx-auto');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should have margin bottom on icon container', () => {
            const { container } = render(<EmptyVouchersState />);

            const iconContainer = container.querySelector('.mb-4');
            expect(iconContainer).toBeInTheDocument();
        });
    });

    describe('Icon Styling', () => {
        it('should render icon with correct size', () => {
            const { container } = render(<EmptyVouchersState />);

            const icon = container.querySelector('.size-8');
            expect(icon).toBeInTheDocument();
        });

        it('should apply grayscale filter to icon', () => {
            const { container } = render(<EmptyVouchersState />);

            const icon = container.querySelector('.grayscale-100');
            expect(icon).toBeInTheDocument();
        });

        it('should have lazy loading on icon', () => {
            render(<EmptyVouchersState />);

            const icon = screen.getByRole('img');
            expect(icon).toHaveAttribute('loading', 'lazy');
        });
    });

    describe('Text Styling', () => {
        it('should style title correctly', () => {
            render(<EmptyVouchersState />);

            const title = screen.getByText('Tukarkan Dengan Vouchers');
            expect(title).toHaveClass('text-lg', 'font-semibold', 'text-title-black');
        });

        it('should style voucher count correctly', () => {
            render(<EmptyVouchersState />);

            const count = screen.getByText('0 voucher');
            expect(count).toHaveClass('text-sm', 'text-gray-500');
        });

        it('should style empty state heading correctly', () => {
            render(<EmptyVouchersState />);

            const heading = screen.getByText('Belum Ada Voucher');
            expect(heading).toHaveClass('text-lg', 'font-medium', 'text-title-black', 'mb-2');
        });

        it('should style message correctly', () => {
            render(<EmptyVouchersState />);

            const message = screen.getByText('Kamu belum memiliki voucher yang dapat ditukarkan.');
            expect(message).toHaveClass('text-gray-500', 'text-sm');
        });
    });

    describe('Accessibility', () => {
        it('should have accessible image', () => {
            render(<EmptyVouchersState />);

            const icon = screen.getByRole('img');
            expect(icon).toBeInTheDocument();
        });

        it('should have proper heading hierarchy', () => {
            const { container } = render(<EmptyVouchersState />);

            const h2 = container.querySelector('h2');
            const h3 = container.querySelector('h3');

            expect(h2).toBeInTheDocument();
            expect(h3).toBeInTheDocument();
        });

        it('should have semantic HTML structure', () => {
            const { container } = render(<EmptyVouchersState />);

            expect(container.querySelector('h2')).toHaveTextContent('Tukarkan Dengan Vouchers');
            expect(container.querySelector('h3')).toHaveTextContent('Belum Ada Voucher');
        });
    });

    describe('Layout Structure', () => {
        it('should have proper spacing between elements', () => {
            const { container } = render(<EmptyVouchersState />);

            const spacedElements = container.querySelectorAll('.mb-2, .mb-4');
            expect(spacedElements.length).toBeGreaterThan(0);
        });

        it('should have flex layout for header', () => {
            const { container } = render(<EmptyVouchersState />);

            const flexHeader = container.querySelector('.flex.items-center.justify-between.mb-4');
            expect(flexHeader).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should render without errors when no props provided', () => {
            expect(() => render(<EmptyVouchersState />)).not.toThrow();
        });

        it('should handle null message gracefully', () => {
            render(<EmptyVouchersState message={null as any} />);

            expect(screen.getByText('Belum Ada Voucher')).toBeInTheDocument();
        });

        it('should handle undefined message gracefully', () => {
            render(<EmptyVouchersState message={undefined} />);

            expect(screen.getByText('Kamu belum memiliki voucher yang dapat ditukarkan.')).toBeInTheDocument();
        });

        it('should handle very long messages without breaking layout', () => {
            const veryLongMessage = 'A'.repeat(500);
            const { container } = render(<EmptyVouchersState message={veryLongMessage} />);

            expect(container.querySelector('.text-center')).toBeInTheDocument();
        });

        it('should handle messages with line breaks', () => {
            const messageWithBreaks = 'Line 1\nLine 2\nLine 3';
            render(<EmptyVouchersState message={messageWithBreaks} />);

            // Text with line breaks is rendered but split across multiple text nodes
            expect(screen.getByText(/Line 1/)).toBeInTheDocument();
            expect(screen.getByText(/Line 2/)).toBeInTheDocument();
            expect(screen.getByText(/Line 3/)).toBeInTheDocument();
        });
    });

    describe('Visual Consistency', () => {
        it('should use consistent gray colors', () => {
            const { container } = render(<EmptyVouchersState />);

            const grayElements = container.querySelectorAll('[class*="gray"]');
            expect(grayElements.length).toBeGreaterThan(0);
        });

        it('should have consistent border radius', () => {
            const { container } = render(<EmptyVouchersState />);

            const roundedElements = container.querySelectorAll('.rounded-3xl, .rounded-full');
            expect(roundedElements.length).toBeGreaterThan(0);
        });

        it('should maintain proper spacing hierarchy', () => {
            const { container } = render(<EmptyVouchersState />);

            const spacingElements = container.querySelectorAll('[class*="mb-"], [class*="p-"]');
            expect(spacingElements.length).toBeGreaterThan(0);
        });
    });

    describe('Component Props', () => {
        it('should accept message prop', () => {
            const testMessage = 'Test message';
            render(<EmptyVouchersState message={testMessage} />);

            expect(screen.getByText(testMessage)).toBeInTheDocument();
        });

        it('should use default message when prop not provided', () => {
            render(<EmptyVouchersState />);

            expect(screen.getByText('Kamu belum memiliki voucher yang dapat ditukarkan.')).toBeInTheDocument();
        });

        it('should override default message with custom prop', () => {
            const customMessage = 'Custom empty message';
            render(<EmptyVouchersState message={customMessage} />);

            expect(screen.queryByText('Kamu belum memiliki voucher yang dapat ditukarkan.')).not.toBeInTheDocument();
            expect(screen.getByText(customMessage)).toBeInTheDocument();
        });
    });
});
