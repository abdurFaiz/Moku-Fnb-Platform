import { useFavoritesStore } from "@/features/storefront/stores/favoritesStore";

export function useFavorites() {
    return useFavoritesStore();
}
