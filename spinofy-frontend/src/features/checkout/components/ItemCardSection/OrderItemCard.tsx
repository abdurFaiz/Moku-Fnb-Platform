import { ItemDetails } from "./ItemDetails";
import { EditButton } from "./EditButton";
import { ItemImage } from "./ItemImage";
import { ItemPrice } from "./ItemPrice";
import { QuantityControl } from "./QuantityControl";

export interface OrderItemProps {
  name: string;
  notes?: string | null;
  price: number;
  image: string;
  quantity: number;
  options?: string[];
  onQuantityChange: (delta: number) => void;
  onEdit: () => void;
  isLastItem?: boolean;
}

export function OrderItemCard({
  name,
  notes,
  price,
  image,
  quantity,
  options,
  onQuantityChange,
  onEdit,
  isLastItem = false,
}: OrderItemProps) {
  return (
    <div
      className={`flex flex-col ${!isLastItem ? "border-b border-dashed border-body-grey/25 pb-3" : "pb-3"}`}
    >
      {/* Top Section */}
      <div className="flex justify-between items-center pb-3">
        <div className="flex flex-col gap-2 w-40">
          <ItemDetails
            name={name}
            notes={notes}
            options={options}
          />
          <ItemPrice price={price} />
        </div>
        <ItemImage src={image} alt={name} />
      </div>

      {/* Bottom Section */}
      <div className="flex justify-between items-center">
        <EditButton onClick={onEdit} />
        <QuantityControl
          quantity={quantity}
          onDecrease={() => onQuantityChange(-1)}
          onIncrease={() => onQuantityChange(1)}
        />
      </div>
    </div>
  );
}
