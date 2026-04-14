import { VoucherCard } from "./VoucherCard";
import { VoucherActionButton } from "./MoreVoucherActionButton";
import { SubHeader } from "@/components";
import { Trash2 } from "lucide-react";

interface VoucherSectionProps {
  readonly voucher: {
    readonly name: string;
    readonly savings: number;
  };
  readonly onCheckVouchers: () => void;
  readonly onRemoveVoucher?: () => void;
}

export function VoucherSection({
  voucher,
  onCheckVouchers,
  onRemoveVoucher,
}: VoucherSectionProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 mb-4">
        <SubHeader title="Voucher Diskon" />
        {onRemoveVoucher && (
          <button
            onClick={onRemoveVoucher}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Hapus voucher"
            aria-label="Hapus voucher yang diterapkan"
          >
            <Trash2 className="w-4 h-4 text-red-500" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="relative mx-4 mb-4 h-[120px]">
        <VoucherCard name={voucher.name} savings={voucher.savings} />
        <VoucherActionButton onClick={onCheckVouchers} />
      </div>
    </div>
  );
}
