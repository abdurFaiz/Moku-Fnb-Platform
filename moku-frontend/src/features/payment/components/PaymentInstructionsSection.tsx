import React from 'react';
import { Separator } from '@/components/Separator';

export const PaymentInstructionsSection: React.FC = () => (
    <>
        <Separator />
        <div className="flex flex-col gap-4 mt-6">
            <h3 className="text-lg font-rubik font-medium text-title-black">
                Cara Membayarnya :
            </h3>
            <div className="flex flex-col gap-2">
                {/* Step 1 */}
                <InstructionStep number={1}>
                    Klik unduh barcode atau screenshoot barcode untuk menyimpan gambar QRIS
                </InstructionStep>

                {/* Step 2 */}
                <InstructionStep number={2}>
                    Buka pembayaran QRIS pada mobile banking atau e-wallet
                </InstructionStep>

                {/* Step 3 */}
                <InstructionStep number={3}>
                    Unggah gambar QRIS yang telah tersimpan dan selesaikan pembayaran
                </InstructionStep>

                {/* Step 4 */}
                <InstructionStep number={4}>
                    Cek status pembayaran pada platform ini
                </InstructionStep>
            </div>
        </div>
    </>
);

const InstructionStep: React.FC<{ number: number; children: string }> = ({
    number,
    children,
}) => (
    <p className="text-base font-normal text-title-black leading-6">
        <span className="font-medium">{number}.</span> {children}
    </p>
);
