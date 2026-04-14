import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import type { SearchResponse } from "../types/Search";

export class SearchAPI {
    static async searchProduct(outletSlug: string, value: string): Promise<SearchResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/products/most-searched`, {
                params: {
                    search: value
                }
            });
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