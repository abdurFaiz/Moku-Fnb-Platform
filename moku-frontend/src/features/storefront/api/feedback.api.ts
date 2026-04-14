import { axiosInstance } from "@/lib/axios";
import type { FeedbackResponse } from "@/features/storefront/types/Feedback";
import { toast } from "sonner";

interface FeedbackPayload {
    feedback_option_question_id: number[],
    comment: string[]
    is_anonymous: 1 | 0 // 1 for anonymous (hide name), 0 for not anonymous (show name)
}

export class FeedbackAPI {
    static async getFeedback(outletSlug: string): Promise<FeedbackResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/feedback`)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get banner information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch banner information for: ' + outletSlug + ' with ' + error);
        }
    }

    static async showFeedback(outletSlug: string, uuid: string): Promise<FeedbackResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/feedback/${uuid}`)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get banner information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch banner information for: ' + outletSlug + ' with ' + error);
        }
    }

    static async updateFeedback(outletSlug: string, uuid: string, bodyRes: FeedbackPayload,): Promise<FeedbackResponse> {
        try {
            const response = await axiosInstance.put(`/outlet/${outletSlug}/feedback/${uuid}`, bodyRes)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get banner information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch banner information for: ' + outletSlug + ' with ' + error);
        }
    }
}