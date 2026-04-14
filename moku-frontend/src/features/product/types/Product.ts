export interface ProductResponse {
  status: string;
  message: string;
  data: ProductData[];
}

export interface ProductData {
  categories: Category[];
  recommendedProducts: Product[];
  products: Product[];
  outlet?: {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    map: string | null;
    is_active: number;
    fee_tax: number;
    created_at: string;
    updated_at: string;
    is_open: boolean;
    operational_schedules?: Array<{
      id: number;
      uuid: string;
      outlet_id: number;
      day: number;
      open_time: string | null;
      close_time: string | null;
      is_open: number;
      created_at: string;
      updated_at: string;
    }>;
  };
}

export interface Category {
  id: number;
  position: number;
  name: string;
  outlet_id: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
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
  image_url: string;
}

export interface RecommendedProducts {
  id: number;
  uuid: string;
  name: string;
  price: string;
  description: string;
  is_available: number;
  is_recommended: number;
  image: string;
  image_url: string;
  product_category_id: number;
  outlet_id: number;
  created_at: string;
  updated_at: string;
}

