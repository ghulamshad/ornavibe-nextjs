/**
 * Public site content API — hero, about, contact, FAQ, footer, CTA.
 */
import api from './axios';

export interface SiteContent {
  /** Store currency, symbol, and payment gateway toggles */
  store?: {
    currency: string;
    currency_symbol: string;
    payment_gateway_stripe_enabled?: boolean;
    payment_gateway_bank_deposit_enabled?: boolean;
    /** Logo image URL or storage path; empty = use default `/assets/logo.jpg` on frontend */
    logo_url?: string;
  };
  /** MUI storefront palette overrides (hex). Empty strings = use defaults in `@/theme`. */
  theme?: {
    primary?: string;
    secondary?: string;
    background_default?: string;
    paper?: string;
  };
  topbar?: {
    enabled?: boolean;
    background?: string;
    text_color?: string;
    center_text?: string;
    center_text_color?: string;
    center_link?: string;
    phone?: string;
    phone_color?: string;
    social_links?: Array<{ label: string; href: string; icon?: string }>;
  };
  hero: {
    title: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
  };
  /** Small stats row under hero, e.g. 50k+ Total sales */
  hero_stats?: Array<{ label: string; value: string }>;
  /** Left hero banner column (hs-1) */
  hero_banner?: {
    eyebrow: string;
    title: string;
    cta_text: string;
    cta_href: string;
    image_url: string;
  };
  /** Hero carousel slides (final-ref style) */
  hero_slides?: Array<{
    sub_title: string;
    title: string;
    description: string;
    cta_primary_text: string;
    cta_primary_href: string;
    cta_secondary_text: string;
    cta_secondary_href: string;
    image_url: string;
    image_alt?: string;
    open_in_new_tab?: boolean;
  }>;
  /** `full_bleed` = full-width image carousel (HeroBanner); `overlay` = text-on-image slider */
  hero_slider_variant?: 'overlay' | 'full_bleed';
  /** Three small banner cards */
  small_banners?: Array<{ eyebrow: string; title: string; cta_text: string; cta_href: string; image_url: string }>;
  /** Deal section: title + countdown end ISO */
  deal_section?: { title: string; countdown_end: string };
  /** Gallery images */
  gallery?: Array<{ image_url: string; alt?: string }>;
  /** Testimonials slider */
  testimonials?: Array<{ name: string; role: string; quote: string; avatar_url?: string; rating?: number }>;
  /** Homepage testimonials block heading + CTA (from settings) */
  testimonials_section?: {
    title?: string;
    explore_more_href?: string | null;
    explore_more_label?: string;
  };
  /** Newsletter strip */
  newsletter?: { title: string; subtitle: string; button_text: string };
  about: {
    title: string;
    body: string;
    bullet_list?: string[];
  };
  contact: {
    title: string;
    body: string;
    email: string;
    phone: string;
    success_message?: string;
  };
  faqs: Array<{ question: string; answer: string }>;
  /** Benefits strip under hero (Free Delivery, etc.) */
  benefits?: Array<{ title: string; subtitle: string }>;
  cta: {
    title: string;
    subtitle: string;
  };
  footer: {
    brand: string;
    company: string;
    tagline: string;
    /** Footer strip background (hex), default dark grey */
    background?: string;
    /** Primary text / foreground (hex) */
    text_color?: string;
  };
  featured: {
    title: string;
    subtitle: string;
  };
  /** Gifoy-like promo banner ("Mega Collections") */
  promo_banner?: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta_label: string;
    cta_href?: string;
  };
  /** Trending section copy above trending products grid */
  trending?: {
    eyebrow: string;
    title: string;
    view_more_label?: string;
  };
  /** Blog index page copy and SEO */
  blog?: {
    title: string;
    subtitle: string;
    meta_title: string;
    meta_description: string;
  };
  /** Floating WhatsApp / phone / link strip (admin: Sticky contact) */
  sticky_contact?: {
    enabled: boolean;
    placement: string;
    edge_offset: number;
    vertical_offset: number;
    custom_top?: string | null;
    custom_right?: string | null;
    custom_bottom?: string | null;
    custom_left?: string | null;
    items: Array<{
      type: string;
      href: string;
      image_url?: string | null;
      label?: string | null;
      open_in_new_tab?: boolean;
    }>;
  };
}

export async function fetchSiteContent(): Promise<SiteContent> {
  const response = await api.get<SiteContent>('/api/v1/site/content');
  return response.data;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function submitContactForm(payload: ContactFormPayload): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/api/v1/contact', payload);
  return response.data;
}

export interface LegalPageContent {
  title: string;
  content: string;
  last_updated: string;
  contact_email?: string;
}

export async function fetchLegalPage(slug: 'privacy' | 'terms' | 'cookies'): Promise<LegalPageContent> {
  const response = await api.get<LegalPageContent>(`/api/v1/site/legal/${slug}`);
  return response.data;
}

/** Fetch any published page by slug (e.g. for /legal/sla, /legal/security). Same shape as LegalPageContent for display. */
export async function fetchPageBySlug(slug: string): Promise<LegalPageContent> {
  const response = await api.get<LegalPageContent>(`/api/v1/site/pages/${slug}`);
  return response.data;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export interface FaqPageResponse {
  title: string;
  meta_title?: string;
  meta_description?: string;
  items: FaqItem[];
}

export async function fetchFaq(): Promise<FaqPageResponse> {
  const response = await api.get<FaqPageResponse>('/api/v1/site/faq');
  return response.data;
}
