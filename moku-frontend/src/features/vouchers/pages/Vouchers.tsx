import { Suspense, lazy, useMemo, useState } from 'react';

import { BottomNav } from '@/components/MenuBar';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Separator } from '@/components/Separator';
import HeaderBar from '@/components/HeaderBar';
import { EmptyVoucherState } from '../components/EmptyVoucherState';
import { SkeletonVouchersPage } from '@/components/skeletons/SkeletonComponents';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { toast } from 'sonner';
import type { VoucherCardProps } from '@/components/VoucherCard';
import type { UserVoucher } from '@/features/vouchers/types/UserVoucher';
import ButtonBackToUp from '@/components/BackToUp';
import { useQueryUserVouchers } from '@/features/vouchers/hooks/api/useQueryVocher';
import { useClaimVoucherPointMutation } from '@/features/vouchers/hooks/api/useMutationVoucher';

const VoucherListSection = lazy(() =>
    import('@/features/vouchers/components/VoucherListSection').then((module) => ({
        default: module.VoucherListSection,
    }))
);

const VoucherDetailDrawer = lazy(() =>
    import('@/features/vouchers/components/VoucherDetailDrawer').then((module) => ({
        default: module.VoucherDetailDrawer,
    }))
);

const VoucherSectionSkeleton = ({ title, className = 'px-4' }: { title: string; className?: string }) => (
    <div className={className}>
        <div className="flex flex-col gap-4">
            <h3 className="text-base font-medium text-gray-800">{title}</h3>
            <div className="h-24 rounded-xl bg-slate-100/70 animate-pulse" />
        </div>
    </div>
);

export default function Voucher() {
    const { navigateToHistoryVouchers, outletSlug } = useOutletNavigation();
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherCardProps | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [claimedVoucherIds, setClaimedVoucherIds] = useState<Record<number, boolean>>({});
    const claimVoucherMutation = useClaimVoucherPointMutation();

    // Fetch vouchers from VoucherAPI
    const { data: vouchersResponse, isLoading, error } = useQueryUserVouchers(outletSlug, {
        enabled: !!outletSlug,
        staleTime: 5 * 60 * 1000,
    });

    // Extract and categorize vouchers
    const allVouchers = vouchersResponse?.data?.user_vouchers || [];

    const parseDate = (dateString: string | null): Date | null => {
        if (!dateString) return null;
        // Parse YYYY-MM-DD format and set to end of day (23:59:59)
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            date.setHours(23, 59, 59, 999); // Set to end of day
            return date;
        }
        return new Date(dateString);
    };

    // Helper function to transform API vouchers to card props with ID tracking
    const transformAPIVouchersToCardProps = (vouchers: UserVoucher[]): VoucherCardProps[] => {
        const now = new Date();
        return vouchers.map((voucher, index) => {
            const expiryDate = parseDate(voucher.end_date);
            const isExpired = expiryDate ? expiryDate < now : false; // If no end_date, treat as not expired
            const voucherKey = voucher.id ?? index;
            const isClaimed = Boolean(claimedVoucherIds[voucherKey]);
            const status: VoucherCardProps['status'] = isExpired
                ? 'expired'
                : isClaimed
                    ? 'claimed'
                    : 'active';
            return {
                title: voucher.name,
                subtitle: voucher.description || '',
                expiryDate: expiryDate?.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                }) || '-',
                minTransaction: voucher.min_transaction ? `Rp${voucher.min_transaction.toLocaleString('id-ID')}` : undefined,
                minPoin: undefined, // UserVoucher doesn't have point field - this should only show for reward vouchers
                status,
                voucherId: voucherKey,
                discoundFixedPrice: voucher.discount_fixed ? Number(voucher.discount_fixed) : 0,
                discoundPercent: voucher.discount_percent ? Number(voucher.discount_percent) : 0,
                maxUsage: voucher.max_usage || 0,
            } as VoucherCardProps;
        });
    };

    const categorizeVouchers = (vouchers: UserVoucher[]) => {
        const now = new Date();
        // Umum: claim_type 1 (PLATFORM) and not expired
        const general = vouchers.filter(v => {
            const expiryDate = parseDate(v.end_date);
            const isExpired = expiryDate ? expiryDate <= now : false;
            return v.claim_type === 1 && !isExpired;
        });
        // Admin: claim_type 2 (ADMIN) and not expired
        const admin = vouchers.filter(v => {
            const expiryDate = parseDate(v.end_date);
            const isExpired = expiryDate ? expiryDate <= now : false;
            return v.claim_type === 2 && !isExpired;
        });
        // Unavailable: expired or claim_type other than 1 and 2
        const unavailable = vouchers.filter(v => {
            const expiryDate = parseDate(v.end_date);
            const isExpired = expiryDate ? expiryDate <= now : false;
            return isExpired || (v.claim_type !== 1 && v.claim_type !== 2);
        });

        return { general, admin, unavailable };
    };

    const categorized = useMemo(() => categorizeVouchers(allVouchers), [allVouchers]);

    const handleVoucherClick = async (voucherCard: VoucherCardProps) => {
        setSelectedVoucher(voucherCard);
        setIsDrawerOpen(true);
    };

    const handleClaimVoucher = async () => {
        if (!outletSlug || selectedVoucher?.voucherId === undefined) {
            toast.error('Informasi voucher atau outlet tidak tersedia');
            return;
        }

        if (selectedVoucher.status !== 'active') {
            toast.error('Voucher ini tidak dapat diklaim', {
                description: `Status: ${selectedVoucher.status}`,
            });
            return;
        }

        try {
            const response = await claimVoucherMutation.mutateAsync({
                outletSlug,
                voucherId: selectedVoucher.voucherId,
            });
            toast.success('🎉 Voucher berhasil diklaim!', {
                description: response.message || `${selectedVoucher.title} telah ditambahkan ke akun Anda.`,
            });
            setClaimedVoucherIds((prev) => {
                if (selectedVoucher?.voucherId === undefined) {
                    return prev;
                }
                return {
                    ...prev,
                    [selectedVoucher.voucherId]: true,
                };
            });
            setIsDrawerOpen(false);
            setSelectedVoucher(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Gagal mengklaim voucher';
            toast.error('❌ Gagal mengklaim voucher', {
                description: errorMessage,
            });
        }
    };

    // Transform vouchers to card props
    const generalVouchers = useMemo(
        () => transformAPIVouchersToCardProps(categorized.general),
        [categorized.general, claimedVoucherIds]
    );
    const adminVouchers = useMemo(
        () => transformAPIVouchersToCardProps(categorized.admin),
        [categorized.admin, claimedVoucherIds]
    );
    const unavailableVouchers = useMemo(
        () => transformAPIVouchersToCardProps(categorized.unavailable),
        [categorized.unavailable, claimedVoucherIds]
    );

    return (
        <ScreenWrapper>
            <div className="sticky top-0 z-10 bg-white rounded-b-3xl shadow-[0_4px_8px_0_rgba(128,128,128,0.24)]">
                <div className="px-4 py-5 flex flex-col gap-6">
                    <HeaderBar title='Vouchers' onHistory={navigateToHistoryVouchers} showHistory={true} className='p-0 bg-transparent shadow-none' />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && <SkeletonVouchersPage />}

            {/* Error State */}
            {error && !isLoading && (
                <div className="px-4 py-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-red-600">⚠️ {error.message}</p>
                        <p className="text-xs text-red-500 mt-2">Tidak dapat memuat voucher</p>
                    </div>
                </div>
            )}

            {/* Content */}
            {!isLoading && !error && (
                <div className="flex flex-col gap-9 mt-6 mb-28">
                    {/* Terbaru Section - Umum (claim_type: 1) */}
                    <div className="px-1">
                        {generalVouchers.length > 0 ? (
                            <Suspense fallback={<VoucherSectionSkeleton title="Terbaru" className="px-1" />}>
                                <VoucherListSection
                                    title="Terbaru"
                                    vouchers={generalVouchers}
                                    totalItems={generalVouchers.length}
                                    onVoucherClick={handleVoucherClick}
                                />
                            </Suspense>
                        ) : (
                            <>
                                <h3 className="text-base font-medium text-gray-800 mb-4">Terbaru</h3>
                                <EmptyVoucherState message="Belum ada voucher terbaru" icon={<img loading='lazy' src="/icons/icon-voucher.svg" alt="Voucher Icon" className='grayscale-100' />} />
                            </>
                        )}
                    </div>

                    <Separator />

                    {/* Langsung Tukarkan Ke Kasir Section - Admin (claim_type: 2) */}
                    <div className="px-4">
                        {adminVouchers.length > 0 ? (
                            <Suspense fallback={<VoucherSectionSkeleton title="Langsung Tukarkan Ke Kasir" />}>
                                <VoucherListSection
                                    title="Langsung Tukarkan Ke Kasir"
                                    vouchers={adminVouchers}
                                    totalItems={adminVouchers.length}
                                    onVoucherClick={handleVoucherClick}
                                />
                            </Suspense>
                        ) : (
                            <>
                                <h3 className="text-base font-medium text-gray-800 mb-4">Langsung Tukarkan Ke Kasir</h3>
                                <EmptyVoucherState message="Belum ada voucher tersedia" icon={<img loading='lazy' src="/icons/icon-voucher.svg" alt="Voucher Icon" className='grayscale-100' />} />
                            </>
                        )}
                    </div>

                    <Separator />

                    {/* Belum Bisa Digunakan Section */}
                    <div className="px-4">
                        {unavailableVouchers.length > 0 ? (
                            <Suspense fallback={<VoucherSectionSkeleton title="Belum Bisa Digunakan" />}>
                                <VoucherListSection
                                    title="Belum Bisa Digunakan"
                                    vouchers={unavailableVouchers}
                                    totalItems={unavailableVouchers.length}
                                    onVoucherClick={handleVoucherClick}
                                />
                            </Suspense>
                        ) : (
                            <>
                                <h3 className="text-base font-medium text-gray-800 mb-4">Belum Bisa Digunakan</h3>
                                <EmptyVoucherState message="Belum ada voucher" icon={<img loading='lazy' src="/icons/icon-voucher.svg" alt="Voucher Icon" className='grayscale-100' />} />
                            </>
                        )}
                    </div>
                </div>
            )}

            <BottomNav />

            {(isDrawerOpen || selectedVoucher) && (
                <Suspense fallback={null}>
                    <VoucherDetailDrawer
                        voucher={selectedVoucher}
                        isOpen={isDrawerOpen}
                        onOpenChange={setIsDrawerOpen}
                        onClaim={handleClaimVoucher}
                    />
                </Suspense>
            )}
            <ButtonBackToUp />

        </ScreenWrapper>
    );
}
