import { useState } from "react";
import { Heart, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KeyboardEvent } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface VerticalProductCardProps {
    name: string;
    price: number;
    description?: string;
    displayImage: string;
    priority: boolean;
    isAvailable: boolean;
    isGuest: boolean;
    isFavorite: boolean;
    guestRestrictionMessage: string;
    productUuid?: string;
    cartQuantity?: number;
    onCardClick?: () => void;
    onToggleFavorite?: () => void;
    onAddClick: () => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    onImageError: () => void;
}

export default function VerticalProductCard({
    name,
    price,
    description,
    displayImage,
    priority,
    isAvailable,
    isGuest,
    isFavorite,
    guestRestrictionMessage,
    // productUuid,
    cartQuantity = 0,
    onCardClick,
    onToggleFavorite,
    onAddClick,
    onIncrement,
    onDecrement,
    onImageError,
}: Readonly<VerticalProductCardProps>) {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
            onClick={() => isAvailable && onCardClick?.()}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            className="w-full text-left cursor-pointer"
        >
            <div className="flex flex-row-reverse gap-4 justify-between items-center p-3 rounded-[20px] border border-body-grey/10 bg-white disabled:opacity-60" style={{ opacity: isAvailable === false ? 0.6 : 1 }}>
                <div className="flex flex-col justify-center gap-0">
                    <div className={`relative justify-center item-center flex size-20 rounded-2xl overflow-hidden ${isAvailable ? "" : "opacity-60"}`}>
                        {!isImageLoaded && (
                            <Skeleton className="absolute inset-0 z-0 h-full w-full rounded-2xl pointer-events-none" />
                        )}
                        <img
                            decoding="async"
                            width={112}
                            height={112}
                            src={displayImage}
                            alt={name}
                            loading={priority ? "eager" : "lazy"}
                            className={`w-full h-full object-cover transition-opacity duration-200 ${isAvailable ? "" : "grayscale"} ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                onToggleFavorite?.();
                            }}
                            className="absolute top-2 right-2 rounded-full"
                            aria-label="Favorite"
                        >
                            <Heart
                                className={cn(
                                    "w-5 h-5",
                                    isFavorite
                                        ? "fill-dark-red text-dark-red"
                                        : "fill-primary-orange/20 text-primary-orange"
                                )}
                            />
                        </button>
                    </div>
                    {cartQuantity > 0 ? (
                        <div className="flex items-center gap-1 w-fit mx-auto -mt-3 z-10 py-1 px-2 rounded-3xl border border-primary-orange bg-white">
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onDecrement?.();
                                }}
                                className="p-0.5 rounded-full hover:bg-primary-orange/10 transition-colors"
                            >
                                <Minus className="w-3.5 h-3.5 text-primary-orange" />
                            </button>
                            <span className="text-xs font-medium text-primary-orange min-w-[16px] text-center">
                                {cartQuantity}
                            </span>
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onIncrement?.();
                                }}
                                className="p-0.5 rounded-full hover:bg-primary-orange/10 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5 text-primary-orange" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(event) => {
                                event.stopPropagation();
                                onAddClick();
                            }}
                            disabled={isAvailable === false || isGuest}
                            className={`w-fit mx-auto -mt-3 z-10 py-1 px-3 rounded-3xl border text-xs transition-colors capitalize ${isAvailable && !isGuest
                                ? "border-primary-orange bg-white text-primary-orange"
                                : "border-gray-300 bg-gray-100 font-medium cursor-not-allowed text-dark-red"
                                }`}
                            title={isGuest ? guestRestrictionMessage : undefined}
                        >
                            {!isAvailable ? "Habis" : isGuest ? "Login" : "Tambah"}
                        </button>
                    )}
                </div>
                <div className="flex flex-col gap-3 flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-base font-medium font-rubik text-title-black capitalize">{name}</h3>
                            <p className="text-sm text-gray-500 font-rubik leading-normal capitalize line-clamp-2 overflow-hidden text-ellipsis">
                                {description}
                            </p>
                        </div>
                        <span className="text-base font-medium font-rubik text-title-black">
                            Rp {price.toLocaleString("id-ID")}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}