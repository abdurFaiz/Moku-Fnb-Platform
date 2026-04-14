import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { VoucherListSection } from "@/features/vouchers/components/VoucherListSection";
import { Separator } from "@/components/Separator";
import HeaderBar from "@/components/HeaderBar";
import { useNavigate } from "react-router-dom";
import { TextInputWithIcon } from "../../../components/InputVouchers";
import { SkeletonVouchersPage } from "@/components/skeletons/SkeletonComponents";
import { useCart } from "@/features/cart/hooks/useCart";
import { useVoucherCalculation } from "@/features/vouchers/hooks/useVoucherCalculation";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { useCartStore } from "@/features/cart/stores/cartStore";
import { useVoucherStore } from '@/features/vouchers/stores/voucherStore';
// import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { UserVoucher } from "@/features/vouchers/types/UserVoucher";
import type { Voucher } from "@/features/vouchers/hooks/useVoucherState";
import { useQueryPayment, paymentQueryKeys } from "@/features/payment/hooks/api/useQueryPayment";
import { voucherQueryKeys } from "@/features/vouchers/hooks/api/useQueryVocher";
import { useApplyVoucherCodeMutation as useApplyVoucherCodePaymentMutation } from "@/features/payment/hooks/api/useMutationPayment";
import { useApplyVoucherCodeMutation, useStoreInputCheckVoucherMutation, useStoreCheckVoucherMutation } from "@/features/vouchers/hooks/api/useMutationVoucher";
import { VoucherAPI } from "@/features/vouchers/api/voucher.api";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

const VOUCHER_USAGE_STORAGE_KEY = 'voucherUsageCounts';
const MIN_TRANSACTION_THRESHOLD = 1000; // Minimum subtotal required to apply any voucher

const readVoucherUsageFromStorage = (): VoucherUsageMap => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(VOUCHER_USAGE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as VoucherUsageMap;
    }
  } catch (error) {
    console.error('Failed to parse voucher usage from storage:', error);
  }

  return {};
};

interface ItemSelection {
  itemId: string;
  quantity: number;
}

type VoucherUsageMap = Record<string, number>;

const persistVoucherUsage = (usage: VoucherUsageMap): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(VOUCHER_USAGE_STORAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.error('Failed to persist voucher usage:', error);
  }
};

export default function VoucherCheckout() {
  const navigate = useNavigate();
  const { getTotalPrice } = useCart();
  const { outletSlug, navigateToCheckout } = useOutletNavigation();
  const cartItems = useCartStore();

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [itemSelections, setItemSelections] = useState<ItemSelection[]>([]);
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [voucherUsageCounts, setVoucherUsageCounts] = useState<VoucherUsageMap>(readVoucherUsageFromStorage);

  const queryClient = useQueryClient();
  // Only use storeInputCheckVoucherMutation for applying vouchers (both product and non-product)
  const applyVoucherCodePaymentMutation = useApplyVoucherCodePaymentMutation();
  const applyVoucherCodeMutation = useApplyVoucherCodeMutation();
  const storeInputCheckVoucherMutation = useStoreInputCheckVoucherMutation();
  const storeCheckVoucherMutation = useStoreCheckVoucherMutation();
  const isSubmittingCode = applyVoucherCodeMutation.isPending || applyVoucherCodePaymentMutation.isPending || storeInputCheckVoucherMutation.isPending;

  const getVoucherUsageCount = useCallback((voucherId: string | number): number => {
    return voucherUsageCounts[String(voucherId)] ?? 0;
  }, [voucherUsageCounts]);

  const incrementVoucherUsage = useCallback((voucherId: string | number): void => {
    setVoucherUsageCounts((prev: VoucherUsageMap) => {
      const normalizedId = String(voucherId);
      const next = {
        ...prev,
        [normalizedId]: (prev[normalizedId] ?? 0) + 1,
      };
      persistVoucherUsage(next);
      return next;
    });
  }, []);

  // Get order code from localStorage
  const orderCode = localStorage.getItem('currentOrderCode');

  const subtotal = getTotalPrice();

  // Fetch current order data from API to get applied discount
  const { data: paymentData } = useQueryPayment(outletSlug, {
    staleTime: 1000 * 30, // 30 seconds
  });

  // Extract discount from API response
  const apiDiscount = useMemo(() => {
    if (!paymentData?.data?.order || paymentData.data.order.length === 0) {
      return 0;
    }
    const order = paymentData.data.order[0];
    return Number((order as any).discount) || 0;
  }, [paymentData]);

  // Calculate discount only for selected items - ONLY on base price, not extras/toppings
  // Use API discount if available, otherwise calculate from selected items
  const calculateDiscountForSelectedItems = (voucher: Voucher | null) => {
    // If there's a discount from the API, use that (means voucher was already applied on backend)
    if (apiDiscount > 0) {
      return apiDiscount;
    }

    // Otherwise calculate from selected items
    if (!voucher || itemSelections.length === 0) return 0;

    let totalDiscount = 0;
    itemSelections.forEach(selection => {
      const item = cartItems.items.find(i => i.id === selection.itemId);
      if (item) {
        // Use basePrice if available, otherwise fall back to price
        // This ensures voucher only applies to the base product, not extras/toppings
        const priceForDiscount = item.basePrice ?? item.price;

        let discountPerItem = voucher.type === 'percentage'
          ? Math.round((voucher.value / 100) * priceForDiscount)
          : voucher.value;

        // Prevent discount from exceeding the base price so final price never becomes negative
        discountPerItem = Math.min(discountPerItem, priceForDiscount);

        const discount = selection.quantity * discountPerItem;
        const cappedDiscount = voucher.maxDiscount
          ? Math.min(discount, voucher.maxDiscount)
          : discount;

        totalDiscount += cappedDiscount;
      }
    });

    return totalDiscount;
  };

  const { calculation: baseCalculation, appliedVoucher, applyVoucher, removeVoucher } =
    useVoucherCalculation(subtotal, 0.1);

  // Override calculation with selected items discount
  const calculation = {
    ...baseCalculation,
    discount: calculateDiscountForSelectedItems(appliedVoucher),
    finalPrice: subtotal - calculateDiscountForSelectedItems(appliedVoucher),
  };

  // Get product IDs from cart for fetching relevant vouchers
  const productIdsInCart = useMemo(() => {
    return cartItems.items
      .map(item => Number(item.productId))
      .filter(id => !isNaN(id) && id > 0);
  }, [cartItems.items]);

  // Fetch vouchers based on products in cart (instead of all user vouchers)
  const { data: userVouchersData, isLoading, error } = useQuery({
    queryKey: ['vouchers', 'user', 'product', outletSlug, productIdsInCart],
    queryFn: async () => {
      if (!outletSlug || productIdsInCart.length === 0) {
        return { status: 'success', message: '', data: { user_vouchers: [] } };
      }
      const response = await VoucherAPI.getListVoucherUserProduct(outletSlug, productIdsInCart);
      return response;
    },
    enabled: !!outletSlug && productIdsInCart.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Normalize different possible response shapes and provide a safe fallback
  const _rawUserVouchers: any =
    (userVouchersData as any)?.data?.user_vouchers ||
    (userVouchersData as any)?.user_vouchers ||
    (userVouchersData as any)?.data ||
    (userVouchersData as any) ||
    [];

  // Cast to the expected type for downstream usage
  const userVouchers: UserVoucher[] = _rawUserVouchers as UserVoucher[];

  // Convert API Voucher to Voucher type for calculation
  const convertAPIVoucherToCalculationType = (voucher: UserVoucher | any): Voucher | null => {
    // Add safety checks for potentially undefined properties
    // Name is required, but id can be missing (we'll use outlet_id + name as fallback)
    if (!voucher?.name) {
      return null;
    }

    // Determine whether voucher is percentage or fixed-price discount
    const discountFixed = voucher.discount_fixed ?? null;
    const discountPercent = voucher.discount_percent ?? 0;

    // Extract applicable product IDs from voucher.products or voucher.voucher_products
    let applicableProductIds: number[] = [];

    // Try to get from products array first (standard structure)
    if (voucher.products && Array.isArray(voucher.products)) {
      applicableProductIds = voucher.products.map((product: any) => product.id).filter((id: any) => id);
    }

    // If no products found, try voucher_products structure (nested product objects)
    if (applicableProductIds.length === 0 && voucher.voucher_products && Array.isArray(voucher.voucher_products)) {
      applicableProductIds = voucher.voucher_products
        .map((vp: any) => vp.product?.id || vp.product_id)
        .filter((id: any) => id);
    }

    // Prefer fixed amount if provided, otherwise treat as percent discount
    const isFixed = typeof discountFixed === 'number' && Number.isFinite(discountFixed) && discountFixed > 0;

    return {
      id: voucher.id,
      name: voucher.name || '-',
      description: voucher.description || '-',
      code: voucher.code || undefined,
      type: isFixed ? 'fixed' : 'percentage',
      value: isFixed ? Number(discountFixed) : (Number.isFinite(discountPercent) ? discountPercent : 0),
      minTransaction: voucher.min_transaction ?? 0,
      isActive: voucher.is_active !== 0,
      applicableProductIds: applicableProductIds.length > 0 ? applicableProductIds : undefined,
    };
  };

  // Convert to voucher card format for UI
  const convertToVoucherCard = (userVoucher: UserVoucher) => {
    const calculationVoucher = convertAPIVoucherToCalculationType(userVoucher);

    // Skip invalid vouchers
    if (!calculationVoucher) {
      return null;
    }

    // Calculate potential discount
    let potentialDiscount = 0;
    let canUse = true;

    const discountPercent = userVoucher.discount_percent ?? 0;
    // Only calculate discount if is_active is 1 or undefined (default to active)
    if (canUse && (userVoucher.is_active === 1 || userVoucher.is_active === undefined)) {
      // For fixed discount vouchers, potential saving is the fixed price (capped at subtotal)
      if (userVoucher.discount_fixed && Number.isFinite(userVoucher.discount_fixed) && userVoucher.discount_fixed > 0) {
        potentialDiscount = Math.min(subtotal, Number(userVoucher.discount_fixed));
      } else {
        potentialDiscount = Math.round(subtotal * (Number.isFinite(discountPercent) ? discountPercent : 0) / 100);
      }
    }

    // Add safety check for expiry date (using end_date from UserVoucher)
    let expiryDate = "Tanpa Batas";
    if (userVoucher.end_date && typeof userVoucher.end_date === 'string') {
      try {
        expiryDate = new Date(userVoucher.end_date).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      } catch (error) {
        console.error('Failed to parse expiry date:', error);
        expiryDate = "Tanpa Batas";
      }
    }

    // Format min_transaction to display as Rp format
    let minTransaction = undefined;
    if (userVoucher.min_transaction && userVoucher.min_transaction > 0) {
      minTransaction = `Rp ${userVoucher.min_transaction.toLocaleString('id-ID')}`;
    }

    const maxUsageValue = userVoucher.max_usage ?? 0;
    const usageCount = getVoucherUsageCount(userVoucher.id);
    const remainingUsage = maxUsageValue > 0 ? Math.max(maxUsageValue - usageCount, 0) : undefined;
    const isUsageExceeded = maxUsageValue > 0 && remainingUsage === 0;

    let status: "active" | "cancelled" | "disabled" | "expired";
    // Set status to disabled if can_used is 0 or max usage reached
    if (userVoucher.can_used === 0 || isUsageExceeded) {
      status = "disabled";
    } else if (new Date(userVoucher.end_date || '') < new Date()) {
      status = "expired";
    } else {
      status = "active";
    }

    return {
      title: userVoucher.name || '-',
      subtitle: userVoucher.description || `-`,
      expiryDate,
      minTransaction,
      status,
      maxUsage: userVoucher.max_usage ?? undefined,
      remainingUsage,
      discoundFixedPrice: userVoucher.discount_fixed ? Number(userVoucher.discount_fixed) : undefined,
      discoundPercent: userVoucher.discount_percent || 0,
      potentialSavings: potentialDiscount,
      voucher: calculationVoucher,
      code: userVoucher.code || (userVoucher.id ? userVoucher.id.toString() : ''),
      isDisabled: status === "disabled",
    };
  };

  const cartProductIdsSet = new Set(cartItems.items.map(ci => Number(ci.productId)));

  const activeVouchers = userVouchers
    .filter((userVoucher: UserVoucher | any) => {
      // Treat explicitly disabled (0) as disabled, otherwise consider it active
      return userVoucher.can_used === 1 || userVoucher.can_used === undefined;
    })
    .map((uv: UserVoucher) => convertToVoucherCard(uv))
    .filter((v: any) => v !== null);

  const disabledVouchers = userVouchers
    .filter((userVoucher: UserVoucher | any) => {
      return userVoucher.can_used === 0;
    })
    .map((uv: UserVoucher) => convertToVoucherCard(uv))
    .filter((v: any) => v !== null);

  // Mark vouchers as disabled for the current cart if they are product-based but none of their products are present
  const markApplicability = (voucherCards: any[]) => voucherCards.map((vc) => {
    const applicableIds = vc.voucher?.applicableProductIds || [];
    const isApplicableToCart = applicableIds.length === 0 || applicableIds.some((id: number) => cartProductIdsSet.has(id));

    // Global min transaction threshold (also defined above)
    const globalMinViolated = subtotal < MIN_TRANSACTION_THRESHOLD;
    const voucherMin = vc.voucher?.minTransaction ?? 0;
    const voucherMinViolated = voucherMin > 0 && subtotal < voucherMin;

    // Determine disabled state: either not applicable to cart, or min transaction not met
    const isDisabled = !isApplicableToCart || globalMinViolated || voucherMinViolated;

    // If it's already expired/cancelled/claimed, respect that status, otherwise convert active -> disabled when necessary
    let status = vc.status;
    if ((status === 'active' || status === undefined) && isDisabled) {
      status = 'disabled';
    }

    // Augment subtitle with reason when disabled due to min transaction for clarity
    let subtitle = vc.subtitle || '';
    if (voucherMinViolated && voucherMin > 0) {
      const note = `Minimal Rp ${voucherMin.toLocaleString('id-ID')} diperlukan`;
      if (!subtitle.includes(note)) subtitle = `${subtitle} • ${note}`;
    } else if (globalMinViolated) {
      const note = `Minimal Rp ${MIN_TRANSACTION_THRESHOLD.toLocaleString('id-ID')} diperlukan`;
      if (!subtitle.includes(note)) subtitle = `${subtitle} • ${note}`;
    }

    return { ...vc, isDisabled, status, subtitle };
  });

  const activeVouchersWithFlag = markApplicability(activeVouchers as any);
  const disabledVouchersWithFlag = markApplicability(disabledVouchers as any);

  const handleVoucherClick = async (voucherCard: any) => {
    if (voucherCard.status === "active") {
      // Global minimum transaction validation
      if (subtotal < MIN_TRANSACTION_THRESHOLD) {
        toast.error(`Minimal transaksi Rp ${MIN_TRANSACTION_THRESHOLD.toLocaleString('id-ID')} untuk menggunakan voucher`);
        return;
      }

      // Per-voucher minimum transaction validation
      const voucherMin = voucherCard.voucher?.minTransaction ?? 0;
      if (voucherMin > 0 && subtotal < voucherMin) {
        toast.error(`Minimal transaksi Rp ${voucherMin.toLocaleString('id-ID')} untuk voucher ini`);
        return;
      }
      // Apply voucher to state and show item selector (from user voucher list)
      applyVoucher(voucherCard.voucher, 'user');
      setItemSelections([]); // Reset selections when new voucher applied

      // Apply to backend via API for non-product vouchers
      if (!outletSlug) {
        return;
      }

      // If this is a product-only voucher (has applicableProductIds), do not apply to order directly here.
      // The store-level application will be processed via the "Apply" action where product selections are submitted.
      const isProductBased = voucherCard.voucher?.applicableProductIds && voucherCard.voucher.applicableProductIds.length > 0;
      if (isProductBased) {
        // For user vouchers that are product-based, attempt to auto-apply via store check endpoint
        // Auto-select best matching cart items (highest price) for the voucher
        const applicableIds = voucherCard.voucher?.applicableProductIds || [];
        const productIds: number[] = [];
        const quantities: number[] = [];

        if (applicableIds.length > 0) {
          // select the highest price matching cart item
          let bestItem: any = null;
          for (const cartItem of cartItems.items) {
            if (applicableIds.includes(Number(cartItem.productId))) {
              if (!bestItem || (cartItem.basePrice ?? cartItem.price) > (bestItem.basePrice ?? bestItem.price)) {
                bestItem = cartItem;
              }
            }
          }
          if (bestItem) {
            productIds.push(Number(bestItem.productId));
            quantities.push(1);
          }
        } else {
          // no applicable product list, fallback to highest price product in cart
          let bestItem: any = null;
          for (const cartItem of cartItems.items) {
            if (!bestItem || (cartItem.basePrice ?? cartItem.price) > (bestItem.basePrice ?? bestItem.price)) {
              bestItem = cartItem;
            }
          }
          if (bestItem) {
            productIds.push(Number(bestItem.productId));
            quantities.push(1);
          }
        }

        if (productIds.length === 0) {
          toast.info('Tidak ada produk yang cocok untuk voucher ini pada keranjang Anda');
          return;
        }

        try {
          const resp = await storeCheckVoucherMutation.mutateAsync({
            outletSlug: outletSlug!,
            payload: { code: voucherCard.code, product_ids: productIds, quantities },
          });

          if (resp && resp.status !== 'error') {
            // Apply locally and persist selection
            applyVoucher(voucherCard.voucher, 'user');

            // Convert productIds to cart itemIds for proper selection tracking
            const cartItemSelections: ItemSelection[] = [];
            productIds.forEach((pid, idx) => {
              const cartItem = cartItems.items.find(ci => Number(ci.productId) === pid);
              if (cartItem) {
                cartItemSelections.push({ itemId: cartItem.id, quantity: quantities[idx] });
              }
            });

            useVoucherStore.getState().setVoucherSelections(cartItemSelections);
            setItemSelections(cartItemSelections);
            try { localStorage.setItem('appliedVoucher', JSON.stringify(voucherCard.voucher)); } catch (err) { /* ignore */ }
            toast.success(resp.message || 'Voucher berhasil diterapkan');
            if (outletSlug && orderCode) {
              await queryClient.invalidateQueries({ queryKey: voucherQueryKeys.orderList(outletSlug, orderCode) });
              await queryClient.invalidateQueries({ queryKey: paymentQueryKeys.list(outletSlug) });
            }
            // navigate to checkout
            setTimeout(() => navigateToCheckout(), 300);
          } else {
            toast.error(resp?.message || 'Voucher tidak dapat diterapkan');
          }
        } catch (err) {
          console.error('Failed to check/apply store voucher:', err);
          toast.error('Tidak bisa menggunakan voucher');
        }
        return;
      }
      // else: non-product voucher
      if (!voucherCard.code || voucherCard.code.trim() === '') {
        return;
      }

      try {
        // For non-product vouchers, send full cart details to the store input check endpoint so
        // backend can validate and apply the voucher on the order.
        const product_ids: number[] = [];
        const quantities: number[] = [];
        cartItems.items.forEach(i => {
          if (i.productId) {
            product_ids.push(Number(i.productId));
            quantities.push(i.quantity);
          }
        });

        const resp = await storeInputCheckVoucherMutation.mutateAsync({
          outletSlug: outletSlug!,
          payload: { code: voucherCard.code, product_ids, quantities },
        });

        if (resp && resp.status !== 'error') {
          // Try to apply server returned voucher info (if any)
          const vouchers = (resp as any)?.data?.vouchers || (resp as any)?.vouchers || [];
          if (Array.isArray(vouchers) && vouchers.length > 0 && vouchers[0]) {
            const calcVoucher = convertAPIVoucherToCalculationType(vouchers[0].voucher || vouchers[0]);
            if (calcVoucher) {
              applyVoucher(calcVoucher, 'user');
              try { localStorage.setItem('appliedVoucher', JSON.stringify(calcVoucher)); } catch (err) { /* ignore */ }
            }
          }

          if (outletSlug && orderCode) {
            await queryClient.invalidateQueries({ queryKey: voucherQueryKeys.orderList(outletSlug, orderCode) });
            await queryClient.invalidateQueries({ queryKey: paymentQueryKeys.list(outletSlug) });
          }
        } else {
          // display error or fallback message
          console.error('Failed to apply voucher via store endpoint:', resp);
        }
      } catch (error) {
        console.error('Failed to apply voucher via store endpoint:', error);
      }
    } else if (voucherCard.status === "cancelled") {
      if (appliedVoucher?.id === voucherCard.voucher.id) {
        removeVoucher();
        setItemSelections([]);
      }
    } else {
      toast.info('Voucher tidak tersedia untuk digunakan');
    }
  };

  const appliedVoucherUsageExceeded = useMemo(() => {
    if (!appliedVoucher) {
      return false;
    }

    const matchedVoucher = userVouchers.find((voucher) => voucher.id === Number(appliedVoucher.id));
    if (!matchedVoucher?.max_usage || matchedVoucher.max_usage <= 0) {
      return false;
    }

    const usageCount = getVoucherUsageCount(appliedVoucher.id);
    return usageCount >= matchedVoucher.max_usage;
  }, [appliedVoucher, userVouchers, getVoucherUsageCount]);

  const setVoucherSelections = useVoucherStore((state) => state.setVoucherSelections);

  // Open accordion when voucher is applied or when a discount becomes available after load
  useEffect(() => {
    if (!isLoading && (appliedVoucher || apiDiscount > 0)) {
      setIsAccordionOpen(true);
    }
  }, [isLoading, appliedVoucher, apiDiscount]);
  const handleApplyVoucher = async () => {
    if (!appliedVoucher || itemSelections.length === 0) {
      console.warn('No voucher selected or no items selected for discount');
      return;
    }

    if (appliedVoucherUsageExceeded) {
      toast.error('Voucher ini sudah mencapai batas penggunaan');
      return;
    }

    // Validate minimum totals before applying
    if (subtotal < MIN_TRANSACTION_THRESHOLD) {
      toast.error(`Minimal transaksi Rp ${MIN_TRANSACTION_THRESHOLD.toLocaleString('id-ID')} untuk menggunakan voucher`);
      return;
    }

    if ((appliedVoucher.minTransaction ?? 0) > 0 && subtotal < (appliedVoucher.minTransaction ?? 0)) {
      toast.error(`Minimal transaksi Rp ${(appliedVoucher.minTransaction ?? 0).toLocaleString('id-ID')} untuk voucher ini`);
      return;
    }

    // Before persisting, attempt to apply voucher at API level
    const appliedVoucherCode = appliedVoucher.code ?? '';
    const isProductBased = appliedVoucher.applicableProductIds && appliedVoucher.applicableProductIds.length > 0;

    try {
      if (isProductBased) {
        // Build payload for store-level application
        const productIds: number[] = [];
        const quantities: number[] = [];
        for (const sel of itemSelections) {
          const cart = cartItems.items.find(ci => ci.id === sel.itemId);
          if (!cart) continue;
          if (!cart.productId) continue;
          productIds.push(Number(cart.productId));
          quantities.push(sel.quantity);
        }

        if (productIds.length === 0) {
          toast.error('Tidak ada product yang bisa dipilih untuk voucher ini');
          return;
        }

        // Prefer store input application which applies the voucher to given products in the order
        await storeInputCheckVoucherMutation.mutateAsync({
          outletSlug: outletSlug!,
          payload: {
            code: appliedVoucherCode,
            product_ids: productIds,
            quantities,
          },
        });
        if (outletSlug && orderCode) {
          await queryClient.invalidateQueries({ queryKey: voucherQueryKeys.orderList(outletSlug, orderCode) });
          await queryClient.invalidateQueries({ queryKey: paymentQueryKeys.list(outletSlug) });
        }
      } else {
        // Non-product voucher, apply for the whole order using store input check endpoint
        const product_ids: number[] = [];
        const quantities: number[] = [];
        cartItems.items.forEach(i => {
          if (i.productId) {
            product_ids.push(Number(i.productId));
            quantities.push(i.quantity);
          }
        });

        await storeInputCheckVoucherMutation.mutateAsync({
          outletSlug: outletSlug!,
          payload: { code: appliedVoucherCode, product_ids, quantities },
        });
        if (outletSlug && orderCode) {
          await queryClient.invalidateQueries({ queryKey: voucherQueryKeys.orderList(outletSlug, orderCode) });
          await queryClient.invalidateQueries({ queryKey: paymentQueryKeys.list(outletSlug) });
        }
      }
    } catch (error: any) {
      console.error('Failed to apply voucher via API:', error);
      toast.error(error?.message || 'Gagal menerapkan voucher');
      return;
    }

    // Persist selections using the voucher store so Checkout can read them
    setVoucherSelections(itemSelections);
    // Keep legacy persisted keys for backward compatibility (optional)
    try {
      localStorage.setItem('voucherItemSelections', JSON.stringify(itemSelections));
      localStorage.setItem('appliedVoucherId', appliedVoucher.id.toString());
      localStorage.setItem('appliedVoucherCode', appliedVoucher.code || '');
      // appliedVoucher object is persisted in store, no need to duplicate, but keep it for compatibility
      localStorage.setItem('appliedVoucher', JSON.stringify(appliedVoucher));
    } catch (err) {
      // ignore localStorage errors
    }

    if (appliedVoucher.id !== undefined) {
      incrementVoucherUsage(appliedVoucher.id);
    }

    // Navigate to checkout with applied voucher
    navigateToCheckout();
  };

  const handleClearVoucher = () => {
    removeVoucher();
    setItemSelections([]);
    setVoucherCode('');
    // Clear persisted selections in the voucherStore and legacy keys
    const clearVoucherSelections = useVoucherStore.getState().clearVoucherSelections;
    clearVoucherSelections();
    try {
      localStorage.removeItem('voucherItemSelections');
      localStorage.removeItem('appliedVoucherId');
      localStorage.removeItem('appliedVoucherCode');
      localStorage.removeItem('appliedVoucher');
    } catch (err) {
      // ignore
    }
  };

  // Handle voucher code input submission
  const handleVoucherCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!voucherCode.trim()) {
      return;
    }

    if (!outletSlug) {
      return;
    }

    // Basic check: require minimum transaction to attempt voucher code
    if (subtotal < MIN_TRANSACTION_THRESHOLD) {
      toast.error(`Minimal transaksi Rp ${MIN_TRANSACTION_THRESHOLD.toLocaleString('id-ID')} untuk menggunakan voucher`);
      return;
    }

    try {
      // Build product list from cart - same as handleApplyVoucher button
      const product_ids: number[] = [];
      const quantities: number[] = [];
      cartItems.items.forEach((i) => {
        if (i.productId) {
          product_ids.push(Number(i.productId));
          quantities.push(i.quantity);
        }
      });

      // Apply voucher using same payload structure as button: {code, product_ids, quantities}
      // Accepts any voucher code - backend validates if it exists and is applicable
      const response = await storeInputCheckVoucherMutation.mutateAsync({
        outletSlug: outletSlug!,
        payload: {
          code: voucherCode.trim(),
          product_ids,
          quantities
        },
      });

      // Check if response has error status
      if (!response || response.status === 'error' || response.status === 'warning') {
        // Error message is already shown by the API via toast.info()
        // Just return without showing duplicate error
        return;
      }

      // Ensure order list cache is refreshed
      if (outletSlug && orderCode) {
        await queryClient.invalidateQueries({ queryKey: voucherQueryKeys.orderList(outletSlug, orderCode) });
      }

      // If voucher info is returned in response (vouchers[]), use it; otherwise, try to use data from payment apply
      const vouchers = (response as any)?.data?.vouchers || (response as any)?.vouchers || [];
      if (Array.isArray(vouchers) && vouchers.length > 0) {
        const first = vouchers[0];
        if (first) {
          const calculationVoucher = convertAPIVoucherToCalculationType(first.voucher || first);
          if (calculationVoucher) {
            // This code path is the result of applying a raw voucher code (input), mark source as 'input'
            applyVoucher(calculationVoucher, 'input');

            // Auto-select best matching item (same logic as button)
            const applicableIds = calculationVoucher.applicableProductIds || [];
            let selectionItemId: string | null = null;

            if (applicableIds.length > 0) {
              // Select highest price item matching applicable product IDs
              let bestItem: any = null;
              for (const cartItem of cartItems.items) {
                if (applicableIds.includes(Number(cartItem.productId))) {
                  if (!bestItem || (cartItem.basePrice ?? cartItem.price) > (bestItem.basePrice ?? bestItem.price)) {
                    bestItem = cartItem;
                  }
                }
              }
              if (bestItem) selectionItemId = bestItem.id;
            } else {
              // Choose highest price cart item
              let bestItem: any = null;
              for (const cartItem of cartItems.items) {
                if (!bestItem || (cartItem.basePrice ?? cartItem.price) > (bestItem.basePrice ?? bestItem.price)) {
                  bestItem = cartItem;
                }
              }
              if (bestItem) selectionItemId = bestItem.id;
            }

            if (selectionItemId) {
              const selections = [{ itemId: selectionItemId, quantity: 1 }];
              setVoucherSelections(selections);
              setItemSelections(selections);
              try {
                localStorage.setItem('voucherItemSelections', JSON.stringify(selections));
                localStorage.setItem('appliedVoucherId', calculationVoucher.id.toString());
                localStorage.setItem('appliedVoucherCode', calculationVoucher.code || '');
                localStorage.setItem('appliedVoucher', JSON.stringify(calculationVoucher));
              } catch (err) {/* ignore */ }
            }

            if (calculationVoucher.id !== undefined) {
              incrementVoucherUsage(calculationVoucher.id);
            }

            setVoucherCode('');
            navigateToCheckout();
            return;
          }
        }
      }

      // For payment-level success without voucher metadata, create a minimal voucher entry in local store
      const appliedFromPayment = (response && response.status !== 'error');
      if (appliedFromPayment) {
        // Extract discount from response if available
        const discountFromResponse = (response as any)?.data?.discount || (response as any)?.discount || 0;
        const voucherTypeFromResponse = (response as any)?.data?.type || 'fixed';
        const voucherNameFromResponse = (response as any)?.data?.name || voucherCode.trim();

        const minimalVoucher: Voucher = {
          id: voucherCode.trim(),
          name: voucherNameFromResponse,
          code: voucherCode.trim(),
          type: voucherTypeFromResponse,
          value: discountFromResponse,
          isActive: true,
        };

        applyVoucher(minimalVoucher, 'input');
        try {
          localStorage.setItem('appliedVoucher', JSON.stringify(minimalVoucher));
          localStorage.setItem('appliedVoucherId', String(minimalVoucher.id));
          localStorage.setItem('appliedVoucherCode', minimalVoucher.code || '');
        } catch (err) { /* ignore */ }

        if (minimalVoucher.id !== undefined) {
          incrementVoucherUsage(minimalVoucher.id);
        }

        setVoucherCode('');
        // Ensure payment data is refreshed so Checkout can read new discount (if any)
        if (outletSlug) {
          await queryClient.invalidateQueries({ queryKey: paymentQueryKeys.list(outletSlug) });
        }
        navigateToCheckout();
        return;
      }
    } catch (error) {
      console.error('Failed to use voucher code:', error);
    }
  };

  const isApplyButtonDisabled = !appliedVoucher || (appliedVoucher.applicableProductIds && appliedVoucher.applicableProductIds.length > 0 && itemSelections.length === 0) || appliedVoucherUsageExceeded;

  // Helper function to render voucher item button
  const renderVoucherItem = (item: any, _index: number, isSelected: boolean, discountPerItem: number) => (
    <button
      key={item.id}
      onClick={() => {
        setItemSelections((prev) => {
          const exists = prev.find((s) => s.itemId === item.id);
          if (exists) {
            // Deselect if already selected
            return [];
          }
          // Replace any existing selection with this item (max 1 item)
          return [{ itemId: item.id, quantity: 1 }];
        });
      }}
      className={`w-full text-left transition-all duration-200 rounded-xl p-3 border-2 ${isSelected
        ? 'bg-orange-50 border-orange-400 shadow-md'
        : 'bg-white border-gray-200 hover:border-orange-300'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Radio Button */}
        <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
          ? 'bg-orange-500 border-orange-500'
          : 'border-gray-300'
          }`}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-sm font-semibold text-title-black">{item.name}</p>
            {/* {index === 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                Harga Tertinggi
              </span>
            )} */}
          </div>

          {/* Price breakdown */}
          <div className="space-y-0.5 text-xs">
            <p className="text-gray-600">
              Harga Normal: <span className="font-bold text-title-black">Rp {(item.basePrice ?? item.price).toLocaleString('id-ID')}</span>
            </p>
            {/* {item.extraPrice && item.extraPrice > 0 && (
              <p className="text-gray-500">
                + Topping: <span className="font-bold text-gray-700">Rp {item.extraPrice.toLocaleString('id-ID')}</span>
              </p>
            )}
            {item.options && item.options.length > 0 && (
              <p className="text-gray-400 mt-1">
                ({item.options.join(', ')}) <span className="text-gray-500">(tidak di potong)</span>
              </p>
            )} */}
          </div>
        </div>

        {/* Discount Preview */}
        {isSelected && (
          <div className="shrink-0 text-right">
            <p className="text-sm font-bold text-orange-600">
              -Rp {discountPerItem.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-orange-500 font-medium">
              {appliedVoucher?.type === 'percentage'
                ? `${appliedVoucher?.value}% diskon*`
                : `Rp ${Number(appliedVoucher?.value).toLocaleString('id-ID')} diskon*`}
            </p>
          </div>
        )}
        {/* {isSelected && (
          <div className="ml-3 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setItemSelections(prev => prev.map(s => s.itemId === item.id ? { ...s, quantity: Math.max(1, s.quantity - 1) } : s));
              }}
              className="px-2 py-1 bg-gray-100 rounded-full"
            >-</button>
            <span className="text-sm">{(itemSelections.find(s => s.itemId === item.id)?.quantity) ?? 1}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const cartQty = item.quantity ?? 99;
                setItemSelections(prev => prev.map(s => s.itemId === item.id ? { ...s, quantity: Math.min(cartQty, s.quantity + 1) } : s));
              }}
              className="px-2 py-1 bg-gray-100 rounded-full"
            >+</button>
          </div>
        )} */}

        {/* Show the price after discount to make it explicit to the user */}
        {/* {discountPerItem > 0 && (
          <div className="mt-2 text-right">
            <p className="text-sm text-gray-700">Harga Setelah Diskon</p>
            <p className="text-sm font-bold text-orange-600">Rp {Math.max((item.basePrice ?? item.price) - discountPerItem, 0).toLocaleString('id-ID')}</p>
          </div>
        )} */}
      </div>
    </button>
  );

  if (isLoading) {
    return <SkeletonVouchersPage />;
  }

  if (error) {
    return (
      <ScreenWrapper>
        <div className="px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-sm text-red-600">⚠️ {error instanceof Error ? error.message : String(error)}</p>
            <p className="text-xs text-red-500 mt-2">Tidak dapat memuat voucher</p>
          </div>
        </div>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white rounded-b-3xl shadow-[0_4px_8px_0_rgba(128,128,128,0.24)]">
        <div className="px-4 py-5 flex flex-col gap-6">
          <HeaderBar
            title="Pilih Voucher"
            showBack={true}
            onBack={() => navigate(-1)}
            className="p-0 bg-transparent shadow-none"
          />
          <form onSubmit={handleVoucherCodeSubmit} className="w-full flex gap-2">
            <TextInputWithIcon
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Ada Kode voucher? Masukkan di sini"
              disabled={isSubmittingCode}
              containerClassName="flex-1"
            />
            <button
              type="submit"
              disabled={isSubmittingCode || !voucherCode.trim()}
              className="px-4 py-3 bg-orange-500 text-white rounded-2xl font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmittingCode ? 'Loading...' : 'Gunakan'}
            </button>
          </form>
        </div>
      </div>

      {/* Calculation Summary - Drawer at bottom when voucher applied */}
      <Drawer open={!!appliedVoucher} onOpenChange={(open) => !open && handleClearVoucher()}>
        <DrawerContent className="max-w-[440px] mx-auto">
          <DrawerHeader className="sticky top-0 bg-white z-10">
            <button
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              className="w-full flex justify-between items-center hover:bg-gray-50 transition-colors rounded-lg p-2"
            >
              <div className="flex flex-col items-start">
                <DrawerTitle className="text-sm text-gray-600">{appliedVoucher?.name}</DrawerTitle>
                <p className="text-base font-medium text-orange-500">
                  {calculation.discount > 0 ? (
                    <>-Rp {calculation.discount.toLocaleString("id-ID")}</>
                  ) : (
                    <>Pilih items untuk diskon</>
                  )}
                </p>
              </div>
              <ChevronUp
                className={`w-5 h-5 text-gray-600 transition-transform ${isAccordionOpen ? "rotate-180" : ""}`}
              />
            </button>
          </DrawerHeader>

          {/* Accordion Content - Only shows when expanded */}
          {isAccordionOpen && appliedVoucher && (
            <div className="px-4 pt-4 border-t border-gray-100 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-700">Pilih Items untuk Diskon</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${itemSelections.length > 0
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
                  }`}>
                  {itemSelections.length > 0 ? '1 Dipilih' : 'Max 1 Item'}
                </span>
              </div>

              {/* Items Selector - Radio Button Style (Max 1 Item) */}
              <div className="space-y-2 mb-4">
                {appliedVoucher.applicableProductIds && appliedVoucher.applicableProductIds.length > 0
                  ? // Only show products that are covered by the voucher
                  cartItems.items
                    .filter(item => appliedVoucher.applicableProductIds?.includes(Number(item.productId)))
                    .map((item, index) => {
                      const isSelected = itemSelections.some(s => s.itemId === item.id);
                      const priceForDiscount = item.basePrice ?? item.price;
                      let discountPerItem = appliedVoucher.type === 'percentage'
                        ? Math.round((appliedVoucher.value / 100) * priceForDiscount)
                        : appliedVoucher.value;

                      discountPerItem = Math.min(discountPerItem, priceForDiscount);

                      return renderVoucherItem(item, index, isSelected, discountPerItem);
                    })
                  : // Show all cart items if no specific products are covered
                  cartItems.items.map((item, index) => {
                    const isSelected = itemSelections.some(s => s.itemId === item.id);
                    const priceForDiscount = item.basePrice ?? item.price;
                    const discountPerItem = appliedVoucher.type === 'percentage'
                      ? Math.round((appliedVoucher.value / 100) * priceForDiscount)
                      : appliedVoucher.value;

                    return renderVoucherItem(item, index, isSelected, discountPerItem);
                  })
                }
              </div>
            </div>
          )}

          <DrawerFooter>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleClearVoucher}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
              >
                Hapus Voucher
              </button>
              <button
                onClick={handleApplyVoucher}
                disabled={isApplyButtonDisabled}
                className={`flex-1 px-4 py-3 rounded-2xl font-medium transition-colors ${isApplyButtonDisabled ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
              >
                {appliedVoucherUsageExceeded ? 'Kuota Habis' : 'Gunakan Voucher'}
              </button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Voucher List */}
      <div className="flex flex-col gap-9 mt-6 mb-32">
        <VoucherListSection
          title="Voucher Tersedia"
          totalItems={(activeVouchersWithFlag || []).length}
          vouchers={activeVouchersWithFlag}
          onVoucherClick={handleVoucherClick}
        />

        {disabledVouchers.length > 0 && (
          <>
            <Separator />
            <VoucherListSection
              title="Voucher Tidak Tersedia"
              totalItems={(disabledVouchersWithFlag || []).length}
              vouchers={disabledVouchersWithFlag}
              onVoucherClick={handleVoucherClick}
            />
          </>
        )}
      </div>
    </ScreenWrapper>
  );
}