import { Separator } from "@/components/Separator";
import { SubHeader } from "@/components/SubHeader";
import { ProductRenderer } from "@/features/storefront/components/ProductRenderer";
import { ProductContainer } from "../../product/components/ProductContainer";
import { ProductList } from "../../product/components/ProductList";
import type { HomeProduct } from "@/features/outlets/services/outletProductService";
import type { Category } from "@/features/product/types/Product";
import { useFavorites } from "@/features/storefront/hooks/useFavorites";
import { useToggleLikeMutation } from "@/features/storefront/hooks/api/useMutationLike";
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { toast } from 'sonner';
import { useCallback, useMemo } from "react";
import { DynamicProductOrganizer } from "@/features/product/services/dynamicProductOrganizer";

interface DynamicCategorySectionProps {
    category: Category;
    products: HomeProduct[];
    onProductClick: (productId: string) => void;
    onTambahClick?: (productId: string) => void;
    onIncrement?: (productId: string) => void;
    onDecrement?: (productId: string) => void;
    getCartQuantity?: (productId: string) => number;
    prioritizeFirst?: number;
}

export function DynamicCategorySection({
    category,
    products,
    onProductClick,
    onTambahClick,
    onIncrement,
    onDecrement,
    getCartQuantity,
    prioritizeFirst = 0,
}: Readonly<DynamicCategorySectionProps>) {
    const { addFavorite, removeFavorite, isFavorite, items: favoriteItems } = useFavorites();

    const favoriteIds = useMemo(() => favoriteItems.map(item => item.id), [favoriteItems]);

    // Handle favorite toggle (optimistic + server sync)
    const outletSlug = useOutletStore((s) => s.outletSlug);
    const toggleLike = useToggleLikeMutation();

    const handleToggleFavorite = useCallback((product: HomeProduct) => {
        const productId = product.id;
        const wasFavorite = isFavorite(productId);

        // Optimistic update to local favorites store
        if (wasFavorite) {
            removeFavorite(productId);
        } else {
            addFavorite({
                id: product.id,
                name: product.name,
                price: product.price as number,
                image: product.image,
                description: product.description,
            });
        }

        // If no outlet selected, just keep local change and skip server call
        if (!outletSlug) {
            return;
        }

        toggleLike.mutate(
            { outletSlug, uuidProduct: productId },
            {
                onError: (_err) => {
                    // rollback optimistic change
                    if (wasFavorite) {
                        addFavorite({
                            id: product.id,
                            name: product.name,
                            price: product.price as number,
                            image: product.image,
                            description: product.description,
                        });
                    } else {
                        removeFavorite(productId);
                    }

                    toast.error('Gagal mengubah favorite. Silakan coba lagi.');
                },
            }
        );
    }, [addFavorite, removeFavorite, isFavorite, outletSlug, toggleLike]);

    // Create section ID for scroll navigation using the centralized method
    const sectionId = useMemo(
        () => {
            const id = DynamicProductOrganizer.createSectionId(category.name);
            return id;
        },
        [category.name]
    );

    return (
        <>
            <ProductContainer id={sectionId}>
                <SubHeader
                    title={category.name}
                    totalItems={products.length}
                    divider={false}
                />
                <ProductList>
                    <ProductRenderer
                        products={products}
                        onProductClick={onProductClick}
                        onTambahClick={onTambahClick}
                        onIncrement={onIncrement}
                        onDecrement={onDecrement}
                        getCartQuantity={getCartQuantity}
                        onToggleFavorite={handleToggleFavorite}
                        showFavorite={true}
                        favoriteIds={favoriteIds}
                        variant="vertical"
                        containerClassName="grid grid-cols-1 gap-4"
                        showDescription={true}
                        emptyState={{
                            title: category.name,
                            type: "category",
                        }}
                        prioritizeFirst={prioritizeFirst}
                    />
                </ProductList>
            </ProductContainer>
            <Separator />
        </>
    );
}