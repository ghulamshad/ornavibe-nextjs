/**
 * Orders API — customer orders and place order.
 */
import api from './axios';
import type { Order, CreateOrderPayload } from '@/types/order';

const PREFIX = '/api/v1/orders';

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
