
import { HeaderBar, ScreenWrapper, ProductRendererVerticalList } from "@/components";
import { useHomePage } from "@/features/storefront/hooks";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { useScrollToTop } from "@/hooks/shared/useScrollToTop";

export default function Recommend() {
    const { navigateToHome } = useOutletNavigation();
    const { products, handleProductClick } = useHomePage();

    useScrollToTop([products.recommendations]);

    return (
        <ScreenWrapper>
            <HeaderBar
                title="Rekomendasi Only For You"
                showBack={true}
                onBack={navigateToHome}
            />

            <div className="px-4 grid gap-4">
                <ProductRendererVerticalList
                    products={products.recommendations}
                    onProductClick={handleProductClick}
                    emptyState={{
                        title: "Recommendations",
                        type: "recommendations",
                        message: "Try selecting a different outlet to see recommended products"
                    }}
                />
            </div>
        </ScreenWrapper>
    );
}