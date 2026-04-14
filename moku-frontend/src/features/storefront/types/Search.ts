export interface SearchResponse {
    status: string;
    message: string;
    data: {
        products: ProductSearch[];
    };
}

export interface ProductSearch {
    id: number;
    uuid: string;
    name: string;
    price: string;
    description: string;
    is_available: number;
    is_published: number;
    is_recommended: number;
    image: string;
    product_category_id: number;
    outlet_id: number;
    created_at: string;
    updated_at: string;
    search_count: string | null;
    image_url: string;
}
