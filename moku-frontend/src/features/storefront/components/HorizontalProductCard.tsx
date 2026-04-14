import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import type { KeyboardEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface HorizontalProductCardProps {
    name: string;
    price: number;
    description?: string;
    displayImage: string;
    priority: boolean;
    isAvailable: boolean;
    isGuest: boolean;
    guestRestrictionMessage: string;
    productUuid?: string;
    cartQuantity?: number;
    onCardClick?: () => void;
    onAddClick: () => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    onImageError: () => void;
    width?: string;
}

export default function HorizontalProductCard({
    name,
    price,
    description,
    displayImage,
    priority,
    isAvailable,
    isGuest,
    guestRestrictionMessage,
    // productUuid,
    cartQuantity = 0,
    onCardClick,
    onAddClick,
    onIncrement,
    onDecrement,
    onImageError,
    width = "w-full",
}: Readonly<HorizontalProductCardProps>) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!isAvailable) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onCardClick?.();
        }
    };

    const handleImageLoad = () => setIsImageLoaded(true);
    const handleImageError = () => {
        onImageError();
        setIsImageLoaded(true);
    };

    return (
        <div
            role="button"
            tabIndex={isAvailable ? 0 : -1}
            onClick={() => isAvailable && onCardClick?.()}
            onKeyDown={handleKeyDown}
            className={`flex gap-3 p-2 rounded-3xl border border-gray-200/50 bg-white shadow-2xs ${width} cursor-pointer disabled:opacity-60`}
        >
            <div className={`relative size-20 shrink-0 rounded-xl overflow-hidden ${isAvailable ? "" : "opacity-60"}`}>
                {!isImageLoaded && (
                    <Skeleton className="absolute inset-0 z-0 h-full w-full rounded-2xl pointer-events-none" />
                )}
                <img
                    decoding="async"
                    width={112}
                    height={112}
                    src={displayImage}
                    alt={name}
                    fetchPriority={priority ? "high" : "auto"}
                    loading={priority ? "eager" : "lazy"}
                    className={`w-full h-full object-cover transition-opacity duration-200 ${isAvailable ? "" : "grayscale"} ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            </div>
            <div className="flex flex-col flex-1 gap-1 min-w-0">
                <div className="flex flex-col gap-1 min-w-0">
                    <h2 className="text-sm font-medium text-title-black font-rubik line-clamp-1 text-ellipsis capitalize">{name}</h2>
                    {description && (
                        <p className="text-sm text-gray-500 font-rubik leading-normal capitalize text-ellipsis line-clamp-1 overflow-hidden">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-title-black">
                        Rp {price.toLocaleString("id-ID")}
                    </span>
                    {cartQuantity > 0 ? (
                        <div className="flex items-center gap-2 mr-0.5 mb-0.5">
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDecrement?.();
                                }}
                                className="cursor-pointer p-1 rounded-full bg-primary-orange hover:bg-primary-orange/90 transition-colors"
                            >
                                <Minus className="w-5 h-5 text-white" />
                            </button>
                            <span className="text-base font-medium text-title-black min-w-[20px] text-center">
                                {cartQuantity}
                            </span>
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onIncrement?.();
                                }}
                                className="cursor-pointer p-1 rounded-full bg-primary-orange hover:bg-primary-orange/90 transition-colors"
                            >
                                <Plus className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                onAddClick();
                            }}
                            disabled={isAvailable === false || isGuest}
                            className={`cursor-pointer p-1 mr-0.5 mb-0.5 rounded-full transition-colors ${isAvailable && !isGuest
                                ? "bg-primary-orange hover:bg-primary-orange/90"
                                : "bg-gray-300 opacity-60 cursor-not-allowed"
                                }`}
                            title={isGuest ? guestRestrictionMessage : undefined}
                        >
                            <Plus
                                className={`w-6 h-6 ${isAvailable && !isGuest ? "text-white" : "text-gray-500"
                                    }`}
                            />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}