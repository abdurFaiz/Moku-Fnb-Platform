import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { VoucherListSection } from "@/features/vouchers/components/VoucherListSection";
import { Separator } from "@/components/Separator";
import HeaderBar from "@/components/HeaderBar";
import { useNavigate } from "react-router-dom";
import { TextInputWithIcon } from "@/components/InputVouchers";
import { SkeletonVouchersPage } from "@/components/skeletons/SkeletonComponents";
import { useRewardVouchers } from "@/features/vouchers/hooks/useRewardVouchers";
import { transformVouchersToCardProps } from "@/features/vouchers/utils/voucherTransformer";

export default function VoucherSection() {
  const navigate = useNavigate();
  const { vouchers, isLoading, error } = useRewardVouchers();

  const handleOpenVoucherModal = () => {
    // TODO: Implement voucher search/filter modal
  };

  const handleVoucherClick = (voucher: any) => {
    // TODO: Implement voucher selection logic
    console.log('Voucher clicked:', voucher);
  };

  // Transform vouchers to card props
  const terbaruVouchers = transformVouchersToCardProps(vouchers.latest);
  const lainnyaVouchers = transformVouchersToCardProps(vouchers.available);
  const expiredVouchers = transformVouchersToCardProps(vouchers.unavailable);


  return (
    <ScreenWrapper>
      <div className="sticky top-0 z-10 bg-white rounded-b-3xl shadow-[0_4px_8px_0_rgba(128,128,128,0.24)]">
        <div className="px-4 py-5 flex flex-col gap-6">
          <HeaderBar
            title="Vouchers"
            showBack={true}
            onBack={() => navigate(-1)}
            className="p-0 bg-transparent shadow-none"
          />
          <TextInputWithIcon onClick={handleOpenVoucherModal} />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonVouchersPage />}

      {/* Error State */}
      {error && !isLoading && (
        <div className="px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-600">⚠️ {error}</p>
            <p className="text-xs text-red-500 mt-2">Tidak dapat memuat voucher</p>
          </div>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <div className="flex flex-col gap-9 mt-6 mb-28">
          {/* Terbaru Section */}
          <div className="px-4">
            {terbaruVouchers.length > 0 ? (
              <VoucherListSection
                title="Terbaru"
                totalItems={terbaruVouchers.length}
                vouchers={terbaruVouchers}
                onVoucherClick={handleVoucherClick}
              />
            ) : (
              <>
                <h3 className="text-base font-rubik font-semibold text-gray-800 mb-4">Terbaru</h3>
                {/* Empty state */}
              </>
            )}
          </div>

          <Separator />

          {/* Langsung Tukarkan Ke Kasir Section */}
          <div className="px-4">
            {lainnyaVouchers.length > 0 ? (
              <VoucherListSection
                title="Langsung Tukarkan Ke Kasir"
                totalItems={lainnyaVouchers.length}
                vouchers={lainnyaVouchers}
                onVoucherClick={handleVoucherClick}
              />
            ) : (
              <>
                <h3 className="text-base font-rubik font-semibold text-gray-800 mb-4">Langsung Tukarkan Ke Kasir</h3>
                {/* Empty state */}
              </>
            )}
          </div>

          <Separator />

          {/* Expired/Unavailable Section */}
          <div className="px-4">
            {expiredVouchers.length > 0 ? (
              <VoucherListSection
                title="Belum Bisa Digunakan"
                totalItems={expiredVouchers.length}
                vouchers={expiredVouchers}
                onVoucherClick={handleVoucherClick}
              />
            ) : (
              <>
                <h3 className="text-base font-rubik font-semibold text-gray-800 mb-4">Belum Bisa Digunakan</h3>
                {/* Empty state */}
              </>
            )}
          </div>
        </div>
      )}
    </ScreenWrapper>
  );
}
