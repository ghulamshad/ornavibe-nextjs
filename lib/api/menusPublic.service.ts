/**
 * Storefront — public cached menus.
 */
import api from './axios';
import type { PublicMenuResponse } from '@/types/menus';

export async function fetchPublicMenu(slug: string, locale?: string): Promise<PublicMenuResponse> {
  const { data } = await api.get<PublicMenuResponse>(`/api/v1/public/menus/${slug}`, {
    params: locale ? { locale } : undefined,
  });
  return data;
}
