import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useOutletStore } from '../stores/useOutletStore';

/**
 * Hook to get the outlet slug from the URL parameters
 * @returns The outlet slug from the current route
 */
export const useOutletSlug = () => {
    const { outletSlug } = useParams<{ outletSlug: string }>();
    const persistedSlug = useOutletStore((state) => state.outletSlug);
    const syncOutletSlug = useOutletStore((state) => state.syncOutletSlug);

    useEffect(() => {
        if (outletSlug) {
            syncOutletSlug(outletSlug);
        }
    }, [outletSlug, syncOutletSlug]);

    return outletSlug ?? persistedSlug ?? undefined;
};