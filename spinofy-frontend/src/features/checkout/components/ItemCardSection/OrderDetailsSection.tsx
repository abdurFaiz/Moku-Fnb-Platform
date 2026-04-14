import { SubHeader } from "@/components/SubHeader";
import { SwipeableItemCard } from "./SwipeableItemCard";
import type { OrderItemProps } from "./OrderItemCard";
import { AddMoreCard } from "../AddMoreCard";

type Quantities = { [key: string]: number };

interface OrderDetailsSectionProps {
  items: (Omit<OrderItemProps, "quantity" | "onQuantityChange" | "onEdit"> & {
    id: string;
    orderProductId?: number;
    productId?: number;
    productUuid?: string;
    variantIds?: number[];
    options?: string[];
  })[];
  quantities: Quantities;
  onUpdateQuantity: (itemId: string, delta: number) => Promise<void>;
  onAddItem: () => void;
  onEditItem?: (cartItemId: string, productUuid: string, variantIds: number[], quantity: number, note: string) => void;
  onDeleteItem?: (itemId: string) => Promise<void>;
}

export function OrderDetailsSection({
  items,
  quantities,
  onUpdateQuantity,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: Readonly<OrderDetailsSectionProps>) {
  return (
    <div className="flex flex-col gap-2">
      <SubHeader title="Detail Pesanan" totalItems={items.length} />
      <div className="flex flex-col gap-3">
        <div className="mx-4 rounded-3xl bg-white flex flex-col gap-3">
          {items.map((item, index) => (
            <SwipeableItemCard
              key={item.id}
              itemId={item.id}
              name={item.name}
              notes={item.notes}
              price={item.price}
              image={item.image}
              quantity={quantities[item.id] || 1}
              options={item.options}
              onQuantityChange={(delta: number) => onUpdateQuantity(item.id, delta)}
              onEdit={() => {
                if (onEditItem && item.productUuid) {
                  // Use item.id as cartItemId for cart items
                  onEditItem(
                    item.id,
                    item.productUuid,
                    item.variantIds || [],
                    quantities[item.id] || 1,
                    item.notes || ""
                  );
                }
              }}
              onDelete={async () => {
                if (onDeleteItem) {
                  await onDeleteItem(item.id);
                }
              }}
              isLastItem={index === items.length - 1}

            />
          ))}
          <AddMoreCard onAddMore={onAddItem} />
        </div>
      </div>
    </div>
  );
}
