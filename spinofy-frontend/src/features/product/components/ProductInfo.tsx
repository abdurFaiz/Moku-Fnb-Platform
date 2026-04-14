interface ProductInfoProps {
    title: string;
    description: string;
    price: number;
}

export function ProductInfo({ title, description, price }: ProductInfoProps) {
    return (
        <div className="flex flex-col gap-2">
            <div>
                <h1 className="text-xl font-medium font-rubik text-title capitalize">
                    {title}
                </h1>
                <p className="text-base text-body-grey font-rubik leading-normal wrap-break-word">
                    {description}
                </p>
            </div>
            <span className="text-lg font-rubik font-medium text-primary-orange">
                Rp {price.toLocaleString("id-ID")}
            </span>
        </div>
    );
}