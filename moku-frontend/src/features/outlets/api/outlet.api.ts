import { axiosInstance } from '@/lib/axios';
import type { OutletResponse, SingleOutletResponse } from '@/features/outlets/types/Outlet';
import { toast } from 'sonner';

export class OutletAPI {
    static async getListOutlets(): Promise<OutletResponse> {
        try {
            const response = await axiosInstance.get<OutletResponse>(`/outlet`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get outlets information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch outlets information: ' + error);
        }
    }
    static async getOutlet(outletSlug: string): Promise<SingleOutletResponse> {
        try {
            const response = await axiosInstance.get<SingleOutletResponse>(`/outlet/${outletSlug}`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get outlet information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch outlet information for: ${outletSlug} with ${error}`);
        }
    }
}

export default OutletAPI;