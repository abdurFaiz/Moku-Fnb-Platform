import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
    quantity: number;
    onDecrease: () => void;
    onIncrease: () => void;
}

export function QuantityControl({ quantity, onDecrease, onIncrease }: QuantityControlProps) {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onDecrease}
                className="p-1 rounded-full border border-primary-orange bg-white"
            >
                <Minus className="w-6 h-6 text-primary-orange" strokeWidth={2} />
            </button>
            <span className="text-base font-rubik font-medium text-title-black">
                {quantity}
            </span>
            <button
                onClick={onIncrease}
                className="p-1 rounded-full bg-primary-orange"
            >
                <Plus className="w-6 h-6 text-white" strokeWidth={2} />
            </button>
        </div>
    );
}