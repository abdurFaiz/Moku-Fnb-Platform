import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';
import { isGuestUser, isRestrictedForGuest, getGuestHomeRoute, GUEST_RESTRICTION_MESSAGE } from '@/utils/guestRouteGuard';
import { toast } from 'sonner';
import { SkeletonLoader } from './LoadingSpinner';

interface ProtectedRouteProps {
    children: ReactNode;
    requireAuth?: boolean;
    outletSlug?: string;
    guestRestricted?: boolean;
}

export const ProtectedRoute = ({
    children,
    requireAuth = true,
    outletSlug,
    guestRestricted = true
}: ProtectedRouteProps) => {
    const { isAuthenticated, isLoading } = useAuthContext();
    const location = useLocation();

    // Show loading spinner while checking auth state
    if (isLoading) {
        return (
            <SkeletonLoader />
        );
    }

    // Check guest route restrictions first
    if (guestRestricted && isGuestUser() && isRestrictedForGuest(location.pathname)) {
        toast.error(GUEST_RESTRICTION_MESSAGE);
        return <Navigate to={getGuestHomeRoute(outletSlug)} replace />;
    }



    // If user is authenticated but trying to access auth pages, redirect to home
    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};