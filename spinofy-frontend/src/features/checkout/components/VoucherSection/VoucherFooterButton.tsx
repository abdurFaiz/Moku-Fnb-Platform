import { ChevronRight } from "lucide-react";

interface VoucherFooterButtonProps {
    onClick: () => void;
}

export const VoucherFooterButton = ({ onClick }: VoucherFooterButtonProps) => (
    <button
        onClick={onClick}
        className="absolute z-10 left-0 bottom-0 w-full h-[60px] px-4 py-4 rounded-b-2xl bg-primary-orange/20 flex justify-between items-end"
    >
        <span className="text-xs font-medium font-rubik text-primary-orange">
            Ayo!, Check Voucher Menarik Lainnya
        </span>
        <ChevronRight className="w-6 h-6" strokeWidth={2} />
    </button>
);
