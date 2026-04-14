import { Plus } from "lucide-react";

interface AddButtonProps {
    onClick: () => void;
    /**
     * Optional accessibility label.
     */
    'aria-label'?: string;
}

export function AddButton({ onClick, 'aria-label': ariaLabel = "Add to cart" }: AddButtonProps) {
    return (
        <button
            onClick={onClick}
            aria-label={ariaLabel}
            className="p-1 mr-2 rounded-full h-fit bg-primary-orange transition-opacity hover:opacity-80"
        >
            <Plus className="w-6 h-6 text-white" strokeWidth={2} />
        </button>
    );
}