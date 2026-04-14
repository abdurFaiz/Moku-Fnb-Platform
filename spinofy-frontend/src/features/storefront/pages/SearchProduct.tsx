import { HeaderSearchBar, ScreenWrapper } from "@/components";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { useScrollToTop } from "@/hooks/shared/useScrollToTop";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";
import { useMemo, useState, useEffect } from "react";
import type { Product } from "@/features/product/types/Product";
import { Binoculars, PackageSearch, ShoppingCart, Flame } from "lucide-react";
import { isGuestUser, GUEST_CART_RESTRICTION_MESSAGE } from "@/utils/guestRouteGuard";
import { toast } from "sonner";
import { useQuerySearchProduct } from "@/features/storefront/hooks/api/useQuerySearchProduct";



// Helper function to format price in Indonesian format
const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === 'string' ? Number.parseFloat(price) : price;
    if (Number.isNaN(numPrice)) return 'Rp 0,00';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numPrice);
};

export default function SearchProduct() {
    const { navigateToHome } = useOutletNavigation();
    const outletSlug = useOutletSlug();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const isGuest = isGuestUser();

    useScrollToTop();

    // Debounce search query - wait 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only update debounced query if it meets minimum length or is empty
            const trimmed = searchQuery.trim();
            if (trimmed.length === 0 || trimmed.length >= 4) {
                setDebouncedQuery(searchQuery);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch search results using API
    const { data: searchResults, isLoading, error } = useQuerySearchProduct(
        outletSlug ?? null,
        debouncedQuery,
        {
            enabled: !!outletSlug,
            retry: 2,
        }
    );

    // Extract products from search results (ProductSearch is already a product)
    const products: Product[] = useMemo(() => {
        if (!searchResults || !Array.isArray(searchResults)) return [];
        return searchResults as Product[];
    }, [searchResults]);

    // Determine if we're in search mode (user has typed something)
    const isSearching = debouncedQuery.trim().length > 0;

    // Show typing indicator when user is typing but debounce hasn't triggered yet
    const isTyping = searchQuery.trim().length > 0 && searchQuery !== debouncedQuery;

    // Get display products based on search state
    const displayProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];

        // If searching, show all results from API
        if (isSearching) {
            return products;
        }

        // If not searching, show first 6 as default/popular products
        return products.slice(0, 6);
    }, [products, isSearching]);

    // Handle search input
    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    // Handle navigate to detail item
    const handleViewDetails = (product: Product) => {
        if (isGuest) {
            toast.error(GUEST_CART_RESTRICTION_MESSAGE);
            return;
        }
        globalThis.location.href = `/${outletSlug}/detail-item?uuid=${product.uuid}`;
    };

    const ProductCard = ({ product }: { product: Product }) => (
        <div
            className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-3">
                {/* Product image */}
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                        loading="lazy"
                        src={product.image_url || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Product info */}
                <div className="flex-1 items-center min-w-0">
                    <h3 className="font-medium text-title-black truncate">
                        {product.name}
                    </h3>

                    {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {product.description}
                        </p>
                    )}

                    {/* Price and Cart Button */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="text-sm font-medium text-green-600">
                            {formatPrice(product.price)}
                        </div>
                        <button
                            onClick={() => handleViewDetails(product)}
                            disabled={isGuest}
                            className={`flex items-center h-fit gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${isGuest
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                                : 'bg-primary-orange text-white hover:bg-orange-600'
                                }`}
                            title={isGuest ? GUEST_CART_RESTRICTION_MESSAGE : undefined}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {isGuest ? 'Login' : 'Add'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) {
        return (
            <ScreenWrapper>
                <HeaderSearchBar
                    placeholder="Cari produk berdasarkan nama, deskripsi, outlet, kategori"
                    onBack={() => navigateToHome()}
                    onSearch={handleSearch}
                />
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-red-500">Error: {error?.message || 'Terjadi kesalahan'}</div>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <HeaderSearchBar
                placeholder="Cari produk berdasarkan nama, deskripsi, outlet, kategori"
                onBack={() => navigateToHome()}
                onSearch={handleSearch}
            />

            <div className="px-4 pt-6 pb-4 mb-20">
                {/* Loading state */}
                {(isLoading || isTyping) && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-gray-600">
                            {searchQuery.trim() ? 'Sedang mencari...' : 'Memuat produk...'}
                        </div>
                    </div>
                )}

                {/* Header section with search info or popular label */}
                {!isLoading && !isTyping && displayProducts.length > 0 && (
                    <>
                        {isSearching ? (
                            <div className="mb-4 text-sm text-gray-600">
                                Ditemukan <span className="font-semibold">{displayProducts.length}</span> produk
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-full bg-orange-50">
                                    <Flame className="w-5 h-5 text-primary-orange" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-title-black">Produk Populer</p>
                                    <p className="text-xs text-gray-500">Dicari dan disukai banyak orang 😍</p>
                                </div>
                            </div>
                        )}

                        {/* Products list */}
                        <div className="space-y-3">
                            {displayProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Empty search result */}
                {!isLoading && !isTyping && isSearching && displayProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-2xl mb-2"><Binoculars className="size-8 text-gray-400" /></div>
                        <p className="text-gray-600 text-center">
                            Tidak ada produk yang cocok dengan pencarian "<strong>{searchQuery}</strong>"
                        </p>
                        <p className="text-gray-500 text-sm text-center mt-2">
                            Coba cari berdasarkan nama produk, deskripsi, outlet, atau kategori
                        </p>
                    </div>
                )}

                {/* Empty default products */}
                {!isLoading && !isTyping && !isSearching && displayProducts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-2xl mb-2"><PackageSearch className="size-8 text-gray-400" /></div>
                        <p className="text-gray-600 text-center">
                            Tidak ada produk tersedia saat ini
                        </p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    )
}