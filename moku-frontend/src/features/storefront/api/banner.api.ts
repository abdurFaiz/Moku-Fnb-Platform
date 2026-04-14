import { axiosInstance } from "@/lib/axios";
import type { BannerResponse } from "@/features/storefront/types/Banner";
import { toast } from "sonner";

export class BannerAPI {
    static async getListBanner(outletSlug: string): Promise<BannerResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/banner`)
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