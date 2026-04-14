import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useProductDetail, useOutletList } from '../hooks/useProductDetail';
import { useQueryProductDetail } from '../hooks/api/useQueryProduct';
import { useOutlets } from '@/features/outlets/hooks/api/useQueryOutlet';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { mockProductDetailResponse } from './mockData';

// Mock dependencies
vi.mock('../hooks/api/useQueryProduct');
vi.mock('@/features/outlets/hooks/api/useQueryOutlet');
vi.mock('@/features/outlets/hooks/useOutletSlug');
vi.mock('@/features/outlets/stores/useOutletStore');

describe('useProductDetail', () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
        return wrapper;
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    describe('useProductDetail', () => {
        it('should fetch product detail successfully', async () => {
            const mockRefetch = vi.fn();
            vi.mocked(useQueryProductDetail).mockReturnValue({
                data: mockProductDetailResponse,
                isLoading: false,
                error: null,
                refetch: mockRefetch,
            } as any);

            const { result } = renderHook(
                () => useProductDetail('test-outlet', 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            expect(result.current.product).toEqual(mockProductDetailResponse.data.product);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.refetch).toBe(mockRefetch);
        });

        it('should handle loading state', () => {
            vi.mocked(useQueryProductDetail).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
                refetch: vi.fn(),
            } as any);

            const { result } = renderHook(
                () => useProductDetail('test-outlet', 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            expect(result.current.product).toBeUndefined();
            expect(result.current.isLoading).toBe(true);
        });

        it('should handle error state', () => {
            const mockError = new Error('Failed to fetch product');
            vi.mocked(useQueryProductDetail).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
                refetch: vi.fn(),
            } as any);

            const { result } = renderHook(
                () => useProductDetail('test-outlet', 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            expect(result.current.product).toBeUndefined();
            expect(result.current.error).toBe(mockError);
        });

        it('should handle null outletSlug', () => {
            vi.mocked(useQueryProductDetail).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            } as any);

            renderHook(
                () => useProductDetail(null, 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            expect(useQueryProductDetail).toHaveBeenCalledWith(null, 'product-uuid-1', expect.any(Object));
        });

        it('should handle null productIdentifier', () => {
            vi.mocked(useQueryProductDetail).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            } as any);

            renderHook(
                () => useProductDetail('test-outlet', null),
                { wrapper: createWrapper() }
            );

            expect(useQueryProductDetail).toHaveBeenCalledWith('test-outlet', null, expect.any(Object));
        });

        it('should handle undefined parameters', () => {
            vi.mocked(useQueryProductDetail).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            } as any);

            renderHook(
                () => useProductDetail(undefined, undefined),
                { wrapper: createWrapper() }
            );

            expect(useQueryProductDetail).toHaveBeenCalledWith(null, null, expect.any(Object));
        });

        it('should pass staleTime option to query', () => {
            vi.mocked(useQueryProductDetail).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: null,
                refetch: vi.fn(),
            } as any);

            renderHook(
                () => useProductDetail('test-outlet', 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            expect(useQueryProductDetail).toHaveBeenCalledWith(
                'test-outlet',
                'product-uuid-1',
                { staleTime: 5 * 60 * 1000 }
            );
        });
    });

    describe('useOutletList', () => {
        const mockOutlets = [
            { id: 1, slug: 'cafe-1', name: 'Cafe 1' } as any,
            { id: 2, slug: 'cafe-2', name: 'Cafe 2' } as any,
            { id: 3, slug: 'cafe-3', name: 'Cafe 3' } as any,
        ];

        beforeEach(() => {
            vi.mocked(useOutlets).mockReturnValue({
                data: mockOutlets,
                isLoading: false,
                error: null,
            } as any);
        });

        it('should use route slug when available', () => {
            vi.mocked(useOutletSlug).mockReturnValue('cafe-2');
            vi.mocked(useOutletStore).mockImplementation((selector: any) => selector({ outletSlug: undefined }));

            const { result } = renderHook(() => useOutletList());

            expect(result.current.outletSlug).toBe('cafe-2');
            expect(result.current.selectedOutlet).toEqual(mockOutlets[1]);
        });

        it('should use persisted slug when route slug not available', () => {
            vi.mocked(useOutletSlug).mockReturnValue(undefined);
            vi.mocked(useOutletStore).mockImplementation((selector: any) => selector({ outletSlug: 'cafe-3' }));

            const { result } = renderHook(() => useOutletList());

            expect(result.current.outletSlug).toBe('cafe-3');
            expect(result.current.selectedOutlet).toEqual(mockOutlets[2]);
        });

        it('should use first outlet when no slug available', () => {
            vi.mocked(useOutletSlug).mockReturnValue(undefined);
            vi.mocked(useOutletStore).mockImplementation((selector: any) => selector({ outletSlug: undefined }));

            const { result } = renderHook(() => useOutletList());

            expect(result.current.outletSlug).toBe('cafe-1');
            expect(result.current.selectedOutlet).toEqual(mockOutlets[0]);
        });

        it('should handle loading state', () => {
            vi.mocked(useOutlets).mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            } as any);

            const { result } = renderHook(() => useOutletList());

            expect(result.current.isLoading).toBe(true);
            expect(result.current.outletSlug).toBeUndefined();
            expect(result.current.selectedOutlet).toBeUndefined();
        });

        it('should handle error state', () => {
            const mockError = new Error('Failed to fetch outlets');
            vi.mocked(useOutlets).mockReturnValue({
                data: undefined,
                isLoading: false,
                error: mockError,
            } as any);

            const { result } = renderHook(() => useOutletList());

            expect(result.current.error).toBe(mockError);
        });

        it('should handle empty outlets array', () => {
            vi.mocked(useOutlets).mockReturnValue({
                data: [],
                isLoading: false,
                error: null,
            } as any);
            vi.mocked(useOutletSlug).mockReturnValue(undefined);
            vi.mocked(useOutletStore).mockImplementation((selector: any) => selector({ outletSlug: undefined }));

            const { result } = renderHook(() => useOutletList());

            expect(result.current.outletSlug).toBeUndefined();
            expect(result.current.selectedOutlet).toBeUndefined();
        });

        it('should handle non-existent route slug', () => {
            vi.mocked(useOutletSlug).mockReturnValue('non-existent');
            vi.mocked(useOutletStore).mockImplementation((selector: any) => selector({ outletSlug: undefined }));

            const { result } = renderHook(() => useOutletList());

            // Should not find outlet with non-existent slug
            expect(result.current.selectedOutlet).toBeUndefined();
            expect(result.current.outletSlug).toBeUndefined();
        });

        it('should prioritize route slug over persisted slug', () => {
            vi.mocked(useOutletSlug).mockReturnValue('cafe-1');
            vi.mocked(useOutletStore).mockImplementation((selector: any) => selector({ outletSlug: 'cafe-2' }));

            const { result } = renderHook(() => useOutletList());

            expect(result.current.outletSlug).toBe('cafe-1');
            expect(result.current.selectedOutlet).toEqual(mockOutlets[0]);
        });

        it('should pass staleTime option to useOutlets', () => {
            renderHook(() => useOutletList());

            expect(useOutlets).toHaveBeenCalledWith({
                staleTime: 10 * 60 * 1000,
            });
        });
    });
});
