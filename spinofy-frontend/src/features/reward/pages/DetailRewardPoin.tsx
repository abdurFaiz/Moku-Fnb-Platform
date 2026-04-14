import { HeaderBar, ScreenWrapper } from "@/components";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation"
export default function DetailRewardPoin() {
    const { navigateToHome } = useOutletNavigation();

    return (
        <ScreenWrapper>
            <HeaderBar title="Detail Reward Poin" onBack={navigateToHome} showBack={true} />
            <div className="my-6 flex flex-col gap-6">
            
            </div>
        </ScreenWrapper>
    )
}