import { HeaderBar, ScreenWrapper } from "@/components";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { useFavorites } from "@/features/storefront/hooks/useFavorites";
import { useToggleLikeMutation } from '@/features/storefront/hooks/api/useMutationLike';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { ProductCard } from "@/features/storefront/components/ProductItem";


export default function Favorite() {
    const { navigateToHome } = useOutletNavigation();
    const { items: favoriteProducts, removeFavorite, isFavorite, addFavorite } = useFavorites();

    const outletSlug = useOutletStore((s) => s.outletSlug);
    const toggleLike = useToggleLikeMutation();

    const handleToggleFavorite = (productId: string) => {
        // optimistic remove
        removeFavorite(productId);

        if (!outletSlug) {
            return;
        }

        toggleLike.mutate({ outletSlug, uuidProduct: productId }, {
            onError: () => {
                // rollback
                const product = favoriteProducts.find((p) => p.id === productId);
                if (product) {
                    // Re-add back
                    // NOTE: product.price is number as stored in favorites
                    addFavorite?.(product as any);
                }
            },
        });
    };

    return (
        <ScreenWrapper className="min-h-screen">
            <HeaderBar title="Favorite" showBack={true} onBack={navigateToHome} />
            <div className="mt-6 grid grid-cols-1 gap-4 mx-4">
                {favoriteProducts.length > 0 ? (
                    favoriteProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            name={product.name}
                            price={product.price}
                            image={product.image}
                            isFavorite={isFavorite(product.id)}
                            onToggleFavorite={() => handleToggleFavorite(product.id)}
                        />
                    ))
                ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center py-12">
                        <p className="text-gray-500 font-rubik text-center">No favorite products yet</p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    )
}