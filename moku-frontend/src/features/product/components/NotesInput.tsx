interface Props {
    value: string;
    onChange: (v: string) => void;
}

const MAX_CHARACTERS = 200;

export default function NotesInput({ value, onChange }: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        // Only update if the new value doesn't exceed max characters
        if (newValue.length <= MAX_CHARACTERS) {
            onChange(newValue);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium capitalize font-rubik text-title-black">
                    Notes
                </h2>

            </div>
            <div className="flex flex-col item-end justify-end gap-2">

                <textarea
                    value={value}
                    onChange={handleChange}
                    placeholder="Tambahan Catatan Disini"
                    maxLength={MAX_CHARACTERS}
                    className="w-full cursor-pointer h-[166px] px-4 py-4 rounded-3xl border border-title-black/20 bg-white text-base text-title-black placeholder:text-title-black resize-none focus:outline-none focus:ring-2 focus:ring-primary-orange/20"
                />
                <span className={`text-sm text-right font-rubik ${value.length >= MAX_CHARACTERS - 20 ? 'text-orange-500' : 'text-body-grey'}`}>
                    {value.length}/{MAX_CHARACTERS}
                </span>
            </div>
        </div>
    );
}
