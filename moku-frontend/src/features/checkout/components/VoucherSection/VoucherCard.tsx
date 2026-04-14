import { Check } from "lucide-react";
import { VoucherIcon } from "./VoucherIcon";
import { VoucherInfo } from "./VoucherInfo";

interface VoucherCardProps {
    name: string;
    savings: number;
}

export function VoucherCard({ name, savings }: VoucherCardProps) {
    return (
        <div className="absolute z-20 left-0 top-0 w-full h-[78px] px-4 py-4 bg-white/80 backdrop-blur-sm border border-light-green rounded-2xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3">
                <VoucherIcon />
                <VoucherInfo name={name} savings={savings} />
            </div>

            <div className="p-1 rounded-2xl bg-light-green">
                <Check className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
        </div>
    );
}
