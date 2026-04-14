import Button from "@/components/ui/button";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
interface AddMoreCardProps {
    onAddMore: () => void;
}

export function AddMoreCard({ onAddMore }: AddMoreCardProps) {
    const { navigateToHome } = useOutletNavigation();

    function handleAddMore() {
        onAddMore();
        navigateToHome();
    }
    return (
        <div className="flex justify-between items-center px-3 pt-3 border-t border-body-grey/25">
            <div className="flex flex-col gap-1 w-[260px]">
                <h3 className="text-base font-rubik font-medium capitalize">Kamu mau tambah pesanan lain?</h3>
                <p className="text-sm font-rubik text-body-grey capitalize">Bisa tambahin menu lainnya, ya🤗.</p>
            </div>
            <Button variant={"outline"} size={"sm"} onClick={handleAddMore} className="font-medium">Tambah</Button>
        </div>
    );
}