import { Button } from "@/components"
import { FeedbackBottomSheet } from "./FeedbackBottomSheet"
import { useCallback, useState, useEffect } from "react"

export type FeedbackSectionProps = {
    visible?: boolean;
    onHide?: () => void;
}

export const FeedbackSection = ({ visible = true, onHide, }: FeedbackSectionProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [_isHidden, setIsHidden] = useState(false);

    // Check if feedback was already submitted on component mount
    useEffect(() => {
        const feedbackSubmitted = localStorage.getItem('feedbackSubmitted');
        if (feedbackSubmitted === 'true') {
            setIsHidden(true);
        }
    }, []);

    const handleCallFeedbackBottomSheet = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleFeedbackSuccess = useCallback(() => {
        setIsHidden(true);
        localStorage.setItem('feedbackSubmitted', 'true');
        onHide?.();
    }, [onHide]);

    if (!visible || _isHidden) {
        return null;
    }

    return (
        <div className="z-10 w-full max-w-[440px] mx-auto px-4">
            {/* Container with Shadow and Gradient */}
            <div className="relative bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl p-3.5 pl-3 shadow-orange-500/30 flex flex-row justify-between items-center border border-white/20 ">
                {/* Text Section */}
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-sm text-white font-medium tracking-wide">
                        Yuk kasih tau pendapat kamu🤗
                    </span>
                </div>

                {/* Button */}
                <Button
                    variant={"secondary"}
                    size={"sm"}
                    onClick={handleCallFeedbackBottomSheet}
                    className="bg-white text-orange-600 hover:bg-gray-100 rounded-full font-medium px-4 shadow-sm"
                >
                    Isi Disini Ya
                </Button>
            </div>

            <FeedbackBottomSheet
                open={isOpen}
                onOpenChange={setIsOpen}
                onSuccess={handleFeedbackSuccess}
            />
        </div>
    )
}

export default FeedbackSection;
