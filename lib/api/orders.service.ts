/**
 * Orders API — customer orders and place order.
 */
import api from './axios';
import type { Order, CreateOrderPayload, ShippingAddress } from '@/types/order';

const PREFIX = '/api/v1/orders';

export interface ShippingQuoteMethod {
  code: string;
  label: string;
  rate: number;
  carrier?: string | null;
  zone_id?: number | null;
  zone_name?: string | null;
  estimated_days_min?: number | null;
  estimated_days_max?: number | null;
}

export interface CheckoutPreview {
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  cod_fee: number;
  total: number;
  currency: string;
  shipping_method: string;
  delivery_carrier?: string | null;
  items_count?: number;
  shipping_quote?: {
    zone: { id: number; name: string } | null;
    methods: ShippingQuoteMethod[];
  };
}

export async function fetchMyOrders(params?: { page?: number }): Promise<Order[] | { data: Order[]; meta?: unknown }> {
  const response = await api.get<Order[] | { data: Order[]; meta?: unknown }>(PREFIX, { params });
  return response.data;
}

export async function fetchOrderById(id: string | number): Promise<Order> {
  const response = await api.get<Order>(`${PREFIX}/${id}`);
  return response.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const response = await api.post<Order>(PREFIX, payload);
  return response.data;
}

export async function previewCheckout(payload: {
  payment_gateway?: string;
  shipping_method?: string;
  /** Used to resolve shipping zone and per-method rates (country should be ISO 3166-1 alpha-2). */
  shipping_address?: Partial<ShippingAddress>;
}): Promise<CheckoutPreview> {
  const response = await api.post<CheckoutPreview>(`${PREFIX}/preview`, payload);
  return response.data;
}

export async function uploadDepositSlip(
  orderId: string | number,
  file: File
): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<{ message: string }>(
    `${PREFIX}/${orderId}/deposit-slip`,
    formData
  );
  return response.data;
}
