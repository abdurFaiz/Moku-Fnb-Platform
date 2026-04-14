import '@/index.css'
import { useState } from "react";
import emptyProductImage from '@/../public/images/empty-product.svg';
import ClickSpark from "../../../components/ClickSpark";

interface ProductRewardCardProps {
    name: string;
    description?: string;
    image?: string;
    points: number;
    onClaimClick?: () => void;
    isDisabled?: boolean;
    status: "active" | "expired";
    pointBalance: number;
}

export function ProductRewardCard({
    name,
    description,
    image,
    points,
    onClaimClick,
    isDisabled = false,
    status,
    pointBalance,
}: Readonly<ProductRewardCardProps>) {
    const [imageError, setImageError] = useState(false);
    const displayImage = !image || imageError ? emptyProductImage : image;

    const isButtonDisabled = status === "expired" || isDisabled;

    const remainingPoints = points - pointBalance;

    return (
        <div className="flex flex-col rounded-[20px] border p-1 border-body-grey/10 bg-white">
            <div className="relative mb-3">
                <div className={`relative justify-center item-center flex w-full aspect-square rounded-2xl overflow-hidden ${!isButtonDisabled ? '' : 'opacity-60'}`}>
                    <img
                        loading='lazy'
                        src={displayImage}
                        alt={name}
                        className={`w-full h-full object-cover ${!isButtonDisabled ? '' : 'grayscale'}`}
                        onError={() => setImageError(true)}
                    />
                    {remainingPoints > 0 && (
                        <div className="absolute top-0 right-0 bg-primary-orange flex rounded-bl-2xl py-1 px-2 items-center justify-center">
                            <span className='text-xs text-white font-rubik leading-relaxed'>Kurang {remainingPoints} poin lagi</span>
                        </div>
                    )}

                </div>
            </div>
            <div className="flex flex-col justify-between flex-1 gap-2">
                <div className="space-y-1 px-2">
                    <span className="text-sm font-medium font-rubik text-title-black capitalize line-clamp-1">{name}</span>
                    {description && (
                        <p className="text-xs text-gray-500 font-rubik leading-relaxed capitalize line-clamp-2">
                            {description}
                        </p>
                    )}
                    <div className=" text-primary-orange px-2 py-1 rounded-full  font-medium flex items-center gap-1">
                        <img loading='lazy' src="/icons/icon-poin.svg" alt="poin" className="size-4" />
                        <span className='text-sm'>{points} poin</span>
                    </div>
                </div>
                <ClickSpark
                    sparkColor="#E7E909"
                    sparkSize={10}
                    sparkRadius={15}
                    sparkCount={8}
                    duration={400}
                    extraScale={2}
                >
                    <button
                        onClick={onClaimClick}
                        disabled={isButtonDisabled}
                        className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-colors capitalize ${!isButtonDisabled ? 'border border-primary-orange bg-white text-primary-orange hover:bg-primary-orange hover:text-white' : 'border border-gray-300 bg-gray-100 font-medium cursor-not-allowed text-gray-500'}`}
                    >
                        {!isButtonDisabled ? 'Tukarkan' : status === 'expired' ? 'Kadaluarsa' : 'Tidak Cukup Poin'}
                    </button>
                </ClickSpark>
            </div>
        </div>
    );
}