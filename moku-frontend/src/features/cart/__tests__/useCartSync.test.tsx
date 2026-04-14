import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCartSync } from '../hooks/useCartSync';

// Mock the payment hook
vi.mock('@/features/payment/hooks/api/useQueryPayment', () => ({
  useQueryPayment: vi.fn(),
}));

import { useQueryPayment } from '@/features/payment/hooks/api/useQueryPayment';
const mockUseQueryPayment = vi.mocked(useQueryPayment);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCartSync', () => {
  it('should return default values when no data', () => {
    vi.mocked(useQueryPayment).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useCartSync('test-outlet', true),
      { wrapper: createWrapper() }
    );

    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrice).toBe(0);
    expect(result.current.currentOrder).toBeNull();
  });

  it('should handle loading state', () => {
    vi.mocked(useQueryPayment).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(
      () => useCartSync('test-outlet'),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);
  });
});