import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { InvoiceAPI } from '@/features/invoice/api/invoice.api';
import type { InvoiceOrderResponse } from '@/features/invoice/types/Invoice';

const FIVE_MINUTES = 1000 * 60 * 5;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const invoiceQueryKeys = {
    root: () => ['invoice'] as const,
    detail: (slug: string, orderCode: number | string) => ['invoice', slug, orderCode] as const,
} as const;

const ensureInvoiceSuccess = (
    response: InvoiceOrderResponse,
    slug: string,
    orderCode: number | string
) => {
    if (response.status === 'error') {
        throw new Error(
            response.message || `Failed to load invoice data for ${slug}/${orderCode}`
        );
    }
    return response;
};

const fetchInvoice = async (slug: string, orderCode: number) => {
    const response = await InvoiceAPI.getInvoiceOrder(slug, orderCode);
    return ensureInvoiceSuccess(response, slug, orderCode);
};

const baseQueryConfig = {
    staleTime: FIVE_MINUTES,
    gcTime: THIRTY_MINUTES,
    refetchOnWindowFocus: false,
} as const;

export const invoiceQueryOptions = (slug: string, orderCode: number) =>
    queryOptions<
        InvoiceOrderResponse,
        Error,
        InvoiceOrderResponse,
        ReturnType<typeof invoiceQueryKeys.detail>
    >({
        queryKey: invoiceQueryKeys.detail(slug, orderCode),
        queryFn: () => fetchInvoice(slug, orderCode),
        ...baseQueryConfig,
    });

type InvoiceQueryKey = ReturnType<typeof invoiceQueryKeys.detail>;
type InvoiceQueryOptions = Omit<
    UseQueryOptions<InvoiceOrderResponse, Error, InvoiceOrderResponse, InvoiceQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryInvoice = (
    slug?: string | null,
    orderCode?: number | null,
    options?: InvoiceQueryOptions
) => {
    if (!slug || orderCode == null) {
        return useQuery<InvoiceOrderResponse, Error, InvoiceOrderResponse, InvoiceQueryKey>({
            queryKey: invoiceQueryKeys.detail(slug ?? '', orderCode ?? 'missing'),
            queryFn: async () => {
                throw new Error('Outlet slug and order code are required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<InvoiceOrderResponse, Error, InvoiceOrderResponse, InvoiceQueryKey>({
        ...invoiceQueryOptions(slug, orderCode),
        ...options,
    });
};

export const prefetchInvoice = (queryClient: QueryClient, slug: string, orderCode: number) =>
    queryClient.prefetchQuery(invoiceQueryOptions(slug, orderCode));
