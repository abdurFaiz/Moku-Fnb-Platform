import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '../hooks/useFavorites';
import { useFavoritesStore } from '../stores/favoritesStore';
import type { FavoriteProduct } from '../stores/favoritesStore';

describe('useFavorites', () => {
    const mockProduct1: FavoriteProduct = {
        id: 'product-uuid-1',
        name: 'Product 1',
        price: 100,
        image: 'https://example.com/image1.jpg',
    };

    const mockProduct2: FavoriteProduct = {
        id: 'product-uuid-2',
        name: 'Product 2',
        price: 200,
        image: 'https://example.com/image2.jpg',
    };

    const mockProduct3: FavoriteProduct = {
        id: 'product-uuid-3',
        name: 'Product 3',
        price: 300,
        image: 'https://example.com/image3.jpg',
    };

    beforeEach(() => {
        // Reset store state before each test
        useFavoritesStore.setState({
            items: [],
        });
    });

    describe('Hook Integration', () => {
        it('should return favorites store methods', () => {
            const { result } = renderHook(() => useFavorites());

            expect(typeof result.current.addFavorite).toBe('function');
            expect(typeof result.current.removeFavorite).toBe('function');
            expect(typeof result.current.isFavorite).toBe('function');
            expect(typeof result.current.clearFavorites).toBe('function');
            expect(typeof result.current.getFavoriteCount).toBe('function');
        });

        it('should return favorites array', () => {
            const { result } = renderHook(() => useFavorites());

            expect(Array.isArray(result.current.items)).toBe(true);
        });
    });

    describe('Add Favorite', () => {
        it('should add favorite through hook', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
            });

            expect(result.current.isFavorite('product-uuid-1')).toBe(true);
        });

        it('should add multiple favorites', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.addFavorite(mockProduct2);
                result.current.addFavorite(mockProduct3);
            });

            expect(result.current.items.length).toBe(3);
            expect(result.current.isFavorite('product-uuid-1')).toBe(true);
            expect(result.current.isFavorite('product-uuid-2')).toBe(true);
            expect(result.current.isFavorite('product-uuid-3')).toBe(true);
        });

        it('should not add duplicate favorites', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.addFavorite(mockProduct1);
            });

            expect(result.current.items.length).toBe(1);
        });
    });

    describe('Remove Favorite', () => {
        it('should remove favorite through hook', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.removeFavorite('product-uuid-1');
            });

            expect(result.current.isFavorite('product-uuid-1')).toBe(false);
        });

        it('should remove one favorite without affecting others', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.addFavorite(mockProduct2);
                result.current.addFavorite(mockProduct3);
                result.current.removeFavorite('product-uuid-2');
            });

            expect(result.current.items.length).toBe(2);
            expect(result.current.isFavorite('product-uuid-1')).toBe(true);
            expect(result.current.isFavorite('product-uuid-2')).toBe(false);
            expect(result.current.isFavorite('product-uuid-3')).toBe(true);
        });

        it('should handle removing non-existent favorite', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.removeFavorite('non-existent-id');
            });

            expect(result.current.items.length).toBe(1);
        });
    });

    describe('Is Favorite', () => {
        it('should check if product is favorite', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
            });

            expect(result.current.isFavorite('product-uuid-1')).toBe(true);
            expect(result.current.isFavorite('product-uuid-2')).toBe(false);
        });

        it('should return false for non-existent favorite', () => {
            const { result } = renderHook(() => useFavorites());

            expect(result.current.isFavorite('product-uuid-999')).toBe(false);
        });

        it('should be case-sensitive', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite({
                    ...mockProduct1,
                    id: 'PRODUCT-UUID-1',
                });
            });

            expect(result.current.isFavorite('product-uuid-1')).toBe(false);
            expect(result.current.isFavorite('PRODUCT-UUID-1')).toBe(true);
        });
    });

    describe('Clear Favorites', () => {
        it('should clear all favorites', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.addFavorite(mockProduct2);
                result.current.addFavorite(mockProduct3);
                result.current.clearFavorites();
            });

            expect(result.current.items.length).toBe(0);
        });

        it('should allow adding favorites after clearing', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.clearFavorites();
                result.current.addFavorite(mockProduct2);
            });

            expect(result.current.items.length).toBe(1);
            expect(result.current.isFavorite('product-uuid-2')).toBe(true);
        });
    });

    describe('Get Favorite Count', () => {
        it('should return count of favorites', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.addFavorite(mockProduct2);
                result.current.addFavorite(mockProduct3);
            });

            expect(result.current.getFavoriteCount()).toBe(3);
        });

        it('should return zero when no favorites', () => {
            const { result } = renderHook(() => useFavorites());

            expect(result.current.getFavoriteCount()).toBe(0);
        });

        it('should update count after removal', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.addFavorite(mockProduct2);
            });

            expect(result.current.getFavoriteCount()).toBe(2);

            act(() => {
                result.current.removeFavorite('product-uuid-1');
            });

            expect(result.current.getFavoriteCount()).toBe(1);
        });
    });

    describe('Hook Reactivity', () => {
        it('should update when favorites change', () => {
            const { result, rerender } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
            });

            rerender();

            expect(result.current.isFavorite('product-uuid-1')).toBe(true);
        });

        it('should reflect store changes across multiple hook instances', () => {
            const { result: result1 } = renderHook(() => useFavorites());
            const { result: result2 } = renderHook(() => useFavorites());

            act(() => {
                result1.current.addFavorite(mockProduct1);
            });

            expect(result2.current.isFavorite('product-uuid-1')).toBe(true);
        });
    });

    describe('Complex Scenarios', () => {
        it('should handle rapid add/remove operations', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                for (let i = 0; i < 10; i++) {
                    result.current.addFavorite({
                        id: `product-uuid-${i}`,
                        name: `Product ${i}`,
                        price: i * 100,
                        image: `https://example.com/image${i}.jpg`,
                    });
                }
            });

            expect(result.current.getFavoriteCount()).toBe(10);

            act(() => {
                for (let i = 0; i < 5; i++) {
                    result.current.removeFavorite(`product-uuid-${i}`);
                }
            });

            expect(result.current.getFavoriteCount()).toBe(5);
        });

        it('should maintain consistency across operations', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite(mockProduct1);
                result.current.addFavorite(mockProduct2);
                result.current.addFavorite(mockProduct3);
            });

            expect(result.current.items.length).toBe(3);

            act(() => {
                result.current.removeFavorite('product-uuid-2');
            });

            expect(result.current.items.length).toBe(2);
            expect(result.current.isFavorite('product-uuid-2')).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in product ID', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite({
                    ...mockProduct1,
                    id: 'uuid-café-123',
                });
            });

            expect(result.current.isFavorite('uuid-café-123')).toBe(true);
        });

        it('should handle unicode characters', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite({
                    ...mockProduct1,
                    id: 'uuid-🎉-emoji',
                });
            });

            expect(result.current.isFavorite('uuid-🎉-emoji')).toBe(true);
        });

        it('should handle products with missing optional fields', () => {
            const { result } = renderHook(() => useFavorites());

            act(() => {
                result.current.addFavorite({
                    id: 'product-uuid-1',
                    name: 'Product 1',
                    price: 100,
                    image: 'https://example.com/image1.jpg',
                });
            });

            expect(result.current.isFavorite('product-uuid-1')).toBe(true);
        });
    });
});
