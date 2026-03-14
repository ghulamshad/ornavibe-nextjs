/**
 * Cart types — storefront cart and checkout.
 */

export interface CartItem {
  id: string | number;
  product_id?: number | string;
  gift_basket_id?: string;
  product_variant_id?: number;
  /** Display name for this cart line (product or basket). */
  name?: string;
  /** Optional backend-friendly product name, used by older APIs. */
  product_name?: string;
  price: string | number;
  quantity: number;
  image_url?: string;
  type?: 'product' | 'gift_basket';
}

export interface Cart {
  items: CartItem[];
  discount_code?: string | null;
  discount_amount?: number;
  subtotal: number;
  total: number;
  item_count?: number;
}

export interface AddCartItemPayload {
  product_id?: number | string;
  gift_basket_id?: string;
  product_variant_id?: number;
  quantity: number;
}

export interface UpdateCartItemPayload {
  item_id: string | number;
  quantity: number;
}
