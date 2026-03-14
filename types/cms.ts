export interface CmsSeoMeta {
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  structured_data?: any;
}

export interface CmsBlock {
  id?: number;
  type: string;
  position: number;
  config: Record<string, any>;
  is_active?: boolean;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  blocks: CmsBlock[];
  seo: CmsSeoMeta | null;
  published_at: string | null;
  updated_at: string;
}

export interface CmsPageListItem {
  id: string;
  slug: string;
  title: string;
  status: string;
  publish_at: string | null;
  unpublish_at: string | null;
  updated_at: string;
}

export interface CmsBlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface CmsBlogTag {
  id: number;
  name: string;
  slug: string;
}

export interface CmsBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: any;
  featured_image?: string | null;
  author?: { id: number | string; name?: string };
  status: string;
  publish_at: string | null;
  reading_time?: number | null;
  categories: CmsBlogCategory[];
  tags: CmsBlogTag[];
  seo: CmsSeoMeta | null;
  updated_at: string;
}

export interface CmsBlogListItem {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  featured_image?: string | null;
  author?: { id: number | string; name?: string };
  publish_at: string | null;
  reading_time?: number | null;
}

export interface CmsCampaign {
  id: number;
  name: string;
  slug: string;
  theme_config?: any;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  priority: number;
  updated_at: string;
}

export interface CmsMediaItem {
  id: number;
  filename: string;
  path: string;
  url: string;
  mime_type: string | null;
  size: number;
  alt_text?: string | null;
  folder?: string | null;
  created_at: string;
}

