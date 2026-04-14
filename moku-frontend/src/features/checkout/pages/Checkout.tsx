import { Suspense, lazy, useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { Separator } from '@/components/Separator';
import HeaderBar from '@/components/HeaderBar';
import { SkeletonCheckoutPage } from '@/components/skeletons/SkeletonComponents';
import { X, ChevronRight } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useScrollToTop } from '@/hooks/shared/useScrollToTop';
import { useVoucherCalculation } from '@/features/vouchers/hooks/useVoucherCalculation';
import { useVoucherStore } from '@/features/vouchers/stores/voucherStore';
import { usePointsCalculation } from '@/hooks/shared/usePointsCalculation';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { useBarcodeStore } from '@/features/storefront/stores/useBarcodeStore';
import { OutletType } from '@/features/outlets/types/Outlet';
import isOrderBlocking from '@/features/checkout/utils/orderHelpers';
import { useQueryOrders } from '@/features/transaction/hooks/api/useQueryOrder';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { useQueryOrderVouchers } from '@/features/vouchers/hooks/api/useQueryVocher';
import { useQueryTableNumbers } from '@/features/table/hooks/api/useQueryTableNumbers';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCheckoutPageData,
  useCheckoutItemManagement,
  useCheckoutPageHandlers,
  useCheckoutPageSideEffects,
  useCheckoutPageDisplayData,
} from '@/features/checkout/hooks';

import { toast } from 'sonner';

import { useStoreCheckoutRequestMutation } from '@/features/payment/hooks/api/useMutationPayment';
import { PaymentAPI } from '@/features/checkout/api/payment.api';
import type { TableNumber } from '@/features/table/types/TableNumber';
import type { CheckoutRequestPayload } from '@/features/checkout/types/Checkout';
import { SkeletonLoader } from '@/components';
import { useStoreInputCheckVoucherMutation } from '@/features/vouchers/hooks/api/useMutationVoucher';
import { voucherQueryKeys } from '@/features/vouchers/hooks/api/useQueryVocher';
import { paymentQueryKeys } from '@/features/payment/hooks/api/useQueryPayment';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { useUpdateProfile } from '@/features/profile/services';
import { genderToString } from '@/features/profile/types/Auth';

const PaymentDetailSection = lazy(() =>
  import('@/features/payment/components/PaymentDetailSection').then((module) => ({
    default: module.PaymentDetailSection,
  }))
);

const OrderDetailsSection = lazy(() =>
  import('../components/ItemCardSection/OrderDetailsSection').then((module) => ({
    default: module.OrderDetailsSection,
  }))
);

const SpecialOffersSection = lazy(() =>
  import('../components/SpecialOfferSection/SpecialOffersSection').then((module) => ({
    default: module.SpecialOffersSection,
  }))
);

const PaymentMethodSection = lazy(() =>
  import('../../payment/components/PaymentMethodSection').then((module) => ({
    default: module.PaymentMethodSection,
  }))
);

const CheckoutFooter = lazy(() =>
  import('../components/CheckoutFooter').then((module) => ({
    default: module.CheckoutFooter,
  }))
);

const VoucherSection = lazy(() =>
  import('../components/VoucherSection/VoucherSection').then((module) => ({
    default: module.VoucherSection,
  }))
);

const PointsBadge = lazy(() =>
  import('../../../components/PointsBadge').then((module) => ({
    default: module.PointsBadge,
  }))
);

const TableSection = lazy(() =>
  import('@/features/table/components/TableSection').then((module) => ({
    default: module.TableSection,
  }))
);

interface ItemSelection {
  itemId: string;
  quantity: number;
}


export default function Checkout() {
  const navigate = useNavigate();
  const { navigateToHome, outletSlug } = useOutletNavigation();
  const { items, getTotalPrice, setCheckoutProcessing, isCheckoutProcessing, clearCart } =
    useCart();
  const { user } = useAuth();
  const storeCheckoutRequestMutation = useStoreCheckoutRequestMutation();
  const storeInputCheckVoucherMutation = useStoreInputCheckVoucherMutation();
  const updateProfileMutation = useUpdateProfile();
  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("1");
  const [paymentMethodFee, setPaymentMethodFee] = useState(0);
  const [selectedTables, setSelectedTables] = useState<TableNumber[]>([]);
  const [isTableDrawerOpen, setIsTableDrawerOpen] = useState(false);
  const [isProfileIncompleteModalOpen, setIsProfileIncompleteModalOpen] = useState(false);
  const [isUnpaidOrderModalOpen, setIsUnpaidOrderModalOpen] = useState(false);
  const [pendingOrderCode, setPendingOrderCode] = useState<string | null>(null);
  const [checkoutJustCompleted, setCheckoutJustCompleted] = useState(false);

  // Check if user profile is complete
  const isProfileComplete = () => {
    if (!user) return false;
    return !!(user.name && user.phone);
  };

  // Get outlet type from store
  const { getOutletType } = useOutletStore();
  const { setBarcode } = useBarcodeStore();

  const {
    outlet,
    outletName,
    taxRate,
    specialOffers,
    currentOrder,
    orderCode,
    paymentData,
    paymentMethods,
    isLoading: isDataLoading,
    refetchPaymentData,
    invalidateCheckoutData,
  } = useCheckoutPageData();

  const outletType = getOutletType();

  const isTableService =
    outletType === OutletType.TABLE_SERVICE ||
    outletType === OutletType.BOTH ||
    outlet?.type === OutletType.TABLE_SERVICE ||
    outlet?.type === OutletType.BOTH;

  // Always refresh checkout data when entering the page
  useEffect(() => {
    if (!outlet?.slug) {
      return;
    }

    void invalidateCheckoutData();
  }, [outlet?.slug, invalidateCheckoutData]);

  // Set initial payment method fee when payment methods are loaded
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const firstMethod = paymentMethods[0];
      setSelectedPaymentMethod(firstMethod.id.toString());
      setPaymentMethodFee(Number(firstMethod.percentage_fee) || 0);
    }
  }, [paymentMethods]);

  // Fetch tables from API
  const { data: apiTableData, isLoading: isTablesLoading } = useQueryTableNumbers(outletSlug);

  // Fetch orders to check for unpaid ones
  const { data: ordersData, isLoading: isOrdersLoading } = useQueryOrders(outletSlug, {
    enabled: !!outletSlug,
  });

  const tables = apiTableData?.data?.table_numbers || [];

  // Memoized section splitting based on table location
  const tablesByLocation = useMemo(() => {
    const locationMap = new Map<string, TableNumber[]>();

    for (const table of tables) {
      const locationName = table.table_number_location?.name || 'Tanpa Lokasi';
      if (!locationMap.has(locationName)) {
        locationMap.set(locationName, []);
      }
      locationMap.get(locationName)!.push(table);
    }

    return Array.from(locationMap.entries()).map(([location, tableLists]) => ({
      location,
      tables: tableLists,
    }));
  }, [tables]);

  const handleTableSelect = (table: TableNumber) => {
    setSelectedTables((prevTables) => {
      const isSelected = prevTables.some(t => t.id === table.id);
      return isSelected ? [] : [table];
    });
  };

  const handleTableSubmit = () => {
    setIsTableDrawerOpen(false);
  };

  useEffect(() => {
    if (selectedTables.length > 0 && isTableService) {
      const firstTableId = selectedTables[0].id.toString();
      setBarcode(firstTableId);
    }
  }, [selectedTables, setBarcode, isTableService]);

  const {
    updateItemQuantity,
    deleteItem,
    editItem,
    formatOrderItems,
  } = useCheckoutItemManagement(
    outlet?.slug,
    orderCode,
    refetchPaymentData,
    navigateToHome
  );

  const subtotal = getTotalPrice();
  const MIN_TRANSACTION_THRESHOLD = 1000; // Minimum subtotal required to use vouchers

  // Read applied voucher directly from the voucher store to ensure sync with VoucherCheckout page
  const appliedVoucherFromStore = useVoucherStore((state) => state.appliedVoucher);
  const appliedVoucherSourceFromStore = useVoucherStore((state) => state.appliedVoucherSource);

  const { calculation: baseCalculation, removeVoucher, applyVoucher } =
    useVoucherCalculation(subtotal, taxRate);

  // Use the voucher from store instead of the one from useVoucherCalculation
  const appliedVoucher = appliedVoucherFromStore;

  // Get voucher item selections from localStorage
  // Extract discount from API response
  const apiDiscount = useMemo(() => {
    if (!paymentData?.data?.order || paymentData.data.order.length === 0) {
      return 0;
    }
    const order = paymentData.data.order[0];
    return Number((order as any).discount) || 0;
  }, [paymentData]);

  // Read voucher selections from persisted voucher store (falls back to legacy localStorage)
  const voucherSelectionsFromStore = useVoucherStore((state) => state.voucherSelections);
  const getVoucherSelections = () => {
    if (voucherSelectionsFromStore && voucherSelectionsFromStore.length > 0) {
      return voucherSelectionsFromStore;
    }

    try {
      const selections = localStorage.getItem('voucherItemSelections');
      return selections ? JSON.parse(selections) : [];
    } catch (error) {
      console.error('Failed to parse voucher selections:', error);
      return [];
    }
  };

  // Calculate discount only for selected items - ONLY on base price, not extras/toppings
  // Prioritize voucher selections over API discount to ensure per-item discount is applied correctly
  const calculatePerItemDiscount = () => {
    // If no voucher is applied, return 0
    if (!appliedVoucher) {
      // If there's an API discount but no voucher in store, use API discount as fallback
      return apiDiscount > 0 ? apiDiscount : 0;
    }

    const voucherSelections = getVoucherSelections();
    const hasApplicableProducts = appliedVoucher.applicableProductIds && appliedVoucher.applicableProductIds.length > 0;

    // If we have voucher selections, calculate discount based on those selections
    if (voucherSelections.length > 0) {
      let totalDiscount = 0;
      voucherSelections.forEach((selection: ItemSelection) => {
        const item = items.find(i => i.id === selection.itemId);
        if (item) {
          // Use basePrice if available, otherwise fall back to price
          // This ensures voucher only applies to the base product, not extras/toppings
          const priceForDiscount = item.basePrice ?? item.price;

          const discountPerItem = appliedVoucher.type === 'percentage'
            ? Math.round((appliedVoucher.value / 100) * priceForDiscount)
            : appliedVoucher.value;

          const itemDiscount = selection.quantity * discountPerItem;
          const cappedDiscount = appliedVoucher.maxDiscount
            ? Math.min(itemDiscount, appliedVoucher.maxDiscount)
            : itemDiscount;

          totalDiscount += cappedDiscount;
        }
      });
      return totalDiscount;
    }

    // If no selections but voucher is applied, only calculate for product-specific vouchers
    if (hasApplicableProducts) {
      let totalDiscount = 0;
      items.forEach((item) => {
        const productId = Number(item.productId);
        // Check if this item's product is in the applicable list
        if (appliedVoucher.applicableProductIds!.includes(productId)) {
          const priceForDiscount = item.basePrice ?? item.price;
          const discountPerItem = appliedVoucher.type === 'percentage'
            ? Math.round((appliedVoucher.value / 100) * priceForDiscount)
            : appliedVoucher.value;

          const itemDiscount = item.quantity * discountPerItem;
          const cappedDiscount = appliedVoucher.maxDiscount
            ? Math.min(itemDiscount, appliedVoucher.maxDiscount)
            : itemDiscount;

          totalDiscount += cappedDiscount;
        }
      });
      return totalDiscount;
    }

    // For vouchers without selections and no applicable products, use API discount as fallback
    return apiDiscount > 0 ? apiDiscount : 0;
  };

  const perItemDiscount = calculatePerItemDiscount();

  // Determine effective discount based on voucher state
  // If voucher is applied with selections, use perItemDiscount (don't let API override it)
  // Otherwise, use the maximum discount available
  const voucherSelections = getVoucherSelections();
  const hasVoucherSelections = appliedVoucherFromStore && voucherSelections.length > 0;

  const effectiveDiscount = hasVoucherSelections
    ? perItemDiscount  // Use calculated per-item discount when selections exist
    : Math.max(perItemDiscount, baseCalculation.discount || 0, apiDiscount || 0);  // Otherwise use max

  const discountedSubtotal = Math.max(0, subtotal - effectiveDiscount);
  const tax = Math.round(discountedSubtotal * taxRate);
  const calculation = {
    ...baseCalculation,
    discount: effectiveDiscount,
    tax: tax,
    finalPrice: discountedSubtotal + tax,
  };

  // Keep track of previous cart length to detect when a new order is started (cart was empty -> now has items)
  const prevItemsCountRef = useRef(items.length);

  useEffect(() => {
    const prevCount = prevItemsCountRef.current;
    const currentCount = items.length;
    // If the cart was empty and now items exist, a new order started -> clear voucher
    if (prevCount === 0 && currentCount > 0) {
      try {
        // Clear voucher state when starting a new order
        removeVoucher();
        useVoucherStore.getState().clearVoucherSelections();
        localStorage.removeItem('voucherItemSelections');
        localStorage.removeItem('appliedVoucherId');
        localStorage.removeItem('appliedVoucherCode');
        localStorage.removeItem('appliedVoucher');
      }
      catch {
        //ignore
      }
    }
    prevItemsCountRef.current = currentCount;
  }, [items.length, removeVoucher]);

  const unpaidOrders = ordersData?.data?.order || [];
  const paymentOrders = paymentData?.data?.order || [];
  const hasPaymentOrders = paymentOrders.length > 0;

  // Use helper to detect blocking order status (handles both "2" / 2 and 'menunggu-konfirmasi')

  const unpaidOrder = [...unpaidOrders, ...paymentOrders].find((order) => {
    return isOrderBlocking(order);
  });

  const { handleAddMoreItems, handleNavigateToVouchers, isLoading } =
    useCheckoutPageHandlers({
      orderCode,
      currentOrder,
      outletSlug,
      isCheckoutPaymentLoading: false,
      onNavigateToHome: navigateToHome,
      subtotal,
      tax: calculation.tax,
      discount: calculation.discount,
      finalPrice: calculation.finalPrice + paymentMethodFee,
      appliedVoucher,
      paymentMethodFee,
      paymentMethodId: Number(selectedPaymentMethod),
      unpaidOrder,
      isOrdersLoading,
      onUnpaidOrderAttempt: (order) => {
        setPendingOrderCode(order.code);
        setIsUnpaidOrderModalOpen(true);
      },
    });

  const handleSubmit = async () => {
    if (!isProfileComplete()) {
      setIsProfileIncompleteModalOpen(true);
      return;
    }
    if (unpaidOrder) {
      setIsUnpaidOrderModalOpen(true);
      return;
    }

    // Prevent checkout when an applied voucher requires a higher minimum transaction
    if (appliedVoucher) {
      if (subtotal < MIN_TRANSACTION_THRESHOLD) {
        toast.error(`Minimal transaksi Rp ${MIN_TRANSACTION_THRESHOLD.toLocaleString('id-ID')} menyelesaikan transaksi`);
        return;
      }

      if ((appliedVoucher.minTransaction ?? 0) > 0 && subtotal < (appliedVoucher.minTransaction ?? 0)) {
        toast.error(`Minimal transaksi Rp ${(appliedVoucher.minTransaction ?? 0).toLocaleString('id-ID')} menyelesaikan transaksi`);
        return;
      }
    }

    // Prepare checkout payload
    const product_ids: number[] = [];
    const variant_ids: number[] = [];
    const quantities: number[] = [];
    const notes: string[] = [];

    items.forEach((item) => {
      product_ids.push(item.productId!);
      variant_ids.push(...(item.variantIds || []));
      quantities.push(item.quantity);
      notes.push(item.notes || '');
    });

    // voucher_type: 1 = user voucher, 2 = input voucher
    const voucher_type = appliedVoucher
      ? (appliedVoucherSourceFromStore === 'input' ? 2 : 1)
      : null;

    const payload: CheckoutRequestPayload = {
      product_ids,
      variant_ids,
      quantities,
      voucher_type,
      notes,
      voucher_code: appliedVoucher?.code || '',
      table_number_id: selectedTables.length > 0 ? selectedTables[0].id.toString() : null,
      method_id: Number(selectedPaymentMethod),
    };

    try {
      setCheckoutProcessing(true);
      const response = await storeCheckoutRequestMutation.mutateAsync({
        outletSlug: outletSlug!,
        payload,
      });

      // On success, extract the created order
      const raw = (response as any)?.data?.data || (response as any)?.data || (response as any);
      const createdOrder = raw?.order || raw || null;

      let createdOrderCode = createdOrder?.code;
      const createdOrderId = createdOrder?.id;

      // If codeOrder is missing but we have order id, try to find the code in payment list using id
      if (!createdOrderCode && createdOrderId && outletSlug) {
        const maxRetries = 5;
        const delayMs = 300;
        for (let i = 0; i < maxRetries && !createdOrderCode; i++) {
          try {
            const list = await PaymentAPI.getListPayment(outletSlug);
            const listAny: any = list;
            const maybeOrders: any[] = listAny?.data?.order || listAny?.data?.data?.order || listAny?.data?.data || [];
            const found = Array.isArray(maybeOrders) ? maybeOrders.find((o: any) => o?.id === createdOrderId) : null;
            if (found?.code) {
              createdOrderCode = found.code;
              break;
            }
          } catch (err) {
            // ignore
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      // Persist orderCode and full order data to local storage so the Payment page
      // can read it without needing backend fetches (local-only mode)
      if (createdOrderCode) {
        try {
          localStorage.setItem('currentOrderCode', String(createdOrderCode));
        } catch (err) {
          // ignore
        }
      }

      if (createdOrder) {
        try {
          localStorage.setItem('currentOrderData', JSON.stringify(createdOrder));
        } catch (err) {
          // ignore
        }
      }

      // Clear cart after successful order creation
      clearCart();

      // Clear applied voucher state and persisted selections after a successful order
      try {
        // remove from voucher store
        removeVoucher();
        useVoucherStore.getState().clearVoucherSelections();
        // clear legacy keys
        localStorage.removeItem('voucherItemSelections');
        localStorage.removeItem('appliedVoucherId');
        localStorage.removeItem('appliedVoucherCode');
        localStorage.removeItem('appliedVoucher');
      } catch (err) {
        // ignore errors while clearing voucher state
      }

      // Mark checkout as just completed to prevent unwanted navigation
      setCheckoutJustCompleted(true);

      if (outletSlug) {
        navigate(`/${outletSlug}/payment`, { state: { orderCode: createdOrderCode, orderData: createdOrder, paymentMethodFee } });
      } else {
        navigateToHome();
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      // Handle error
    } finally {
      setCheckoutProcessing(false);
    }
  };

  useScrollToTop([isDataLoading]);

  // Reset checkout completion flag after navigation
  useEffect(() => {
    if (checkoutJustCompleted) {
      const timer = setTimeout(() => {
        setCheckoutJustCompleted(false);
      }, 5000); // Reset after 5 seconds to allow navigation to complete and prevent redirect-to-home
      return () => clearTimeout(timer);
    }
  }, [checkoutJustCompleted]);

  // Refresh payment data when the checkout state changes externally
  useEffect(() => {
    if (!orderCode || hasPaymentOrders) {
      return;
    }

    void refetchPaymentData();
  }, [hasPaymentOrders, orderCode, refetchPaymentData]);

  // Fetch user vouchers for the order (cached for VoucherCheckout screen)
  useQueryOrderVouchers(outletSlug, orderCode, {
    enabled: !!outletSlug && !!orderCode,
    staleTime: 1000 * 60 * 5,
  });


  useCheckoutPageSideEffects({
    currentOrder,
    isDataLoading,
    outletSlug,
    items,
    isCheckoutProcessing,
    checkoutJustCompleted,
    onNavigateToHome: navigateToHome,
    setCheckoutProcessing,
  });

  // Auto-apply claimed voucher from reward
  useEffect(() => {
    const claimedVoucherCode = localStorage.getItem('claimedVoucherCode');
    const claimedVoucherId = localStorage.getItem('claimedVoucherId');

    if (claimedVoucherCode && claimedVoucherId && !appliedVoucher && items.length > 0 && outletSlug) {
      // Auto-apply the voucher
      const applyClaimedVoucher = async () => {
        try {
          const product_ids: number[] = [];
          const quantities: number[] = [];
          items.forEach((i) => {
            if (i.productId) {
              product_ids.push(Number(i.productId));
              quantities.push(i.quantity);
            }
          });

          const response = await storeInputCheckVoucherMutation.mutateAsync({
            outletSlug: outletSlug!,
            payload: {
              code: claimedVoucherCode,
              product_ids,
              quantities
            },
          });

          if (response && response.status !== 'error') {
            // Get voucher info from response
            const vouchers = (response as any)?.data?.vouchers || (response as any)?.vouchers || [];
            if (Array.isArray(vouchers) && vouchers.length > 0) {
              const voucherData = vouchers[0].voucher || vouchers[0];

              // Convert to calculation voucher format
              const calculationVoucher = {
                id: voucherData.id || claimedVoucherId,
                name: voucherData.name || 'Voucher Reward',
                code: claimedVoucherCode,
                type: (voucherData.discount_fixed && voucherData.discount_fixed > 0) ? 'fixed' : 'percentage',
                value: voucherData.discount_fixed || voucherData.discount_percent || 0,
                minTransaction: voucherData.min_transaction || 0,
                isActive: true,
                applicableProductIds: voucherData.products?.map((p: any) => p.id) ||
                  voucherData.voucher_products?.map((vp: any) => vp.product?.id || vp.product_id) ||
                  undefined,
              } as any;

              // Apply voucher to store
              applyVoucher(calculationVoucher, 'user');

              toast.success('Voucher berhasil diterapkan!');

              // Invalidate queries to refresh data
              if (orderCode) {
                await queryClient.invalidateQueries({ queryKey: voucherQueryKeys.orderList(outletSlug, orderCode) });
                await queryClient.invalidateQueries({ queryKey: paymentQueryKeys.list(outletSlug) });
              }
            }
          }
        } catch (error) {
          console.error('Failed to auto-apply voucher:', error);
          toast.error('Gagal menerapkan voucher secara otomatis');
        } finally {
          // Clear the claimed voucher flags
          localStorage.removeItem('claimedVoucherCode');
          localStorage.removeItem('claimedVoucherId');
        }
      };

      applyClaimedVoucher();
    }
  }, [items.length, appliedVoucher, outletSlug, orderCode]);

  const { orderItemsData, paymentDetailsData, footerData, quantities } =
    useCheckoutPageDisplayData({
      items,
      subtotal,
      tax: calculation.tax,
      discount: calculation.discount,
      finalPrice: calculation.finalPrice,
      originalPrice: calculation.originalPrice,
      appliedVoucher,
      formatOrderItems,
      paymentMethodFee,
    });

  // Calculate earned points from final price
  const earnedPoints = usePointsCalculation(calculation.finalPrice);

  if (isDataLoading) {
    return <SkeletonCheckoutPage />;
  }

  return (
    <ScreenWrapper>
      {/* Header Section */}
      <HeaderBar
        title={`Checkout • ${outletName}`}
        showBack={true}
        onBack={navigateToHome}
      />

      <div className="flex flex-col gap-4 pt-6">


        {/* Order Items Section */}
        <Suspense
          fallback={
            <div className="px-4">
              <div className="h-36 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <OrderDetailsSection
            items={orderItemsData}
            quantities={quantities}
            onUpdateQuantity={updateItemQuantity}
            onAddItem={handleAddMoreItems}
            onEditItem={editItem}
            onDeleteItem={deleteItem}
          />
        </Suspense>

        <Separator />

        {/* Special Offers Section */}
        {specialOffers.length > 0 && (
          <>
            <Suspense
              fallback={
                <div className="px-4">
                  <div className="h-28 w-full rounded-2xl bg-gray-100 animate-pulse" />
                </div>
              }
            >
              <SpecialOffersSection
                offers={specialOffers}
                onAddOffer={(offerId: string) => {
                  navigate(`/${outletSlug}/detail-item?id=${offerId}`);
                }}
              />
            </Suspense>
            <Separator />
          </>
        )}

        {/* Payment Details Section */}
        <Suspense
          fallback={
            <div className="px-4">
              <div className="h-28 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <PaymentDetailSection
            title="Detail Pembayaran"
            items={paymentDetailsData}
          />
        </Suspense>
        {earnedPoints > 0 && (
          <div className="px-4">
            <Suspense
              fallback={<div className="h-10 w-32 rounded-full bg-gray-100 animate-pulse" />}
            >
              <PointsBadge points={earnedPoints} />
            </Suspense>
          </div>
        )}

        <Separator />

        {/* Voucher Section - Per Item */}
        {(appliedVoucher || apiDiscount > 0) ? (
          <>
            <Suspense
              fallback={
                <div className="px-4">
                  <div className="h-24 w-full rounded-2xl bg-gray-100 animate-pulse" />
                </div>
              }
            >
              <VoucherSection
                voucher={{ name: appliedVoucher?.name || 'Voucher Applied', savings: calculation.discount > 0 ? calculation.discount : baseCalculation.discount }}
                onCheckVouchers={handleNavigateToVouchers}
                onRemoveVoucher={() => {
                  removeVoucher();
                  // Clear voucher selections from voucher store and localStorage
                  useVoucherStore.getState().clearVoucherSelections();
                  try {
                    localStorage.removeItem('voucherItemSelections');
                    localStorage.removeItem('appliedVoucherId');
                    localStorage.removeItem('appliedVoucherCode');
                    localStorage.removeItem('appliedVoucher');
                  } catch (err) {
                    // ignore
                  }
                  // Navigate back to voucher selection
                  handleNavigateToVouchers();
                }}
              />
            </Suspense>
            <Separator />
          </>
        ) : (
          <>
            <div className="px-4 py-4">
              <h3 className="text-base font-rubik font-medium text-title-black mb-3">Voucher Diskon per Produk</h3>
              <button
                onClick={handleNavigateToVouchers}
                className="w-full px-4 py-3 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <span className="text-sm font-medium text-orange-600">
                  Pilih Voucher untuk Produk
                </span>
              </button>
            </div>
            <Separator />
          </>
        )}
        {/* Table Selection Section - Only for Table Service outlets */}
        {isTableService && (
          <div className="flex flex-col gap-3 px-4">
            <h2 className="text-base font-rubik font-medium capitalize">Lokasi Meja</h2>
            <Drawer open={isTableDrawerOpen} onOpenChange={setIsTableDrawerOpen}>
              <DrawerTrigger asChild>
                <button
                  className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  aria-label="Pilih meja untuk pesanan"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Pilih Meja</span>
                    {selectedTables.length > 0 && (
                      <span className="text-sm text-primary-orange font-semibold" aria-live="polite">
                        {selectedTables.map(t => t.number).join(', ')}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </button>
              </DrawerTrigger>

              <DrawerContent className="max-h-[90vh] max-w-[440px] mx-auto">
                <DrawerHeader className="flex flex-row items-center justify-between">
                  <DrawerTitle>Pilih Meja</DrawerTitle>
                  <DrawerClose
                    className="p-0 rounded-full hover:bg-gray-100"
                    aria-label="Tutup pemilihan meja"
                  >
                    <X className="w-5 h-5" />
                  </DrawerClose>
                </DrawerHeader>

                {/* Table Sections - Grouped by Location */}
                <div className="flex-1 overflow-y-auto px-4 pb-32">
                  {isTablesLoading && (
                    <SkeletonLoader />
                  )}
                  {!isTablesLoading && tablesByLocation.length > 0 && (
                    <Suspense
                      fallback={<div className="h-32 w-full rounded-2xl bg-gray-100 animate-pulse" />}
                    >
                      <div className="flex flex-col gap-8">
                        {tablesByLocation.map((section) => (
                          <TableSection
                            key={section.location}
                            title={section.location}
                            tables={section.tables}
                            selectedTableIds={selectedTables.map(t => t.id)}
                            onTableSelect={handleTableSelect}
                            columns={4}
                          />
                        ))}
                      </div>
                    </Suspense>
                  )}
                  {!isTablesLoading && tablesByLocation.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>Belum ada meja tersedia</p>
                    </div>
                  )}
                </div>

                {/* Bottom action bar */}
                <DrawerFooter className="border-t bg-white">
                  <button
                    onClick={handleTableSubmit}
                    className="w-full py-3 bg-primary-orange text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={selectedTables.length === 0}
                    aria-label={`Simpan ${selectedTables.length} meja yang dipilih`}
                  >
                    Simpan Meja
                  </button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        )}
        <Separator />

        {/* Payment Method Section */}
        <Suspense
          fallback={
            <div className="px-4">
              <div className="h-40 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <PaymentMethodSection
            selectedMethod={selectedPaymentMethod}
            onSelectMethod={(methodId, fee) => {
              setSelectedPaymentMethod(methodId);
              setPaymentMethodFee(fee);
            }}
            paymentMethods={paymentMethods}
          />
        </Suspense>

        {/* Bottom Spacing for Fixed Footer */}
        <div className="h-40"></div>
      </div>

      {/* Checkout Footer */}
      <>
        <Suspense
          fallback={
            <div className="px-4 pb-6">
              <div className="h-24 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <CheckoutFooter
            summary={footerData}
            onSubmit={handleSubmit}
            // Consider checkout blocked for unpaid orders OR when subtotal is below the global threshold
            isBlocked={Boolean(unpaidOrder) || subtotal < MIN_TRANSACTION_THRESHOLD || ((appliedVoucher?.minTransaction ?? 0) > 0 && subtotal < (appliedVoucher?.minTransaction ?? 0))}
            isLoading={Boolean(isLoading || isCheckoutProcessing)}
            onBlockedSubmit={() => {
              // Prioritize unpaid order flow
              if (unpaidOrder) {
                setPendingOrderCode(unpaidOrder.code);
                setIsUnpaidOrderModalOpen(true);
                return;
              }

              // If subtotal is too low for global minimum
              if (subtotal < MIN_TRANSACTION_THRESHOLD) {
                toast.error(`Minimal transaksi Rp ${MIN_TRANSACTION_THRESHOLD.toLocaleString('id-ID')} untuk membuat pesanan`);
                return;
              }

              // If applied voucher requires higher minimum
              if ((appliedVoucher?.minTransaction ?? 0) > 0 && subtotal < (appliedVoucher?.minTransaction ?? 0)) {
                toast.error(`Voucher ini membutuhkan minimal transaksi Rp ${(appliedVoucher?.minTransaction ?? 0).toLocaleString('id-ID')}`);
                return;
              }
            }}
          />
        </Suspense>
      </>

      {/* Profile Incomplete Drawer */}
      <Drawer open={isProfileIncompleteModalOpen} onOpenChange={setIsProfileIncompleteModalOpen}>
        <DrawerContent className="max-w-[440px] mx-auto">
          <DrawerHeader>
            <DrawerTitle>Lengkapi Nomor WhatsApp</DrawerTitle>
            <DrawerDescription>
              Untuk melanjutkan checkout, mohon lengkapi nomor WhatsApp Anda terlebih dahulu.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const phone = formData.get('phone') as string;

                if (!phone || phone.trim() === '') {
                  toast.error('Nomor WhatsApp harus diisi');
                  return;
                }

                // Update profile with phone number
                updateProfileMutation.mutate(
                  {
                    name: user?.name || '',
                    phone: phone.trim(),
                    date_birth: user?.customer_profile?.date_birth || '',
                    gender: genderToString(user?.customer_profile?.gender ?? null),
                    job: user?.customer_profile?.job || '',
                  },
                  {
                    onSuccess: () => {
                      setIsProfileIncompleteModalOpen(false);
                      toast.success('Nomor WhatsApp berhasil disimpan');
                    },
                    onError: (error: any) => {
                      console.error('Update phone failed:', error);
                      toast.error('Gagal menyimpan nomor WhatsApp');
                    },
                  }
                );
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Contoh: 08123456789"
                  defaultValue={user?.phone || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500">
                  Nomor ini akan digunakan untuk konfirmasi pesanan
                </p>
              </div>

              <DrawerFooter className="px-0 pt-4">
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setIsProfileIncompleteModalOpen(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
                  </button>
                </div>
              </DrawerFooter>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Unpaid Order Modal */}
      <AlertDialog open={isUnpaidOrderModalOpen} onOpenChange={setIsUnpaidOrderModalOpen}>
        <AlertDialogContent className='mx-auto max-w-[440px]'>
          <AlertDialogHeader>
            <AlertDialogTitle>Pesanan Belum Selesai</AlertDialogTitle>
            <AlertDialogDescription>
              Anda memiliki pesanan yang belum dibayar atau menunggu konfirmasi. Silakan selesaikan pesanan tersebut sebelum membuat pesanan baru.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex flex-row gap-6'>
            <AlertDialogCancel className='w-full'>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className='w-full bg-primary-orange hover:bg-orange-600'
              onClick={() => {
                if (pendingOrderCode) {
                  navigate(`/${outletSlug}/detail-transaction?code=${pendingOrderCode}`);
                }
              }}
            >
              Lihat Pesanan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScreenWrapper>
  );
}