import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedbackAPI } from '../api/feedback.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import type { FeedbackResponse } from '../types/Feedback';

vi.mock('@/lib/axios');
vi.mock('sonner');

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
                    ],
                },
            ],
        },
    },
};

describe('FeedbackAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getFeedback', () => {
        it('should fetch feedback successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            const result = await FeedbackAPI.getFeedback('test-outlet');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/test-outlet/feedback');
            expect(result).toEqual(mockFeedbackResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should handle error response with message', async () => {
            const errorResponse = {
                status: 'error',
                message: 'Feedback not found',
                data: null,
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: errorResponse,
            });

            const result = await FeedbackAPI.getFeedback('test-outlet');

            expect(result).toEqual(errorResponse);
            expect(toast.info).toHaveBeenCalledWith('Feedback not found');
        });

        it('should handle error response without message', async () => {
            const errorResponse = {
                status: 'error',
                message: '',
                data: null,
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: errorResponse,
            });

            const result = await FeedbackAPI.getFeedback('test-outlet');

            expect(result).toEqual(errorResponse);
            expect(toast.info).toHaveBeenCalledWith('Failed to get banner information, refresh the page');
        });

        it('should throw error on network failure', async () => {
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

            await expect(FeedbackAPI.getFeedback('test-outlet')).rejects.toThrow(
                'Failed to fetch banner information for: test-outlet with Error: Network error'
            );
        });

        it('should handle different outlet slugs', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            await FeedbackAPI.getFeedback('different-outlet');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/different-outlet/feedback');
        });
    });

    describe('showFeedback', () => {
        it('should fetch specific feedback successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            const result = await FeedbackAPI.showFeedback('test-outlet', 'feedback-uuid-123');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/test-outlet/feedback/feedback-uuid-123');
            expect(result).toEqual(mockFeedbackResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should handle error response with message', async () => {
            const errorResponse = {
                status: 'error',
                message: 'Feedback not found',
                data: null,
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: errorResponse,
            });

            const result = await FeedbackAPI.showFeedback('test-outlet', 'invalid-uuid');

            expect(result).toEqual(errorResponse);
            expect(toast.info).toHaveBeenCalledWith('Feedback not found');
        });

        it('should handle error response without message', async () => {
            const errorResponse = {
                status: 'error',
                message: '',
                data: null,
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: errorResponse,
            });

            const result = await FeedbackAPI.showFeedback('test-outlet', 'uuid');

            expect(result).toEqual(errorResponse);
            expect(toast.info).toHaveBeenCalledWith('Failed to get banner information, refresh the page');
        });

        it('should throw error on network failure', async () => {
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

            await expect(FeedbackAPI.showFeedback('test-outlet', 'uuid')).rejects.toThrow(
                'Failed to fetch banner information for: test-outlet with Error: Network error'
            );
        });

        it('should handle different outlet slugs and uuids', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            await FeedbackAPI.showFeedback('cafe-abc', 'uuid-456');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/cafe-abc/feedback/uuid-456');
        });
    });

    describe('updateFeedback', () => {
        const mockPayload = {
            feedback_option_question_id: [1, 2],
            comment: ['Great service', 'Good food'],
            is_anonymous: 0 as const,
        };

        it('should update feedback successfully', async () => {
            vi.mocked(axiosInstance.put).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            const result = await FeedbackAPI.updateFeedback('test-outlet', 'feedback-uuid-123', mockPayload);

            expect(axiosInstance.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/feedback/feedback-uuid-123',
                mockPayload
            );
            expect(result).toEqual(mockFeedbackResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should handle anonymous feedback', async () => {
            const anonymousPayload = {
                ...mockPayload,
                is_anonymous: 1 as const,
            };

            vi.mocked(axiosInstance.put).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            await FeedbackAPI.updateFeedback('test-outlet', 'uuid', anonymousPayload);

            expect(axiosInstance.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/feedback/uuid',
                anonymousPayload
            );
        });

        it('should handle error response with message', async () => {
            const errorResponse = {
                status: 'error',
                message: 'Failed to update feedback',
                data: null,
            };

            vi.mocked(axiosInstance.put).mockResolvedValue({
                data: errorResponse,
            });

            const result = await FeedbackAPI.updateFeedback('test-outlet', 'uuid', mockPayload);

            expect(result).toEqual(errorResponse);
            expect(toast.info).toHaveBeenCalledWith('Failed to update feedback');
        });

        it('should handle error response without message', async () => {
            const errorResponse = {
                status: 'error',
                message: '',
                data: null,
            };

            vi.mocked(axiosInstance.put).mockResolvedValue({
                data: errorResponse,
            });

            const result = await FeedbackAPI.updateFeedback('test-outlet', 'uuid', mockPayload);

            expect(result).toEqual(errorResponse);
            expect(toast.info).toHaveBeenCalledWith('Failed to get banner information, refresh the page');
        });

        it('should throw error on network failure', async () => {
            vi.mocked(axiosInstance.put).mockRejectedValue(new Error('Network error'));

            await expect(FeedbackAPI.updateFeedback('test-outlet', 'uuid', mockPayload)).rejects.toThrow(
                'Failed to fetch banner information for: test-outlet with Error: Network error'
            );
        });

        it('should handle empty comments array', async () => {
            const emptyCommentsPayload = {
                feedback_option_question_id: [1],
                comment: [],
                is_anonymous: 0 as const,
            };

            vi.mocked(axiosInstance.put).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            await FeedbackAPI.updateFeedback('test-outlet', 'uuid', emptyCommentsPayload);

            expect(axiosInstance.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/feedback/uuid',
                emptyCommentsPayload
            );
        });

        it('should handle multiple feedback options', async () => {
            const multipleOptionsPayload = {
                feedback_option_question_id: [1, 2, 3, 4, 5],
                comment: ['Comment 1', 'Comment 2', 'Comment 3', 'Comment 4', 'Comment 5'],
                is_anonymous: 1 as const,
            };

            vi.mocked(axiosInstance.put).mockResolvedValue({
                data: mockFeedbackResponse,
            });

            await FeedbackAPI.updateFeedback('test-outlet', 'uuid', multipleOptionsPayload);

            expect(axiosInstance.put).toHaveBeenCalledWith(
                '/outlet/test-outlet/feedback/uuid',
                multipleOptionsPayload
            );
        });
    });
});
