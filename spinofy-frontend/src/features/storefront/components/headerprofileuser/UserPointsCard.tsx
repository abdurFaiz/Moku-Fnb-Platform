import { ChevronRight } from "lucide-react";
import { UserHeaderTop } from "./UserHeaderTop";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

interface UserPointsCardProps {
    name: string;
    vouchers: number;
    points: number;
    onClickRedeem?: () => void;
}

export function UserPointsCard({
    name,
    vouchers,
    points,
}: UserPointsCardProps) {
    const { navigateToRewardPoin } = useOutletNavigation();
    return (
        <div className="px-4 mt-4 relative z-10">
            <div className="p-4 rounded-3xl border border-body-grey/15 bg-white shadow-2xs">

                <UserHeaderTop name={name} vouchers={vouchers} points={points} />

                <div className="relative"
                >
                    <button
                        onClick={navigateToRewardPoin}
                        className="flex cursor-pointer relative overflow-hidden bg-linear-to-r from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300 items-center justify-between w-full py-3 px-4 rounded-full transition-all duration-300"
                    >
                        <span className="text-sm font-medium text-primary-orange font-rubik">
                            Gunakan poin untuk reward menarik
                        </span>
                        <ChevronRight className="w-5 h-5 text-primary-orange font-rubik" />
                        <DotPattern width={14}
                            height={14}
                            cx={2}
                            cy={2}
                            cr={2}
                            className={cn(
                                "[mask:linear-gradient(to_bottom_left,white,transparent,transparent)] absolute top-0 right-0 text-primary-orange/20",
                            )} />

                    </button>
                    <img src="../images/lightning-yellow.png" alt="" className="size-10 absolute -top-2 -left-4 -rotate-12" />
                </div>
            </div>
        </div>
    );
}