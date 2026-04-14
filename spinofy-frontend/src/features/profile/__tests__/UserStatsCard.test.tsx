import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Heart, ShoppingBag, Gift } from 'lucide-react';
import UserStatsCard from '../pages/Components/UserStatsCard';
import './setup';

describe('UserStatsCard', () => {
    const mockStats = [
        {
            title: 'Favorit',
            value: 5,
            icon: <Heart data-testid="heart-icon" className="w-5 h-5" />,
        },
        {
            title: 'Pesanan',
            value: 10,
            icon: <ShoppingBag data-testid="bag-icon" className="w-5 h-5" />,
            withBorder: true,
        },
        {
            title: 'Poin',
            value: 100,
            icon: <Gift data-testid="gift-icon" className="w-5 h-5" />,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render the component', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should render all stat items', () => {
            render(<UserStatsCard stats={mockStats} />);

            expect(screen.getByText('Favorit')).toBeInTheDocument();
            expect(screen.getByText('Pesanan')).toBeInTheDocument();
            expect(screen.getByText('Poin')).toBeInTheDocument();
        });

        it('should render stat values', () => {
            render(<UserStatsCard stats={mockStats} />);

            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('should render stat icons', () => {
            render(<UserStatsCard stats={mockStats} />);

            expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
            expect(screen.getByTestId('bag-icon')).toBeInTheDocument();
            expect(screen.getByTestId('gift-icon')).toBeInTheDocument();
        });

        it('should render with default className', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('px-4', '-mt-8', 'mb-6', 'relative', 'z-20');
        });

        it('should apply custom className', () => {
            const { container } = render(<UserStatsCard stats={mockStats} className="custom-class" />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('custom-class');
        });

        it('should merge custom className with default classes', () => {
            const { container } = render(<UserStatsCard stats={mockStats} className="custom-class" />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('px-4', '-mt-8', 'custom-class');
        });
    });

    describe('Card Styling', () => {
        it('should have correct card styling', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const card = container.querySelector('.bg-white');
            expect(card).toHaveClass(
                'bg-white',
                'rounded-2xl',
                'border',
                'border-white',
                'shadow-sm',
                'p-4',
                'flex',
                'justify-between',
                'items-center'
            );
        });

        it('should have rounded corners', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const card = container.querySelector('.rounded-2xl');
            expect(card).toBeInTheDocument();
        });

        it('should have shadow', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const card = container.querySelector('.shadow-sm');
            expect(card).toBeInTheDocument();
        });
    });

    describe('Stat Item Layout', () => {
        it('should render stat items with flex layout', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const statItems = container.querySelectorAll('.flex.flex-col');
            expect(statItems.length).toBe(3);
        });

        it('should center align stat items', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const statItems = container.querySelectorAll('.items-center');
            expect(statItems.length).toBeGreaterThan(0);
        });

        it('should have gap between elements', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const statItems = container.querySelectorAll('.gap-2');
            expect(statItems.length).toBeGreaterThan(0);
        });

        it('should have flex-1 for equal width distribution', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const statItems = container.querySelectorAll('.flex-1');
            expect(statItems.length).toBe(3);
        });
    });

    describe('Border Styling', () => {
        it('should apply border to items with withBorder true', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const borderedItems = container.querySelectorAll('.border-x');
            expect(borderedItems.length).toBe(1);
        });

        it('should not apply border to items without withBorder', () => {
            const statsWithoutBorder = [
                {
                    title: 'Test',
                    value: 1,
                    icon: <Heart />,
                    withBorder: false,
                },
            ];
            const { container } = render(<UserStatsCard stats={statsWithoutBorder} />);
            const borderedItems = container.querySelectorAll('.border-x');
            expect(borderedItems.length).toBe(0);
        });

        it('should apply correct border color', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const borderedItem = container.querySelector('.border-gray-100');
            expect(borderedItem).toBeInTheDocument();
        });

        it('should apply padding to bordered items', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const borderedItem = container.querySelector('.border-x');
            expect(borderedItem).toHaveClass('px-2');
        });
    });

    describe('Title Styling', () => {
        it('should have correct title styling', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const titles = container.querySelectorAll('h3');
            titles.forEach(title => {
                expect(title).toHaveClass('text-title-black', 'text-base', 'font-medium', 'text-center');
            });
        });

        it('should center align titles', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const titles = container.querySelectorAll('h3');
            titles.forEach(title => {
                expect(title).toHaveClass('text-center');
            });
        });
    });

    describe('Value and Icon Display', () => {
        it('should display values with correct styling', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const values = container.querySelectorAll('span');
            values.forEach(value => {
                expect(value).toHaveClass('text-title-black', 'text-sm', 'font-medium');
            });
        });

        it('should group icon and value together', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const iconValueGroups = container.querySelectorAll('.flex.items-center.gap-2');
            expect(iconValueGroups.length).toBe(3);
        });

        it('should handle string values', () => {
            const statsWithString = [
                {
                    title: 'Status',
                    value: 'Active',
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={statsWithString} />);
            expect(screen.getByText('Active')).toBeInTheDocument();
        });

        it('should handle numeric values', () => {
            render(<UserStatsCard stats={mockStats} />);
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('should handle zero values', () => {
            const statsWithZero = [
                {
                    title: 'Count',
                    value: 0,
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={statsWithZero} />);
            expect(screen.getByText('0')).toBeInTheDocument();
        });
    });

    describe('Click Handling', () => {
        it('should call onClick when stat item is clicked', () => {
            const handleClick = vi.fn();
            const statsWithClick = [
                {
                    title: 'Clickable',
                    value: 5,
                    icon: <Heart />,
                    onClick: handleClick,
                },
            ];

            render(<UserStatsCard stats={statsWithClick} />);

            const clickableElement = screen.getByText('5');
            fireEvent.click(clickableElement);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not throw error when onClick is not provided', () => {
            render(<UserStatsCard stats={mockStats} />);

            const value = screen.getByText('5');
            expect(() => fireEvent.click(value)).not.toThrow();
        });

        it('should handle multiple clicks', () => {
            const handleClick = vi.fn();
            const statsWithClick = [
                {
                    title: 'Clickable',
                    value: 5,
                    icon: <Heart />,
                    onClick: handleClick,
                },
            ];

            render(<UserStatsCard stats={statsWithClick} />);

            const clickableElement = screen.getByText('5');
            fireEvent.click(clickableElement);
            fireEvent.click(clickableElement);
            fireEvent.click(clickableElement);

            expect(handleClick).toHaveBeenCalledTimes(3);
        });

        it('should handle clicks independently for multiple stats', () => {
            const onClick1 = vi.fn();
            const onClick2 = vi.fn();
            const statsWithClicks = [
                {
                    title: 'First',
                    value: 1,
                    icon: <Heart />,
                    onClick: onClick1,
                },
                {
                    title: 'Second',
                    value: 2,
                    icon: <Gift />,
                    onClick: onClick2,
                },
            ];

            render(<UserStatsCard stats={statsWithClicks} />);

            fireEvent.click(screen.getByText('1'));
            expect(onClick1).toHaveBeenCalledTimes(1);
            expect(onClick2).not.toHaveBeenCalled();

            fireEvent.click(screen.getByText('2'));
            expect(onClick2).toHaveBeenCalledTimes(1);
            expect(onClick1).toHaveBeenCalledTimes(1);
        });
    });

    describe('Empty and Edge Cases', () => {
        it('should handle empty stats array', () => {
            const { container } = render(<UserStatsCard stats={[]} />);
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should handle single stat item', () => {
            const singleStat = [mockStats[0]];
            render(<UserStatsCard stats={singleStat} />);
            expect(screen.getByText('Favorit')).toBeInTheDocument();
        });

        it('should handle many stat items', () => {
            const manyStats = Array.from({ length: 10 }, (_, i) => ({
                title: `Stat ${i}`,
                value: i,
                icon: <Heart key={i} />,
            }));
            render(<UserStatsCard stats={manyStats} />);
            expect(screen.getByText('Stat 0')).toBeInTheDocument();
            expect(screen.getByText('Stat 9')).toBeInTheDocument();
        });

        it('should handle very long titles', () => {
            const longTitleStats = [
                {
                    title: 'A'.repeat(100),
                    value: 1,
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={longTitleStats} />);
            expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
        });

        it('should handle very large values', () => {
            const largeValueStats = [
                {
                    title: 'Large',
                    value: 999999999,
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={largeValueStats} />);
            expect(screen.getByText('999999999')).toBeInTheDocument();
        });

        it('should handle special characters in title', () => {
            const specialCharStats = [
                {
                    title: 'Test & Title <>',
                    value: 1,
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={specialCharStats} />);
            expect(screen.getByText('Test & Title <>')).toBeInTheDocument();
        });

        it('should handle unicode characters in title', () => {
            const unicodeStats = [
                {
                    title: '测试 🎉',
                    value: 1,
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={unicodeStats} />);
            expect(screen.getByText('测试 🎉')).toBeInTheDocument();
        });

        it('should handle negative values', () => {
            const negativeStats = [
                {
                    title: 'Negative',
                    value: -5,
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={negativeStats} />);
            expect(screen.getByText('-5')).toBeInTheDocument();
        });

        it('should handle decimal values', () => {
            const decimalStats = [
                {
                    title: 'Decimal',
                    value: '3.14',
                    icon: <Heart />,
                },
            ];
            render(<UserStatsCard stats={decimalStats} />);
            expect(screen.getByText('3.14')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should use semantic heading for titles', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const headings = container.querySelectorAll('h3');
            expect(headings.length).toBe(3);
        });

        it('should have proper structure for screen readers', () => {
            render(<UserStatsCard stats={mockStats} />);
            expect(screen.getByText('Favorit')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
        });
    });

    describe('Responsive Layout', () => {
        it('should use flexbox for responsive layout', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const card = container.querySelector('.flex.justify-between');
            expect(card).toBeInTheDocument();
        });

        it('should distribute space evenly with flex-1', () => {
            const { container } = render(<UserStatsCard stats={mockStats} />);
            const statItems = container.querySelectorAll('.flex-1');
            expect(statItems.length).toBe(3);
        });
    });
});
