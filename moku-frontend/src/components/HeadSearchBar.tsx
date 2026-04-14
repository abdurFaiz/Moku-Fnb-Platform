import { ArrowLeft, Search } from "lucide-react";

interface HeaderSearchBarProps {
    placeholder?: string;
    onBack?: () => void;
    onSearch?: (value: string) => void;
}

const HeaderSearchBar = ({
    placeholder = "",
    onBack,
    onSearch,
}: HeaderSearchBarProps) => {
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value;
        onSearch?.(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch?.(e.target.value);
    };

    return (
        <div className="w-full p-4 bg-white shadow-sm flex items-center gap-3 rounded-b-2xl">
            {/* Back Button */}
            <button onClick={onBack} className="text-title-black">
                <ArrowLeft size={22} />
            </button>

            {/* Search Bar */}
            <form
                onSubmit={handleSearch}
                className="flex items-center w-full rounded-full border py-1 border-primary-orange overflow-hidden"
            >
                <input
                    type="text"
                    name="search"
                    placeholder={placeholder}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-2 outline-none text-sm font-rubik text-body-grey placeholder:text-body-grey"
                />
                <button
                    type="submit"
                    className="bg-primary-orange w-10 h-10 flex items-center justify-center rounded-full mr-1"
                >
                    <Search size={18} className="text-white" />
                </button>
            </form>
        </div>
    );
};

export default HeaderSearchBar;
