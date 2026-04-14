import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import {
    useMutationUpdateFeedback,
    useSubmitFeedback,
    type FeedbackPayload,
} from '../hooks/api/useMutationFeedback';
import { FeedbackAPI } from '../api/feedback.api';
import { toast } from 'sonner';
import type { FeedbackResponse } from '../types/Feedback';

vi.mock('../api/feedback.api');
vi.mock('sonner');

const mockFeedbackResponse: FeedbackResponse = {
    status: 'success',
    message: 'Feedback updated successfully',
    data: {
        feedback: {
            uuid: 'feedback-uuid-123',
            user_id: 1,
            outlet_id: 1,
            is_done: 1,
            is_anonymous: false,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T10:00:00Z',
            questions: [
                {
                    id: 1,
                    question: 'How was your experience?',
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

    const Wrapper = ({ children }: { children: ReactNode }) => {
        return createElement(QueryClientProvider, { client: queryClient }, children);
    };

    return { Wrapper, queryClient };
};

describe('useMutationUpdateFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(FeedbackAPI.updateFeedback).mockResolvedValue(mockFeedbackResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Successful Mutation', () => {
        it('should update feedback successfully', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Great service'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'feedback-uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.updateFeedback).toHaveBeenCalledWith(
                'test-outlet',
                'feedback-uuid-123',
                payload
            );
            expect(toast.success).toHaveBeenCalledWith('Feedback berhasil dikirim!', {
                description: 'Terima kasih atas feedback Anda',
            });
        });

        it('should handle anonymous feedback', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1, 2],
                comment: ['Comment 1', 'Comment 2'],
                is_anonymous: 1,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.updateFeedback).toHaveBeenCalledWith('test-outlet', 'uuid-123', payload);
        });

        it('should handle multiple feedback options', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1, 2, 3, 4, 5],
                comment: ['C1', 'C2', 'C3', 'C4', 'C5'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.updateFeedback).toHaveBeenCalledWith('test-outlet', 'uuid-123', payload);
        });

        it('should handle empty comments', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: [],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.updateFeedback).toHaveBeenCalledWith('test-outlet', 'uuid-123', payload);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', async () => {
            const error = new Error('Failed to update feedback');
            vi.mocked(FeedbackAPI.updateFeedback).mockRejectedValue(error);

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(toast.error).toHaveBeenCalledWith('Gagal mengirim feedback', {
                description: 'Failed to update feedback',
            });
        });

        it('should handle network errors', async () => {
            const error = new Error('Network error');
            vi.mocked(FeedbackAPI.updateFeedback).mockRejectedValue(error);

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(toast.error).toHaveBeenCalledWith('Gagal mengirim feedback', {
                description: 'Network error',
            });
        });

        it('should handle error without message', async () => {
            const error = new Error();
            vi.mocked(FeedbackAPI.updateFeedback).mockRejectedValue(error);

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(toast.error).toHaveBeenCalledWith('Gagal mengirim feedback', {
                description: 'Terjadi kesalahan saat mengirim feedback',
            });
        });
    });

    describe('Optimistic Updates', () => {
        it('should cancel outgoing queries on mutation', async () => {
            const { Wrapper, queryClient } = createWrapper();
            const cancelQueriesSpy = vi.spyOn(queryClient, 'cancelQueries');

            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(cancelQueriesSpy).toHaveBeenCalled();
        });

        it('should rollback on error', async () => {
            const { Wrapper, queryClient } = createWrapper();

            // Set initial data
            const previousData: FeedbackResponse = {
                ...mockFeedbackResponse,
                data: {
                    feedback: {
                        ...mockFeedbackResponse.data.feedback,
                        is_done: 0,
                    },
                },
            };

            queryClient.setQueryData(['feedback', 'show', 'test-outlet', 'uuid-123'], previousData);

            // Mock error
            vi.mocked(FeedbackAPI.updateFeedback).mockRejectedValue(new Error('Update failed'));

            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            // Check that data was rolled back
            const currentData = queryClient.getQueryData(['feedback', 'show', 'test-outlet', 'uuid-123']);
            expect(currentData).toEqual(previousData);
        });
    });

    describe('Cache Updates', () => {
        it('should update cache on success', async () => {
            const { Wrapper, queryClient } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            const cachedData = queryClient.getQueryData(['feedback', 'show', 'test-outlet', 'uuid-123']);
            expect(cachedData).toEqual(mockFeedbackResponse);
        });

        it('should invalidate queries on settled', async () => {
            const { Wrapper, queryClient } = createWrapper();
            const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(invalidateQueriesSpy).toHaveBeenCalled();
        });
    });

    describe('Loading States', () => {
        it('should show pending state during mutation', async () => {
            let resolveMutation: any;
            vi.mocked(FeedbackAPI.updateFeedback).mockImplementation(
                () => new Promise((resolve) => {
                    resolveMutation = () => resolve(mockFeedbackResponse);
                })
            );

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useMutationUpdateFeedback(), { wrapper: Wrapper });

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.mutate({
                outletSlug: 'test-outlet',
                uuid: 'uuid-123',
                payload,
            });

            await waitFor(() => {
                expect(result.current.isPending).toBe(true);
            });

            resolveMutation();

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.isPending).toBe(false);
        });
    });
});

describe('useSubmitFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(FeedbackAPI.updateFeedback).mockResolvedValue(mockFeedbackResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Simplified Interface', () => {
        it('should submit feedback with simplified interface', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useSubmitFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Great!'],
                is_anonymous: 0,
            };

            result.current.submitFeedback(payload);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.updateFeedback).toHaveBeenCalledWith('test-outlet', 'uuid-123', payload);
        });

        it('should expose loading state', async () => {
            let resolveMutation: any;
            vi.mocked(FeedbackAPI.updateFeedback).mockImplementation(
                () => new Promise((resolve) => {
                    resolveMutation = () => resolve(mockFeedbackResponse);
                })
            );

            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useSubmitFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.submitFeedback(payload);

            await waitFor(() => {
                expect(result.current.isLoading).toBe(true);
            });

            resolveMutation();

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should expose error state', async () => {
            vi.mocked(FeedbackAPI.updateFeedback).mockRejectedValue(new Error('Failed'));

            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useSubmitFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.submitFeedback(payload);

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Failed');
        });

        it('should expose success state', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useSubmitFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.submitFeedback(payload);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });
        });

        it('should expose reset function', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useSubmitFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.submitFeedback(payload);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.isSuccess).toBe(true);

            result.current.reset();

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(false);
            });

            expect(result.current.isError).toBe(false);
        });
    });

    describe('Different Outlet and UUID', () => {
        it('should handle different outlet slugs', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useSubmitFeedback('cafe-abc', 'uuid-456'),
                { wrapper: Wrapper }
            );

            const payload: FeedbackPayload = {
                feedback_option_question_id: [1],
                comment: ['Test'],
                is_anonymous: 0,
            };

            result.current.submitFeedback(payload);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.updateFeedback).toHaveBeenCalledWith('cafe-abc', 'uuid-456', payload);
        });
    });
});
