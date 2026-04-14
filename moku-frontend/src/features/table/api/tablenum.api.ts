import { axiosInstance } from "@/lib/axios";
import type { TableNumbersResponse, TableNumberDetailResponse } from "@/features/table/types/TableNumber";
import { toast } from "sonner";

export class TableNumberAPI {
    static async getListTableNumber(outletSlug: string): Promise<TableNumbersResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/table-number`)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get table number information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch table number information for: ' + outletSlug + ' with ' + error);
        }
    }
    static async getDetailTableNumber(outletSlug: string, number_table: string): Promise<TableNumberDetailResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/table-number/${number_table}`)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get table number information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch table number information for: ' + outletSlug + ' with ' + error);
        }
    }
}