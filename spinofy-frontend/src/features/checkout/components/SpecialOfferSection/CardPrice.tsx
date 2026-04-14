interface CardPriceProps {
    price: number;
    locale?: string;
    currency?: string; 
}

export function CardPrice({ price, locale = "id-ID" }: CardPriceProps) {
    return (
        <span className="text-base font-rubik font-medium capitalize">
            Rp {price.toLocaleString(locale)}
        </span>
    );
}