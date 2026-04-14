import { Navigate, useParams } from "react-router-dom";

import { SkeletonLoader } from "@/components/LoadingSpinner";
import { useQueryOutlet } from "@/features/outlets/hooks/api/useQueryOutlet";

interface ProtectedOutletRouteProps {
    children: React.ReactNode;
}

export const ProtectedOutletRoute: React.FC<ProtectedOutletRouteProps> = ({ children }) => {
    const { outletSlug } = useParams<{ outletSlug: string }>();
    const {
        data: outlet,
        isLoading,
        isError,
    } = useQueryOutlet(outletSlug);

    if (!outletSlug) {
        return <Navigate to="/onboard" replace />;
    }

    if (isLoading) {
        return <SkeletonLoader />;
    }

    if (isError || !outlet) {
        return <Navigate to="/onboard" replace />;
    }

    return <>{children}</>;
};