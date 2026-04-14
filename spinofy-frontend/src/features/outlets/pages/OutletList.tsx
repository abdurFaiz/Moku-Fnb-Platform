import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { OutletSelectionView } from '@/features/outlets/components/OutletSelectionView';
import { useAuthContext } from '@/contexts/AuthContext';
import { useWelcomeOutletSelection } from '@/features/outlets/hooks/useWelcomeOutletSelection';
import { HeaderBar } from '@/components';
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";

export default function OutletSelectionPage() {
    const { navigateToAccount } = useOutletNavigation();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuthContext();
    const { handleOutletSelect } = useWelcomeOutletSelection();

    // Redirect non-authenticated users back to welcome
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/onboard', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    const handleBackClick = () => {
        navigate('/onboard', { replace: true });
    };

    return (
        <ScreenWrapper>
            <HeaderBar title='Outlet Tersedia' showBack={true} onBack={navigateToAccount} />
            <OutletSelectionView
                onOutletSelect={handleOutletSelect}
                onBackClick={handleBackClick}
            />
        </ScreenWrapper>
    );
}