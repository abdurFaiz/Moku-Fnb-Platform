import { useState } from "react";
import emptyProductImage from '@/../public/images/empty-product.svg';

interface ItemImageProps {
    src: string;
    alt: string;
    className?: string; // Allow custom sizing
}

export function ItemImage({
    src,
    alt,
    className = "size-20"
}: ItemImageProps) {
    const [imageError, setImageError] = useState(false);
    const displayImage = !src || imageError ? emptyProductImage : src;

    return (
        <div className="rounded-2xl overflow-hidden">
            <img
                loading="lazy"
                src={displayImage}
                alt={alt}
                className={`${className} object-cover`}
                onError={() => setImageError(true)}
            />
        </div>
    );
}