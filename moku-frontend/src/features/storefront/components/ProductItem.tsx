import "@/index.css";
import { useState } from "react";
import emptyProductImage from "@/../public/images/empty-product.svg";
import { isGuestUser, GUEST_CART_RESTRICTION_MESSAGE } from "@/utils/guestRouteGuard";
import { toast } from "sonner";
import HorizontalProductCard from "@/features/storefront/components/HorizontalProductCard";
import VerticalProductCard from "@/features/storefront/components/VerticalProductCard";

interface ProductCardProps {
    name: string;
    price: number;
    image: string;
    productUuid?: string;
    cartQuantity?: number;
    onCardClick?: () => void;
    onTambahClick?: () => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    onToggleFavorite?: () => void;
    isFavorite?: boolean;
    variant?: "horizontal" | "vertical";
    description?: string;
    isAvailable?: boolean;
    priority?: boolean;
    cardWidth?: string;
}

export function ProductCard({
    name,
    price,
    image,
    productUuid,
    cartQuantity = 0,
    onCardClick,
    onTambahClick,
    onIncrement,
    onDecrement,
    onToggleFavorite,
    isFavorite = false,
    variant = "horizontal",
    description,
    isAvailable = true,
    priority = false,
    cardWidth,
}: Readonly<ProductCardProps>) {
    const [imageError, setImageError] = useState(false);
    const isGuest = isGuestUser();
    const displayImage = !image || imageError ? emptyProductImage : image;

    const handleAddClick = () => {
        if (isGuest) {
            toast.error(GUEST_CART_RESTRICTION_MESSAGE);
            return;
        }
        onTambahClick?.();
    };

    if (variant === "horizontal") {
        return (
            <HorizontalProductCard
                name={name}
                price={price}
                description={description}
                displayImage={displayImage}
                priority={priority}
                isAvailable={isAvailable}
                isGuest={isGuest}
                guestRestrictionMessage={GUEST_CART_RESTRICTION_MESSAGE}
                productUuid={productUuid}
                cartQuantity={cartQuantity}
                onCardClick={onCardClick}
                onAddClick={handleAddClick}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onImageError={() => setImageError(true)}
                width={cardWidth}
            />
        );
    }

    return (
        <VerticalProductCard
            name={name}
            price={price}
            description={description}
            displayImage={displayImage}
            priority={priority}
            isAvailable={isAvailable}
            isGuest={isGuest}
            isFavorite={isFavorite ?? false}
            guestRestrictionMessage={GUEST_CART_RESTRICTION_MESSAGE}
            productUuid={productUuid}
            cartQuantity={cartQuantity}
            onCardClick={onCardClick}
            onToggleFavorite={onToggleFavorite}
            onAddClick={handleAddClick}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            onImageError={() => setImageError(true)}
        />
    );
}
