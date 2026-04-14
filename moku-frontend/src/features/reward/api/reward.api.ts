import { axiosInstance } from "@/lib/axios";
import type { RewardResponse } from "@/features/reward/types/Reward";
import { toast } from "sonner";

export class RewardAPI {
    static async getListRewardPoint(outletSlug: string): Promise<RewardResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/reward`)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get reward points information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch reward points information for: ' + outletSlug + ' with ' + error);
        }
    }

    static async getHistoryRewardPoint(outletSlug: string): Promise<RewardResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/reward/history`)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get reward points history information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch reward points history information for: ' + outletSlug + ' with ' + error);
        }
    }
}