/**
 * Cart API — storefront cart.
 */
import api from './axios';
import type { Cart, AddCartItemPayload, UpdateCartItemPayload } from '@/types/cart';

const PREFIX = '/api/v1/cart';

export async function fetchCart(): Promise<Cart> {
  const response = await api.get<Cart>(PREFIX);
  return response.data;
}

export async function addCartItem(payload: AddCartItemPayload): Promise<Cart> {
  const response = await api.post<Cart>(`${PREFIX}/items`, payload);
  return response.data;
}

export async function updateCartItem(itemId: string | number, payload: { quantity: number }): Promise<Cart> {
  const response = await api.patch<Cart>(`${PREFIX}/items/${itemId}`, payload);
  return response.data;
}

export async function removeCartItem(itemId: string | number): Promise<Cart> {
  const response = await api.delete<Cart>(`${PREFIX}/items/${itemId}`);
  return response.data;
}

export async function applyDiscountCode(code: string): Promise<Cart> {
  const response = await api.patch<Cart>(PREFIX, { discount_code: code });
  return response.data;
}
