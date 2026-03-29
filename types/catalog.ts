/**
 * Catalog types — products and categories for storefront and admin.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
  children?: { id: string; name: string; slug: string }[];
  sort_order?: number;
  meta?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProductVariant {
  id: number;
  sku?: string;
  name: string;
  price_modifier: string | number;
  stock_quantity: number;
  image_url?: string;
}

export interface ProductReview {
  id: number;
  rating: number;
  body?: string;
  created_at?: string;
  user?: { name: string };
}

export interface Product {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  category_id?: string | number;
  category?: Category;
  stock_quantity?: number | null;
  is_active?: boolean;
  image_url?: string;
  images?: string[];
  variants?: ProductVariant[];
  is_trending?: boolean;
  badge_type?: 'new' | 'hot' | 'discount' | 'oos' | null;
  badge_discount_percent?: number | null;
  reviews_count?: number;
  reviews_avg_rating?: number | null;
  reviews?: ProductReview[];
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductListParams {
  page?: number;
  per_page?: number;
  category_id?: string | number;
  search?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  min_rating?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
