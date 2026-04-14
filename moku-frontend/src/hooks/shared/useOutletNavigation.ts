import { useNavigate } from "react-router-dom";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";

/**
 * Navigation utility hook that provides outlet-aware navigation functions
 */
export const useOutletNavigation = () => {
    const navigate = useNavigate();
    const outletSlug = useOutletSlug();

    const navigateToHome = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/home`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToTableNumber = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/table-number`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToRecommend = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/recommend`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToFavorite = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/favorite`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToTransaction = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/transactions`);
        } else {
            navigate('/onboard');
        }
    }

    const navigateToCheckout = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/checkout`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToVouchers = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/vouchers`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToRewardPoin = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/reward-poin`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToHistoryPoin = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/history-poin`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToHistoryVouchers = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/history-vouchers`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToDetailItem = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/detail-item`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToPayment = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/payment`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToAccount = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/account`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToFormProfile = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/form-profile`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToWhatsapProfile = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/form-whatsapp`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToComingSoon = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/coming-soon`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToVoucherCheckout = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/voucher-checkout`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToSearchProduct = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/search-product`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateToInvoice = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/invoice/:orderCode`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToRefundPolicy = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/refund-policy`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToPrivacyPolicy = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/privacy-policy`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToTermsAndConditions = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/terms-and-conditions`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToFAQ = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/faq`);
        } else {
            navigate('/onboard');
        }
    };
    const navigateToMyRewardVoucher = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/my-reward-voucher`);
        } else {
            navigate('/onboard');
        }
    };

    // Generic navigation with outlet slug
    const navigateWithOutlet = (path: string) => {
        if (outletSlug) {
            navigate(`/${outletSlug}${path}`);
        } else {
            navigate('/onboard');
        }
    };

    const navigateNotFound = () => {
        if (outletSlug) {
            navigate(`/${outletSlug}/not-found`);
        } else {
            navigate('/onboard');
        }
    };

    return {
        navigateToHome,
        navigateToCheckout,
        navigateToVouchers,
        navigateToRewardPoin,
        navigateToHistoryPoin,
        navigateToHistoryVouchers,
        navigateToDetailItem,
        navigateToPayment,
        navigateToVoucherCheckout,
        navigateToSearchProduct,
        navigateWithOutlet,
        navigateToAccount,
        navigateToTransaction,
        navigateToRecommend,
        navigateToFavorite,
        navigateToTableNumber,
        navigateNotFound,
        navigateToFormProfile,
        navigateToWhatsapProfile,
        navigateToComingSoon,
        navigateToInvoice,
        navigateToRefundPolicy,
        navigateToPrivacyPolicy,
        navigateToTermsAndConditions,
        navigateToFAQ,
        navigateToMyRewardVoucher,
        outletSlug,
    };
};