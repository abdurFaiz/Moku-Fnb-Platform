import { Pencil } from "lucide-react";

interface EditButtonProps {
    onClick: () => void;
    text?: string;
}

export function EditButton({ onClick, text = "Ubah" }: EditButtonProps) {
    return (
        <button
            onClick={onClick}
            className="flex cursor-pointer items-center gap-2 px-2 py-1.5 rounded-3xl bg-primary-orange/20 self-start"
        >
            <Pencil className="w-4 h-4" fill="#F35F0F" stroke="none" />
            <span className="text-xs font-rubik font-medium text-primary-orange capitalize">
                {text}
            </span>
        </button>
    );
}