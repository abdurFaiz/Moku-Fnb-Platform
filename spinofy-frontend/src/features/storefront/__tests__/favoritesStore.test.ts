import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoritesStore } from '../stores/favoritesStore';

describe('useFavoritesStore', () => {
    beforeEach(() => {
        useFavoritesStore.setState({
            items: [],
        });
    });

    const mockProduct1 = {
        id: 'product-uuid-1',
        name: 'Product 1',
        price: 10000,
        image: 'image1.jpg',
    };

    const mockProduct2 = {
        id: 'product-uuid-2',
        name: 'Product 2',
        price: 20000,
        image: 'image2.jpg',
    };

    describe('Initial State', () => {
        it('should initialize with empty items array', () => {
            const store = useFavoritesStore.getState();
            expect(store.items).toEqual([]);
            expect(store.getFavoriteCount()).toBe(0);
        });
    });

    describe('Add Favorite', () => {
        it('should add a single favorite', () => {
            const store = useFavoritesStore.getState();
            store.addFavorite(mockProduct1);

            expect(store.items).toHaveLength(1);
            expect(store.items[0]).toEqual(mockProduct1);
            expect(store.isFavorite(mockProduct1.id)).toBe(true);
        });

        it('should not add duplicate favorites', () => {
            const store = useFavoritesStore.getState();
            store.addFavorite(mockProduct1);
            store.addFavorite(mockProduct1);

            expect(store.items).toHaveLength(1);
        });
    });

    describe('Remove Favorite', () => {
        it('should remove a favorite', () => {
            const store = useFavoritesStore.getState();
            store.addFavorite(mockProduct1);

            store.removeFavorite(mockProduct1.id);

            expect(store.items).toHaveLength(0);
            expect(store.isFavorite(mockProduct1.id)).toBe(false);
        });
    });

    describe('Clear Favorites', () => {
        it('should clear all favorites', () => {
            const store = useFavoritesStore.getState();
            store.addFavorite(mockProduct1);
            store.addFavorite(mockProduct2);

            store.clearFavorites();

            expect(store.items).toHaveLength(0);
        });
    });
});
