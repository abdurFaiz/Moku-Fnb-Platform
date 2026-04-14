import HeaderBar from "@/components/HeaderBar";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { EmptyVoucherState } from "../components/EmptyVoucherState";
import { TabFilter } from "../components/TabFilter";
import VoucherCard from "@/components/VoucherCard";
import { useMemo, useState } from "react";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { DateFormatterUtils } from "@/utils/formatters";
import type { UserVoucher } from "@/features/vouchers/types/UserVoucher";
import { useQueryUserVouchers } from "@/features/vouchers/hooks/api/useQueryVocher";

type TabType = "active" | "expired";

export default function HistoryVouchers() {
    const { navigateToVouchers, outletSlug } = useOutletNavigation();
    const [activeTab, setActiveTab] = useState<TabType>("active");

    const { data: vouchersResponse, isLoading, error } = useQueryUserVouchers(outletSlug, {
        enabled: !!outletSlug,
    });

    const userVouchers = vouchersResponse?.data?.user_vouchers ?? [];

    const tabs = [
        { id: "active", label: "Dipakai" },
        { id: "expired", label: "Kadaluarsa" },
    ];

    const isExpired = (endDate: string | null): boolean => {
        if (!endDate) return true;
        return new Date(endDate) < new Date();
    };

    const filteredVouchers = useMemo(() => {
        return userVouchers.filter((uv) => {
            if (uv.is_active === 0) return false;

            if (activeTab === "active") {
                return !isExpired(uv.end_date) && uv.can_used === 1;
            }

            return isExpired(uv.end_date) || uv.can_used === 0;
        });
    }, [userVouchers, activeTab]);


    const renderEmptyState = () => {
        if (activeTab === "active") {
            return (
                <EmptyVoucherState
                    message="Belum ada voucher yang dipakai"
                    icon="🎟️"
                />
            );
        } else {
            return (
                <EmptyVoucherState
                    message="Belum ada voucher yang kadaluarsa"
                    icon="⏰"
                />
            );
        }
    };

    const getVoucherStatus = (uv: UserVoucher) => {
        if (uv.can_used === 0) {
            return "disabled";
        }
        if (isExpired(uv.end_date)) {
            return "expired";
        }
        return "active";
    };

    return (
        <ScreenWrapper>
            <HeaderBar title="Riwayat Voucher" showBack onBack={navigateToVouchers} />
            <div className="mt-6">
                <TabFilter
                    tabs={tabs}
                    activeTab={activeTab}
                    onChange={(tabId) => setActiveTab(tabId as TabType)}
                />
            </div>
            <div className="space-y-4 mx-4 mt-6">
                {isLoading && <div className="text-center py-8">Loading...</div>}
                {error && <div className="text-center py-8 text-red-500">{error.message}</div>}
                {!isLoading && filteredVouchers.length === 0 && renderEmptyState()}
                {!isLoading && filteredVouchers.length > 0 && (
                    filteredVouchers.map((uv) => (
                        <VoucherCard
                            key={uv.id}
                            title={uv.name}
                            subtitle={`Code: ${uv.code}`}
                            expiryDate={DateFormatterUtils.formatDateOnly(uv.end_date || '')}
                            minTransaction={uv.min_transaction ? `Rp${uv.min_transaction.toLocaleString('id-ID')}` : undefined}
                            minPoin={undefined}
                            status={getVoucherStatus(uv)}
                            isDisabled={isExpired(uv.end_date) || uv.can_used === 0}
                        />
                    ))
                )}
            </div>
        </ScreenWrapper>
    )
}