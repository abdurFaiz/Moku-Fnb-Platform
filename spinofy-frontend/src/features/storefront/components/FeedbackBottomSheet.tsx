import { Button, Label, Textarea } from "@/components"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Switch } from "@/components/ui/switch"
import { EyeOffIcon } from "lucide-react"
import { useState, useCallback, useEffect } from "react"
import { useSubmitFeedback } from "@/features/storefront/hooks/api/useMutationFeedback"
import { useQueryFeedback, useGetAllFeedbackData } from "@/features/storefront/hooks/api/useQueryFeedback"
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug"
import type { FeedbackOption, FeedbackQuestion } from "@/features/storefront/types/Feedback"

interface FeedbackBottomSheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

// Emoticon mapping for feedback options
// const getEmoticonForOption = (option: string): string => {
//     const lowerOption = option.toLowerCase();

//     if (lowerOption.includes('sangat buruk')) return '😡';
//     if (lowerOption.includes('buruk')) return '😞';
//     if (lowerOption.includes('cukup')) return '😐';
//     if (lowerOption.includes('sangat baik')) return '😍';
//     if (lowerOption.includes('baik')) return '😊';

//     // Fallback based on common patterns
//     if (lowerOption.includes('sangat') && lowerOption.includes('tidak')) return '😡';
//     if (lowerOption.includes('tidak')) return '😞';
//     if (lowerOption.includes('biasa')) return '😐';
//     if (lowerOption.includes('sangat')) return '�';
//     if (lowerOption.includes('suka')) return '�';

//     return '🤔'; // Default emoticon
// };

interface FeedbackFormState {
    selectedOptions: Record<number, number>; // questionId -> optionId
    comments: Record<number, string>; // questionId -> comment
    hideMyName: boolean;
}

export const FeedbackBottomSheet = ({ open, onOpenChange, onSuccess }: FeedbackBottomSheetProps) => {
    const outletSlug = useOutletSlug();

    const [formState, setFormState] = useState<FeedbackFormState>({
        selectedOptions: {},
        comments: {},
        hideMyName: false,
    });

    // First, fetch all feedback to get the UUID
    const { data: allFeedbackData, isLoading: isLoadingUuid } = useGetAllFeedbackData(
        outletSlug,
        {
            enabled: !!outletSlug && open,
        }
    );

    const uuid = allFeedbackData?.data?.feedback?.uuid;

    // Then fetch specific feedback details using the UUID
    const { data: feedbackData, isLoading: isLoadingFeedback, error } = useQueryFeedback(
        outletSlug,
        uuid,
        {
            enabled: !!outletSlug && !!uuid && open,
        }
    );

    const isLoading = isLoadingUuid || isLoadingFeedback;

    // Submit feedback mutation
    const { submitFeedback, isLoading: isSubmitting, isSuccess } = useSubmitFeedback(
        outletSlug || '',
        uuid || ''
    );

    const handleOptionSelect = useCallback((questionId: number, optionId: number) => {
        setFormState(prev => ({
            ...prev,
            selectedOptions: {
                ...prev.selectedOptions,
                [questionId]: optionId,
            },
        }));
    }, []);

    const handleCommentChange = useCallback((questionId: number, comment: string) => {
        setFormState(prev => ({
            ...prev,
            comments: {
                ...prev.comments,
                [questionId]: comment,
            },
        }));
    }, []);

    const handleSubmit = useCallback(() => {
        if (!feedbackData?.data?.feedback?.questions) return;

        // Prepare payload
        const selectedOptionIds = Object.values(formState.selectedOptions);
        const comments = feedbackData.data.feedback.questions.map((question: FeedbackQuestion) =>
            formState.comments[question.id] || ''
        );

        submitFeedback({
            feedback_option_question_id: selectedOptionIds,
            comment: comments,
            is_anonymous: formState.hideMyName ? 1 : 0,
        });
    }, [feedbackData, formState, submitFeedback]);

    const handleClose = useCallback(() => {
        // Mark feedback as skipped/submitted so it won't show again
        localStorage.setItem('feedbackSubmitted', 'true');
        localStorage.setItem('feedbackToastDismissed', 'true');

        onOpenChange?.(false);
        onSuccess?.(); // Call onSuccess to hide the FeedbackSection

        setFormState({
            selectedOptions: {},
            comments: {},
            hideMyName: false,
        });
    }, [onOpenChange, onSuccess]);

    // Reset form when opening
    useEffect(() => {
        if (open) {
            setFormState({
                selectedOptions: {},
                comments: {},
                hideMyName: false,
            });
        }
    }, [open]);

    // Close on success
    useEffect(() => {
        if (isSuccess) {
            // Store feedback success in localStorage
            localStorage.setItem('feedbackSubmitted', 'true');

            // Call onSuccess callback
            onSuccess?.();

            setTimeout(() => {
                handleClose();
            }, 2000);
        }
    }, [isSuccess, handleClose, onSuccess]);

    const feedback = feedbackData?.data?.feedback;
    const canSubmit = feedback?.questions?.every((question: FeedbackQuestion) =>
        formState.selectedOptions[question.id] !== undefined
    ) || false;

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-w-[440px] mx-auto max-h-[90vh]">
                <DrawerClose />
                <DrawerHeader className="pb-4">
                    <DrawerTitle>
                        <h2 className="font-rubik text-lg font-medium text-title-black">
                            {isSuccess ? 'Terima Kasih! 🎉' : 'Bagikan Pengalaman Kamu Yuk!'}
                        </h2>
                    </DrawerTitle>
                    <DrawerDescription>
                        <p className="font-rubik text-sm text-body-grey">
                            {isSuccess
                                ? 'Feedback kamu sangat berharga untuk kami'
                                : 'Pendapat Kamu Bantu kami melayani lebih baik.'
                            }
                        </p>
                    </DrawerDescription>
                </DrawerHeader>

                <div className="flex-1 overflow-y-auto px-4">
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange mx-auto mb-4"></div>
                                <p className="text-body-grey text-sm">Memuat feedback...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <p className="text-red-500 text-sm mb-4">Gagal memuat feedback</p>
                                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                                    Coba Lagi
                                </Button>
                            </div>
                        </div>
                    )}

                    {isSuccess && (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                                <div className="text-6xl mb-4">🎉</div>
                                <p className="text-body-grey text-sm">
                                    Feedback berhasil dikirim!
                                </p>
                            </div>
                        </div>
                    )}

                    {feedback && feedback.questions && !isSuccess && (
                        <div className="space-y-6 pb-4">
                            {feedback.questions.map((question: FeedbackQuestion) => (
                                <div key={question.id} className="space-y-3">
                                    <h3 className="text-sm font-medium text-title-black">
                                        {question.question}
                                    </h3>

                                    {/* Options */}
                                    <div className="grid grid-cols-5 gap-2 pb-2">
                                        {question.options?.map((option: FeedbackOption) => {
                                            const isSelected = formState.selectedOptions[question.id] === option.id;
                                            // const emoticon = getEmoticonForOption(option.option);

                                            return (
                                                <button
                                                    key={option.id}
                                                    onClick={() => handleOptionSelect(question.id, option.id)}
                                                    className={`
                                                        flex flex-col items-center p-2 rounded-lg border-2 transition-all
                                                        ${isSelected
                                                            ? 'border-primary-orange bg-primary-orange/10'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                        }
                                                    `}
                                                >
                                                    {/* <span className="text-xl mb-1">{emoticon}</span> */}
                                                    <span className={`
                                                        text-[10px] text-center leading-tight
                                                        ${isSelected ? 'text-primary-orange font-medium' : 'text-body-grey'}
                                                    `}>
                                                        {option.option}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Comment for this question */}
                                    <div className="flex flex-col gap-3">
                                        <Label>Spill pengalaman lebih lengkap nya dong 👇</Label>
                                        <div className="flex flex-col gap-1">
                                            <Textarea
                                                placeholder={`Ceritakan lebih detail...`}
                                                value={formState.comments[question.id] || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value.length <= 2000) {
                                                        handleCommentChange(question.id, value);
                                                    }
                                                }}
                                                className="min-h-[80px] resize-none rounded-xl text-sm"
                                                maxLength={2000}
                                            />
                                            <div className="flex justify-end">
                                                <span className={`text-xs ${(formState.comments[question.id] || '').length > 1800
                                                    ? 'text-red-500'
                                                    : 'text-body-grey'
                                                    }`}>
                                                    {(formState.comments[question.id] || '').length}/2000
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {feedback && feedback.questions && !isSuccess && (
                    <DrawerFooter className="pt-4">
                        <div className="flex flex-col gap-3">
                            {/* Privacy Option */}
                            <div className={`flex flex-row justify-between items-center rounded-full p-1 border transition-colors ${formState.hideMyName
                                ? 'border-primary-orange bg-primary-orange/15'
                                : 'border-neutral-200 bg-neutral-100'
                                }`}>
                                <div className="flex flex-row gap-2 pl-2 py-1.5 items-center">
                                    <EyeOffIcon className={`size-4 ${formState.hideMyName
                                        ? 'text-primary-orange'
                                        : 'text-title-black'
                                        }`} />
                                    <span className={`text-xs font-medium ${formState.hideMyName
                                        ? 'text-primary-orange'
                                        : 'text-body-grey'
                                        }`}>
                                        Sembunyikan nama saya
                                    </span>
                                </div>
                                <Switch
                                    checked={formState.hideMyName}
                                    onCheckedChange={(checked) =>
                                        setFormState(prev => ({ ...prev, hideMyName: checked }))
                                    }
                                    className="data-[state=checked]:bg-primary-orange data-[state=unchecked]:bg-gray-200"
                                />
                            </div>
                            <div className="flex flex-row gap-3 items-center justify-center w-full">

                                {/* Skip Button */}
                                <Button
                                    variant={"outline"}
                                    size={"lg"}
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                    className="w-full"
                                >
                                    Skip, dulu deh
                                </Button>
                                {/* Submit Button */}

                                <Button
                                    variant={"primary"}
                                    size={"lg"}
                                    onClick={handleSubmit}
                                    disabled={!canSubmit || isSubmitting}
                                    className="w-full"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Mengirim...
                                        </div>
                                    ) : (
                                        'Kirim Feedback'
                                    )}
                                </Button>

                            </div>
                        </div>
                    </DrawerFooter>
                )}
            </DrawerContent>
        </Drawer>
    )
}

export default FeedbackBottomSheet;
