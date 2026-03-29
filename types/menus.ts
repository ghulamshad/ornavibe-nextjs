/**
 * Dynamic menus (header/footer/mobile) — aligns with Laravel Menu / MenuItem API.
 */

export type MenuLocation = 'header' | 'footer' | 'mobile';

export type MenuItemLinkType = 'page' | 'category' | 'product' | 'url' | 'custom';

export interface AdminMenu {
  id: string;
  name: string;
  slug: string;
  location: MenuLocation;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminMenuItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  title: string;
  titles?: Record<string, string> | null;
  type: MenuItemLinkType;
  reference_id?: string | null;
  url?: string | null;
  target?: string;
  sort_order: number;
  icon?: string | null;
  css_class?: string | null;
  visibility?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
  resolved_url?: string;
  children?: AdminMenuItem[];
  created_at?: string;
  updated_at?: string;
}

export interface PublicMenuResponse {
  menu: Pick<AdminMenu, 'id' | 'name' | 'slug' | 'location'>;
  items: PublicMenuItem[];
}

export interface PublicMenuItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  title: string;
  title_display: string;
  titles?: Record<string, string> | null;
  type: MenuItemLinkType;
  reference_id?: string | null;
  url?: string | null;
  target: string;
  sort_order: number;
  icon?: string | null;
  css_class?: string | null;
  visibility?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
  resolved_url: string;
  children: PublicMenuItem[];
}
