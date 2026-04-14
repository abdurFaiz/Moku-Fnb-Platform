import { SubHeader } from "@/components/SubHeader";
import { ServiceFeeItem } from "./ServiceFeeItem";

export interface ServiceFeeItemProps {
    id: string;
    name: string;
    price: string;
    details?: Array<{
        label: string;
        price: number;
    }>;
}

interface ServiceFeeSectionProps {
    title: string;
    totalItems: number;
    items: ServiceFeeItemProps[];
}

export const ServiceFeeSection: React.FC<ServiceFeeSectionProps> = ({ title, totalItems, items }) => {
    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Header */}
            <SubHeader title={title} totalItems={totalItems} />

            {/* Items */}
            <div className="flex flex-col">
                {items.map((item) => (
                    <ServiceFeeItem key={item.id} {...item} />
                ))}
            </div>
        </div>
    );
};