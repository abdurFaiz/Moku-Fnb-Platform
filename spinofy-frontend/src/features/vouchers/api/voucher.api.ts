import { axiosInstance } from "@/lib/axios";
import type { UserVoucherListResponse, PayloadCheckVoucher } from "@/features/vouchers/types/UserVoucher";
import type { VouchersResponse } from "@/features/vouchers/types/Voucher";
import { toast } from "sonner";

export class VoucherAPI {
    static async getListVoucherUser(outletSlug: string): Promise<UserVoucherListResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/user-voucher`)
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch voucher information for: ' + outletSlug + ' with ' + error);
        }
    }

    static async listVouchersOrder(outletSlug: string, codeOrder: string): Promise<UserVoucherListResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/user-voucher/${codeOrder}/order`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get list order vouchers, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to list order vouchers for: ' + outletSlug + ' with ' + error);
        }
    }
    static async getListVoucherUserProduct(outletSlug: string, product_ids: number[]): Promise<UserVoucherListResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/user-voucher/product`, {
                params: { product_ids },
            });

            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch voucher information for: ' + outletSlug + ' with ' + error);
        }
    }

    static async claimVoucherPoint(outletSlug: string, voucherId: number): Promise<VouchersResponse> {
        try {
            const response = await axiosInstance.post(`/outlet/${outletSlug}/voucher/${voucherId}`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to claim voucher, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to claim voucher for: ' + outletSlug + ' with ' + error);
        }
    }

    static async listVouchersPoint(outletSlug: string): Promise<VouchersResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/voucher`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get list user vouchers, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to list user vouchers for: ' + outletSlug + ' with ' + error);
        }
    }
    static async listVouchersProductPoint(outletSlug: string): Promise<VouchersResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/voucher/products/list`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get list user vouchers, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to list user vouchers for: ' + outletSlug + ' with ' + error);
        }
    }
    static async listVouchersGeneralPoint(outletSlug: string): Promise<VouchersResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/voucher/rewards/list`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get list user vouchers, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to list user vouchers for: ' + outletSlug + ' with ' + error);
        }
    }

    static async useInputCodeVoucher(outletSlug: string, voucherCode: string): Promise<VouchersResponse> {
        try {
            const response = await axiosInstance.put(`/outlet/${outletSlug}/payment/voucher/input-code`, {
                voucher_code: voucherCode
            });
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Kode voucher tidak valid atau tidak dapat digunakan';
                toast.info(errorMessage);
            } else {
                toast.success(response.data.message || 'Voucher berhasil diterapkan');
            }
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal memproses kode voucher';
            toast.error(errorMessage);
            throw error;
        }
    }
    static async useStoreCheckVoucher(outletSlug: string, payload: PayloadCheckVoucher): Promise<VouchersResponse> {
        try {

            const response = await axiosInstance.post(`/outlet/${outletSlug}/product/check-voucher`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Kode voucher tidak valid atau tidak dapat digunakan';
                toast.info(errorMessage);
            } else {
                toast.success(response.data.message || 'Voucher berhasil diterapkan');
            }
            return response.data;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal memproses kode voucher';
            toast.error(errorMessage);
            throw error;
        }
    }
    static async useStoreInputCheckVoucher(outletSlug: string, payload: PayloadCheckVoucher): Promise<VouchersResponse> {
        try {

            const response = await axiosInstance.post(`/outlet/${outletSlug}/product/voucher/input-code`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Kode voucher tidak valid atau tidak dapat digunakan';
                toast.info(errorMessage);
            } else {
                toast.success(response.data.message || 'Voucher berhasil diterapkan');
            }
            return response.data;
        } catch (error: any) {
            // Handle 400 Bad Request errors gracefully
            if (error.response?.status === 400) {
                const errorData = error.response?.data;
                const errorMessage = errorData?.message || 'Kode voucher tidak valid atau tidak dapat digunakan';
                // Return error response instead of throwing to avoid showing raw error
                return {
                    status: 'error',
                    message: errorMessage,
                    data: errorData?.details || {}
                } as VouchersResponse;
            }

            const errorMessage = error instanceof Error ? error.message : 'Gagal memproses kode voucher';
            toast.error(errorMessage);
            throw error;
        }
    }

}