import { cn } from "@/lib/utils";

interface Tab {
    readonly id: string;
    readonly label: string;
}

interface TabFilterProps {
    readonly tabs: Tab[];
    readonly activeTab: string;
    readonly onChange: (tabId: string) => void;
}

export function TabFilter({ tabs, activeTab, onChange }: TabFilterProps) {
    return (
        <div className="flex items-center">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "flex-1 py-4 text-base font-medium capitalize transition-all",
                        "border-b-2",
                        activeTab === tab.id
                            ? "border-primary-orange text-primary-orange"
                            : "border-transparent text-body-grey hover:text-body-grey/80"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
