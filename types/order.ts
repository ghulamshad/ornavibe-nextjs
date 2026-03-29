/**
 * Order types — customer orders and admin order management.
 */

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  id: number | string;
  product_id: number | string;
  name: string;
  price: string | number;
  quantity: number;
  total?: number;
}

export interface OrderPayment {
  id: number | string;
  gateway: string;
  amount?: string | number;
  currency?: string;
  status: string;
  proof_url?: string | null;
  external_id?: string | null;
  approved_at?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface BankAccountInfo {
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  bsb_or_sort_code?: string;
  instructions?: string;
}

export interface Order {
  id: number | string;
  user_id?: number;
  status: OrderStatus;
  subtotal: string | number;
  discount_amount?: string | number;
  shipping_amount?: string | number;
  cod_fee?: string | number;
  total: string | number;
  shipping_method?: string | null;
  delivery_carrier?: string | null;
  currency?: string;
  gift_message?: string | null;
  shipping_address?: ShippingAddress;
  items: OrderItem[];
  payments?: OrderPayment[];
  bank_account?: BankAccountInfo | null;
  created_at: string;
  updated_at?: string;
  user?: { id: number; email: string; name?: string };
}

export interface ShippingAddress {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface CreateOrderPayload {
  shipping_address: ShippingAddress;
  gift_message?: string;
  payment_gateway: string;
  shipping_method?: string;
}
