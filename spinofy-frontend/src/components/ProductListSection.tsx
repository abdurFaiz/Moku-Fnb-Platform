import { SubHeader } from "./SubHeader";
import { ProductRewardCard } from "../features/reward/components/ProductRewardCard";
import { VirtuosoGrid } from "react-virtuoso";
import { forwardRef } from "react";

interface ProductRewardCardProps {
    name: string;
    description?: string;
    image?: string;
    points: number;
    voucherId?: number;
    status: "active" | "expired";
    isDisabled?: boolean;
    pointBalance: number;
}

export type { ProductRewardCardProps };

interface ProductListSectionProps {
    title: string;
    products: ProductRewardCardProps[];
    totalItems: number;
    onProductClick?: (product: ProductRewardCardProps) => void;
}

export function ProductListSection({
    title,
    products,
    totalItems,
    onProductClick,
}: ProductListSectionProps) {

    function handleClickProduct(product: ProductRewardCardProps) {
        onProductClick?.(product);
    }

    return (
        <div className="flex px-4 flex-col gap-6 mb-6">
            <SubHeader title={title} totalItems={totalItems} />
            <VirtuosoGrid
                useWindowScroll
                data={products}
                overscan={200}
                computeItemKey={(index, product) => `${product.voucherId ?? index}-${index}`}
                components={{
                    List: forwardRef<HTMLDivElement>((props, ref) => (
                        <div {...props} ref={ref} className="grid grid-cols-2 gap-4" />
                    )),
                    Item: forwardRef<HTMLDivElement>((props, ref) => (
                        <div {...props} ref={ref} />
                    )),
                }}
                itemContent={(_, product) => (
                    <ProductRewardCard
                        onClaimClick={() => handleClickProduct(product)}
                        {...product}
                    />
                )}
            />
        </div>
    );
}