import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useToggleLikeMutation } from '../hooks/api/useMutationLike';
import { LikeAPI } from '../api/like.api';

vi.mock('../api/like.api');

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => {
        return createElement(QueryClientProvider, { client: queryClient }, children);
    };

    return { Wrapper, queryClient };
};

describe('useToggleLikeMutation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Toggle Like', () => {
        it('should toggle like successfully', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledWith('test-outlet', 'product-uuid-1');
            expect(result.current.data).toEqual({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'product-uuid-1',
                },
            });
        });

        it('should handle toggle error', async () => {
            vi.mocked(LikeAPI.toggleLike).mockRejectedValue(new Error('Failed to toggle like'));

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Failed to toggle like');
        });

        it('should handle network error', async () => {
            vi.mocked(LikeAPI.toggleLike).mockRejectedValue(new Error('Network error'));

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Network error');
        });

        it('should handle empty outlet slug', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: '', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledWith('', 'product-uuid-1');
        });

        it('should handle empty product UUID', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: '',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: '' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledWith('test-outlet', '');
        });

        it('should handle special characters in outlet slug', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'café-123', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledWith('café-123', 'product-uuid-1');
        });

        it('should handle unicode characters in product UUID', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'uuid-🎉',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'uuid-🎉' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledWith('test-outlet', 'uuid-🎉');
        });

        it('should increment likes count', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 42,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.data?.likes_count).toBe(42);
        });

        it('should handle multiple toggle mutations', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });
            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-2' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledTimes(2);
        });

        it('should handle rapid toggle requests', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });
            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledTimes(2);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long outlet slug', async () => {
            const longSlug = 'a'.repeat(200);
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: longSlug, uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledWith(longSlug, 'product-uuid-1');
        });

        it('should handle very long product UUID', async () => {
            const longUuid = 'uuid-' + 'a'.repeat(200);
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 1,
                    product_uuid: longUuid,
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: longUuid });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(LikeAPI.toggleLike).toHaveBeenCalledWith('test-outlet', longUuid);
        });

        it('should handle zero likes count', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product unliked successfully',
                data: {
                    is_liked: false,
                    likes_count: 0,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.data?.likes_count).toBe(0);
        });

        it('should handle large likes count', async () => {
            vi.mocked(LikeAPI.toggleLike).mockResolvedValue({
                status: 'success',
                message: 'Product liked successfully',
                data: {
                    is_liked: true,
                    likes_count: 999999,
                    product_uuid: 'product-uuid-1',
                },
            });

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useToggleLikeMutation(), { wrapper: Wrapper });

            result.current.mutate({ outletSlug: 'test-outlet', uuidProduct: 'product-uuid-1' });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.data?.likes_count).toBe(999999);
        });
    });
});
