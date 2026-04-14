import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import type { LikeResponse } from "../types/Like";

export class LikeAPI {
    static async toggleLike(outletSlug: string, uuidProduct: string): Promise<LikeResponse> {
        try {
            const response = await axiosInstance.put(`/outlet/${outletSlug}/products/${uuidProduct}/like`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get like information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch like information for: ' + outletSlug + ' with ' + error);
        }
    }
}