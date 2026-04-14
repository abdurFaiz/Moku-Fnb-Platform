import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import type { Outlet as DomainOutlet } from '@/features/outlets/types/Outlet';

/**
 * API response structure for outlets
 */
export interface OutletsApiResponse {
  data?: {
    outlets?: Outlet[];
    [key: string]: any;
  };
  success?: boolean;
  message?: string;
}

/**
 * Outlet interface
 */
export type Outlet = DomainOutlet;

/**
 * API response structure for products
 */
export interface ProductsApiResponse {
  data?: Array<{
    categories?: Category[];
    products?: HomeProduct[];
    [key: string]: any;
  }>;
  success?: boolean;
  message?: string;
}

/**
 * Extracted product data from API response
 */
export interface ExtractedProductData {
  categories: Category[];
  products: HomeProduct[];
}

/**
 * Organized products by category
 */
export interface DynamicOrganizedProducts {
  recommendations: HomeProduct[];
  [categoryKey: string]: HomeProduct[];
}

/**
 * Product lookup format for ProductLookupService
 */
export interface ProductLookupFormat {
  recommendations: HomeProduct[];
  [categoryKey: string]: HomeProduct[];
}

/**
 * Combined state of outlets and products
 */
export interface ProductQueryState {
  outletsData: OutletsApiResponse | undefined;
  productsData: ProductsApiResponse | undefined;
  currentOutlet: Outlet | null;
  organizedProducts: DynamicOrganizedProducts;
  extractedData: ExtractedProductData;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Product query hooks return type
 */
export interface UseProductsReturn {
  products: DynamicOrganizedProducts;
  categories: Category[];
  outlets: Outlet[];
  currentOutlet: Outlet | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  getCategoryDisplayName: (categoryKey: string) => string;
  createSectionId: (category: string) => string;
}
