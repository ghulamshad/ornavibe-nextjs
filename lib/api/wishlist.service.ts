import api from './axios';
import type { Product } from '@/types/catalog';

const PREFIX = '/api/v1/wishlist';

export async function fetchWishlist(): Promise<Product[]> {
  const response = await api.get<{ data: Product[] }>(PREFIX);
  const data = response.data;
  return Array.isArray((data as any).data) ? (data as any).data : (data as any as Product[]);
}

export async function addToWishlist(productId: string | number): Promise<Product[]> {
  const response = await api.post<{ data: Product[] }>(PREFIX, { product_id: productId });
  return response.data.data;
}

export async function removeFromWishlist(productId: string | number): Promise<Product[]> {
  const response = await api.delete<{ data: Product[] }>(`${PREFIX}/${productId}`);
  return response.data.data;
}

