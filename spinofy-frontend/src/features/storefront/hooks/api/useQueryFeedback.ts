import { useQuery } from '@tanstack/react-query';
import { FeedbackAPI } from '@/features/storefront/api/feedback.api';
import type { FeedbackResponse } from '@/features/storefront/types/Feedback';

// Query keys for feedback
export const feedbackQueryKeys = {
    all: ['feedback'] as const,
    show: (outletSlug: string, uuid: string) => [...feedbackQueryKeys.all, 'show', outletSlug, uuid] as const,
    get: (outletSlug: string) => [...feedbackQueryKeys.all, 'get', outletSlug] as const,
};

/**
 * Hook to fetch feedback details
 * @param outletSlug - The outlet slug
 * @param uuid - The feedback UUID
 * @param options - React Query options
 */
export const useQueryFeedback = (
    outletSlug: string | undefined,
    uuid: string | undefined,
    options?: {
        enabled?: boolean;
        staleTime?: number;
        gcTime?: number;
        retry?: number | boolean;
        refetchOnWindowFocus?: boolean;
    }
) => {
    return useQuery<FeedbackResponse, Error>({
        queryKey: feedbackQueryKeys.show(outletSlug || '', uuid || ''),
        queryFn: async () => {
            if (!outletSlug || !uuid) {
                throw new Error('Outlet slug and UUID are required');
            }
            return FeedbackAPI.showFeedback(outletSlug, uuid);
        },
        enabled: Boolean(outletSlug && uuid && options?.enabled !== false),
        staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
        gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
        retry: options?.retry ?? 2,
        refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    });
};

export const useGetAllFeedbackData = (
    outletSlug?: string,
    options?: {
        enabled?: boolean;
        staleTime?: number;
        gcTime?: number;
        retry?: number | boolean;
        refetchOnWindowFocus?: boolean;
    }
) => {
    return useQuery<FeedbackResponse, Error>({
        queryKey: feedbackQueryKeys.get(outletSlug || ''),
        queryFn: async () => {
            if (!outletSlug) {
                throw new Error('Outlet slug is required');
            }
            return FeedbackAPI.getFeedback(outletSlug);
        },
        enabled: Boolean(outletSlug && options?.enabled !== false),
        staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
        gcTime: options?.gcTime ?? 10 * 60 * 1000, // 10 minutes
        retry: options?.retry ?? 2,
        refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    });
};

export const useGetFeedbackData = (outletSlug?: string, uuid?: string) => {
    return useQuery<FeedbackResponse, Error>({
        queryKey: feedbackQueryKeys.show(outletSlug || '', uuid || ''),
        queryFn: async () => {
            if (!outletSlug || !uuid) {
                throw new Error('Outlet slug and UUID are required');
            }
            return FeedbackAPI.showFeedback(outletSlug, uuid);
        },
        enabled: false,
        staleTime: Infinity,
    });
};