import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import type { ProductDetail } from '@/features/product/types/DetailProduct';

export type MinimalProduct = HomeProduct | ProductDetail | null | undefined;

const isProductDetail = (product: MinimalProduct): product is ProductDetail => {
    if (!product || typeof product !== 'object') {
        return false;
    }

    return 'image_url' in product;
};

export const getFallbackImage = (product: MinimalProduct): string => {
    if (!product) {
        return '';
    }

    if (isProductDetail(product)) {
        return product.image_url || product.image || '';
    }

    return product.image || '';
};

export const getFallbackPrice = (product: MinimalProduct): number => {
    if (!product) {
        return 0;
    }

    const rawPrice = product.price;
    if (typeof rawPrice === 'number') {
        return rawPrice;
    }

    const parsed = Number(rawPrice);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const getFallbackName = (product: MinimalProduct, defaultValue = 'Produk'): string => {
    return product?.name ?? defaultValue;
};

export const getFallbackDescription = (product: MinimalProduct, defaultValue = ''): string => {
    return product?.description ?? defaultValue;
};

/**
 * Get complete fallback product object
 */
export const getProductFallback = (data?: Partial<{
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
}>): {
    id: string;
    name: string;
    price: number;
    image: string;
    description: string;
} => {
    return {
        id: data?.id ?? 'fallback-product',
        name: data?.name ?? 'Produk',
        price: data?.price ?? 0,
        image: data?.image ?? '',
        description: data?.description ?? '',
    };
};
