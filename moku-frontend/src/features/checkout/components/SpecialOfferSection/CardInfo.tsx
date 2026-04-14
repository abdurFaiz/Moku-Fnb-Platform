interface CardInfoProps {
    name: string;
    description: string;
}

export function CardInfo({ name, description }: CardInfoProps) {
    return (
        <div className="flex flex-col gap-1 flex-1 min-w-0 max-w-[170px]">
            <h2 className="text-base font-rubik font-medium text-title-black line-clamp-1 text-ellipsis capitalize">{name}</h2>
            <p className="text-sm font-rubik text-body-grey capitalize leading-normal line-clamp-1 overflow-hidden whitespace-normal wrap-break-word">
                {description}
            </p>
        </div>
    );
}