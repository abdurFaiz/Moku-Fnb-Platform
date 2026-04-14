import { Info } from "lucide-react";
import { useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";

interface PointsSummaryProps {
    points: number;
    message?: string;
}

export const PointsSummary = ({ points, message = "Total poin yang berhasil kamu kumpulkan. Hebat!" }: PointsSummaryProps) => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <div className="relative flex flex-col overflow-hidden mx-4 gap-4 p-4 bg-linear-to-r from-white to-primary-orange/90 border-2 border-primary-orange/90 rounded-3xl mt-6">
                <img loading="lazy" src="/icons/icon-spinofy-white.svg" alt="Spibofy Icon" className="absolute -right-1.5 -top-1 w-36 opacity-30" />
                <div className="flex flex-row gap-2">
                    <div className="flex flex-row gap-1 items-center p-1 rounded-full bg-primary-orange w-fit">
                        <img loading="lazy" src="/icons/icon-poin.svg" alt="icon poin" className="size-8 ml-1" />
                        <div className="px-2 p-1 rounded-full bg-white">
                            <span className="text-xl font-medium font-rubik text-primary-orange">{points} Poin</span>
                        </div>
                    </div>
                    <DrawerTrigger asChild>
                        <Info className="size-5 text-primary-orange cursor-pointer" />
                    </DrawerTrigger>
                </div>
                <p className="font-medium text-base font-rubik leading-relaxed z-30">{message}</p>
            </div>

            <DrawerContent className="mx-auto max-w-[440px]">
                <DrawerHeader>
                    <DrawerTitle className="text-base">Aturan Reward Poin</DrawerTitle>
                    <DrawerDescription className="text-base">
                        Pelajari cara mendapatkan dan menggunakan poin reward Anda
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 pb-6 space-y-4">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Cara Mendapatkan Poin</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li>Selesaikan pembelian di outlet kami</li>
                            <li>Setiap Rp10.000 transaksi = 1 poin.  Semakin sering kamu pesan lewat Spinofy, semakin banyak poin yang kamu kumpulkan</li>

                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Cara Menggunakan Poin</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li>Tukar poin dengan voucher diskon</li>
                            <li>Tukar poin dengan produk gratis</li>
                            <li>Poin dapat digunakan di outlet pembelian product</li>
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold text-base">Syarat & Ketentuan</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                            <li>Poin tidak dapat dijual atau ditukar dengan uang</li>
                        </ul>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};