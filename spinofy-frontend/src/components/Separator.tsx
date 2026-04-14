interface SeparatorProps {
    height?: string; 
    className?: string;
}

export const Separator = ({ height = "h-1", className = "" }: SeparatorProps) => {
    return (
        <div className={`${height} bg-body-grey/15 ${className}`}></div>
    );
};
