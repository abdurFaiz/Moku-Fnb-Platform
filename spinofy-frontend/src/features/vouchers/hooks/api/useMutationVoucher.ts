import {
    useMutation,
    useQueryClient,
    type QueryClient,
    type QueryKey,
    type UseMutationOptions,
} from '@tanstack/react-query';

import { VoucherAPI } from '@/features/vouchers/api/voucher.api';
import { voucherQueryKeys } from '@/features/vouchers/hooks/api/useQueryVocher';
import { rewardQueryKeys } from '@/features/reward/hooks/api/useQueryReward';
import type { VouchersResponse } from '@/features/vouchers/types/Voucher';
import type { PayloadCheckVoucher } from '@/features/vouchers/types/UserVoucher';

type VoucherInvalidateTarget =
    | { type: 'root' }
    | { type: 'userList'; slug: string }
    | { type: 'orderList'; slug: string; orderCode: string }
    | { type: 'rewardPoints'; slug: string }
    | { type: 'rewardProducts'; slug: string }
    | { type: 'rewardGeneral'; slug: string }
    | { type: 'custom'; queryKey: QueryKey };

type VoucherMutationContext<TData, TVariables> = {
    data: TData;
    variables: TVariables;
};

type VoucherInvalidateResolver<TData, TVariables> =
    | VoucherInvalidateTarget[]
    | ((context: VoucherMutationContext<TData, TVariables>) => VoucherInvalidateTarget[] | undefined | null);

export interface VoucherMutationOptions<
    TData,
    TVariables extends { outletSlug: string },
    TContext = unknown,
> extends Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn' | 'onSuccess'> {
    invalidateTargets?: VoucherInvalidateResolver<TData, TVariables>;
    onSuccess?: (
        data: TData,
        variables: TVariables,
        context: TContext,
    ) => void | Promise<void>;
}

const defaultInvalidateResolver = <TData, TVariables extends { outletSlug: string }>(
    context: VoucherMutationContext<TData, TVariables>,
): VoucherInvalidateTarget[] => [
        { type: 'root' },
        { type: 'userList', slug: context.variables.outletSlug },
    ];

const normalizeTargets = <TData, TVariables extends { outletSlug: string }>(
    context: VoucherMutationContext<TData, TVariables>,
    resolver?: VoucherInvalidateResolver<TData, TVariables>,
) => {
    const resolved = resolver
        ? typeof resolver === 'function'
            ? resolver(context)
            : resolver
        : defaultInvalidateResolver(context);

    if (!resolved || resolved.length === 0) {
        return [] as VoucherInvalidateTarget[];
    }

    return resolved.filter((target): target is VoucherInvalidateTarget => Boolean(target));
};

const invalidateTargets = (queryClient: QueryClient, targets: VoucherInvalidateTarget[]) => {
    const tasks: Array<Promise<unknown>> = [];

    for (const target of targets) {
        if (!target) continue;

        switch (target.type) {
            case 'root':
                tasks.push(queryClient.invalidateQueries({ queryKey: voucherQueryKeys.root() }));
                break;
            case 'userList':
                tasks.push(queryClient.invalidateQueries({ queryKey: voucherQueryKeys.userList(target.slug) }));
                break;
            case 'orderList':
                tasks.push(
                    queryClient.invalidateQueries({
                        queryKey: voucherQueryKeys.orderList(target.slug, target.orderCode),
                    }),
                );
                break;
            case 'rewardPoints':
                tasks.push(queryClient.invalidateQueries({ queryKey: voucherQueryKeys.rewardPoints(target.slug) }));
                break;
            case 'rewardProducts':
                tasks.push(
                    queryClient.invalidateQueries({ queryKey: voucherQueryKeys.rewardProducts(target.slug) }),
                );
                break;
            case 'rewardGeneral':
                tasks.push(
                    queryClient.invalidateQueries({ queryKey: voucherQueryKeys.rewardGeneral(target.slug) }),
                );
                break;
            case 'custom':
                tasks.push(queryClient.invalidateQueries({ queryKey: target.queryKey }));
                break;
            default:
                break;
        }
    }

    if (tasks.length === 0) {
        return Promise.resolve();
    }

    return Promise.allSettled(tasks);
};

export const useVoucherMutation = <
    TData,
    TVariables extends { outletSlug: string },
    TContext = unknown,
>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: VoucherMutationOptions<TData, TVariables, TContext>,
) => {
    const queryClient = useQueryClient();
    const { invalidateTargets: resolver, onSuccess, ...restOptions } = options ?? {};

    return useMutation<TData, Error, TVariables, TContext>({
        mutationFn,
        onSuccess: async (data, variables, context) => {
            const contextPayload: VoucherMutationContext<TData, TVariables> = {
                data,
                variables,
            };

            const targets = normalizeTargets(contextPayload, resolver);
            if (targets.length > 0) {
                await invalidateTargets(queryClient, targets);
            }

            if (onSuccess) {
                await Promise.resolve(onSuccess(data, variables, context));
            }
        },
        ...restOptions,
    });
};

export interface ClaimVoucherPointVariables {
    outletSlug: string;
    voucherId: number;
}

export const useClaimVoucherPointMutation = (
    options?: VoucherMutationOptions<VouchersResponse, ClaimVoucherPointVariables>,
) =>
    useVoucherMutation<VouchersResponse, ClaimVoucherPointVariables>(
        ({ outletSlug, voucherId }) => VoucherAPI.claimVoucherPoint(outletSlug, voucherId),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'userList', slug: variables.outletSlug },
                { type: 'rewardPoints', slug: variables.outletSlug },
                {
                    type: 'custom',
                    queryKey: rewardQueryKeys.summary(variables.outletSlug),
                },
            ],
            ...options,
        },
    );

export interface ApplyVoucherCodeVariables {
    outletSlug: string;
    payload: { voucher_code: string };
    orderCode?: string;
}

export const useApplyVoucherCodeMutation = (
    options?: VoucherMutationOptions<VouchersResponse, ApplyVoucherCodeVariables>,
) =>
    useVoucherMutation<VouchersResponse, ApplyVoucherCodeVariables>(
        ({ outletSlug, payload }) => VoucherAPI.useInputCodeVoucher(outletSlug, payload.voucher_code),
        {
            invalidateTargets: ({ variables }) => {
                const targets: VoucherInvalidateTarget[] = [
                    { type: 'userList', slug: variables.outletSlug },
                ];

                if (variables.orderCode) {
                    targets.push({
                        type: 'orderList',
                        slug: variables.outletSlug,
                        orderCode: variables.orderCode,
                    });
                }

                return targets;
            },
            ...options,
        },
    );

export interface StoreCheckVoucherVariables {
    outletSlug: string;
    payload: PayloadCheckVoucher;
}

export const useStoreCheckVoucherMutation = (
    options?: VoucherMutationOptions<VouchersResponse, StoreCheckVoucherVariables>,
) =>
    useVoucherMutation<VouchersResponse, StoreCheckVoucherVariables>(
        ({ outletSlug, payload }) => VoucherAPI.useStoreCheckVoucher(outletSlug, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'userList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );

export interface StoreInputCheckVoucherVariables {
    outletSlug: string;
    payload: PayloadCheckVoucher;
}

export const useStoreInputCheckVoucherMutation = (
    options?: VoucherMutationOptions<VouchersResponse, StoreInputCheckVoucherVariables>,
) =>
    useVoucherMutation<VouchersResponse, StoreInputCheckVoucherVariables>(
        ({ outletSlug, payload }) => VoucherAPI.useStoreInputCheckVoucher(outletSlug, payload),
        {
            invalidateTargets: ({ variables }) => [
                { type: 'userList', slug: variables.outletSlug },
            ],
            ...options,
        },
    );
