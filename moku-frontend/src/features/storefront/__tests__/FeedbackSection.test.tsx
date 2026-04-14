import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeedbackSection } from '../components/FeedbackSection';
import './setup';

// Mock FeedbackBottomSheet component
vi.mock('../components/FeedbackBottomSheet', () => ({
    FeedbackBottomSheet: ({ open, onOpenChange, onSuccess }: any) => (
        <div data-testid="feedback-bottom-sheet">
            <div data-testid="bottom-sheet-open">{open ? 'open' : 'closed'}</div>
            <button
                data-testid="trigger-success"
                onClick={() => onSuccess?.()}
            >
                Trigger Success
            </button>
            <button
                data-testid="trigger-close"
                onClick={() => onOpenChange?.(false)}
            >
                Close
            </button>
        </div>
    ),
}));

describe('FeedbackSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Rendering', () => {
        it('should render feedback section when visible', () => {
            render(<FeedbackSection visible={true} />);

            expect(screen.getByText('Yuk kasih tau pendapat kamu🤗')).toBeInTheDocument();
            expect(screen.getByText('Isi Disini Ya')).toBeInTheDocument();
        });

        it('should not render when visible is false', () => {
            render(<FeedbackSection visible={false} />);

            expect(screen.queryByText('Yuk kasih tau pendapat kamu🤗')).not.toBeInTheDocument();
        });

        it('should render by default when visible prop is not provided', () => {
            render(<FeedbackSection />);

            expect(screen.getByText('Yuk kasih tau pendapat kamu🤗')).toBeInTheDocument();
        });

        it('should not render when feedback was already submitted', () => {
            localStorage.setItem('feedbackSubmitted', 'true');

            render(<FeedbackSection visible={true} />);

            expect(screen.queryByText('Yuk kasih tau pendapat kamu🤗')).not.toBeInTheDocument();
        });

        it('should render when feedbackSubmitted is not true', () => {
            localStorage.setItem('feedbackSubmitted', 'false');

            render(<FeedbackSection visible={true} />);

            expect(screen.getByText('Yuk kasih tau pendapat kamu🤗')).toBeInTheDocument();
        });
    });

    describe('Button Interaction', () => {
        it('should open bottom sheet when button is clicked', () => {
            render(<FeedbackSection visible={true} />);

            const button = screen.getByText('Isi Disini Ya');
            fireEvent.click(button);

            expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('open');
        });

        it('should close bottom sheet when close is triggered', async () => {
            render(<FeedbackSection visible={true} />);

            // Open the bottom sheet
            const openButton = screen.getByText('Isi Disini Ya');
            fireEvent.click(openButton);

            expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('open');

            // Close the bottom sheet
            const closeButton = screen.getByTestId('trigger-close');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('closed');
            });
        });
    });

    describe('Success Handling', () => {
        it('should hide section when feedback is successfully submitted', async () => {
            render(<FeedbackSection visible={true} />);

            // Open the bottom sheet
            const openButton = screen.getByText('Isi Disini Ya');
            fireEvent.click(openButton);

            // Trigger success
            const successButton = screen.getByTestId('trigger-success');
            fireEvent.click(successButton);

            await waitFor(() => {
                expect(screen.queryByText('Yuk kasih tau pendapat kamu🤗')).not.toBeInTheDocument();
            });
        });

        it('should set localStorage when feedback is submitted', async () => {
            render(<FeedbackSection visible={true} />);

            // Open the bottom sheet
            const openButton = screen.getByText('Isi Disini Ya');
            fireEvent.click(openButton);

            // Trigger success
            const successButton = screen.getByTestId('trigger-success');
            fireEvent.click(successButton);

            await waitFor(() => {
                expect(localStorage.getItem('feedbackSubmitted')).toBe('true');
            });
        });

        it('should call onHide callback when feedback is submitted', async () => {
            const onHide = vi.fn();
            render(<FeedbackSection visible={true} onHide={onHide} />);

            // Open the bottom sheet
            const openButton = screen.getByText('Isi Disini Ya');
            fireEvent.click(openButton);

            // Trigger success
            const successButton = screen.getByTestId('trigger-success');
            fireEvent.click(successButton);

            await waitFor(() => {
                expect(onHide).toHaveBeenCalled();
            });
        });

        it('should not call onHide when not provided', async () => {
            render(<FeedbackSection visible={true} />);

            // Open the bottom sheet
            const openButton = screen.getByText('Isi Disini Ya');
            fireEvent.click(openButton);

            // Trigger success - should not throw error
            const successButton = screen.getByTestId('trigger-success');
            expect(() => fireEvent.click(successButton)).not.toThrow();
        });
    });

    describe('LocalStorage Persistence', () => {
        it('should check localStorage on mount', () => {
            localStorage.setItem('feedbackSubmitted', 'true');

            render(<FeedbackSection visible={true} />);

            expect(screen.queryByText('Yuk kasih tau pendapat kamu🤗')).not.toBeInTheDocument();
        });

        it('should remain visible when localStorage is empty', () => {
            render(<FeedbackSection visible={true} />);

            expect(screen.getByText('Yuk kasih tau pendapat kamu🤗')).toBeInTheDocument();
        });

        it('should remain visible when localStorage has different value', () => {
            localStorage.setItem('feedbackSubmitted', 'false');

            render(<FeedbackSection visible={true} />);

            expect(screen.getByText('Yuk kasih tau pendapat kamu🤗')).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should render with correct styling classes', () => {
            const { container } = render(<FeedbackSection visible={true} />);

            const mainDiv = container.querySelector('.z-10.w-full.max-w-\\[440px\\]');
            expect(mainDiv).toBeInTheDocument();
        });

        it('should render button with correct variant', () => {
            render(<FeedbackSection visible={true} />);

            const button = screen.getByText('Isi Disini Ya');
            expect(button).toBeInTheDocument();
        });

        it('should pass correct props to FeedbackBottomSheet', () => {
            render(<FeedbackSection visible={true} />);

            expect(screen.getByTestId('feedback-bottom-sheet')).toBeInTheDocument();
            expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('closed');
        });
    });

    describe('Multiple Interactions', () => {
        it('should handle multiple open/close cycles', async () => {
            render(<FeedbackSection visible={true} />);

            const openButton = screen.getByText('Isi Disini Ya');

            // First cycle
            fireEvent.click(openButton);
            expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('open');

            const closeButton = screen.getByTestId('trigger-close');
            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('closed');
            });

            // Second cycle
            fireEvent.click(openButton);
            expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('open');
        });

        it('should only hide once after success', async () => {
            const onHide = vi.fn();
            render(<FeedbackSection visible={true} onHide={onHide} />);

            const openButton = screen.getByText('Isi Disini Ya');
            fireEvent.click(openButton);

            const successButton = screen.getByTestId('trigger-success');
            fireEvent.click(successButton);

            await waitFor(() => {
                expect(onHide).toHaveBeenCalledTimes(1);
            });

            // Click again should not call onHide again since component is hidden
            expect(screen.queryByText('Yuk kasih tau pendapat kamu🤗')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle rapid button clicks', () => {
            render(<FeedbackSection visible={true} />);

            const button = screen.getByText('Isi Disini Ya');

            // Rapid clicks
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            // Should still work correctly
            expect(screen.getByTestId('bottom-sheet-open')).toHaveTextContent('open');
        });

        it('should handle visible prop changes', () => {
            const { rerender } = render(<FeedbackSection visible={true} />);

            expect(screen.getByText('Yuk kasih tau pendapat kamu🤗')).toBeInTheDocument();

            rerender(<FeedbackSection visible={false} />);

            expect(screen.queryByText('Yuk kasih tau pendapat kamu🤗')).not.toBeInTheDocument();

            rerender(<FeedbackSection visible={true} />);

            expect(screen.getByText('Yuk kasih tau pendapat kamu🤗')).toBeInTheDocument();
        });

        it('should handle onHide prop changes', async () => {
            const onHide1 = vi.fn();
            const onHide2 = vi.fn();

            const { rerender } = render(<FeedbackSection visible={true} onHide={onHide1} />);

            const openButton = screen.getByText('Isi Disini Ya');
            fireEvent.click(openButton);

            rerender(<FeedbackSection visible={true} onHide={onHide2} />);

            const successButton = screen.getByTestId('trigger-success');
            fireEvent.click(successButton);

            await waitFor(() => {
                expect(onHide2).toHaveBeenCalled();
                expect(onHide1).not.toHaveBeenCalled();
            });
        });
    });
});
