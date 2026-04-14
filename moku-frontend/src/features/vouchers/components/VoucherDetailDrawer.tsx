import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import type { VoucherCardProps } from "../../../components/VoucherCard";

interface VoucherDetailDrawerProps {
    voucher: VoucherCardProps | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onClaim?: () => void;
}

export function VoucherDetailDrawer({
    voucher,
    isOpen,
    onOpenChange,
    onClaim,
}: VoucherDetailDrawerProps) {
    if (!voucher) return null;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Aktif
                    </span>
                );
            case "expired":
                return (
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        Expired
                    </span>
                );
            case "cancelled":
                return (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        Dibatalkan
                    </span>
                );
            case "disabled":
                return (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        Tidak Tersedia
                    </span>
                );
            case "claimed":
                return (
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        Sudah Diklaim
                    </span>
                );
            default:
                return null;
        }
    };

    const getButtonStyles = () => {
        if (voucher.status === "disabled" || voucher.status === "expired" || voucher.status === "claimed") {
            return "bg-gray-300 text-gray-600 cursor-not-allowed";
        }
        switch (voucher.status) {
            case "active":
                return "bg-orange-500 text-white hover:bg-orange-600";
            case "cancelled":
                return "bg-white text-red-600 border border-red-600 hover:bg-red-50";
            default:
                return "bg-orange-500 text-white hover:bg-orange-600";
        }
    };

    const getButtonText = () => {
        if (voucher.status === "cancelled") {
            return "Batal";
        }
        if (voucher.status === "expired") {
            return "Expired";
        }
        if (voucher.status === "claimed") {
            return "Sudah Diklaim";
        }
        return "Gunakan";
    };

    const isButtonDisabled = () => {
        return voucher.status === "disabled" || voucher.status === "expired" || voucher.status === "claimed";
    };

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-[440px] mx-auto">
                <DrawerHeader className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <DrawerTitle className="text-xl font-bold text-title-black">
                                {voucher.title}
                            </DrawerTitle>
                            <DrawerDescription className="text-sm text-gray-600 mt-2">
                                {voucher.subtitle}
                            </DrawerDescription>
                        </div>
                        <div className="ml-2">
                            {getStatusBadge(voucher.status)}
                        </div>
                    </div>
                </DrawerHeader>

                {/* Divider */}
                <div className="h-px bg-gray-200 mx-4"></div>

                {/* Details Section */}
                <div className="px-4 py-6 space-y-6">
                    {/* Discount Section */}
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                        <p className="text-xs text-gray-600 mb-2">Nilai Diskon</p>
                        <div className="flex items-baseline gap-2">
                            {(voucher.discoundPercent || 0) > 0 ? (
                                <p className="text-2xl font-bold text-orange-600">
                                    {voucher.discoundPercent}%
                                </p>
                            ) : (
                                <p className="text-2xl font-bold text-orange-600">
                                    Rp{(voucher.discoundFixedPrice || 0).toLocaleString("id-ID")}
                                </p>
                            )}
                            <span className="text-sm text-gray-600">Diskon</span>
                        </div>
                    </div>

                    {/* Minimum Transaction */}
                    {voucher.minTransaction && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-title-black">
                                Minimum Transaksi
                            </p>
                            <p className="text-base text-gray-700">{voucher.minTransaction}</p>
                        </div>
                    )}

                    {/* Expiry Date */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-title-black">Berlaku Hingga</p>
                        <p className="text-base text-gray-700">{voucher.expiryDate}</p>
                    </div>

                    {/* Max Usage */}
                    {voucher.maxUsage && (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-title-black">
                                Batasan Penggunaan
                            </p>
                            <p className="text-base text-gray-700">Bisa dipakai hingga {voucher.maxUsage}x</p>
                        </div>
                    )}

                    {/* Terms & Conditions */}
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-title-black">
                            Syarat & Ketentuan
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                • Voucher hanya berlaku untuk transaksi di outlet yang ditunjuk<br />
                                • Voucher tidak dapat dijual atau dipindahkan ke akun lain<br />
                                • Voucher tidak dapat dikembalikan dalam bentuk uang tunai<br />
                                • Penggunaan voucher tidak dapat diakumulasikan dengan penawaran lain<br />
                                • Voucher hanya berlaku sampai tanggal yang tertera<br />
                            </p>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="flex flex-row gap-5 mb-6">
                    <DrawerClose asChild>
                        <Button size={'lg'} variant="outline" className="border-gray-300 w-full">
                            Tutup
                        </Button>
                    </DrawerClose>
                    <Button
                        onClick={onClaim}
                        disabled={isButtonDisabled()}
                        className={`w-full ${getButtonStyles()}`}
                        size={"lg"}
                    >
                        {getButtonText()}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
