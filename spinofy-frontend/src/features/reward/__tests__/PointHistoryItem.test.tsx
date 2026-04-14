import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PointHistoryItem } from '../components/PointHistoryItem';
import './setup';

describe('PointHistoryItem', () => {
    const defaultProps = {
        category: 'Pembelian',
        title: 'Order #12345',
        date: '1 Januari 2026',
        amount: 50,
    };

    describe('Rendering', () => {
        it('should render all props correctly', () => {
            render(<PointHistoryItem {...defaultProps} />);

            expect(screen.getByText('Pembelian')).toBeInTheDocument();
            expect(screen.getByText('Order #12345')).toBeInTheDocument();
            expect(screen.getByText('1 Januari 2026')).toBeInTheDocument();
            expect(screen.getByText('+ 50')).toBeInTheDocument();
        });

        it('should render point icon', () => {
            render(<PointHistoryItem {...defaultProps} />);

            const icon = screen.getByAltText('Poin');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveAttribute('src', '/icons/icon-poin.svg');
        });

        it('should render with zero amount', () => {
            render(<PointHistoryItem {...defaultProps} amount={0} />);

            expect(screen.getByText('+ 0')).toBeInTheDocument();
        });

        it('should render with large positive amount', () => {
            render(<PointHistoryItem {...defaultProps} amount={999999} />);

            expect(screen.getByText('+ 999.999')).toBeInTheDocument();
        });

        it('should render with large negative amount', () => {
            render(<PointHistoryItem {...defaultProps} amount={-999999} />);

            expect(screen.getByText('-999.999')).toBeInTheDocument();
        });
    });

    describe('Positive Amount Styling', () => {
        it('should display positive amount with plus sign', () => {
            render(<PointHistoryItem {...defaultProps} amount={50} />);

            const amountText = screen.getByText('+ 50');
            expect(amountText).toBeInTheDocument();
        });

        it('should apply green color class for positive amount', () => {
            render(<PointHistoryItem {...defaultProps} amount={50} />);

            const amountText = screen.getByText('+ 50');
            expect(amountText).toHaveClass('text-green-500');
        });

        it('should display zero with plus sign', () => {
            render(<PointHistoryItem {...defaultProps} amount={0} />);

            const amountText = screen.getByText('+ 0');
            expect(amountText).toBeInTheDocument();
            expect(amountText).toHaveClass('text-green-500');
        });
    });

    describe('Negative Amount Styling', () => {
        it('should display negative amount without extra minus sign', () => {
            render(<PointHistoryItem {...defaultProps} amount={-30} />);

            const amountText = screen.getByText('-30');
            expect(amountText).toBeInTheDocument();
        });

        it('should apply red color class for negative amount', () => {
            render(<PointHistoryItem {...defaultProps} amount={-30} />);

            const amountText = screen.getByText('-30');
            expect(amountText).toHaveClass('text-red-500');
        });

        it('should handle small negative amounts', () => {
            render(<PointHistoryItem {...defaultProps} amount={-1} />);

            expect(screen.getByText('-1')).toBeInTheDocument();
        });
    });

    describe('Number Formatting', () => {
        it('should format thousands with dot separator', () => {
            render(<PointHistoryItem {...defaultProps} amount={1000} />);

            expect(screen.getByText('+ 1.000')).toBeInTheDocument();
        });

        it('should format millions correctly', () => {
            render(<PointHistoryItem {...defaultProps} amount={1000000} />);

            expect(screen.getByText('+ 1.000.000')).toBeInTheDocument();
        });

        it('should format negative thousands correctly', () => {
            render(<PointHistoryItem {...defaultProps} amount={-5000} />);

            expect(screen.getByText('-5.000')).toBeInTheDocument();
        });

        it('should not format numbers less than 1000', () => {
            render(<PointHistoryItem {...defaultProps} amount={999} />);

            expect(screen.getByText('+ 999')).toBeInTheDocument();
        });

        it('should handle decimal amounts', () => {
            render(<PointHistoryItem {...defaultProps} amount={50.5} />);

            const amountElement = screen.getByText(/50/);
            expect(amountElement).toBeInTheDocument();
        });
    });

    describe('Category Display', () => {
        it('should render different categories', () => {
            const categories = ['Pembelian', 'Penukaran', 'Bonus', 'Refund'];

            categories.forEach((category) => {
                const { unmount } = render(
                    <PointHistoryItem {...defaultProps} category={category} />
                );
                expect(screen.getByText(category)).toBeInTheDocument();
                unmount();
            });
        });

        it('should handle empty category', () => {
            render(<PointHistoryItem {...defaultProps} category="" />);

            const categoryElement = screen.queryByText('Pembelian');
            expect(categoryElement).not.toBeInTheDocument();
        });

        it('should handle long category names', () => {
            const longCategory = 'Very Long Category Name That Might Overflow';
            render(<PointHistoryItem {...defaultProps} category={longCategory} />);

            expect(screen.getByText(longCategory)).toBeInTheDocument();
        });
    });

    describe('Title Display', () => {
        it('should render different title formats', () => {
            const titles = [
                'Order #12345',
                'Voucher Redeemed',
                'Welcome Bonus',
                'Refund for Order #999',
            ];

            titles.forEach((title) => {
                const { unmount } = render(<PointHistoryItem {...defaultProps} title={title} />);
                expect(screen.getByText(title)).toBeInTheDocument();
                unmount();
            });
        });

        it('should handle empty title', () => {
            render(<PointHistoryItem {...defaultProps} title="" />);

            const titleElement = screen.queryByText('Order #12345');
            expect(titleElement).not.toBeInTheDocument();
        });

        it('should handle special characters in title', () => {
            const specialTitle = 'Order #12345 - 50% Discount!';
            render(<PointHistoryItem {...defaultProps} title={specialTitle} />);

            expect(screen.getByText(specialTitle)).toBeInTheDocument();
        });
    });

    describe('Date Display', () => {
        it('should render different date formats', () => {
            const dates = [
                '1 Januari 2026',
                '15 Desember 2025',
                '2026-01-01',
                'Today',
                'Yesterday',
            ];

            dates.forEach((date) => {
                const { unmount } = render(<PointHistoryItem {...defaultProps} date={date} />);
                expect(screen.getByText(date)).toBeInTheDocument();
                unmount();
            });
        });

        it('should handle empty date', () => {
            render(<PointHistoryItem {...defaultProps} date="" />);

            const dateElement = screen.queryByText('1 Januari 2026');
            expect(dateElement).not.toBeInTheDocument();
        });

        it('should handle long date strings', () => {
            const longDate = 'Senin, 1 Januari 2026 pukul 14:30 WIB';
            render(<PointHistoryItem {...defaultProps} date={longDate} />);

            expect(screen.getByText(longDate)).toBeInTheDocument();
        });
    });

    describe('Layout and Styling', () => {
        it('should have correct container structure', () => {
            const { container } = render(<PointHistoryItem {...defaultProps} />);

            const mainContainer = container.querySelector('.flex.flex-row.items-center');
            expect(mainContainer).toBeInTheDocument();
        });

        it('should have border styling', () => {
            const { container } = render(<PointHistoryItem {...defaultProps} />);

            const borderElement = container.querySelector('.border-b.border-dashed');
            expect(borderElement).toBeInTheDocument();
        });

        it('should have proper spacing classes', () => {
            const { container } = render(<PointHistoryItem {...defaultProps} />);

            const gapElement = container.querySelector('.gap-1');
            expect(gapElement).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle all props as empty strings', () => {
            render(<PointHistoryItem category="" title="" date="" amount={0} />);

            expect(screen.getByText('+ 0')).toBeInTheDocument();
        });

        it('should handle very large positive numbers', () => {
            render(<PointHistoryItem {...defaultProps} amount={Number.MAX_SAFE_INTEGER} />);

            const amountElement = screen.getByText(/\+/);
            expect(amountElement).toBeInTheDocument();
        });

        it('should handle very large negative numbers', () => {
            render(<PointHistoryItem {...defaultProps} amount={-Number.MAX_SAFE_INTEGER} />);

            const amountElement = screen.getByText(/-/);
            expect(amountElement).toBeInTheDocument();
        });

        it('should handle unicode characters in text fields', () => {
            render(
                <PointHistoryItem
                    category="购买"
                    title="订单 #12345"
                    date="2026年1月1日"
                    amount={50}
                />
            );

            expect(screen.getByText('购买')).toBeInTheDocument();
            expect(screen.getByText('订单 #12345')).toBeInTheDocument();
            expect(screen.getByText('2026年1月1日')).toBeInTheDocument();
        });

        it('should handle HTML entities in text', () => {
            render(
                <PointHistoryItem
                    {...defaultProps}
                    title="Order & Purchase #12345"
                />
            );

            expect(screen.getByText('Order & Purchase #12345')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            const { container } = render(<PointHistoryItem {...defaultProps} />);

            const heading = container.querySelector('h1');
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Order #12345');
        });

        it('should have accessible image alt text', () => {
            render(<PointHistoryItem {...defaultProps} />);

            const image = screen.getByAltText('Poin');
            expect(image).toBeInTheDocument();
        });

        it('should use semantic HTML elements', () => {
            const { container } = render(<PointHistoryItem {...defaultProps} />);

            expect(container.querySelector('p')).toBeInTheDocument();
            expect(container.querySelector('h1')).toBeInTheDocument();
            expect(container.querySelector('span')).toBeInTheDocument();
        });
    });

    describe('Text Styling', () => {
        it('should apply correct font classes to category', () => {
            render(<PointHistoryItem {...defaultProps} />);

            const category = screen.getByText('Pembelian');
            expect(category).toHaveClass('font-rubik', 'font-medium', 'text-xs');
        });

        it('should apply correct font classes to title', () => {
            render(<PointHistoryItem {...defaultProps} />);

            const title = screen.getByText('Order #12345');
            expect(title).toHaveClass('font-rubik', 'font-medium', 'text-base');
        });

        it('should apply correct font classes to date', () => {
            render(<PointHistoryItem {...defaultProps} />);

            const date = screen.getByText('1 Januari 2026');
            expect(date).toHaveClass('font-rubik', 'font-normal', 'text-xs');
        });

        it('should apply correct font classes to amount', () => {
            render(<PointHistoryItem {...defaultProps} />);

            const amount = screen.getByText('+ 50');
            expect(amount).toHaveClass('font-medium', 'text-xs', 'font-rubik');
        });
    });
});
