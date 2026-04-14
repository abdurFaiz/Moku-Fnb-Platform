import React from 'react';

interface EmptyVouchersStateProps {
    /**
     * Optional custom message
     * @default "Kamu belum memiliki voucher yang dapat ditukarkan..."
     */
    message?: string;
}

export const EmptyVouchersState: React.FC<EmptyVouchersStateProps> = ({
    message = 'Kamu belum memiliki voucher yang dapat ditukarkan.',
}) => {
    return (
        <div className="mx-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-title-black">Tukarkan Dengan Vouchers</h2>
                <span className="text-sm text-gray-500">0 voucher</span>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-gray-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <img loading="lazy" src='/icons/icon-voucher.svg' className='size-8 grayscale-100' />
                </div>
                <h3 className="text-lg font-medium text-title-black mb-2">
                    Belum Ada Voucher
                </h3>
                <p className="text-gray-500 text-sm">
                    {message}
                </p>
            </div>
        </div>
    );
};
