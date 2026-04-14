import { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
// import { Minus, Plus } from "lucide-react";
import type { UserVoucherItem } from "@/features/vouchers/types/Voucher";
import confetti from "canvas-confetti";

interface BottomSheetRewardDetailProps {
    isOpen: boolean;
    onClose: () => void;
    reward: UserVoucherItem | null;
    pointBalance: number;
    onClaim?: (voucherId: number) => Promise<void>;
    isClaimLoading?: boolean;
}

export const BottomSheetRewardDetail = ({
    isOpen,
    onClose,
    reward,
    pointBalance,
    onClaim,
    isClaimLoading = false,
}: BottomSheetRewardDetailProps) => {
    const [quantity, _setQuantity] = useState(1);

    if (!reward) return null;

    const totalPoints = reward.point * quantity;
    const hasEnoughPoints = pointBalance >= totalPoints;
    const isExpired = new Date(reward.valid_until) < new Date();
    const canClaim = hasEnoughPoints && !isExpired;

    const imageUrl = reward.is_product_reward
        ? reward.voucher_products?.[0]?.image_url
        : undefined;

    const description = reward.voucher?.description || "Tidak ada deskripsi tersedia";
    const handleClickConfetti = () => {
        const end = Date.now() + 1 * 1000; // 3 seconds
        const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
        const frame = () => {
            if (Date.now() > end) return;
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                startVelocity: 60,
                origin: { x: 0, y: 0.5 },
                colors: colors,
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                startVelocity: 60,
                origin: { x: 1, y: 0.5 },
                colors: colors,
            });
            requestAnimationFrame(frame);
        };
        frame();
    };

    const handleClaim = async () => {
        if (canClaim && onClaim && reward.id) {
            try {
                await onClaim(reward.id);

                setTimeout(() => {
                    handleClickConfetti();
                }, 500);
            } catch (error) {
                
            }
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-h-[90vh] max-w-[440px] mx-auto  ">
                <div className="w-full flex flex-col max-h-[85vh]">
                    <DrawerHeader className="shrink-0">
                        <DrawerTitle className="text-xl">{reward.name}</DrawerTitle>
                        <DrawerDescription className="sr-only">
                            Detail reward {reward.name}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="px-4 space-y-4 overflow-y-auto flex-1">
                        {/* Image */}
                        {imageUrl && (
                            <div className="w-full relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                                <img
                                    src={imageUrl}
                                    alt={reward.name}
                                    className="w-full h-full object-contain "
                                />
                                <div className="absolute top-0 right-0 px-2 py-1 rounded-bl-2xl bg-primary-orange">
                                    <span className="text-sm font-medium text-white">Perlu {reward.point} Poin</span>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-700">Deskripsi</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
                        </div>
                        {/* Valid Until */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Berlaku Hingga</span>
                            <span className="text-sm text-gray-600">
                                {new Date(reward.valid_until).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>

                        {/* Status Messages */}
                        {!hasEnoughPoints && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600">
                                    Poin tidak cukup. Anda memerlukan {totalPoints - pointBalance} poin lagi.
                                </p>
                            </div>
                        )}

                        {isExpired && (
                            <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                                <p className="text-sm text-gray-600">Reward ini sudah tidak berlaku.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons - Fixed at bottom */}
                    <div className="flex justify-between items-center p-4 border-t bg-white shrink-0 gap-4">
                        {/* Quantity Selector */}
                        {/* <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                                className="w-8 h-8 border-2 border-primary-orange rounded-full flex justify-center items-center text-primary-orange"
                                disabled={quantity <= 1 || isClaimLoading}
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-base font-medium min-w-[30px] text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity((prev) => prev + 1)}
                                className="w-8 h-8 bg-primary-orange rounded-full text-white flex justify-center items-center"
                                disabled={!hasEnoughPoints || isClaimLoading}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div> */}

                        {/* Claim Button */}
                        <Button
                            size={"lg"}
                            onClick={handleClaim}
                            disabled={!canClaim || isClaimLoading}
                            className="flex-1 bg-primary-orange hover:bg-primary-orange/80 text-white text-base"
                        >
                            {isClaimLoading ? "Menukarkan..." : `Tukarkan ${totalPoints} Poin`}
                        </Button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
