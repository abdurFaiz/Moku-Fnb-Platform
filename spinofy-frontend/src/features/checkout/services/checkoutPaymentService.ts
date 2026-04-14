import { PaymentAPI } from '@/features/checkout/api/payment.api';
import { OrderAPI } from '@/features/transaction/api/order.api';
import type { Order } from '@/features/cart/types/Order';
import type { CheckoutPaymentResult } from '@/features/checkout/types/Checkout';

export class CheckoutPaymentService {
    /**
     * Validates outlet availability
     * @throws Error if outlet is not available
     */
    private static validateOutlet(outletSlug: string | null): void {
        if (!outletSlug) {
            throw new Error('No outlet available');
        }
    }

    /**
     * Extract order data dari API response - handle both array dan object format
     */
    private static extractOrderFromResponse(response: any): Order | null {
        const orderData = response?.data?.order;

        if (Array.isArray(orderData)) {
            return orderData[0] || null;
        }

        return orderData || null;
    }

    /**
     * Find order di payment list berdasarkan order code
     */
    private static findOrderInPaymentList(
        response: any,
        orderCode: string
    ): Order | null {
        const orders: Order[] =
            response?.data?.orders ||
            response?.data?.order ||
            [];

        const orderCodeNumber = Number(orderCode);

        return (
            orders.find(
                (o: Order) =>
                    (typeof o.code === 'string' ? Number(o.code) : o.code) === orderCodeNumber
            ) || null
        );
    }

    /**
     * Primary strategy: Fetch order dari getOrderDetails endpoint
     * @returns Order jika berhasil, null jika gagal
     */
    private static async fetchFromOrderDetails(
        outletSlug: string,
        orderCode: string
    ): Promise<Order | null> {
        try {
            const response = await OrderAPI.getOrderDetails(
                outletSlug,
                Number(orderCode)
            );
            return this.extractOrderFromResponse(response);
        } catch (error) {
            console.error('❌ Failed to fetch from order details:', error);
            return null;
        }
    }

    /**
     * Fallback strategy: Fetch order dari payment list
     * @returns Order jika berhasil, null jika gagal
     */
    private static async fetchFromPaymentList(
        outletSlug: string,
        orderCode: string
    ): Promise<Order | null> {
        try {
            const response = await PaymentAPI.getListPayment(outletSlug);
            return this.findOrderInPaymentList(response, orderCode);
        } catch (error) {
            console.error('❌ Failed to fetch from payment list:', error);
            return null;
        }
    }


    static async processCheckout(
        outletSlug: string | null,
        orderCode: string,
        _paymentMethodId: number,
        _tableNumberId?: number | string | null,
        calculationData?: {
            subtotal?: number;
            tax?: number;
            discount?: number;
            finalPrice?: number;
            appliedVoucher?: any;
            paymentMethodFee?: number;
            platformFee?: number;
        }
    ): Promise<CheckoutPaymentResult> {
        // Validate outlet
        this.validateOutlet(outletSlug);

        // Cast to string setelah validation
        const slug = outletSlug as string;

        // Try primary strategy
        let order = await this.fetchFromOrderDetails(slug, orderCode);

        // Try fallback strategy jika primary gagal
        order ??= await this.fetchFromPaymentList(slug, orderCode);

        // Log warning jika tidak ada order, tapi tetap lanjut
        if (!order) {
            console.warn(
                '⚠️ Could not fetch order details, but proceeding with orderCode:',
                orderCode
            );
        }

        // Ensure the backend receives method_id and table_number_id from the
        // initial store checkout request payload. We no longer trigger an
        // explicit `updateStatusPayment` call during the checkout flow.

        return {
            order,
            orderCode,
            subtotal: calculationData?.subtotal,
            tax: calculationData?.tax,
            discount: calculationData?.discount,
            finalPrice: calculationData?.finalPrice,
            appliedVoucher: calculationData?.appliedVoucher,
            paymentMethodFee: calculationData?.paymentMethodFee,
            platformFee: calculationData?.platformFee,
        };
    }
}

export default CheckoutPaymentService;
