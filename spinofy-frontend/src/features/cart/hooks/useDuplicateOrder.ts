import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useMutationDuplicateOrder } from '@/features/cart/hooks/api/useMutationDuplicateOrder';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import type { DuplicateOrderParams } from '@/features/cart/types/OrderDuplication';
import {
    DUPLICATE_ORDER_ERRORS,
} from '@/features/transaction/constants/duplicateOrderConstant';
import { toast } from 'sonner';

/**
 * @returns Object dengan duplicate order mutation dan state
 */
export interface UseDuplicateOrderReturn {
    duplicateOrder: (params: DuplicateOrderParams) => void;
    isDuplicating: boolean;
    isSuccess: boolean;
    error: Error | null;
}

export const useDuplicateOrder = (): UseDuplicateOrderReturn => {
    const { navigateToCheckout } = useOutletNavigation();
    const outletSlug = useOutletSlug();

    const duplicateOrderMutation = useMutationDuplicateOrder({
        onSuccess: async () => {
            try {
                navigateToCheckout();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                toast.error(errorMessage);
            }
        },
        onError: (error: Error) => {
            console.error('❌ Duplicate order mutation error:', error);
            const errorMessage = error.message || DUPLICATE_ORDER_ERRORS.FAILED_DUPLICATE;
            toast.error(errorMessage);
        },
    });

    return {
        duplicateOrder: ({ orderCode }: DuplicateOrderParams) => {
            if (!outletSlug) {
                toast.error(DUPLICATE_ORDER_ERRORS.NO_OUTLET);
                return;
            }

            duplicateOrderMutation.mutate({ orderCode, outletSlug });
        },
        isDuplicating: duplicateOrderMutation.isPending,
        isSuccess: duplicateOrderMutation.isSuccess,
        error: duplicateOrderMutation.error,
    };
};

export default useDuplicateOrder;
