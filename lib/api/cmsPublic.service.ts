import axios from './axios';
import type { CmsPage, CmsBlogPost, CmsBlogListItem, CmsBlogCategory, CmsBlogTag } from '@/types/cms';

const CMS_PREFIX = '/api/v1/cms';

export async function fetchPublicCmsPage(slug: string, storeId?: string): Promise<CmsPage> {
  const response = await axios.get<CmsPage>(`${CMS_PREFIX}/pages/${slug}`, {
    params: storeId ? { store_id: storeId } : undefined,
  });
  return response.data;
}

export async function fetchPublicBlogList(params?: {
  page?: number;
  per_page?: number;
  category_id?: number;
  tag_id?: number;
}): Promise<{ data: CmsBlogListItem[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> {
  const response = await axios.get<{ data: CmsBlogListItem[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(
    `${CMS_PREFIX}/blog`,
    { params, headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } }
  );
  return response.data;
}

export async function fetchPublicBlogCategories(): Promise<CmsBlogCategory[]> {
  const response = await axios.get<{ data: CmsBlogCategory[] }>(`${CMS_PREFIX}/blog/categories`);
  return response.data.data;
}

export async function fetchPublicBlogTags(): Promise<CmsBlogTag[]> {
  const response = await axios.get<{ data: CmsBlogTag[] }>(`${CMS_PREFIX}/blog/tags`);
  return response.data.data;
}

export async function fetchPublicBlogPost(slug: string): Promise<CmsBlogPost> {
  const response = await axios.get<CmsBlogPost>(`${CMS_PREFIX}/blog/${slug}`);
  return response.data;
}

