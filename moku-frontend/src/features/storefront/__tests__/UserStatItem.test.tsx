import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserStatItem } from '../components/headerprofileuser/UserStatItem';

describe('UserStatItem', () => {
    const defaultProps = {
        label: 'Total Orders',
        value: 42,
        icon: 'icon-orders',
        onClick: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render stat item', () => {
            render(<UserStatItem {...defaultProps} />);

            expect(screen.getByText('Total Orders')).toBeInTheDocument();
            expect(screen.getByText('42')).toBeInTheDocument();
        });

        it('should render with custom label', () => {
            render(<UserStatItem {...defaultProps} label='Custom Label' />);

            expect(screen.getByText('Custom Label')).toBeInTheDocument();
        });

        it('should render with custom value', () => {
            render(<UserStatItem {...defaultProps} value={100} />);

            expect(screen.getByText('100')).toBeInTheDocument();
        });

        it('should render as button', () => {
            render(<UserStatItem {...defaultProps} />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onClick when clicked', () => {
            const onClick = vi.fn();
            render(<UserStatItem {...defaultProps} onClick={onClick} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(onClick).toHaveBeenCalled();
        });

        it('should handle multiple clicks', () => {
            const onClick = vi.fn();
            render(<UserStatItem {...defaultProps} onClick={onClick} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            expect(onClick).toHaveBeenCalledTimes(3);
        });
    });

    describe('Label Display', () => {
        it('should display label correctly', () => {
            render(<UserStatItem {...defaultProps} label='Completed Orders' />);

            expect(screen.getByText('Completed Orders')).toBeInTheDocument();
        });

        it('should handle long labels', () => {
            const longLabel = 'A'.repeat(100);
            render(<UserStatItem {...defaultProps} label={longLabel} />);

            expect(screen.getByText(longLabel)).toBeInTheDocument();
        });

        it('should handle special characters in label', () => {
            render(<UserStatItem {...defaultProps} label='Café & Restaurant Orders' />);

            expect(screen.getByText('Café & Restaurant Orders')).toBeInTheDocument();
        });
    });

    describe('Value Display', () => {
        it('should display value correctly', () => {
            render(<UserStatItem {...defaultProps} value={999} />);

            expect(screen.getByText('999')).toBeInTheDocument();
        });

        it('should handle zero value', () => {
            render(<UserStatItem {...defaultProps} value={0} />);

            expect(screen.getByText('0')).toBeInTheDocument();
        });

        it('should handle large values', () => {
            render(<UserStatItem {...defaultProps} value={999999} />);

            expect(screen.getByText('999999')).toBeInTheDocument();
        });

        it('should handle formatted values', () => {
            render(<UserStatItem {...defaultProps} value={1234567} />);

            expect(screen.getByText('1234567')).toBeInTheDocument();
        });
    });

    describe('Icon Display', () => {
        it('should accept icon prop', () => {
            render(<UserStatItem {...defaultProps} icon='custom-icon' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle different icon types', () => {
            render(<UserStatItem {...defaultProps} icon='icon-different' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty label', () => {
            render(<UserStatItem {...defaultProps} label='' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle empty value', () => {
            render(<UserStatItem {...defaultProps} value={0} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle undefined onClick', () => {
            render(<UserStatItem {...defaultProps} onClick={undefined as any} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should be keyboard accessible', () => {
            const onClick = vi.fn();
            render(<UserStatItem {...defaultProps} onClick={onClick} />);

            const button = screen.getByRole('button');
            button.focus();
            expect(button).toHaveFocus();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle label changes', () => {
            const { rerender } = render(<UserStatItem {...defaultProps} label='First' />);

            expect(screen.getByText('First')).toBeInTheDocument();

            rerender(<UserStatItem {...defaultProps} label='Second' />);

            expect(screen.getByText('Second')).toBeInTheDocument();
        });

        it('should handle value changes', () => {
            const { rerender } = render(<UserStatItem {...defaultProps} value={10} />);

            expect(screen.getByText('10')).toBeInTheDocument();

            rerender(<UserStatItem {...defaultProps} value={20} />);

            expect(screen.getByText('20')).toBeInTheDocument();
        });
    });
});
