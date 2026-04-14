import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { LikeAPI } from '../../api/like.api';
import type { LikeResponse } from '../../types/Like';
import { productQueryKeys } from '@/features/product/hooks/api/useQueryProduct';

export interface ToggleLikeVariables {
    outletSlug: string;
    uuidProduct: string;
}

/**
 * Mutation for toggling product like status. On success it will invalidate
 * product list and product detail queries for the given outlet/product so UI
 * will be refreshed.
 */
export const useToggleLikeMutation = (
    options?: UseMutationOptions<LikeResponse, Error, ToggleLikeVariables>
) => {
    const queryClient = useQueryClient();

    return useMutation<LikeResponse, Error, ToggleLikeVariables>({
        mutationFn: ({ outletSlug, uuidProduct }) => LikeAPI.toggleLike(outletSlug, uuidProduct),
        onSuccess: async (data, variables, context) => {
            // Invalidate product queries so UI reflects new like status
            await Promise.allSettled([
                queryClient.invalidateQueries({ queryKey: productQueryKeys.list(variables.outletSlug) }),
                queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(variables.outletSlug, variables.uuidProduct) }),
            ]);

            // Forward user provided onSuccess if any
            if (options?.onSuccess) {
                // Ensure returned promise is awaited if it's async
                // cast to any to match possible different onSuccess signatures
                await Promise.resolve((options.onSuccess as any)(data, variables, context));
            }
        },
        ...options,
    });
};
