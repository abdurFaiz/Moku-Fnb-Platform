import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeedbackBottomSheet } from '../components/FeedbackBottomSheet';
import { useSubmitFeedback } from '../hooks/api/useMutationFeedback';
import { useQueryFeedback, useGetAllFeedbackData } from '../hooks/api/useQueryFeedback';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import type { FeedbackResponse } from '../types/Feedback';
import './setup';

// Mock hooks
vi.mock('../hooks/api/useMutationFeedback');
vi.mock('../hooks/api/useQueryFeedback');
vi.mock('@/features/outlets/hooks/useOutletSlug');

// Mock UI components
vi.mock('@/components/ui/drawer', () => ({
    Drawer: ({ children, open }: any) => (open ? <div data-testid="drawer">{children}</div> : null),
    DrawerClose: () => <button data-testid="drawer-close">Close</button>,
    DrawerContent: ({ children }: any) => <div data-testid="drawer-content">{children}</div>,
    DrawerDescription: ({ children }: any) => <div data-testid="drawer-description">{children}</div>,
    DrawerFooter: ({ children }: any) => <div data-testid="drawer-footer">{children}</div>,
    DrawerHeader: ({ children }: any) => <div data-testid="drawer-header">{children}</div>,
    DrawerTitle: ({ children }: any) => <div data-testid="drawer-title">{children}</div>,
}));

vi.mock('@/components/ui/switch', () => ({
    Switch: ({ checked, onCheckedChange }: any) => (
        <button
            data-testid="switch"
            onClick={() => onCheckedChange?.(!checked)}
        >
            {checked ? 'on' : 'off'}
        </button>
    ),
}));

const mockFeedbackResponse: FeedbackResponse = {
    status: 'success',
    message: 'Feedback retrieved successfully',
    data: {
        feedback: {
            uuid: 'feedback-uuid-123',
            user_id: 1,
            outlet_id: 1,
            is_done: 0,
            is_anonymous: false,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
            questions: [
                {
                    id: 1,
                    question: 'Bagaimana pengalaman Anda?',
                    category: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    laravel_through_key: 1,
                    options: [
                        {
                            id: 1,
                            option: 'Sangat Baik',
                            feedback_question_id: 1,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                        },
                        {
                            id: 2,
                            option: 'Baik',
                            feedback_question_id: 1,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                        },
                    ],
                },
                {
                    id: 2,
                    question: 'Bagaimana pelayanannya?',
                    category: 1,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    laravel_through_key: 1,
                    options: [
                        {
                            id: 3,
                            option: 'Memuaskan',
                            feedback_question_id: 2,
                            outlet_id: 1,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                        },
                    ],
                },
            ],
        },
    },
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('FeedbackBottomSheet', () => {
    const mockSubmitFeedback = vi.fn();
    const mockOnOpenChange = vi.fn();
    const mockOnSuccess = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Default mock implementations
        vi.mocked(useOutletSlug).mockReturnValue('test-outlet');

        vi.mocked(useGetAllFeedbackData).mockReturnValue({
            data: mockFeedbackResponse,
            isLoading: false,
            error: null,
        } as any);

        vi.mocked(useQueryFeedback).mockReturnValue({
            data: mockFeedbackResponse,
            isLoading: false,
            error: null,
        } as any);

        vi.mocked(useSubmitFeedback).mockReturnValue({
            submitFeedback: mockSubmitFeedback,
            isLoading: false,
            isError: false,
            isSuccess: false,
            error: null,
            reset: vi.fn(),
        });
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Rendering', () => {
        it('should render when open', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByTestId('drawer')).toBeInTheDocument();
        });

        it('should not render when closed', () => {
            render(
                <FeedbackBottomSheet
                    open={false}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
        });

        it('should render feedback questions', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Bagaimana pengalaman Anda?')).toBeInTheDocument();
            expect(screen.getByText('Bagaimana pelayanannya?')).toBeInTheDocument();
        });

        it('should render feedback options', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Sangat Baik')).toBeInTheDocument();
            expect(screen.getByText('Baik')).toBeInTheDocument();
            expect(screen.getByText('Memuaskan')).toBeInTheDocument();
        });

        it('should render title and description', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Bagikan Pengalaman Kamu Yuk!')).toBeInTheDocument();
            expect(screen.getByText('Pendapat Kamu Bantu kami melayani lebih baik.')).toBeInTheDocument();
        });
    });

    describe('Loading States', () => {
        it('should show loading state when fetching UUID', () => {
            vi.mocked(useGetAllFeedbackData).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Memuat feedback...')).toBeInTheDocument();
        });

        it('should show loading state when fetching feedback', () => {
            vi.mocked(useQueryFeedback).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Memuat feedback...')).toBeInTheDocument();
        });

        it('should show submitting state', () => {
            vi.mocked(useSubmitFeedback).mockReturnValue({
                submitFeedback: mockSubmitFeedback,
                isLoading: true,
                isError: false,
                isSuccess: false,
                error: null,
                reset: vi.fn(),
            });

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Mengirim...')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should show error message when fetch fails', () => {
            vi.mocked(useQueryFeedback).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to fetch'),
            } as any);

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Gagal memuat feedback')).toBeInTheDocument();
            expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
        });

        it('should reload page when retry button is clicked', () => {
            // Mock window.location.reload
            delete (window as any).location;
            (window as any).location = { reload: vi.fn() };

            vi.mocked(useQueryFeedback).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: new Error('Failed to fetch'),
            } as any);

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const retryButton = screen.getByText('Coba Lagi');
            fireEvent.click(retryButton);

            expect(window.location.reload).toHaveBeenCalled();
        });
    });

    describe('Option Selection', () => {
        it('should select an option when clicked', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const option = screen.getByText('Sangat Baik');
            fireEvent.click(option);

            // Check if the option is visually selected (has the selected class)
            expect(option.closest('button')).toHaveClass('border-primary-orange');
        });

        it('should allow selecting different options for different questions', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const option1 = screen.getByText('Sangat Baik');
            const option2 = screen.getByText('Memuaskan');

            fireEvent.click(option1);
            fireEvent.click(option2);

            expect(option1.closest('button')).toHaveClass('border-primary-orange');
            expect(option2.closest('button')).toHaveClass('border-primary-orange');
        });

        it('should change selection when clicking different option for same question', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const option1 = screen.getByText('Sangat Baik');
            const option2 = screen.getByText('Baik');

            fireEvent.click(option1);
            expect(option1.closest('button')).toHaveClass('border-primary-orange');

            fireEvent.click(option2);
            expect(option2.closest('button')).toHaveClass('border-primary-orange');
            expect(option1.closest('button')).not.toHaveClass('border-primary-orange');
        });
    });

    describe('Comment Input', () => {
        it('should allow entering comments', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const textareas = screen.getAllByPlaceholderText('Ceritakan lebih detail...');
            const textarea = textareas[0];

            fireEvent.change(textarea, { target: { value: 'Great experience!' } });

            expect(textarea).toHaveValue('Great experience!');
        });

        it('should show character count', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const textareas = screen.getAllByPlaceholderText('Ceritakan lebih detail...');
            const textarea = textareas[0];

            fireEvent.change(textarea, { target: { value: 'Test comment' } });

            expect(screen.getByText('12/2000')).toBeInTheDocument();
        });

        it('should limit comment to 2000 characters', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const textareas = screen.getAllByPlaceholderText('Ceritakan lebih detail...');
            const textarea = textareas[0];

            const longText = 'a'.repeat(2500);
            fireEvent.change(textarea, { target: { value: longText } });

            // Should not exceed 2000 characters
            expect((textarea as HTMLTextAreaElement).value.length).toBeLessThanOrEqual(2000);
        });

        it('should show warning color when approaching character limit', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const textareas = screen.getAllByPlaceholderText('Ceritakan lebih detail...');
            const textarea = textareas[0];

            const longText = 'a'.repeat(1850);
            fireEvent.change(textarea, { target: { value: longText } });

            const charCount = screen.getByText('1850/2000');
            expect(charCount).toHaveClass('text-red-500');
        });
    });

    describe('Anonymous Toggle', () => {
        it('should toggle anonymous mode', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const switchButton = screen.getByTestId('switch');
            expect(switchButton).toHaveTextContent('off');

            fireEvent.click(switchButton);
            expect(switchButton).toHaveTextContent('on');
        });

        it('should show correct text for anonymous toggle', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Sembunyikan nama saya')).toBeInTheDocument();
        });
    });

    describe('Form Submission', () => {
        it('should disable submit button when not all questions are answered', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const submitButton = screen.getByText('Kirim Feedback');
            expect(submitButton).toBeDisabled();
        });

        it('should enable submit button when all questions are answered', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            // Select options for all questions
            const option1 = screen.getByText('Sangat Baik');
            const option2 = screen.getByText('Memuaskan');

            fireEvent.click(option1);
            fireEvent.click(option2);

            const submitButton = screen.getByText('Kirim Feedback');
            expect(submitButton).not.toBeDisabled();
        });

        it('should submit feedback with correct payload', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            // Select options
            fireEvent.click(screen.getByText('Sangat Baik'));
            fireEvent.click(screen.getByText('Memuaskan'));

            // Add comments
            const textareas = screen.getAllByPlaceholderText('Ceritakan lebih detail...');
            fireEvent.change(textareas[0], { target: { value: 'Comment 1' } });
            fireEvent.change(textareas[1], { target: { value: 'Comment 2' } });

            // Submit
            const submitButton = screen.getByText('Kirim Feedback');
            fireEvent.click(submitButton);

            expect(mockSubmitFeedback).toHaveBeenCalledWith({
                feedback_option_question_id: [1, 3],
                comment: ['Comment 1', 'Comment 2'],
                is_anonymous: 0,
            });
        });

        it('should submit with anonymous flag when enabled', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            // Select options
            fireEvent.click(screen.getByText('Sangat Baik'));
            fireEvent.click(screen.getByText('Memuaskan'));

            // Enable anonymous
            const switchButton = screen.getByTestId('switch');
            fireEvent.click(switchButton);

            // Submit
            const submitButton = screen.getByText('Kirim Feedback');
            fireEvent.click(submitButton);

            expect(mockSubmitFeedback).toHaveBeenCalledWith(
                expect.objectContaining({
                    is_anonymous: 1,
                })
            );
        });

        it('should submit with empty comments if not provided', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            // Select options only
            fireEvent.click(screen.getByText('Sangat Baik'));
            fireEvent.click(screen.getByText('Memuaskan'));

            // Submit
            const submitButton = screen.getByText('Kirim Feedback');
            fireEvent.click(submitButton);

            expect(mockSubmitFeedback).toHaveBeenCalledWith({
                feedback_option_question_id: [1, 3],
                comment: ['', ''],
                is_anonymous: 0,
            });
        });
    });

    describe('Success State', () => {
        it('should show success message when submission succeeds', () => {
            vi.mocked(useSubmitFeedback).mockReturnValue({
                submitFeedback: mockSubmitFeedback,
                isLoading: false,
                isError: false,
                isSuccess: true,
                error: null,
                reset: vi.fn(),
            });

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Terima Kasih! 🎉')).toBeInTheDocument();
            expect(screen.getByText('Feedback kamu sangat berharga untuk kami')).toBeInTheDocument();
        });

        it('should set localStorage on success', () => {
            vi.mocked(useSubmitFeedback).mockReturnValue({
                submitFeedback: mockSubmitFeedback,
                isLoading: false,
                isError: false,
                isSuccess: true,
                error: null,
                reset: vi.fn(),
            });

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(localStorage.getItem('feedbackSubmitted')).toBe('true');
        });

        it('should call onSuccess callback', () => {
            vi.mocked(useSubmitFeedback).mockReturnValue({
                submitFeedback: mockSubmitFeedback,
                isLoading: false,
                isError: false,
                isSuccess: true,
                error: null,
                reset: vi.fn(),
            });

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                    onSuccess={mockOnSuccess}
                />,
                { wrapper: createWrapper() }
            );

            expect(mockOnSuccess).toHaveBeenCalled();
        });

        it('should close drawer after success with delay', async () => {
            vi.mocked(useSubmitFeedback).mockReturnValue({
                submitFeedback: mockSubmitFeedback,
                isLoading: false,
                isError: false,
                isSuccess: true,
                error: null,
                reset: vi.fn(),
            });

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            // Wait for the timeout to complete
            await waitFor(() => {
                expect(mockOnOpenChange).toHaveBeenCalledWith(false);
            }, { timeout: 3000 });
        });
    });

    describe('Skip Button', () => {
        it('should render skip button', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            expect(screen.getByText('Skip, dulu deh')).toBeInTheDocument();
        });

        it('should close drawer and set localStorage when skip is clicked', () => {
            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                    onSuccess={mockOnSuccess}
                />,
                { wrapper: createWrapper() }
            );

            const skipButton = screen.getByText('Skip, dulu deh');
            fireEvent.click(skipButton);

            expect(localStorage.getItem('feedbackSubmitted')).toBe('true');
            expect(localStorage.getItem('feedbackToastDismissed')).toBe('true');
            expect(mockOnOpenChange).toHaveBeenCalledWith(false);
            expect(mockOnSuccess).toHaveBeenCalled();
        });

        it('should disable skip button when submitting', () => {
            vi.mocked(useSubmitFeedback).mockReturnValue({
                submitFeedback: mockSubmitFeedback,
                isLoading: true,
                isError: false,
                isSuccess: false,
                error: null,
                reset: vi.fn(),
            });

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            const skipButton = screen.getByText('Skip, dulu deh');
            expect(skipButton).toBeDisabled();
        });
    });

    describe('Form Reset', () => {
        it('should reset form when drawer opens', () => {
            const { rerender } = render(
                <FeedbackBottomSheet
                    open={false}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            rerender(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />
            );

            // Form should be in initial state
            const submitButton = screen.getByText('Kirim Feedback');
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle missing outlet slug', () => {
            vi.mocked(useOutletSlug).mockReturnValue(undefined);

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            // Should still render but not fetch data
            expect(screen.getByTestId('drawer')).toBeInTheDocument();
        });

        it('should handle feedback with no questions', () => {
            const emptyFeedback = {
                ...mockFeedbackResponse,
                data: {
                    feedback: {
                        ...mockFeedbackResponse.data.feedback,
                        questions: [],
                    },
                },
            };

            vi.mocked(useQueryFeedback).mockReturnValue({
                data: emptyFeedback,
                isLoading: false,
                error: null,
            } as any);

            render(
                <FeedbackBottomSheet
                    open={true}
                    onOpenChange={mockOnOpenChange}
                />,
                { wrapper: createWrapper() }
            );

            // Submit button should be enabled (no questions to answer)
            const submitButton = screen.getByText('Kirim Feedback');
            expect(submitButton).not.toBeDisabled();
        });
    });
});
