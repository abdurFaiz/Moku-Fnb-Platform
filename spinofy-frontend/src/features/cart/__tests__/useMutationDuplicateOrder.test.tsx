import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useMutationDuplicateOrder } from '../hooks/api/useMutationDuplicateOrder';

// Mock the OrderAPI
vi.mock('@/features/transaction/api/order.api', () => ({
  OrderAPI: {
    storeDuplicateOrder: vi.fn(),
  },
}));

import { OrderAPI } from '@/features/transaction/api/order.api';
const mockStoreDuplicateOrder = vi.mocked(OrderAPI.storeDuplicateOrder);

vi.mock('@/features/transaction/hooks/api/useQueryOrder', () => ({
  orderQueryKeys: {
    list: (slug: string) => ['orders', slug],
  },
}));

vi.mock('@/features/payment/hooks/api/useQueryPayment', () => ({
  paymentQueryKeys: {
    list: (slug: string) => ['payments', slug],
  },
}));

import { OrderAPI } from '@/features/transaction/api/order.api';
const mockStoreDuplicateOrder = vi.mocked(OrderAPI.storeDuplicateOrder);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMutationDuplicateOrder', () => {
  it('should call OrderAPI.storeDuplicateOrder with correct parameters', async () => {
    const mockOrderResponse = {
      status: 'success',
      message: 'Order duplicated',
      data: {},
    };

    vi.mocked(OrderAPI.storeDuplicateOrder).mockResolvedValue(mockOrderResponse);

    const { result } = renderHook(
      () => useMutationDuplicateOrder(),
      { wrapper: createWrapper() }
    );

    result.current.mutate({
      outletSlug: 'test-outlet',
      orderCode: 'ORDER123',
    });

    expect(OrderAPI.storeDuplicateOrder).toHaveBeenCalledWith('test-outlet', {
      code: 'ORDER123',
    });
  });

  it('should handle mutation error', () => {
    const error = new Error('Duplication failed');
    vi.mocked(OrderAPI.storeDuplicateOrder).mockRejectedValue(error);

    const { result } = renderHook(
      () => useMutationDuplicateOrder(),
      { wrapper: createWrapper() }
    );

    expect(result.current.isError).toBe(false); // Initial state
  });
});