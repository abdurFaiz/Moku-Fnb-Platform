import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { WelcomeHero } from '@/features/onboard/components/WelcomeHero';
import { AuthButtonsSection } from '@/features/onboard/components/AuthButtonsSection';
import { OutletSelectionView } from '@/features/outlets/components/OutletSelectionView';
import { useWelcomePageState } from '@/features/onboard/hooks/useWelcomePageState';

export default function Welcome() {
  const {
    showOutletSelection,
    handleGoogleLogin,
    handleGuestLogin,
    hideOutletSelection,
    handleOutletSelect,
    isAuthProcessing,
    authError,
  } = useWelcomePageState();

  // Show outlet selection state
  if (showOutletSelection) {
    return (
      <ScreenWrapper>
        <OutletSelectionView
          onOutletSelect={handleOutletSelect}
          onBackClick={hideOutletSelection}
        />
      </ScreenWrapper>
    );
  }

  // Show welcome login state
  return (
    <ScreenWrapper>
      <WelcomeHero />
      <div className="flex-1 flex flex-col justify-between -mt-10 z-20 px-4">
        <AuthButtonsSection
          onGoogleClick={handleGoogleLogin}
          onGuestClick={handleGuestLogin}
          isProcessing={isAuthProcessing}
          errorMessage={authError}
        />
      </div>
    </ScreenWrapper>
  );
}