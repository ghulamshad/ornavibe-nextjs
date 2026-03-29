/**
 * Catalog API — products and categories (storefront).
 */
import api from './axios';
import type { Product, Category, ProductListParams, PaginatedResponse, ProductReview } from '@/types/catalog';
import type { HeaderNavCategoryRoot } from '@/lib/headerNavFromCategories';

const PREFIX = '/api/v1';

export async function fetchProducts(params?: ProductListParams): Promise<PaginatedResponse<Product> | Product[]> {
  const response = await api.get<PaginatedResponse<Product> | Product[]>(`${PREFIX}/products`, { params });
  return response.data;
}

export async function fetchProductByIdOrSlug(idOrSlug: string | number): Promise<Product> {
  const response = await api.get<Product>(`${PREFIX}/products/${idOrSlug}`);
  return response.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<Category[]>(`${PREFIX}/categories`);
  const data = response.data;
  return Array.isArray(data) ? data : (data as { data?: Category[] }).data ?? [];
}

/** Header nav roots with children + meta (matches `CategorySeeder` / `show_in_header_nav`). */
export async function fetchHeaderNavCategories(): Promise<HeaderNavCategoryRoot[]> {
  const response = await api.get<HeaderNavCategoryRoot[]>(`${PREFIX}/categories`, {
    params: { header_nav: 1 },
  });
  const data = response.data;
  return Array.isArray(data) ? data : [];
}

export async function fetchProductReviews(productIdOrSlug: string | number): Promise<ProductReview[]> {
  const response = await api.get<ProductReview[]>(`${PREFIX}/products/${productIdOrSlug}/reviews`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function submitProductReview(
  productIdOrSlug: string | number,
  payload: { rating: number; body?: string }
): Promise<ProductReview> {
  const response = await api.post<ProductReview>(`${PREFIX}/products/${productIdOrSlug}/reviews`, payload);
  return response.data;
}
