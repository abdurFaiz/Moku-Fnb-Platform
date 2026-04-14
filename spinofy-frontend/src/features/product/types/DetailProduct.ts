export interface ProductDetailResponse {
  status: string;
  message: string;
  data: {
    product: ProductDetail;
  };
}

export interface ProductDetail {
  id: number;
  uuid: string;
  name: string;
  price: string;
  description: string;
  is_available: number;
  is_recommended: number;
  is_published?: number;
  image: string;
  product_category_id: number;
  outlet_id: number;
  created_at: string;
  updated_at: string;
  image_url: string;
  attributes: ProductAttribute[]; // Changed from 'attribute' to 'attributes' array
}

export interface ProductAttribute {
  id: number;
  name: string;
  display_type: number;
  outlet_id: number;
  created_at: string;
  updated_at: string;
  laravel_through_key: number;
  values: AttributeValue[];
}

export interface AttributeValue {
  id: number;
  name: string;
  extra_price: number;
  product_attribute_id: number;
  is_default: number;
  outlet_id: number;
  created_at: string;
  updated_at: string;
}

// Helper types for component usage
export interface SelectorOption {
  id: number;
  name: string;
  extra_price: number;
}

export interface CartItemOptions {
  extras?: string[];
  notes?: string;
}

export interface DetailItemCartData {
  name: string;
  price: number;
  quantity: number;
  options: string[];
  notes: string;
  image: string;
  uuid?: string;
  basePrice: number;
  totalPrice: number;
}

export interface ProductRecommendationResponse {
  status: string
  message: string
  data: ProductRecommendationData
}

export interface ProductRecommendation {
  uuid: string
  name: string
  price: string
  description: string
  is_available: number
  is_published: number
  is_recommended: number
  image: string
  product_category_id: number
  outlet_id: number
  created_at: string
  updated_at: string
  total_sales: number | null
  image_url: string
}

export interface ProductRecommendationData {
  recommendations: ProductRecommendation[]
}