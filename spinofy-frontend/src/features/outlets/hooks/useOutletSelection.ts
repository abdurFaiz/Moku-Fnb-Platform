import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * Hook to manage outlet selection state and navigation
 */
export const useOutletSelection = () => {
    const navigate = useNavigate();
    const { outletSlug } = useParams<{ outletSlug: string }>();
    const [selectedOutletSlug, setSelectedOutletSlug] = useState<string | null>(
        outletSlug || null
    );

    // Update selected outlet when URL params change
    useEffect(() => {
        if (outletSlug !== selectedOutletSlug) {
            setSelectedOutletSlug(outletSlug || null);
        }
    }, [outletSlug, selectedOutletSlug]);

    const handleOutletChange = useCallback((slug: string) => {
        setSelectedOutletSlug(slug);

        // Update URL to reflect the selected outlet
        // Navigate to outlet-specific home page
        if (slug) {
            navigate(`/${slug}/home`, { replace: true });
        } else {
            navigate('/onboard', { replace: true });
        }
    }, [navigate]);

    const clearOutletSelection = useCallback(() => {
        setSelectedOutletSlug(null);
        navigate('/onboard', { replace: true });
    }, [navigate]);

    return {
        selectedOutletSlug,
        handleOutletChange,
        clearOutletSelection,
    };
};