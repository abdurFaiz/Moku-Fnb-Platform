import type {
    ProductResponse,
    ProductData,
    Category,
    Product,
} from '../types/Product';
import type {
    ProductDetailResponse,
    ProductDetail,
    ProductAttribute,
    AttributeValue,
    ProductRecommendationResponse,
    ProductRecommendation,
} from '../types/DetailProduct';

// Mock Categories
export const mockCategories: Category[] = [
    {
        id: 1,
        position: 1,
        name: 'Coffee',
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 2,
        position: 2,
        name: 'Tea & Beverages',
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 3,
        position: 3,
        name: 'Snacks',
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
];

// Mock Products
export const mockProduct: Product = {
    id: 1,
    uuid: 'product-uuid-1',
    name: 'Espresso',
    price: '25000',
    description: 'Strong Italian coffee',
    is_available: 1,
    is_published: 1,
    is_recommended: 1,
    image: 'products/espresso.jpg',
    product_category_id: 1,
    outlet_id: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    image_url: 'http://localhost:8000/storage/products/espresso.jpg',
};

export const mockProducts: Product[] = [
    mockProduct,
    {
        id: 2,
        uuid: 'product-uuid-2',
        name: 'Cappuccino',
        price: '30000',
        description: 'Coffee with steamed milk',
        is_available: 1,
        is_published: 1,
        is_recommended: 0,
        image: 'products/cappuccino.jpg',
        product_category_id: 1,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        image_url: 'http://localhost:8000/storage/products/cappuccino.jpg',
    },
    {
        id: 3,
        uuid: 'product-uuid-3',
        name: 'Green Tea',
        price: '20000',
        description: 'Fresh green tea',
        is_available: 1,
        is_published: 1,
        is_recommended: 1,
        image: 'products/green-tea.jpg',
        product_category_id: 2,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        image_url: 'http://localhost:8000/storage/products/green-tea.jpg',
    },
    {
        id: 4,
        uuid: 'product-uuid-4',
        name: 'Croissant',
        price: '15000',
        description: 'Buttery pastry',
        is_available: 0,
        is_published: 1,
        is_recommended: 0,
        image: 'products/croissant.jpg',
        product_category_id: 3,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        image_url: 'http://localhost:8000/storage/products/croissant.jpg',
    },
    {
        id: 5,
        uuid: 'product-uuid-5',
        name: 'Unpublished Product',
        price: '10000',
        description: 'Not visible',
        is_available: 1,
        is_published: 0,
        is_recommended: 0,
        image: 'products/unpublished.jpg',
        product_category_id: 3,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        image_url: 'http://localhost:8000/storage/products/unpublished.jpg',
    },
];

// Mock Product Data
export const mockProductData: ProductData = {
    categories: mockCategories,
    recommendedProducts: [mockProducts[0], mockProducts[2]],
    products: mockProducts,
};

// Mock Product Response
export const mockProductResponse: ProductResponse = {
    status: 'success',
    message: 'Products retrieved successfully',
    data: [mockProductData],
};

// Mock Attribute Values
export const mockAttributeValues: AttributeValue[] = [
    {
        id: 1,
        name: 'Small',
        extra_price: 0,
        product_attribute_id: 1,
        is_default: 1,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 2,
        name: 'Medium',
        extra_price: 5000,
        product_attribute_id: 1,
        is_default: 0,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 3,
        name: 'Large',
        extra_price: 10000,
        product_attribute_id: 1,
        is_default: 0,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
];

export const mockToppingValues: AttributeValue[] = [
    {
        id: 4,
        name: 'Extra Shot',
        extra_price: 8000,
        product_attribute_id: 2,
        is_default: 0,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
    {
        id: 5,
        name: 'Whipped Cream',
        extra_price: 5000,
        product_attribute_id: 2,
        is_default: 0,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
    },
];

// Mock Product Attributes
export const mockProductAttributes: ProductAttribute[] = [
    {
        id: 1,
        name: 'Size',
        display_type: 1, // Radio
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        laravel_through_key: 1,
        values: mockAttributeValues,
    },
    {
        id: 2,
        name: 'Toppings',
        display_type: 2, // Checkbox
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        laravel_through_key: 1,
        values: mockToppingValues,
    },
];

// Mock Product Detail
export const mockProductDetail: ProductDetail = {
    id: 1,
    uuid: 'product-uuid-1',
    name: 'Espresso',
    price: '25000',
    description: 'Strong Italian coffee',
    is_available: 1,
    is_recommended: 1,
    is_published: 1,
    image: 'products/espresso.jpg',
    product_category_id: 1,
    outlet_id: 1,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    image_url: 'http://localhost:8000/storage/products/espresso.jpg',
    attributes: mockProductAttributes,
};

// Mock Product Detail Response
export const mockProductDetailResponse: ProductDetailResponse = {
    status: 'success',
    message: 'Product retrieved successfully',
    data: {
        product: mockProductDetail,
    },
};

// Mock Product Recommendations
export const mockProductRecommendations: ProductRecommendation[] = [
    {
        uuid: 'product-uuid-1',
        name: 'Espresso',
        price: '25000',
        description: 'Strong Italian coffee',
        is_available: 1,
        is_published: 1,
        is_recommended: 1,
        image: 'products/espresso.jpg',
        product_category_id: 1,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        total_sales: 150,
        image_url: 'http://localhost:8000/storage/products/espresso.jpg',
    },
    {
        uuid: 'product-uuid-3',
        name: 'Green Tea',
        price: '20000',
        description: 'Fresh green tea',
        is_available: 1,
        is_published: 1,
        is_recommended: 1,
        image: 'products/green-tea.jpg',
        product_category_id: 2,
        outlet_id: 1,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-01T00:00:00.000Z',
        total_sales: 120,
        image_url: 'http://localhost:8000/storage/products/green-tea.jpg',
    },
];

// Mock Product Recommendation Response
export const mockProductRecommendationResponse: ProductRecommendationResponse = {
    status: 'success',
    message: 'Recommendations retrieved successfully',
    data: {
        recommendations: mockProductRecommendations,
    },
};

// Mock Error Responses
export const mockErrorResponse: ProductResponse = {
    status: 'error',
    message: 'Failed to fetch products',
    data: [],
};

export const mockErrorDetailResponse: ProductDetailResponse = {
    status: 'error',
    message: 'Product not found',
    data: {
        product: {} as ProductDetail,
    },
};
