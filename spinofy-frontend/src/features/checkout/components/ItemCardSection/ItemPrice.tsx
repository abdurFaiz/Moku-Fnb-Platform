interface ItemPriceProps {
    price: number;
}

export function ItemPrice({ price }: ItemPriceProps) {
    return (
        <span className="text-base font-rubik font-medium capitalize">
            Rp {price.toLocaleString('id-ID')}
        </span>
    );
}