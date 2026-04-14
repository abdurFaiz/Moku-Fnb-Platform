import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useUserStats } from '../hooks/useUserStats';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import './setup';

// Mock the auth store
vi.mock('@/features/auth/stores/auth.store', () => ({
    useAuthStore: vi.fn(),
}));

describe('useUserStats', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Functionality', () => {
        it('should return user stats with all values', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 3,
                total_point: 100,
                total_order: 5,
            });
        });

        it('should handle zero values', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 0,
                total_order: 0,
                total_user_voucher: 0,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 0,
                total_point: 0,
                total_order: 0,
            });
        });

        it('should handle null values and default to 0', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: null,
                total_order: null,
                total_user_voucher: null,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 0,
                total_point: 0,
                total_order: 0,
            });
        });

        it('should handle undefined values and default to 0', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: undefined,
                total_order: undefined,
                total_user_voucher: undefined,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 0,
                total_point: 0,
                total_order: 0,
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle large numbers', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 999999,
                total_order: 10000,
                total_user_voucher: 5000,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 5000,
                total_point: 999999,
                total_order: 10000,
            });
        });

        it('should handle negative numbers (edge case)', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: -10,
                total_order: -5,
                total_user_voucher: -3,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: -3,
                total_point: -10,
                total_order: -5,
            });
        });

        it('should handle mixed null and valid values', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100,
                total_order: null,
                total_user_voucher: 3,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 3,
                total_point: 100,
                total_order: 0,
            });
        });

        it('should handle mixed undefined and valid values', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: undefined,
                total_order: 5,
                total_user_voucher: undefined,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 0,
                total_point: 0,
                total_order: 5,
            });
        });
    });

    describe('Memoization', () => {
        it('should memoize stats when values do not change', () => {
            const mockStoreValues = {
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            };

            vi.mocked(useAuthStore).mockReturnValue(mockStoreValues as any);

            const { result, rerender } = renderHook(() => useUserStats());

            const firstStats = result.current.stats;

            // Rerender without changing values
            rerender();

            const secondStats = result.current.stats;

            // Should be the same object reference due to memoization
            expect(firstStats).toBe(secondStats);
        });

        it('should update stats when values change', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            } as any);

            const { result, rerender } = renderHook(() => useUserStats());

            const firstStats = result.current.stats;

            // Change the mock values
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 200,
                total_order: 10,
                total_user_voucher: 6,
            } as any);

            rerender();

            const secondStats = result.current.stats;

            // Should be different object references
            expect(firstStats).not.toBe(secondStats);
            expect(secondStats).toEqual({
                total_voucher: 6,
                total_point: 200,
                total_order: 10,
            });
        });
    });

    describe('Return Type', () => {
        it('should return object with stats property', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current).toHaveProperty('stats');
            expect(typeof result.current.stats).toBe('object');
        });

        it('should have correct stats structure', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toHaveProperty('total_voucher');
            expect(result.current.stats).toHaveProperty('total_point');
            expect(result.current.stats).toHaveProperty('total_order');
        });

        it('should have numeric values for all stats', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(typeof result.current.stats.total_voucher).toBe('number');
            expect(typeof result.current.stats.total_point).toBe('number');
            expect(typeof result.current.stats.total_order).toBe('number');
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle new user with no activity', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 0,
                total_order: 0,
                total_user_voucher: 0,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 0,
                total_point: 0,
                total_order: 0,
            });
        });

        it('should handle active user with multiple orders', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 5000,
                total_order: 50,
                total_user_voucher: 10,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 10,
                total_point: 5000,
                total_order: 50,
            });
        });

        it('should handle VIP user with high stats', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100000,
                total_order: 500,
                total_user_voucher: 50,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 50,
                total_point: 100000,
                total_order: 500,
            });
        });
    });

    describe('Decimal Values', () => {
        it('should handle decimal point values', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100.5,
                total_order: 5,
                total_user_voucher: 3,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats.total_point).toBe(100.5);
        });

        it('should handle all decimal values', () => {
            vi.mocked(useAuthStore).mockReturnValue({
                total_point: 100.75,
                total_order: 5.5,
                total_user_voucher: 3.25,
            } as any);

            const { result } = renderHook(() => useUserStats());

            expect(result.current.stats).toEqual({
                total_voucher: 3.25,
                total_point: 100.75,
                total_order: 5.5,
            });
        });
    });
});
