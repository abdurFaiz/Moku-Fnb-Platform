import { useState } from "react";
import HeaderBar from "@/components/HeaderBar";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { PointsSummary } from "../components/PoinSummary";
import { VoucherListSection } from "@/features/vouchers/components/VoucherListSection";
import { ProductListSection } from "@/components/ProductListSection";
import { EmptyVouchersState } from "@/features/reward/components/EmptyVouchersState";
import { Separator } from "@/components/Separator";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { SkeltonReward } from "@/components/skeletons";
import { toast } from "sonner";
import type { VoucherCardProps } from "@/components/VoucherCard";
import type { ProductRewardCardProps } from "@/components/ProductListSection";
import type { VouchersResponse, UserVoucherItem } from "@/features/vouchers/types/Voucher";
import ButtonBackToUp from "@/components/BackToUp";
import { useQueryRewardSummary } from "@/features/reward/hooks/api/useQueryReward";
import { useQueryRewardVouchers } from "@/features/vouchers/hooks/api/useQueryVocher";
import { useClaimVoucherPointMutation } from "@/features/vouchers/hooks/api/useMutationVoucher";
import { BottomSheetRewardDetail } from "@/features/reward/components/BottomSheetRewardDetail";
import { BottomSheetRewardSuccess } from "@/features/reward/components/BottomSheetRewardSuccess";
import RewardVoucherCard from "../components/RewardVoucherCard";
import { useVoucherStore, type Voucher } from "@/features/vouchers/stores/voucherStore";
import { useCartStore } from "@/features/cart/stores/cartStore";

export default function RewardPoin() {
    const { navigateToHome, navigateToHistoryPoin,  navigateToCheckout, outletSlug } = useOutletNavigation();
    const claimVoucherMutation = useClaimVoucherPointMutation();
    const [selectedReward, setSelectedReward] = useState<UserVoucherItem | null>(null);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isSuccessSheetOpen, setIsSuccessSheetOpen] = useState(false);

    // Fetch reward points data from API
    const { data: rewardData, isLoading: isRewardLoading } = useQueryRewardSummary(outletSlug, {
        enabled: !!outletSlug,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch all available vouchers using VoucherAPI
    const { data: vouchersData, isLoading: isVouchersLoading, error } = useQueryRewardVouchers(outletSlug, {
        enabled: !!outletSlug,
    });

    // Extract and transform vouchers
    const pointBalance = rewardData?.data?.point_balance ?? 0;
    const vouchersResponse = vouchersData as VouchersResponse | undefined;
    const allVouchers = Array.isArray(vouchersResponse?.data?.vouchers)
        ? vouchersResponse.data.vouchers
        : [];

    // Separate regular vouchers and product rewards
    const regularVouchers = allVouchers.filter(v => !v.is_product_reward);
    const productVouchers = allVouchers.filter(v => v.is_product_reward);

    // Transform regular vouchers to VoucherCardProps
    const transformVouchersToCardProps = (vouchers: VouchersResponse['data']['vouchers']): VoucherCardProps[] => {
        const now = new Date();
        return vouchers.map((voucher, index) => {
            const expiryDate = new Date(voucher.valid_until);
            const isExpired = expiryDate < now;
            const hasEnoughPoints = pointBalance >= voucher.point;

            return {
                title: voucher.name,
                subtitle: voucher.voucher?.description || `-`,
                expiryDate: expiryDate.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                }),
                minPoin: `${voucher.point}`,
                maxUsage: voucher.voucher.max_usage || 0,
                status: isExpired ? 'expired' : 'active',
                voucherId: voucher.id || index,
                isDisabled: !hasEnoughPoints,
            } as VoucherCardProps;
        });
    };

    // Transform product vouchers to ProductRewardCardProps
    const transformProductsToCardProps = (vouchers: VouchersResponse['data']['vouchers']): ProductRewardCardProps[] => {
        const now = new Date();
        return vouchers.map((voucher, index) => {
            const expiryDate = new Date(voucher.valid_until);
            const isExpired = expiryDate < now;
            const hasEnoughPoints = pointBalance >= voucher.point;

            return {
                name: voucher.name,
                description: voucher.voucher?.description || undefined,
                image: voucher.voucher_products?.[0]?.image_url || undefined,
                points: voucher.point,
                voucherId: voucher.id || index,
                status: isExpired ? 'expired' : 'active',
                isDisabled: !hasEnoughPoints,
                pointBalance: pointBalance,
            } as ProductRewardCardProps;
        });
    };

    const vouchers = regularVouchers.length > 0 ? transformVouchersToCardProps(regularVouchers) : [];
    const products = productVouchers.length > 0 ? transformProductsToCardProps(productVouchers) : [];

    // Loading state
    const isLoading = isRewardLoading || isVouchersLoading;

    const handleVoucherClick = (voucherCard: VoucherCardProps) => {
        const voucher = regularVouchers.find(v => v.id === voucherCard.voucherId);
        if (voucher) {
            setSelectedReward(voucher);
            setIsBottomSheetOpen(true);
        }
    };

    const handleProductClick = (productCard: ProductRewardCardProps) => {
        const product = productVouchers.find(v => v.id === productCard.voucherId);
        if (product) {
            setSelectedReward(product);
            setIsBottomSheetOpen(true);
        }
    };

    const handleClaimReward = async (voucherId: number) => {
        if (!outletSlug) {
            toast.error('Informasi outlet tidak tersedia');
            return;
        }

        try {
            await claimVoucherMutation.mutateAsync({
                outletSlug,
                voucherId,
            });
            // Close detail sheet and open success sheet
            setIsBottomSheetOpen(false);
            setIsSuccessSheetOpen(true);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal mengklaim reward';
            toast.error('❌ Gagal mengklaim reward', {
                description: errorMessage,
            });
        }
    };

    const handleUseNow = () => {
        setIsSuccessSheetOpen(false);

        // Store the claimed voucher info for auto-apply in checkout
        if (selectedReward?.voucher) {
            try {

                // Convert the reward voucher to the Voucher type for the store
                const voucherToApply: Voucher = {
                    id: selectedReward.voucher.id || selectedReward.voucher_id || selectedReward.id,
                    name: selectedReward.voucher.name || selectedReward.name,
                    code: selectedReward.voucher.code || '',
                    type: (selectedReward.voucher.discount_fixed && selectedReward.voucher.discount_fixed > 0) ? 'fixed' : 'percentage',
                    value: selectedReward.voucher.discount_fixed || selectedReward.voucher.discount_percent || 0,
                    // maxDiscount: selectedReward.voucher.,
                    minTransaction: selectedReward.voucher.min_transaction || 0,
                    isActive: true,
                    applicableProductIds: selectedReward.voucher_products?.map(vp => vp.id).filter(Boolean),
                };

                // Apply voucher to the store
                const { applyVoucher } = useVoucherStore.getState();
                applyVoucher(voucherToApply, 'user');

                // Verify it was applied
                // const storeState = useVoucherStore.getState();


                // Also store in localStorage for backward compatibility
                localStorage.setItem('appliedVoucher', JSON.stringify(voucherToApply));
                localStorage.setItem('appliedVoucherId', String(voucherToApply.id));
                localStorage.setItem('appliedVoucherCode', voucherToApply.code || '');

                // Set a flag to indicate this voucher should be auto-applied on checkout page load
                localStorage.setItem('autoApplyVoucherOnCheckout', 'true');

                // If this is a product reward, add the product to cart automatically
                if (selectedReward.is_product_reward && selectedReward.voucher_products?.[0]) {
                    const rewardProduct = selectedReward.voucher_products[0];
                    const { addItem } = useCartStore.getState();

                    // Add the reward product to cart
                    addItem({
                        productId: Number(rewardProduct.id),
                        productUuid: rewardProduct.uuid,
                        name: rewardProduct.name || selectedReward.name,
                        price: Number(rewardProduct.price) || 0,
                        basePrice: Number(rewardProduct.price) || 0,
                        quantity: 1,
                        image: rewardProduct.image_url,
                        options: [],
                        notes: '',
                    });

                }

                // Small delay to ensure store is persisted before navigation
                setTimeout(() => {
                    navigateToCheckout();
                }, 100);
            } catch (err) {
                toast.error('Gagal menerapkan voucher');
            }
        } else {
            // If no voucher data, just navigate to checkout
            navigateToCheckout();
        }

        setSelectedReward(null);
    };

    // Loading state
    if (isLoading) {
        return (
            <ScreenWrapper>
                <HeaderBar title="Reward Poin" showBack={true} showHistory={true} onHistory={navigateToHistoryPoin} onBack={navigateToHome} />
                <SkeltonReward />
            </ScreenWrapper>
        );
    }

    // Error state
    if (error) {
        return (
            <ScreenWrapper>
                <HeaderBar title="Reward Poin" showBack={true} showHistory={true} onHistory={navigateToHistoryPoin} onBack={navigateToHome} />
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-lg text-red-500 mb-2">Gagal memuat data</div>
                        <div className="text-sm text-gray-500">Silakan coba lagi nanti</div>
                    </div>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <HeaderBar title="Reward Poin" showBack={true} showHistory={true} onHistory={navigateToHistoryPoin} onBack={navigateToHome} />
            <div className="flex flex-col gap-8">
                <PointsSummary points={pointBalance} />
                <RewardVoucherCard />
                {products.length > 0 && (
                    <ProductListSection
                        title="Tukarkan Dengan Produk"
                        totalItems={products.length}
                        products={products}
                        onProductClick={handleProductClick}
                    />
                )}

                {vouchers.length > 0 && (
                    <>
                        <VoucherListSection
                            title="Tukarkan Dengan Vouchers"
                            totalItems={vouchers.length}
                            vouchers={vouchers}
                            onVoucherClick={handleVoucherClick}
                        />
                        {products.length > 0 && <Separator />}
                    </>
                )}
                {vouchers.length === 0 && products.length === 0 && (
                    <EmptyVouchersState />
                )}
            </div>

            <ButtonBackToUp />

            <BottomSheetRewardDetail
                isOpen={isBottomSheetOpen}
                onClose={() => {
                    setIsBottomSheetOpen(false);
                    setSelectedReward(null);
                }}
                reward={selectedReward}
                pointBalance={pointBalance}
                onClaim={handleClaimReward}
                isClaimLoading={claimVoucherMutation.isPending}
            />

            <BottomSheetRewardSuccess
                isOpen={isSuccessSheetOpen}
                onClose={() => {
                    setIsSuccessSheetOpen(false);
                    setSelectedReward(null);
                }}
                onUseNow={handleUseNow}
            />
        </ScreenWrapper>
    )
}