import { describe, it, expect } from 'vitest';
import type {
    CheckoutItem,
    CheckoutData,
    CheckoutSummary,
    PaymentDetail,
    Voucher,
    CheckoutValidationResult,
    VoucherValidationResult,
    NavigationAction,
    ApiResponse,
    CheckoutPaymentParams,
    VoucherCalculationResult,
    FormattedPrices,
    CheckoutRequestPayload,
} from '../types/Checkout';

describe('Checkout Types', () => {
    describe('CheckoutItem', () => {
        it('should define correct CheckoutItem structure', () => {
            const mockCheckoutItem: CheckoutItem = {
                id: 'item-1',
                name: 'Test Product',
                price: 25000,
                quantity: 2,
                options: ['Large', 'Extra Shot'],
                image: 'https://example.com/image.jpg',
                notes: 'No sugar'
            };

            expect(mockCheckoutItem).toHaveProperty('id');
            expect(mockCheckoutItem).toHaveProperty('name');
            expect(mockCheckoutItem).toHaveProperty('price');
            expect(mockCheckoutItem).toHaveProperty('quantity');
            expect(mockCheckoutItem).toHaveProperty('options');
            expect(mockCheckoutItem).toHaveProperty('image');
            expect(mockCheckoutItem).toHaveProperty('notes');

            expect(typeof mockCheckoutItem.id).toBe('string');
            expect(typeof mockCheckoutItem.name).toBe('string');
            expect(typeof mockCheckoutItem.price).toBe('number');
            expect(typeof mockCheckoutItem.quantity).toBe('number');
            expect(Array.isArray(mockCheckoutItem.options)).toBe(true);
        });

        it('should handle optional properties', () => {
            const minimalItem: CheckoutItem = {
                id: 'item-minimal',
                name: 'Minimal Product',
                price: 10000,
                quantity: 1,
                options: []
            };

            expect(minimalItem.image).toBeUndefined();
            expect(minimalItem.notes).toBeUndefined();
            expect(minimalItem.options).toEqual([]);
        });
    });

    describe('CheckoutData', () => {
        it('should define correct CheckoutData structure', () => {
            const mockVoucher: Voucher = {
                id: 'voucher-1',
                code: 'DISCOUNT10',
                type: 'percentage',
                value: 10,
                isActive: true,
                minTransaction: 50000,
                maxDiscount: 20000,
                description: '10% off minimum 50k'
            };

            const mockCheckoutData: CheckoutData = {
                items: [
                    {
                        id: 'item-1',
                        name: 'Product 1',
                        price: 25000,
                        quantity: 2,
                        options: []
                    }
                ],
                subtotal: 50000,
                tax: 5000,
                discount: 5000,
                total: 50000,
                appliedVoucher: mockVoucher
            };

            expect(mockCheckoutData).toHaveProperty('items');
            expect(mockCheckoutData).toHaveProperty('subtotal');
            expect(mockCheckoutData).toHaveProperty('tax');
            expect(mockCheckoutData).toHaveProperty('discount');
            expect(mockCheckoutData).toHaveProperty('total');
            expect(mockCheckoutData).toHaveProperty('appliedVoucher');

            expect(Array.isArray(mockCheckoutData.items)).toBe(true);
            expect(typeof mockCheckoutData.subtotal).toBe('number');
            expect(mockCheckoutData.appliedVoucher).toEqual(mockVoucher);
        });

        it('should handle null voucher', () => {
            const checkoutDataWithoutVoucher: CheckoutData = {
                items: [],
                subtotal: 25000,
                tax: 2500,
                discount: 0,
                total: 27500,
                appliedVoucher: null
            };

            expect(checkoutDataWithoutVoucher.appliedVoucher).toBeNull();
            expect(checkoutDataWithoutVoucher.discount).toBe(0);
        });
    });

    describe('Voucher', () => {
        it('should define percentage voucher correctly', () => {
            const percentageVoucher: Voucher = {
                id: 'voucher-percentage',
                code: 'SAVE20',
                type: 'percentage',
                value: 20,
                isActive: true,
                minTransaction: 100000,
                maxDiscount: 50000,
                description: '20% off up to 50k'
            };

            expect(percentageVoucher.type).toBe('percentage');
            expect(typeof percentageVoucher.value).toBe('number');
            expect(typeof percentageVoucher.isActive).toBe('boolean');
        });

        it('should define fixed voucher correctly', () => {
            const fixedVoucher: Voucher = {
                id: 'voucher-fixed',
                code: 'FIXED25K',
                type: 'fixed',
                value: 25000,
                isActive: true,
                minTransaction: 75000
            };

            expect(fixedVoucher.type).toBe('fixed');
            expect(fixedVoucher.maxDiscount).toBeUndefined();
            expect(fixedVoucher.description).toBeUndefined();
        });
    });

    describe('CheckoutValidationResult', () => {
        it('should define validation result for valid checkout', () => {
            const validResult: CheckoutValidationResult = {
                isValid: true,
                errors: []
            };

            expect(validResult.isValid).toBe(true);
            expect(validResult.errors).toEqual([]);
        });

        it('should define validation result with errors', () => {
            const invalidResult: CheckoutValidationResult = {
                isValid: false,
                errors: ['Item quantity cannot be zero', 'Payment method required']
            };

            expect(invalidResult.isValid).toBe(false);
            expect(invalidResult.errors).toHaveLength(2);
            expect(Array.isArray(invalidResult.errors)).toBe(true);
        });
    });

    describe('VoucherValidationResult', () => {
        it('should define voucher validation for applicable voucher', () => {
            const canApply: VoucherValidationResult = {
                canApply: true
            };

            expect(canApply.canApply).toBe(true);
            expect(canApply.reason).toBeUndefined();
        });

        it('should define voucher validation with rejection reason', () => {
            const cannotApply: VoucherValidationResult = {
                canApply: false,
                reason: 'Minimum transaction not met'
            };

            expect(cannotApply.canApply).toBe(false);
            expect(cannotApply.reason).toBe('Minimum transaction not met');
        });
    });

    describe('CheckoutPaymentParams', () => {
        it('should define payment parameters correctly', () => {
            const paymentParams: CheckoutPaymentParams = {
                orderCode: 'ORDER123',
                paymentMethodId: 1,
                tableNumberId: 5,
                subtotal: 50000,
                tax: 5000,
                discount: 5000,
                finalPrice: 50000,
                appliedVoucher: {
                    id: 'voucher-1',
                    code: 'DISCOUNT10'
                },
                paymentMethodFee: 2500,
                platformFee: 1000
            };

            expect(typeof paymentParams.orderCode).toBe('string');
            expect(typeof paymentParams.paymentMethodId).toBe('number');
            expect(typeof paymentParams.tableNumberId).toBe('number');
            expect(typeof paymentParams.appliedVoucher).toBe('object');
        });

        it('should handle optional parameters', () => {
            const minimalParams: CheckoutPaymentParams = {
                orderCode: 'ORDER456',
                paymentMethodId: 2
            };

            expect(minimalParams.tableNumberId).toBeUndefined();
            expect(minimalParams.subtotal).toBeUndefined();
            expect(minimalParams.appliedVoucher).toBeUndefined();
        });
    });

    describe('VoucherCalculationResult', () => {
        it('should define voucher calculation result correctly', () => {
            const calculation: VoucherCalculationResult = {
                originalPrice: 100000,
                discount: 10000,
                finalPrice: 90000,
                tax: 9000,
                subtotalWithTax: 99000,
                savings: 10000,
                savingsPercentage: 10,
                canApplyVoucher: true
            };

            expect(typeof calculation.originalPrice).toBe('number');
            expect(typeof calculation.discount).toBe('number');
            expect(typeof calculation.finalPrice).toBe('number');
            expect(typeof calculation.canApplyVoucher).toBe('boolean');
            expect(calculation.errorMessage).toBeUndefined();
        });

        it('should handle error in voucher calculation', () => {
            const calculationWithError: VoucherCalculationResult = {
                originalPrice: 30000,
                discount: 0,
                finalPrice: 30000,
                tax: 3000,
                subtotalWithTax: 33000,
                savings: 0,
                savingsPercentage: 0,
                canApplyVoucher: false,
                errorMessage: 'Minimum transaction not met'
            };

            expect(calculationWithError.canApplyVoucher).toBe(false);
            expect(calculationWithError.errorMessage).toBe('Minimum transaction not met');
            expect(calculationWithError.discount).toBe(0);
        });
    });

    describe('NavigationAction', () => {
        it('should accept valid navigation actions', () => {
            const homeAction: NavigationAction = 'home';
            const paymentAction: NavigationAction = 'payment';
            const voucherAction: NavigationAction = 'voucher';

            expect(homeAction).toBe('home');
            expect(paymentAction).toBe('payment');
            expect(voucherAction).toBe('voucher');
        });
    });

    describe('FormattedPrices', () => {
        it('should define formatted prices structure', () => {
            const formattedPrices: FormattedPrices = {
                subtotal: 'Rp 50.000',
                tax: 'Rp 5.000',
                discount: 'Rp 5.000',
                total: 'Rp 50.000'
            };

            expect(typeof formattedPrices.subtotal).toBe('string');
            expect(typeof formattedPrices.tax).toBe('string');
            expect(typeof formattedPrices.discount).toBe('string');
            expect(typeof formattedPrices.total).toBe('string');
        });
    });

    describe('CheckoutRequestPayload', () => {
        it('should define API request payload correctly', () => {
            const requestPayload: CheckoutRequestPayload = {
                product_ids: [1, 2, 3],
                variant_ids: [1, 2, 3],
                quantities: [2, 1, 3],
                notes: ['No sugar', '', 'Extra hot'],
                voucher_type: 1,
                voucher_code: 'DISCOUNT10',
                table_number_id: '5',
                method_id: 1
            };

            expect(Array.isArray(requestPayload.product_ids)).toBe(true);
            expect(Array.isArray(requestPayload.variant_ids)).toBe(true);
            expect(Array.isArray(requestPayload.quantities)).toBe(true);
            expect(Array.isArray(requestPayload.notes)).toBe(true);
            expect(typeof requestPayload.voucher_type).toBe('number');
            expect(typeof requestPayload.method_id).toBe('number');
        });

        it('should handle null values in request payload', () => {
            const payloadWithNulls: CheckoutRequestPayload = {
                product_ids: [1],
                variant_ids: [1],
                quantities: [1],
                notes: ['Test'],
                voucher_type: null,
                voucher_code: null,
                table_number_id: null,
                method_id: 1
            };

            expect(payloadWithNulls.voucher_type).toBeNull();
            expect(payloadWithNulls.voucher_code).toBeNull();
            expect(payloadWithNulls.table_number_id).toBeNull();
        });
    });

    describe('ApiResponse', () => {
        it('should define API response structure', () => {
            const successResponse: ApiResponse<CheckoutData> = {
                data: {
                    items: [],
                    subtotal: 0,
                    tax: 0,
                    discount: 0,
                    total: 0,
                    appliedVoucher: null
                },
                success: true,
                message: 'Checkout data retrieved successfully'
            };

            expect(typeof successResponse.success).toBe('boolean');
            expect(typeof successResponse.data).toBe('object');
            expect(typeof successResponse.message).toBe('string');
        });

        it('should handle error response', () => {
            const errorResponse: ApiResponse<null> = {
                data: null,
                success: false,
                message: 'Failed to process request'
            };

            expect(errorResponse.success).toBe(false);
            expect(errorResponse.data).toBeNull();
        });
    });
});