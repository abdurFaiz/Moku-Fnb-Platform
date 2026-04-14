interface SubHeaderProps {
    title: string;
    totalItems?: number;
    link?: string;
    url?: () => void;
    divider?: boolean;
}
export const SubHeader: React.FC<SubHeaderProps> = ({ title, totalItems, link, url, divider = true }) => {
    return (
        <div className={`flex justify-between items-center px-4 ${divider ? 'pb-4 border-b border-body-grey/25' : ''}`}>
            <h3 className="text-base font-rubik font-medium capitalize">{title}</h3>
            {totalItems && <p className="text-sm font-rubik capitalize">{totalItems} Item</p>}
            {link && <button className="cursor-pointer text-xs text-primary-orange capitalize" onClick={url} onKeyDown={(e) => e.key === 'Enter' && url?.()} tabIndex={0} aria-label={`See all ${title}`}>{link} {url && ""}</button>}
        </div>
    );
};