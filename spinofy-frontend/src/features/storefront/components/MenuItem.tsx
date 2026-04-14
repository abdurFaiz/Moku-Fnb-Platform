import { X } from "lucide-react";

interface CategoryItem {
    name: string;
    count: number;
}

export default function MenuItem({ items, onClose, activeItem, onItemSelect }: Readonly<{
    items: CategoryItem[],
    onClose: () => void,
    activeItem: string,
    onItemSelect: (item: string) => void
}>) {
    const handleSelect = (itemName: string) => {
        onItemSelect(itemName);
        onClose();
    }; return (
        <div className="max-w-[440px] mx-auto z-9999 bg-white rounded-t-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-title-black">Pilih Menu</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-primary-orange/10 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-body-grey" />
                </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {items.map((item, index) => (
                    <button
                        key={`${item.name}-${index}`}
                        onClick={() => handleSelect(item.name)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${activeItem === item.name
                            ? 'bg-primary-orange/25'
                            : 'bg-white/60 hover:bg-white/80'
                            }`}
                    >
                        <span className={`text-gray-700 ${activeItem === item.name ? 'font-medium text-primary-orange' : 'font-normal'}`}>{item.name}</span>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${activeItem === item.name ? 'bg-white text-primary-orange font font-medium' : 'bg-gray-200 text-body-grey '}`}>
                            {item.count}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}