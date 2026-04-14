import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation"
interface BottomSheetRewardSuccessProps {
    isOpen: boolean;
    onClose: () => void;
    onUseNow?: () => void;
}

export const BottomSheetRewardSuccess = ({
    isOpen,
    onClose,
    onUseNow,
}: BottomSheetRewardSuccessProps) => {
    const { navigateToVouchers } = useOutletNavigation();
    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-w-[440px] mx-auto">
                <div className="w-full flex flex-col py-6 px-6">
                    <DialogTitle className="sr-only">Voucher Berhasil Didapatkan</DialogTitle>
                    <DialogDescription className="sr-only">Selamat! Poinmu berhasil kamu tukarkan dengan hadiah. Yuk, gunakan vouchermu sekarang.</DialogDescription>
                    {/* Success Icon */}
                    <div className="flex flex-col items-center justify-center mb-8">
                        {/* Badge Icon */}
                        <DotLottieReact
                            src="https://lottie.host/3491c3f7-184f-4dbd-8b10-f7be4ceb9bb7/nGaafP0beK.lottie"
                            loop
                            autoplay
                            className="size-64"
                            width={360}
                            height={360}
                            speed={1}
                        />
                        <div className="flex flex-col gap-1">
                            {/* Title */}
                            <h2 className="text-lg font-semibold text-primary-orange text-center">
                                Voucher Berhasil Didapatkan
                            </h2>

                            {/* Description */}
                            <p className="text-center text-gray-600 text-sm px-4">
                                Selamat! Poinmu berhasil kamu tukarkan dengan hadiah. Yuk, gunakan vouchermu sekarang.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-row gap-3">
                        <Button
                            onClick={navigateToVouchers}
                            variant="outline"
                            className="w-full border-2 border-primary-orange text-primary-orange hover:bg-primary-orange/10 font-medium py-3 rounded-full text-base"
                        >
                            Lihat Voucher
                        </Button>
                        <Button
                            onClick={onUseNow}
                            className="w-full bg-primary-orange hover:bg-primary-orange/80 text-white font-medium py-3 rounded-full text-base"
                        >
                            Gunakan Sekarang
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
``