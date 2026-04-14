import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListItemLink from '../pages/Components/ItemLink';
import './setup';

describe('ListItemLink', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render the component with label', () => {
            render(<ListItemLink label="Test Label" />);

            expect(screen.getByText('Test Label')).toBeInTheDocument();
        });

        it('should render as an anchor tag', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
        });

        it('should have default href of #', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '#');
        });

        it('should render with custom href', () => {
            render(<ListItemLink label="Test Label" href="/custom-path" />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '/custom-path');
        });

        it('should render default ChevronRight icon', () => {
            const { container } = render(<ListItemLink label="Test Label" />);

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });

        it('should render custom icon when provided', () => {
            const CustomIcon = () => <span data-testid="custom-icon">Custom</span>;
            render(<ListItemLink label="Test Label" icon={<CustomIcon />} />);

            expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should have default styling classes', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('flex', 'items-center', 'justify-between');
            expect(link).toHaveClass('py-3', 'px-3');
            expect(link).toHaveClass('hover:bg-gray-50', 'rounded-lg', 'transition-colors');
        });

        it('should apply custom className', () => {
            render(<ListItemLink label="Test Label" className="custom-class" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('custom-class');
        });

        it('should merge custom className with default classes', () => {
            render(<ListItemLink label="Test Label" className="custom-class" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('flex', 'items-center', 'custom-class');
        });

        it('should have correct label styling', () => {
            render(<ListItemLink label="Test Label" />);

            const label = screen.getByText('Test Label');
            expect(label).toHaveClass('text-brand-gray', 'text-base');
        });
    });

    describe('Click Handling', () => {
        it('should call onClick when clicked', () => {
            const handleClick = vi.fn();

            render(<ListItemLink label="Test Label" onClick={handleClick} />);

            const link = screen.getByRole('link');
            fireEvent.click(link);

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('should not throw error when onClick is not provided', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(() => fireEvent.click(link)).not.toThrow();
        });

        it('should call onClick with event object', () => {
            const handleClick = vi.fn();

            render(<ListItemLink label="Test Label" onClick={handleClick} />);

            const link = screen.getByRole('link');
            fireEvent.click(link);

            expect(handleClick).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('Accessibility', () => {
        it('should be keyboard accessible', () => {
            const handleClick = vi.fn();

            render(<ListItemLink label="Test Label" onClick={handleClick} />);

            const link = screen.getByRole('link');
            link.focus();
            expect(link).toHaveFocus();
        });

        it('should have accessible label text', () => {
            render(<ListItemLink label="Profile Settings" />);

            expect(screen.getByText('Profile Settings')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty label', () => {
            render(<ListItemLink label="" />);

            const link = screen.getByRole('link');
            expect(link).toBeInTheDocument();
        });

        it('should handle very long labels', () => {
            const longLabel = 'A'.repeat(200);
            render(<ListItemLink label={longLabel} />);

            expect(screen.getByText(longLabel)).toBeInTheDocument();
        });

        it('should handle special characters in label', () => {
            render(<ListItemLink label="Test & Label <>" />);

            expect(screen.getByText('Test & Label <>')).toBeInTheDocument();
        });

        it('should handle unicode characters in label', () => {
            render(<ListItemLink label="测试 🎉 テスト" />);

            expect(screen.getByText('测试 🎉 テ工作')).toBeInTheDocument();
        });

        it('should handle empty href', () => {
            render(<ListItemLink label="Test Label" href="" />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '');
        });

        it('should handle external URLs', () => {
            render(<ListItemLink label="External Link" href="https://example.com" />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', 'https://example.com');
        });

        it('should handle relative paths', () => {
            render(<ListItemLink label="Relative Link" href="../parent/path" />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '../parent/path');
        });

        it('should handle query parameters in href', () => {
            render(<ListItemLink label="Query Link" href="/path?param=value" />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '/path?param=value');
        });

        it('should handle hash fragments in href', () => {
            render(<ListItemLink label="Hash Link" href="#section" />);

            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '#section');
        });

        it('should handle null icon gracefully', () => {
            render(<ListItemLink label="Test Label" icon={null} />);

            expect(screen.getByText('Test Label')).toBeInTheDocument();
        });

        it('should handle undefined icon gracefully', () => {
            const { container } = render(<ListItemLink label="Test Label" icon={undefined} />);
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('Layout', () => {
        it('should have flex layout', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('flex');
        });

        it('should align items center', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('items-center');
        });

        it('should justify content between', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('justify-between');
        });

        it('should have padding', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('py-3', 'px-3');
        });

        it('should have rounded corners', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('rounded-lg');
        });
    });

    describe('Hover Effects', () => {
        it('should have hover background class', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('hover:bg-gray-50');
        });

        it('should have transition class', () => {
            render(<ListItemLink label="Test Label" />);

            const link = screen.getByRole('link');
            expect(link).toHaveClass('transition-colors');
        });
    });

    describe('Multiple Instances', () => {
        it('should render multiple instances independently', () => {
            render(
                <>
                    <ListItemLink label="Link 1" href="/path1" />
                    <ListItemLink label="Link 2" href="/path2" />
                    <ListItemLink label="Link 3" href="/path3" />
                </>
            );

            expect(screen.getByText('Link 1')).toBeInTheDocument();
            expect(screen.getByText('Link 2')).toBeInTheDocument();
            expect(screen.getByText('Link 3')).toBeInTheDocument();
        });

        it('should handle clicks independently', () => {
            const onClick1 = vi.fn();
            const onClick2 = vi.fn();

            render(
                <>
                    <ListItemLink label="Link 1" onClick={onClick1} />
                    <ListItemLink label="Link 2" onClick={onClick2} />
                </>
            );

            fireEvent.click(screen.getByText('Link 1'));
            expect(onClick1).toHaveBeenCalledTimes(1);
            expect(onClick2).not.toHaveBeenCalled();

            fireEvent.click(screen.getByText('Link 2'));
            expect(onClick2).toHaveBeenCalledTimes(1);
            expect(onClick1).toHaveBeenCalledTimes(1);
        });
    });
});
