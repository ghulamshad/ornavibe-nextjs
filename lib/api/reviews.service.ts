/**
 * Reviews API — product reviews (storefront).
 */
import api from './axios';

const PREFIX = '/api/v1/products';

export interface Review {
  id: number | string;
  product_id: number | string;
  user_id?: number;
  rating: number;
  body?: string;
  created_at?: string;
  user?: { name?: string };
}

export async function fetchProductReviews(productId: string | number): Promise<Review[]> {
  const response = await api.get<Review[]>(`${PREFIX}/${productId}/reviews`);
  const data = response.data;
  return Array.isArray(data) ? data : (data as { data?: Review[] }).data ?? [];
}

export async function submitReview(
  productId: string | number,
  payload: { rating: number; body?: string }
): Promise<Review> {
  const response = await api.post<Review>(`${PREFIX}/${productId}/reviews`, payload);
  return response.data;
}
