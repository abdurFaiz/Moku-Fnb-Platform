import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCartStore } from '@/features/cart/stores/cartStore';
import type { Outlet, OutletTypeValues } from '@/features/outlets/types/Outlet';

interface OutletStore {
    currentOutlet: Outlet | null;
    outletSlug: string | null;
    outletType: OutletTypeValues | null;
    setCurrentOutlet: (outlet: Outlet) => void;
    syncOutletSlug: (slug: string | null) => void;
    clearCurrentOutlet: () => void;
    isOutletSelected: () => boolean;
    getOutletType: () => OutletTypeValues | null;
}

/**
 * Outlet store for managing user's selected outlet across the app
 */
export const useOutletStore = create<OutletStore>()(
    persist(
        (set, get) => ({
            currentOutlet: null,
            outletSlug: null,
            outletType: null,

            setCurrentOutlet: (outlet: Outlet) => {
                const previousSlug = get().outletSlug;

                if (previousSlug && previousSlug !== outlet.slug) {
                    useCartStore.getState().clearCart();
                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('currentOrderCode');
                    }
                }

                set({
                    currentOutlet: outlet,
                    outletSlug: outlet.slug,
                    outletType: outlet.type,
                });
            },

            syncOutletSlug: (slug: string | null) => {
                if (!slug) {
                    return;
                }

                const previousSlug = get().outletSlug;
                if (previousSlug === slug) {
                    return;
                }

                if (previousSlug && previousSlug !== slug) {
                    useCartStore.getState().clearCart();
                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('currentOrderCode');
                    }
                }

                set((state) => ({
                    currentOutlet: state.currentOutlet?.slug === slug ? state.currentOutlet : null,
                    outletSlug: slug,
                    outletType: state.currentOutlet?.slug === slug ? state.outletType : null,
                }));
            },

            clearCurrentOutlet: () => {
                useCartStore.getState().clearCart();
                if (typeof window !== 'undefined') {
                    window.localStorage.removeItem('currentOrderCode');
                }

                set({
                    currentOutlet: null,
                    outletSlug: null,
                    outletType: null,
                });
            },

            isOutletSelected: () => {
                return get().currentOutlet !== null;
            },

            getOutletType: () => {
                return get().outletType;
            },
        }),
        {
            name: 'outlet-storage',
            partialize: (state) => ({
                currentOutlet: state.currentOutlet,
                outletSlug: state.outletSlug,
                outletType: state.outletType,
            }),
        }
    )
);

export default useOutletStore;