import Button from "@/components/ui/button";

interface BottomAction {
    label: string;
    onClick?: () => void;
    variant?: "primary" | "outline";
    size?: "lg";
}

interface BottomActionSectionProps {
    actions: BottomAction[];
}

export const BottomActionSection: React.FC<BottomActionSectionProps> = ({ actions }) => {
    const isSingleAction = actions.length === 1;

    return (
        <div className="mt-auto">
            <div
                className={`flex ${isSingleAction ? 'flex-col' : 'flex-row'} items-stretch gap-4 p-4 bg-white rounded-t-3xl shadow-[0_-4px_8px_0_rgba(128,128,128,0.16)]`}
            >
                {actions.map((action, index) => (
                    <Button
                        key={index}
                        className={isSingleAction ? 'w-full' : 'flex-1'}
                        variant={action.variant}
                        onClick={action.onClick}
                        size="lg"
                    >
                        {action.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};