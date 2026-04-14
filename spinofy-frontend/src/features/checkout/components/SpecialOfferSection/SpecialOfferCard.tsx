import type { SpecialOffer } from "@/features/checkout/types/SpecialOffer";
import { Card } from "./WrapperCard";
import { AddButton } from "./AddButton";
import { CardImage } from "./CardImage";
import { CardInfo } from "./CardInfo";
import { CardPrice } from "./CardPrice";

interface SpecialOfferCardProps {
    offer: SpecialOffer;
    onAdd: () => void;
}

export function SpecialOfferCard({ offer, onAdd }: SpecialOfferCardProps) {
    return (
        <Card className="shrink-0 w-[260px] justify-center items-center flex gap-3 relative">
            <CardImage src={offer.image} alt={offer.name} />

            <div className="flex flex-col h-full gap-2 flex-1 ">
                <CardInfo name={offer.name} description={offer.description} />

                <div className="flex justify-between items-center mt-auto">
                    <CardPrice price={offer.price} />
                </div>
            </div>
            <AddButton onClick={onAdd} aria-label={`Add ${offer.name} to cart`} />
        </Card>
    );
}