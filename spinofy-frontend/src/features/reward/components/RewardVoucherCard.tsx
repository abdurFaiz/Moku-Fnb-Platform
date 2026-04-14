import { ArrowRight } from "lucide-react";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation"

export default function RewardVoucherCard() {
    const { navigateToVouchers } = useOutletNavigation();
    return (
        <div className="flex justify-between mx-4 items-center pl-1 py-1 pr-4 rounded-2xl bg-linear-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 ">
            <div className="flex gap-3 items-center">
                <div className="flex items-center justify-center rounded-2xl p-3 bg-primary-orange/20">
                    <img loading="lazy" src="../icons/icon-voucher.svg" alt="icon voucher" className="size-8 text-white" />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-base font-medium text-title-black font-rubik">Lihat Voucher Saya</span>
                    <p className="text-sm text-body-grey">Semua voucher hasil penukaran poin</p>
                </div>
            </div>
            <button onClick={navigateToVouchers}>
                <ArrowRight className="w-5 h-5  text-primary-orange" />
            </button>
        </div>
    )
}