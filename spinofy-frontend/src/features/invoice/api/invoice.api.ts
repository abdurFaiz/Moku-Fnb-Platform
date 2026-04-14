import { axiosInstance } from "@/lib/axios";
import type { InvoiceOrderResponse } from "@/features/invoice/types/Invoice";
import { toast } from "sonner";

export class InvoiceAPI {
    static async getInvoiceOrder(outletSlug: string, orderCode: number): Promise<InvoiceOrderResponse> {
        try {
            // Include product_attribute relationship to get attribute names (Size, Ice, etc.)
            const response = await axiosInstance.get(`/outlet/${outletSlug}/invoice/${orderCode}?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.order_product_additions.addition`)
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get invoice information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch invoice information for: ' + outletSlug + ' with ' + error);
        }
    }
}