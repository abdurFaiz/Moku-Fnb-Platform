import { Minus, Plus } from "lucide-react";
import { isGuestUser, GUEST_CART_RESTRICTION_MESSAGE } from "@/utils/guestRouteGuard";
import { toast } from "sonner";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
}: Readonly<QuantitySelectorProps>) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onDecrease}
        className="w-8 h-8 border rounded-full flex justify-center items-center"
      >
        <Minus className="w-5 h-5" />
      </button>
      <span className="text-base font-medium">{quantity}</span>
      <button
        onClick={onIncrease}
        className="w-8 h-8 bg-primary-orange rounded-full text-white flex justify-center items-center"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

export function AddToCartButton({
  totalPrice,
  onAddToCart,
  buttonText = "Tambah",
  isLoading = false,
  disabled = false,
}: Readonly<{
  totalPrice: number;
  onAddToCart: () => void;
  buttonText?: string;
  isLoading?: boolean;
  disabled?: boolean;
}>) {
  const isGuest = isGuestUser();

  const handleClick = () => {
    if (isGuest) {
      toast.error(GUEST_CART_RESTRICTION_MESSAGE);
      return;
    }
    onAddToCart();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isGuest || disabled}
      className={`flex-1 cursor-pointer bg-primary-orange text-white font-medium py-3 px-6 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${isGuest || disabled ? 'opacity-60' : ''
        }`}
      title={isGuest ? GUEST_CART_RESTRICTION_MESSAGE : disabled ? 'Outlet sedang tutup' : undefined}
    >
      {isLoading ? "Memproses..." : `${buttonText} • Rp ${totalPrice.toLocaleString("id-ID")}`}
    </button>
  );
}
