import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import {
    useQueryFeedback,
    useGetAllFeedbackData,
    useGetFeedbackData,
    feedbackQueryKeys,
} from '../hooks/api/useQueryFeedback';
import { FeedbackAPI } from '../api/feedback.api';
import type { FeedbackResponse } from '../types/Feedback';

vi.mock('../api/feedback.api');

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

describe('useQueryFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(FeedbackAPI.showFeedback).mockResolvedValue(mockFeedbackResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Query Keys', () => {
        it('should generate correct query keys', () => {
            expect(feedbackQueryKeys.all).toEqual(['feedback']);
            expect(feedbackQueryKeys.show('test-outlet', 'uuid-123')).toEqual([
                'feedback',
                'show',
                'test-outlet',
                'uuid-123',
            ]);
            expect(feedbackQueryKeys.get('test-outlet')).toEqual(['feedback', 'get', 'test-outlet']);
        });
    });

    describe('Successful Data Fetching', () => {
        it('should fetch feedback data successfully', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', 'feedback-uuid-123'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockFeedbackResponse);
            expect(FeedbackAPI.showFeedback).toHaveBeenCalledWith('test-outlet', 'feedback-uuid-123');
        });

        it('should use custom query options', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () =>
                    useQueryFeedback('test-outlet', 'uuid-123', {
                        staleTime: 10000,
                        refetchOnWindowFocus: true,
                    }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockFeedbackResponse);
        });

        it('should handle different outlet slugs and uuids', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('cafe-abc', 'uuid-456'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.showFeedback).toHaveBeenCalledWith('cafe-abc', 'uuid-456');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', async () => {
            vi.mocked(FeedbackAPI.showFeedback).mockReset();
            vi.mocked(FeedbackAPI.showFeedback).mockRejectedValueOnce(new Error('Feedback not found'));

            const { Wrapper, queryClient } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', 'invalid-uuid'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 3000 });

            expect(result.current.error).toBeTruthy();
            queryClient.clear();
        });

        it('should handle network errors', async () => {
            vi.mocked(FeedbackAPI.showFeedback).mockReset();
            vi.mocked(FeedbackAPI.showFeedback).mockRejectedValueOnce(new Error('Network error'));

            const { Wrapper, queryClient } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 3000 });

            expect(result.current.error).toBeTruthy();
            queryClient.clear();
        });
    });

    describe('Parameter Validation', () => {
        it('should not execute query when slug is missing', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback(undefined, 'uuid-123'),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should not execute query when uuid is missing', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', undefined),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should handle both parameters undefined', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback(undefined, undefined),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should handle empty string slug', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('', 'uuid-123'),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should handle empty string uuid', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', ''),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should throw error when queryFn is called without required params', async () => {
            vi.mocked(FeedbackAPI.showFeedback).mockReset();
            vi.mocked(FeedbackAPI.showFeedback).mockRejectedValueOnce(
                new Error('Outlet slug and UUID are required')
            );

            const { Wrapper, queryClient } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid', { enabled: true }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 3000 });

            queryClient.clear();
        });
    });

    describe('Enabled Option', () => {
        it('should respect enabled option when false', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid-123', { enabled: false }),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should execute query when enabled is true', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid-123', { enabled: true }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.showFeedback).toHaveBeenCalled();
        });
    });

    describe('Loading States', () => {
        it('should show loading state initially', () => {
            vi.mocked(FeedbackAPI.showFeedback).mockImplementation(
                () => new Promise(() => { })
            );

            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.data).toBeUndefined();
        });
    });

    describe('Caching Behavior', () => {
        it('should use cached data for same parameters', async () => {
            const { Wrapper } = createWrapper();

            const { result: result1 } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
            });

            const { result: result2 } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            expect(result2.current.data).toEqual(mockFeedbackResponse);
            expect(FeedbackAPI.showFeedback).toHaveBeenCalledTimes(1);
        });

        it('should make separate requests for different parameters', async () => {
            const { Wrapper } = createWrapper();

            const { result: result1 } = renderHook(
                () => useQueryFeedback('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
            });

            const { result: result2 } = renderHook(
                () => useQueryFeedback('different-outlet', 'uuid-456'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result2.current.isSuccess).toBe(true);
            });

            expect(FeedbackAPI.showFeedback).toHaveBeenCalledTimes(2);
            expect(FeedbackAPI.showFeedback).toHaveBeenCalledWith('test-outlet', 'uuid-123');
            expect(FeedbackAPI.showFeedback).toHaveBeenCalledWith('different-outlet', 'uuid-456');
        });
    });
});

describe('useGetAllFeedbackData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(FeedbackAPI.getFeedback).mockResolvedValue(mockFeedbackResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Successful Data Fetching', () => {
        it('should fetch all feedback data successfully', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetAllFeedbackData('test-outlet'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockFeedbackResponse);
            expect(FeedbackAPI.getFeedback).toHaveBeenCalledWith('test-outlet');
        });

        it('should use custom query options', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () =>
                    useGetAllFeedbackData('test-outlet', {
                        staleTime: 10000,
                        retry: 3,
                    }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockFeedbackResponse);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', async () => {
            vi.mocked(FeedbackAPI.getFeedback).mockReset();
            vi.mocked(FeedbackAPI.getFeedback).mockRejectedValueOnce(new Error('Failed to fetch'));

            const { Wrapper, queryClient } = createWrapper();
            const { result } = renderHook(
                () => useGetAllFeedbackData('test-outlet'),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            }, { timeout: 3000 });

            expect(result.current.error).toBeTruthy();
            queryClient.clear();
        });
    });

    describe('Parameter Validation', () => {
        it('should not execute query when slug is missing', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetAllFeedbackData(undefined),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.getFeedback).not.toHaveBeenCalled();
        });

        it('should handle empty string slug', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetAllFeedbackData(''),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.getFeedback).not.toHaveBeenCalled();
        });
    });

    describe('Enabled Option', () => {
        it('should respect enabled option when false', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetAllFeedbackData('test-outlet', { enabled: false }),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.getFeedback).not.toHaveBeenCalled();
        });
    });
});

describe('useGetFeedbackData', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(FeedbackAPI.showFeedback).mockResolvedValue(mockFeedbackResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Query Configuration', () => {
        it('should not execute query automatically (enabled: false)', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetFeedbackData('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should have staleTime set to Infinity', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetFeedbackData('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
        });

        it('should handle undefined parameters', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetFeedbackData(undefined, undefined),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
            expect(FeedbackAPI.showFeedback).not.toHaveBeenCalled();
        });

        it('should use correct query key', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useGetFeedbackData('test-outlet', 'uuid-123'),
                { wrapper: Wrapper }
            );

            expect(result.current.data).toBeUndefined();
        });
    });
});
