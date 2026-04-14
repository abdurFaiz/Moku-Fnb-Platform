import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ServiceFeeItemProps {
    id: string;
    name: string;
    price: string;
    details?: Array<{
        label: string;
        price: number;
    }>;
}

const normalizeText = (value?: string): string =>
    (value ?? "")
        .normalize('NFKC')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

const parsePriceValue = (value: string): number => {
    const numeric = value.replace(/[^\d-]/g, '');
    return Number(numeric) || 0;
};

export const ServiceFeeItem: React.FC<ServiceFeeItemProps> = ({
    name,
    price,
    details = []
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const normalizedName = normalizeText(name);
    const mainPriceValue = parsePriceValue(price);
    const visibleDetails = details.filter((detail) => {
        const normalizedLabel = normalizeText(detail.label);
        const isDuplicateDetail =
            details.length === 1 &&
            normalizedLabel === normalizedName &&
            detail.price === mainPriceValue;
        return !isDuplicateDetail;
    });
    const hasDetails = visibleDetails.length > 0;

    return (
        <div className="flex flex-col">
            {/* Main Item */}
            <button
                className="flex justify-between items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                onClick={() => hasDetails && setIsExpanded(!isExpanded)}
                disabled={!hasDetails}
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-rubik  text-body-grey">
                        {name}
                    </span>

                </div>
                <span className="text-sm font-rubik  flex items-center gap-2 text-body-grey">
                    {price}
                    {hasDetails && (
                        <div className="ml-2">
                            {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-body-grey" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-body-grey" />
                            )}
                        </div>
                    )}
                </span>
            </button>

            {/* Expandable Details */}
            {hasDetails && isExpanded && (
                <div className="mx-4 mb-3 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-rubik font-medium text-body-grey mb-3">
                        Rincian Biaya:
                    </div>
                    <div className="space-y-2">
                        {visibleDetails.map((detail) => (
                            <div
                                key={`${detail.label}-${detail.price}`}
                                className="flex justify-between items-center"
                            >
                                <span className="text-sm font-rubik text-body-grey">
                                    {detail.label}
                                </span>
                                <span className="text-sm font-rubik text-body-grey">
                                    {detail.price > 0 ? `+Rp ${detail.price.toLocaleString('id-ID')}` : 'Gratis'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};