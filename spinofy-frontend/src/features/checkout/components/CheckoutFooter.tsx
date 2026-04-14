import Button from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface CheckoutFooterProps {
    summary: {
        total: number;
        originalTotal: number;
        savings: number;
    };
    onSubmit: () => void;
    /** When true the footer will call `onBlockedSubmit` instead of `onSubmit` */
    isBlocked?: boolean;
    /** Called when the user tries to submit but checkout is blocked (eg. unpaid order) */
    onBlockedSubmit?: () => void;
    isLoading?: boolean;
}

export function CheckoutFooter({ summary, onSubmit, isBlocked = false, onBlockedSubmit, isLoading = false }: CheckoutFooterProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 max-w-[440px] z-50 mx-auto w-full flex flex-col rounded-t-3xl bg-white shadow-[0_-4px_8px_0_rgba(128,128,128,0.20)]">
            <div className="px-4 py-4 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2 w-fit">
                        <h3 className="text-base font-rubik font-medium capitalize">Total</h3>
                        {summary.savings > 0 && (
                            <p className="text-xs font-rubik text-light-green capitalize">Yeay!, kamu hemat Rp {summary.savings.toLocaleString('id-ID')} </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 items-end w-fit">
                        <span className="text-base font-rubik font-medium capitalize">Rp {summary.total.toLocaleString('id-ID')}</span>
                        {summary.savings > 0 && (
                            <span className="text-sm font-rubik text-body-grey line-through capitalize">Rp {summary.originalTotal.toLocaleString('id-ID')}</span>
                        )}
                    </div>
                </div>
                <Button
                    variant={"primary"}
                    size={"lg"}
                    className={`w-full ${isBlocked ? "bg-body-grey hover:bg-body-grey cursor-not-allowed text-white" : ""}`}
                    // keep the element interactive so blocked flow (modal) can be triggered
                    aria-disabled={isBlocked || isLoading}
                    disabled={isLoading}
                    onClick={() => {
                        if (isLoading) return;

                        if (isBlocked) {
                            if (typeof onBlockedSubmit === 'function') {
                                onBlockedSubmit();
                            }
                            return;
                        }

                        onSubmit();
                    }}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <Spinner className="text-white" />
                            <span>Memproses...</span>
                        </div>
                    ) : (
                        "Pesan Sekarang"
                    )}
                </Button>
            </div>
        </div>
    );
}