interface CardImageProps {
    src: string;
    alt: string;
}

export function CardImage({ src, alt }: CardImageProps) {
    return (
        <div className="rounded-2xl overflow-hidden ">
            <img
                loading="lazy"
                src={src}
                alt={alt}
                className="size-20 object-cover"
            />
        </div>
    );
}