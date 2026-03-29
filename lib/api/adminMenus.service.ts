/**
 * Admin — dynamic menus & menu items.
 */
import api from './axios';
import type { AdminMenu, AdminMenuItem } from '@/types/menus';

const PREFIX = '/api/v1/admin';

export async function fetchAdminMenus(): Promise<AdminMenu[]> {
  const { data } = await api.get<AdminMenu[]>(`${PREFIX}/menus`);
  return data;
}

export async function fetchAdminMenu(menuId: string): Promise<AdminMenu & { all_items?: AdminMenuItem[] }> {
  const { data } = await api.get(`${PREFIX}/menus/${menuId}`);
  return data;
}

export async function createAdminMenu(payload: {
  name: string;
  slug: string;
  location: string;
  is_active?: boolean;
}): Promise<AdminMenu> {
  const { data } = await api.post<AdminMenu>(`${PREFIX}/menus`, payload);
  return data;
}

export async function updateAdminMenu(
  menuId: string,
  payload: Partial<{ name: string; slug: string; location: string; is_active: boolean }>
): Promise<AdminMenu> {
  const { data } = await api.put<AdminMenu>(`${PREFIX}/menus/${menuId}`, payload);
  return data;
}

export async function deleteAdminMenu(menuId: string): Promise<void> {
  await api.delete(`${PREFIX}/menus/${menuId}`);
}

export async function fetchAdminMenuItems(menuId: string): Promise<{
  tree: AdminMenuItem[];
  flat: AdminMenuItem[];
}> {
  const { data } = await api.get<{ tree: AdminMenuItem[]; flat: AdminMenuItem[] }>(`${PREFIX}/menus/${menuId}/items`);
  return data;
}

export async function createAdminMenuItem(payload: Partial<AdminMenuItem> & { menu_id: string; title: string; type: string }): Promise<AdminMenuItem> {
  const { data } = await api.post<AdminMenuItem>(`${PREFIX}/menu-items`, payload);
  return data;
}

export async function updateAdminMenuItem(
  itemId: string,
  payload: Partial<AdminMenuItem>
): Promise<AdminMenuItem> {
  const { data } = await api.put<AdminMenuItem>(`${PREFIX}/menu-items/${itemId}`, payload);
  return data;
}

export async function deleteAdminMenuItem(itemId: string): Promise<void> {
  await api.delete(`${PREFIX}/menu-items/${itemId}`);
}

export async function bulkReorderMenuItems(
  menuId: string,
  items: { id: string; parent_id: string | null; sort_order: number }[]
): Promise<{ tree: AdminMenuItem[]; flat: AdminMenuItem[] }> {
  const { data } = await api.put<{ tree: AdminMenuItem[]; flat: AdminMenuItem[] }>(
    `${PREFIX}/menus/${menuId}/items/reorder`,
    { items }
  );
  return data;
}
