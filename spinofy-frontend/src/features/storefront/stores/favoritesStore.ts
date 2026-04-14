import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface FavoriteProduct {
    id: string;
    name: string;
    price: number;
    image: string;
    description?: string;
}

interface FavoritesStore {
    items: FavoriteProduct[];
    addFavorite: (product: FavoriteProduct) => void;
    removeFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
    clearFavorites: () => void;
    getFavoriteCount: () => number;
}

export const useFavoritesStore = create<FavoritesStore>()(
    persist(
        (set, get) => ({
            items: [],

            addFavorite: (product) =>
                set((state) => {
                    const exists = state.items.some((item) => item.id === product.id);
                    if (exists) return state;
                    return { items: [...state.items, product] };
                }),

            removeFavorite: (productId) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== productId),
                })),

            isFavorite: (productId) => {
                return get().items.some((item) => item.id === productId);
            },

            clearFavorites: () => set({ items: [] }),

            getFavoriteCount: () => get().items.length,
        }),
        {
            name: "favorites-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
