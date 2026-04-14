import confetti from "canvas-confetti";
import { SubHeader } from "../../../components/SubHeader";
import VoucherCard from "../../../components/VoucherCard";
import type { VoucherCardProps } from "../../../components/VoucherCard";
import { Virtuoso } from "react-virtuoso";
import { forwardRef } from "react";

interface VoucherListSectionProps {
  title: string;
  vouchers: VoucherCardProps[];
  totalItems: number;
  onVoucherClick?: (voucher: VoucherCardProps) => void;
}

export function VoucherListSection({
  title,
  vouchers,
  totalItems,
  onVoucherClick,
}: VoucherListSectionProps) {
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

  function handleClicVoucher(
    voucher: VoucherCardProps,
    status: "active" | "cancelled" | "disabled" | "expired" | "claimed",
  ) {
    // Always open the bottom sheet to show details
    onVoucherClick?.(voucher);

    // Only show confetti for active vouchers
    if (status === "active") {
      handleClickConfetti();
    }
  }
  return (
    <div className="flex flex-col gap-6 ">
      <SubHeader title={title} totalItems={totalItems} />
      <Virtuoso
        useWindowScroll
        data={vouchers}
        overscan={200}
        computeItemKey={(index, voucher) => `${voucher.voucherId ?? index}-${index}`}
        components={{
          List: forwardRef<HTMLDivElement>((props, ref) => (
            <div {...props} ref={ref} className="flex flex-col px-1 gap-5" />
          )),
        }}
        itemContent={(_, voucher) => (
          <VoucherCard
            onClick={() => handleClicVoucher(voucher, voucher.status)}
            onClaimClick={() => handleClicVoucher(voucher, voucher.status)}
            {...voucher}
          />
        )}
      />
    </div>
  );
}
