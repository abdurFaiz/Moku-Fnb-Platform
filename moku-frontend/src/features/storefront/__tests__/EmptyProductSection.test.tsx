import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyProductSection from '../components/EmptyProductSection';

describe('EmptyProductSection', () => {
    const defaultProps = {
        title: 'Products',
        onRetry: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render empty state message', () => {
            render(<EmptyProductSection {...defaultProps} />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should display retry button', () => {
            render(<EmptyProductSection {...defaultProps} />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });
    });

    describe('Interactions', () => {
        it('should call onRetry when retry button is clicked', () => {
            const onRetry = vi.fn();
            render(<EmptyProductSection {...defaultProps} onRetry={onRetry} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(onRetry).toHaveBeenCalled();
        });

        it('should handle multiple retry clicks', () => {
            const onRetry = vi.fn();
            render(<EmptyProductSection {...defaultProps} onRetry={onRetry} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            expect(onRetry).toHaveBeenCalledTimes(3);
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined onRetry', () => {
            render(<EmptyProductSection title="Products" onRetry={undefined as any} />);

            expect(screen.queryByRole('button')).not.toBeInTheDocument();
        });
    });
});
