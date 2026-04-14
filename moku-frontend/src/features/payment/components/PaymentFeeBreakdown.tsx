import React from 'react';

interface PaymentFeeBreakdownProps {
    subtotal?: number;
    tax?: number;
    discount?: number;
    paymentMethodFee?: number;
    platformFee?: number;
    serviceFee?: number;
    serviceFeeConfig?: number;
    total?: number;

}

export const PaymentFeeBreakdown: React.FC<PaymentFeeBreakdownProps> = ({
    subtotal = 0,
    tax = 0,
    discount = 0,
    // paymentMethodFee = 0,
    total = 0,
    platformFee = 0,
    serviceFee = 0,
    serviceFeeConfig, // No default - let it be undefined if not provided
}) => {
    // serviceFeeConfig: 1 = fee provided by outlet (hide platform fee), 2 = show platform fee
    // Convert to number and check if it's 2 (use == to handle string "2" or number 2)
    const shouldShowPlatformFee = Number(serviceFeeConfig) === 2;

    return (
        <div className="px-4 py-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col gap-3">
                {/* Subtotal */}
                {subtotal > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-rubik text-body-grey">Subtotal</span>
                        <span className="text-sm font-rubik font-medium text-title-black">
                            Rp {subtotal.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}

                {/* Tax */}
                {tax > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-rubik text-body-grey">Pajak </span>
                        <span className="text-sm font-rubik font-medium text-title-black">
                            Rp {tax.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}
                {/* Platform Fee - only show if serviceFeeConfig is 2 */}
                {shouldShowPlatformFee && platformFee > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-rubik text-body-grey">Biaya Tambahan </span>
                        <span className="text-sm font-rubik font-medium text-title-black">
                            Rp {platformFee.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}
                {serviceFee > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-rubik text-body-grey">Biaya Layanan </span>
                        <span className="text-sm font-rubik font-medium text-title-black">
                            Rp {serviceFee.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}

                {/* Payment Method Fee */}
                {/* {paymentMethodFee > 0 && (
                    <div className="flex justify-between items-center py-2 px-2 bg-orange-50 rounded border border-orange-200">
                        <span className="text-sm font-rubik text-orange-700">Biaya Metode Pembayaran</span>
                        <span className="text-sm font-rubik font-semibold text-orange-600">
                            Rp {paymentMethodFee.toLocaleString('id-ID')}
                        </span>
                    </div>
                )} */}

                {/* Discount */}
                {discount > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-rubik text-light-green">Diskon Voucher</span>
                        <span className="text-sm font-rubik font-medium text-light-green">
                            - Rp {discount.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}

                {/* Divider */}
                <div className="w-full h-px bg-gray-200 my-2"></div>

                {/* Total */}
                {total > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-base font-rubik font-semibold text-title-black">Total Pembayaran</span>
                        <span className="text-base font-rubik font-bold text-title-black">
                            Rp {total.toLocaleString('id-ID')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
