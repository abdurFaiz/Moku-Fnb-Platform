import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FeedbackAPI } from '@/features/storefront/api/feedback.api';
import { feedbackQueryKeys } from './useQueryFeedback';
import type { FeedbackResponse } from '@/features/storefront/types/Feedback';
import { toast } from 'sonner';

// Feedback payload interface
export interface FeedbackPayload {
    feedback_option_question_id: number[];
    comment: string[];
    is_anonymous: 1 | 0; // 1 for anonymous (hide name), 0 for not anonymous (show name)
}

// Update feedback mutation variables
interface UpdateFeedbackVariables {
    outletSlug: string;
    uuid: string;
    payload: FeedbackPayload;
}

// Context type for optimistic updates
interface MutationContext {
    previousFeedback: FeedbackResponse | undefined;
    outletSlug: string;
    uuid: string;
}

/**
 * Hook to update feedback
 * Handles optimistic updates and cache invalidation
 */
export const useMutationUpdateFeedback = () => {
    const queryClient = useQueryClient();

    return useMutation<FeedbackResponse, Error, UpdateFeedbackVariables, MutationContext>({
        mutationFn: async ({ outletSlug, uuid, payload }) => {
            return FeedbackAPI.updateFeedback(outletSlug, uuid, payload);
        },
        onMutate: async ({ outletSlug, uuid }): Promise<MutationContext> => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: feedbackQueryKeys.show(outletSlug, uuid)
            });

            // Snapshot the previous value
            const previousFeedback = queryClient.getQueryData<FeedbackResponse>(
                feedbackQueryKeys.show(outletSlug, uuid)
            );

            // Return a context object with the snapshotted value
            return { previousFeedback, outletSlug, uuid };
        },
        onError: (error, _variables, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousFeedback) {
                queryClient.setQueryData(
                    feedbackQueryKeys.show(context.outletSlug, context.uuid),
                    context.previousFeedback
                );
            }

            // Show error toast
            toast.error('Gagal mengirim feedback', {
                description: error.message || 'Terjadi kesalahan saat mengirim feedback',
            });
        },
        onSuccess: (data, variables) => {
            // Show success toast
            toast.success('Feedback berhasil dikirim!', {
                description: 'Terima kasih atas feedback Anda',
            });

            // Update the cache with the new data
            queryClient.setQueryData(
                feedbackQueryKeys.show(variables.outletSlug, variables.uuid),
                data
            );
        },
        onSettled: (_data, _error, variables) => {
            // Always refetch after error or success
            queryClient.invalidateQueries({
                queryKey: feedbackQueryKeys.show(variables.outletSlug, variables.uuid)
            });
        },
    });
};

/**
 * Hook to submit feedback with simplified interface
 * @param outletSlug - The outlet slug
 * @param uuid - The feedback UUID
 */
export const useSubmitFeedback = (outletSlug: string, uuid: string) => {
    const updateFeedbackMutation = useMutationUpdateFeedback();

    const submitFeedback = (payload: FeedbackPayload) => {
        return updateFeedbackMutation.mutate({
            outletSlug,
            uuid,
            payload,
        });
    };

    return {
        submitFeedback,
        isLoading: updateFeedbackMutation.isPending,
        isError: updateFeedbackMutation.isError,
        isSuccess: updateFeedbackMutation.isSuccess,
        error: updateFeedbackMutation.error,
        reset: updateFeedbackMutation.reset,
    };
};