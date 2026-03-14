/**
 * Admin types — dashboard, customers, settings.
 */

export interface AdminDashboardStats {
  revenue: number;
  order_count: number;
  recent_orders: Array<{
    id: number | string;
    status: string;
    total: number | string;
    created_at: string;
    user?: { email: string; name?: string };
  }>;
}

export interface AdminCustomer {
  id: number;
  email: string;
  name?: string;
  order_count?: number;
  last_order_at?: string | null;
  created_at?: string;
}

/** Admin payments list item (GET /admin/payments). */
export interface AdminPaymentListItem {
  id: number | string;
  order_id: number | string;
  gateway: string;
  amount: string | number;
  currency: string;
  status: string;
  proof_url?: string | null;
  external_id?: string | null;
  approved_at?: string | null;
  created_at: string;
  order?: {
    id: number | string;
    status: string;
    total: string | number;
    user?: { id: number; email: string; name?: string } | null;
  } | null;
}

/** Dynamic page (legal, custom) for admin CRUD and public display. */
export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  type: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Flat key-value settings from API (GET/PATCH). Keys match backend Setting keys. */
export interface AdminSettings {
  store_name?: string;
  store_email?: string;
  store_phone?: string;
  currency?: string;
  site_hero_title?: string;
  site_hero_subtitle?: string;
  site_footer_brand?: string;
  site_footer_company?: string;
  site_footer_tagline?: string;
  site_about_title?: string;
  site_about_body?: string;
  site_contact_title?: string;
  site_contact_body?: string;
  site_cta_title?: string;
  site_cta_subtitle?: string;
  site_featured_title?: string;
  site_featured_subtitle?: string;
  [key: string]: string | undefined;
}

// Landing / hero section management
export interface AdminLandingHeroSlide {
  id: number;
  sub_title?: string | null;
  title: string;
  description?: string | null;
  cta_primary_text?: string | null;
  cta_primary_href?: string | null;
  cta_secondary_text?: string | null;
  cta_secondary_href?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface AdminLandingHeroBanner {
  id: number;
  eyebrow?: string | null;
  title: string;
  cta_text?: string | null;
  cta_href?: string | null;
  image_url?: string | null;
  is_active?: boolean;
}

export interface AdminLandingSmallBanner {
  id: number;
  eyebrow?: string | null;
  title: string;
  cta_text?: string | null;
  cta_href?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}
