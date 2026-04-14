import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProtectedOutletRoute } from "@/components/ProtectedOutletRoute";
const Home = lazy(() => import("@/features/storefront/pages/Home"));
const OnboardApp = lazy(() => import("@/features/onboard/pages/Welcome"));
const Transactions = lazy(() => import("@/features/transaction/pages/Transactions"));
const Checkout = lazy(() => import("@/features/checkout/pages/Checkout"));
const Payment = lazy(() => import("@/features/payment/pages/Payment"));
const Vouchers = lazy(() => import("@/features/vouchers/pages/Vouchers"));
const Account = lazy(() => import("@/features/profile/pages/Account"));
const FormProfile = lazy(() => import("@/features/profile/pages/Form/FormProfile"));
const DetailItem = lazy(() => import("@/features/product/pages/DetailItem"));
const DetailTransaction = lazy(
  () => import("@/features/transaction/pages/DetailTransaction"),
);
const SearchTransaction = lazy(
  () => import("@/features/transaction/pages/SearchTransaction"),
);
const Invoice = lazy(() => import("@/features/invoice/pages/Invoice"));
const RewardPoin = lazy(() => import("@/features/reward/pages/RewardPoin"));
const HistoryPoin = lazy(() => import("@/features/reward/pages/HistoryPoin"));
const HistoryVouchers = lazy(() => import("@/features/vouchers/pages/HistoryVouchers"));
const NotFound = lazy(() => import("@/NotFound"));
const FormWhatsapp = lazy(
  () => import("@/features/profile/pages/Form/FormWhatsAppNumber"),
);
const VoucherCheckout = lazy(() => import("@/features/checkout/components/VoucherCheckout"));
const GoogleCallback = lazy(() => import("@/features/auth/pages/GoogleCallback"));
const FormEmail = lazy(() => import("@/features/profile/pages/Form/FormEmail"));
const PaymentSuccess = lazy(() => import("@/features/payment/pages/PaymentSuccess"));
const RecommendProduct = lazy(() => import("@/features/storefront/pages/Recommend"));
const Favorite = lazy(() => import("@/features/storefront/pages/Favorite"));
const OutletSelectionPage = lazy(() => import("@/features/outlets/pages/OutletList"));
const TableNumber = lazy(() => import("@/features/table/pages/LIstTable"));
const SearchProduct = lazy(() => import("@/features/storefront/pages/SearchProduct"));
const ComingSoon = lazy(() => import("@/ComingSoon"));
const PrivacyPolicy = lazy(() => import("@/features/profile/pages/legal/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("@/features/profile/pages/legal/TermCondition"));
const RefundPolicy = lazy(() => import("@/features/profile/pages/legal/RefundPolicy"));
const FAQ = lazy(() => import("@/features/profile/pages/legal/FAQ"));
const RouteErrorBoundary = lazy(() => import("@/components/RouteErrorBoundary"));
const MyRewardVoucher = lazy(() => import("@/features/reward/pages/MyRewardVoucher"));

const RootRedirect = () => {
  return <Navigate to="/onboard" replace={true} />;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/outlet-selection",
    element: <OutletSelectionPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/search-product",
    element: <SearchProduct />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/search-product",
    element: <Navigate to="/onboard" replace={true} />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/home",
    element: <Home />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/privacy-policy",
    element: <PrivacyPolicy />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/faq",
    element: <FAQ />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/terms-and-conditions",
    element: <TermsAndConditions />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/refund-policy",
    element: <RefundPolicy />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/table-number",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <TableNumber />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/home",
    element: <Navigate to="/onboard" replace={true} />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/my-reward-voucher",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <MyRewardVoucher />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/recommend",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <RecommendProduct />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/favorite",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <Favorite />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/onboard",
    element: <OnboardApp />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/transactions",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <Transactions />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/checkout",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <Checkout />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/payment",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <Payment />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/vouchers",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <Vouchers />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/account",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <Account />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/form-profile",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <FormProfile />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/detail-item",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <DetailItem />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/detail-transaction",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <DetailTransaction />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/search-transaction",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <SearchTransaction />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/invoice/:orderCode",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <Invoice />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/reward-poin",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <RewardPoin />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/history-poin",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <HistoryPoin />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/history-vouchers",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <HistoryVouchers />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/form-whatsapp",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <FormWhatsapp />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/form-email",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <FormEmail />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/voucher-checkout",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <VoucherCheckout />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/payment-success",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <PaymentSuccess />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/auth/google/callback",
    element: <GoogleCallback />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/webhook/google/callback",
    element: <GoogleCallback />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/*",
    element: <NotFound />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/*",
    element: <NotFound />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/:outletSlug/coming-soon",
    element: (
      <ProtectedOutletRoute>
        <ProtectedRoute guestRestricted={true}>
          <ComingSoon />
        </ProtectedRoute>
      </ProtectedOutletRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
]);

export default router;
