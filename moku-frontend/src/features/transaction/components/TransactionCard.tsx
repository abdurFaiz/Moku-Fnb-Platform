import type { TransactionStatus } from "@/features/transaction/types/Transaction";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useState, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";
import emptyProductImage from '@/../public/images/empty-product.svg';

interface OrderCardProps {
    status: TransactionStatus;
    created_at: string;
    cafeName: string;
    items: string;
    totalItems: number;
    totalPrice: string;
    imageUrl: string;
    pointsMessage?: string;
    orderCode: string;  // Order code for duplicate order API
    onAction?: () => void;
    onReorder?: (orderCode: string) => void;  // Callback for "Pesan Lagi" button
}
const statusConfig = {
    pending: {
        label: "Menunggu Pembayaran",
        bgColor: "bg-blue-500/20",
        textColor: "text-blue-500",
    },
    "menunggu-konfirmasi": {
        label: "Menunggu Pembayaran",
        bgColor: "bg-orange-500/20",
        textColor: "text-orange-500",
    },
    "dalam-proses": {
        label: "Dalam Proses",
        bgColor: "bg-yellow-600/16",
        textColor: "text-yellow-600",
    },
    selesai: {
        label: "Selesai",
        bgColor: "bg-green-500/15",
        textColor: "text-green-500",
    },
    gagal: {
        label: "Gagal",
        bgColor: "bg-red-500/20",
        textColor: "text-red-500",
    },
    expired: {
        label: "Kadaluarsa",
        bgColor: "bg-gray-500/20",
        textColor: "text-gray-500",
    },
    challenge: {
        label: "Challenge",
        bgColor: "bg-purple-500/20",
        textColor: "text-purple-500",
    },
    dibatalkan: {
        label: "Dibatalkan",
        bgColor: "bg-red-500/20",
        textColor: "text-red-500",
    },
    ditolak: {
        label: "Ditolak",
        bgColor: "bg-red-500/20",
        textColor: "text-red-500",
    },
} as const;

export default function OrderCard({
    status,
    created_at,
    cafeName,
    items,
    totalItems,
    totalPrice,
    imageUrl,
    pointsMessage,
    orderCode,
    onAction,
    onReorder,
}: Readonly<OrderCardProps>) {
    const [imageError, setImageError] = useState(false);
    const displayImage = !imageUrl || imageError ? emptyProductImage : imageUrl;
    const config = statusConfig[status];
    const navigate = useNavigate();
    const outletSlug = useOutletSlug();

    const buttonLabel = (() => {
        switch (status) {
            case "menunggu-konfirmasi":
                return "Bayar Sekarang";
            case "pending":
                return "Pesan Sekarang";
            case "dalam-proses":
                return "Lihat Menu Lain";
            default:
                return "Lihat Menu Lain";
        }
    })();

    const buttonDisabled =
        status !== "menunggu-konfirmasi" &&
        status !== "pending" &&
        status !== "dalam-proses" &&
        status !== "expired" &&
        status !== "gagal" &&
        status !== "selesai"
    !onReorder;

    const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();

        if (status === "menunggu-konfirmasi") {
            if (outletSlug) {
                navigate(`/${outletSlug}/payment`, { state: { orderCode } });
            } else {
                navigate("/onboard");
            }
            return;
        }

        if (status === "pending") {
            if (outletSlug) {
                navigate(`/${outletSlug}/checkout`);
            } else {
                navigate("/onboard");
            }
            return;
        }

        if (status === "dalam-proses" || status === "selesai" || status === "gagal" || status === "expired") {
            if (outletSlug) {
                navigate(`/${outletSlug}/home`);
            } else {
                navigate("/onboard");
            }
            return;
        }

        // if (onReorder) {
        //     onReorder(orderCode);
        // }
    };

    // Format date using date-fns with error handling
    const formattedDate = (() => {
        try {
            if (!created_at) {
                console.warn("⚠️ DEBUG: created_at is empty or null:", { created_at, cafeName });
                return "Invalid date";
            }

            // Parse ISO 8601 format: 2025-11-02T08:34:08.000000Z
            const date = parseISO(created_at);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.warn("⚠️ DEBUG: Parsed date is invalid:", { created_at, parsedDate: date, cafe: cafeName });
                return "Invalid date";
            }
            const formatted = format(date, "EEEE, d MMM yyyy, HH:mm", { locale: id });

            return formatted;
        } catch (error) {
            console.error("❌ DEBUG: Error formatting date:", { error, created_at, cafeName, errorMessage: (error as Error).message });
            return "Invalid date";
        }
    })();

    return (
        <div className="relative">
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
                onClick={onAction}
                className="relative z-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 rounded-[20px]"
            >
                <div className="flex flex-col  gap-4 p-4 rounded-[20px] border border-[rgba(128,128,128,0.16)] bg-white hover:shadow-[0_4px_8px_0_rgba(128,128,128,0.16)] hover:transition-shadow ease-in-out duration-200 ">
                    <div
                        className={`absolute top-0 right-0 flex items-center gap-2 px-3 py-1.5 rounded-tl-none rounded-tr-[20px] rounded-bl-2xl rounded-br-none ${config.bgColor}`}
                    >
                        <span className={`text-xs font-rubik font-medium ${config.textColor}`}>
                            {config.label}
                        </span>
                    </div>

                    <div className="flex flex-col gap-3 pb-4 border-b border-dashed border-[rgba(128,128,128,0.36)]">
                        <div className="text-xs font-rubik text-body-grey">{formattedDate}</div>
                        <div className="flex gap-3">
                            <div className="shrink-0 relative">
                                <img
                                    loading="eager"
                                    width={112}
                                    height={112}
                                    decoding="async"
                                    fetchPriority="high"
                                    src={displayImage}
                                    alt={cafeName}
                                    className="w-20 h-20 object-cover rounded-2xl"
                                    onError={() => setImageError(true)}
                                />
                            </div>
                            <div className="flex-1 flex flex-col gap-2 min-w-0">
                                <h3 className="text-base font-rubik font-medium text-title-black">{cafeName}</h3>
                                <p className="text-sm font-rubik text-body line-clamp-1 overflow-hidden text-ellipsis">{items}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm font-rubik font-medium text-title-black">
                            {totalItems} Item • {totalPrice}
                        </div>
                        <button
                            onClick={handleButtonClick}
                            type="button"
                            disabled={buttonDisabled}
                            className="cursor-pointer px-4 font-rubik py-2 bg-primary-orange text-white text-xs font-medium rounded-[20px] hover:bg-primary-orange/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {buttonLabel}
                        </button>
                    </div>
                </div>

            </div>
            {pointsMessage && (
                <div className="absolute -bottom-11 left-0 right-0 flex items-end p-4 h-[59px] bg-[rgba(243,95,15,0.20)] rounded-b-[20px] z-0">
                    <p className="text-xs font-rubik font-medium text-primary-orange">{pointsMessage}</p>
                </div>
            )}
        </div>
    );
}
