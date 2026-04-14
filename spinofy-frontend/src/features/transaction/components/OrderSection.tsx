import { SubHeader } from "@/components/SubHeader";
import { OrderItem } from "./OrderItem";
import type { OrderItemProps } from "./OrderItem";

interface OrderSectionProps {
    title: string;
    totalItems: number;
    items: OrderItemProps[];
}

export const OrderSection: React.FC<OrderSectionProps> = ({ title, totalItems, items }) => {
    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Header */}
            <SubHeader title={title} totalItems={totalItems} />


            {/* Items */}
            <div className="flex flex-col">
                {items.map((item) => (
                    <OrderItem key={item.id} {...item} />
                ))}
            </div>
        </div>
    );
};  