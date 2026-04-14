import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import emptyProductImage from '@/../public/images/empty-product.svg';

interface HeroImageProps {
    imgSrc: string;
    onBack: () => void;
}

export function HeroImage({ imgSrc, onBack }: HeroImageProps) {
    const [imageError, setImageError] = useState(false);
    const displayImage = !imgSrc || imageError ? emptyProductImage : imgSrc;
    return (
        <div className="relative h-[260px] rounded-b-2xl overflow-hidden">
            <img
            loading="lazy"
                src={displayImage}
                alt="Product"
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
            />
            <button
                onClick={onBack}
                className="absolute top-6 left-4 w-10 h-10 bg-white rounded-full flex justify-center items-center shadow-sm"
            >
                <ArrowLeft className="w-6 h-6 text-title-black" />
            </button>
        </div>
    );
}
