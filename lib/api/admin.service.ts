/**
 * Admin API — dashboard, products, categories, orders, customers, settings.
 */
import api from './axios';
import type {
  AdminDashboardStats,
  AdminCustomer,
  AdminSettings,
  AdminLandingHeroSlide,
  AdminLandingHeroBanner,
  AdminLandingSmallBanner,
  Page,
} from '@/types/admin';
import type {
  CmsPageListItem,
  CmsPage,
  CmsBlogPost,
  CmsBlogListItem,
  CmsBlogCategory,
  CmsBlogTag,
  CmsCampaign,
  CmsMediaItem,
} from '@/types/cms';
import type { Product } from '@/types/catalog';
import type { Category } from '@/types/catalog';
import type { Order } from '@/types/order';
import type { AdminPaymentListItem } from '@/types/admin';

const PREFIX = '/api/v1/admin';
const CMS_PREFIX = `${PREFIX}/cms`;

export async function fetchDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get<AdminDashboardStats>(`${PREFIX}/dashboard`);
  return response.data;
}

export interface AdminProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string | null;
  is_active?: boolean | string;
  is_trending?: boolean | string;
  low_stock?: '1' | '';
  stock_threshold?: number;
}

export async function fetchAdminProducts(params?: AdminProductsParams): Promise<{
  data: Product[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}> {
  const response = await api.get(`${PREFIX}/products`, { params });
  return response.data;
}

export async function fetchAdminProductById(id: string | number): Promise<Product> {
  const response = await api.get<Product>(`${PREFIX}/products/${id}`);
  return response.data;
}

export async function createProduct(payload: {
  name: string;
  slug?: string;
  description?: string;
  price: number | string;
  category_id?: string | null;
  stock_quantity?: number;
  is_active?: boolean;
  image_url?: string;
  is_trending?: boolean;
  badge_type?: 'new' | 'hot' | 'discount' | 'oos';
  badge_discount_percent?: number | null;
}): Promise<Product> {
  const response = await api.post<Product>(`${PREFIX}/products`, payload);
  return response.data;
}

export async function updateProduct(
  id: string | number,
  payload: Partial<{
    name: string;
    slug: string;
    description: string;
    price: number | string;
    category_id: string | null;
    stock_quantity: number;
    is_active: boolean;
    image_url: string;
    is_trending: boolean;
    badge_type: 'new' | 'hot' | 'discount' | 'oos';
    badge_discount_percent: number | null;
  }>
): Promise<Product> {
  const response = await api.put<Product>(`${PREFIX}/products/${id}`, payload);
  return response.data;
}

export async function deleteProduct(id: string | number): Promise<void> {
  await api.delete(`${PREFIX}/products/${id}`);
}

export interface ProductImageRecord {
  id: number;
  product_id: number;
  url: string;
  sort_order: number;
}

export async function fetchProductImages(productId: string | number): Promise<ProductImageRecord[]> {
  const response = await api.get<{ data: ProductImageRecord[] }>(`${PREFIX}/products/${productId}/images`);
  return (response.data as { data?: ProductImageRecord[] }).data ?? [];
}

export async function addProductImage(productId: string | number, url: string): Promise<ProductImageRecord> {
  const response = await api.post<ProductImageRecord>(`${PREFIX}/products/${productId}/images`, { url });
  return response.data;
}

export async function reorderProductImages(productId: string | number, order: number[]): Promise<ProductImageRecord[]> {
  const response = await api.patch<ProductImageRecord[]>(`${PREFIX}/products/${productId}/images/reorder`, { order });
  return response.data;
}

export async function deleteProductImage(productId: string | number, imageId: number): Promise<void> {
  await api.delete(`${PREFIX}/products/${productId}/images/${imageId}`);
}

export interface ProductVariantRecord {
  id: number;
  product_id: number;
  name: string;
  sku?: string;
  price_modifier: string | number;
  stock_quantity: number;
  image_url?: string;
}

export async function fetchProductVariants(productId: string | number): Promise<ProductVariantRecord[]> {
  const response = await api.get<{ data: ProductVariantRecord[] }>(`${PREFIX}/products/${productId}/variants`);
  return (response.data as { data?: ProductVariantRecord[] }).data ?? [];
}

export async function addProductVariant(
  productId: string | number,
  payload: { name: string; sku?: string; price_modifier?: number; stock_quantity?: number; image_url?: string }
): Promise<ProductVariantRecord> {
  const response = await api.post<ProductVariantRecord>(`${PREFIX}/products/${productId}/variants`, payload);
  return response.data;
}

export async function updateProductVariant(
  productId: string | number,
  variantId: number,
  payload: Partial<{ name: string; sku: string; price_modifier: number; stock_quantity: number; image_url: string }>
): Promise<ProductVariantRecord> {
  const response = await api.put<ProductVariantRecord>(
    `${PREFIX}/products/${productId}/variants/${variantId}`,
    payload
  );
  return response.data;
}

export async function deleteProductVariant(productId: string | number, variantId: number): Promise<void> {
  await api.delete(`${PREFIX}/products/${productId}/variants/${variantId}`);
}

export interface AdminInventoryItem {
  id: number | string;
  name: string;
  slug: string;
  image_url?: string | null;
  stock_quantity: number;
  category: { id: string; name: string; slug: string } | null;
}

export interface AdminInventoryParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string | null;
  stock_filter?: 'all' | 'low_stock' | 'out_of_stock';
}

export async function fetchAdminInventory(params?: AdminInventoryParams): Promise<{
  data: AdminInventoryItem[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
  threshold: number;
}> {
  const response = await api.get(`${PREFIX}/inventory`, { params });
  return response.data;
}

export async function fetchLowStockProducts(): Promise<{
  threshold: number;
  data: Array<{ id: number; name: string; slug: string; stock_quantity: number; category: { id: string; name: string } | null }>;
}> {
  const response = await api.get(`${PREFIX}/inventory/low-stock`);
  return response.data;
}

export interface AdminCategoriesParams {
  search?: string;
  parent_filter?: 'root_only' | 'has_parent';
  parent_id?: string | null;
}

export async function fetchAdminCategories(params?: AdminCategoriesParams): Promise<Category[]> {
  const response = await api.get<Category[]>(`${PREFIX}/categories`, { params });
  const data = response.data;
  return Array.isArray(data) ? data : (data as { data?: Category[] }).data ?? [];
}

export async function createCategory(payload: {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  parent_id?: string | null;
}): Promise<Category> {
  const response = await api.post<Category>(`${PREFIX}/categories`, payload);
  return response.data;
}

export async function updateCategory(
  id: string,
  payload: { name?: string; slug?: string; description?: string; image_url?: string; parent_id?: string | null }
): Promise<Category> {
  const response = await api.put<Category>(`${PREFIX}/categories/${id}`, payload);
  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`${PREFIX}/categories/${id}`);
}

export async function fetchAdminOrders(params?: {
  status?: string;
  user_id?: number | string;
  page?: number;
  per_page?: number;
}): Promise<{ data: Order[]; meta?: { current_page: number; last_page: number; total: number } }> {
  const response = await api.get(`${PREFIX}/orders`, { params });
  return response.data;
}

export async function updateOrderStatus(orderId: string | number, status: string): Promise<Order> {
  const response = await api.patch<Order>(`${PREFIX}/orders/${orderId}/status`, { status });
  return response.data;
}

export async function fetchAdminOrderById(id: string | number): Promise<Order> {
  const response = await api.get<Order>(`${PREFIX}/orders/${id}`);
  return response.data;
}

// ——— Payments ———

export interface AdminPaymentsParams {
  gateway?: string;
  status?: string;
  order_id?: number | string;
  date_from?: string;
  date_to?: string;
  external_id?: string;
  page?: number;
  per_page?: number;
}

export async function fetchAdminPayments(
  params?: AdminPaymentsParams
): Promise<{
  data: AdminPaymentListItem[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}> {
  const response = await api.get(`${PREFIX}/payments`, { params });
  return response.data;
}

export async function approveAdminPayment(paymentId: string | number): Promise<{ id: number; status: string; order?: Order }> {
  const response = await api.post<{ id: number; status: string; order?: Order }>(
    `${PREFIX}/payments/${paymentId}/approve`
  );
  return response.data;
}

export async function rejectAdminPayment(
  paymentId: string | number,
  reason?: string
): Promise<{ id: number; status: string; order?: Order }> {
  const response = await api.post<{ id: number; status: string; order?: Order }>(
    `${PREFIX}/payments/${paymentId}/reject`,
    reason != null ? { reason } : undefined
  );
  return response.data;
}

// ——— Landing / hero management ———

export async function fetchLandingHeroSlides(): Promise<AdminLandingHeroSlide[]> {
  const response = await api.get<AdminLandingHeroSlide[]>(`${PREFIX}/landing/hero-slides`);
  return response.data;
}

export async function createLandingHeroSlide(
  payload: Partial<AdminLandingHeroSlide>
): Promise<AdminLandingHeroSlide> {
  const response = await api.post<AdminLandingHeroSlide>(`${PREFIX}/landing/hero-slides`, payload);
  return response.data;
}

export async function updateLandingHeroSlide(
  id: number,
  payload: Partial<AdminLandingHeroSlide>
): Promise<AdminLandingHeroSlide> {
  const response = await api.put<AdminLandingHeroSlide>(`${PREFIX}/landing/hero-slides/${id}`, payload);
  return response.data;
}

export async function deleteLandingHeroSlide(id: number): Promise<void> {
  await api.delete(`${PREFIX}/landing/hero-slides/${id}`);
}

export async function fetchLandingHeroBanner(): Promise<AdminLandingHeroBanner | null> {
  const response = await api.get<AdminLandingHeroBanner | null>(`${PREFIX}/landing/hero-banner`);
  return response.data;
}

export async function updateLandingHeroBanner(
  payload: Partial<AdminLandingHeroBanner>
): Promise<AdminLandingHeroBanner> {
  const response = await api.put<AdminLandingHeroBanner>(`${PREFIX}/landing/hero-banner`, payload);
  return response.data;
}

export async function fetchLandingSmallBanners(): Promise<AdminLandingSmallBanner[]> {
  const response = await api.get<AdminLandingSmallBanner[]>(`${PREFIX}/landing/small-banners`);
  return response.data;
}

export async function createLandingSmallBanner(
  payload: Partial<AdminLandingSmallBanner>
): Promise<AdminLandingSmallBanner> {
  const response = await api.post<AdminLandingSmallBanner>(`${PREFIX}/landing/small-banners`, payload);
  return response.data;
}

export async function updateLandingSmallBanner(
  id: number,
  payload: Partial<AdminLandingSmallBanner>
): Promise<AdminLandingSmallBanner> {
  const response = await api.put<AdminLandingSmallBanner>(
    `${PREFIX}/landing/small-banners/${id}`,
    payload
  );
  return response.data;
}

export async function deleteLandingSmallBanner(id: number): Promise<void> {
  await api.delete(`${PREFIX}/landing/small-banners/${id}`);
}

export interface AdminCustomersParams {
  page?: number;
  per_page?: number;
  email?: string;
  name?: string;
  date_from?: string;
  date_to?: string;
}

export async function fetchAdminCustomers(
  params?: AdminCustomersParams
): Promise<{
  data: AdminCustomer[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}> {
  const response = await api.get(`${PREFIX}/customers`, { params });
  return response.data;
}

export async function fetchSettings(): Promise<AdminSettings> {
  const response = await api.get<AdminSettings>(`${PREFIX}/settings`);
  return response.data;
}

export async function updateSettings(payload: Partial<AdminSettings>): Promise<AdminSettings> {
  const response = await api.patch<AdminSettings>(`${PREFIX}/settings`, payload);
  return response.data;
}

// ——— Pages (dynamic legal & custom pages) ———
export async function fetchAdminPages(params?: { type?: string }): Promise<Page[]> {
  const response = await api.get<Page[]>(`${PREFIX}/pages`, { params });
  const data = response.data;
  return Array.isArray(data) ? data : (data as { data?: Page[] }).data ?? [];
}

export async function fetchAdminPageById(id: number | string): Promise<Page> {
  const response = await api.get<Page>(`${PREFIX}/pages/${id}`);
  return response.data;
}

export async function createPage(payload: {
  slug: string;
  title: string;
  content: string;
  meta_title?: string | null;
  meta_description?: string | null;
  type?: string | null;
  is_published?: boolean;
  sort_order?: number;
}): Promise<Page> {
  const response = await api.post<Page>(`${PREFIX}/pages`, payload);
  return response.data;
}

export async function updatePage(
  id: number | string,
  payload: Partial<{
    slug: string;
    title: string;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    type: string | null;
    is_published: boolean;
    sort_order: number;
  }>
): Promise<Page> {
  const response = await api.put<Page>(`${PREFIX}/pages/${id}`, payload);
  return response.data;
}

export async function deletePage(id: number | string): Promise<void> {
  await api.delete(`${PREFIX}/pages/${id}`);
}

// ——— CMS pages (block-based) ———

export async function fetchCmsPages(params?: {
  store_id?: string;
  per_page?: number;
  page?: number;
  search?: string;
  status?: string;
}): Promise<{ data: CmsPageListItem[]; meta: { current_page: number; last_page: number; total: number } }> {
  const response = await api.get<{ data: CmsPageListItem[]; meta: { current_page: number; last_page: number; total: number } }>(
    `${CMS_PREFIX}/pages`,
    { params }
  );
  return response.data;
}

export async function fetchCmsPageById(id: string): Promise<CmsPage> {
  const response = await api.get<CmsPage>(`${CMS_PREFIX}/pages/${id}`);
  return response.data;
}

export async function createCmsPage(payload: {
  store_id?: string | null;
  slug: string;
  title: string;
  status: string;
  publish_at?: string | null;
  unpublish_at?: string | null;
  blocks?: Array<{ type: string; position?: number; config?: Record<string, any>; is_active?: boolean }>;
  seo?: { meta_title?: string; meta_description?: string; robots?: string };
}): Promise<CmsPage> {
  const response = await api.post<CmsPage>(`${CMS_PREFIX}/pages`, payload);
  return response.data;
}

export async function updateCmsPage(
  id: string,
  payload: Partial<{
    slug: string;
    title: string;
    status: string;
    publish_at: string | null;
    unpublish_at: string | null;
    blocks: Array<{ type: string; position?: number; config?: Record<string, any>; is_active?: boolean }>;
    seo: { meta_title?: string; meta_description?: string; robots?: string };
  }>
): Promise<CmsPage> {
  const response = await api.put<CmsPage>(`${CMS_PREFIX}/pages/${id}`, payload);
  return response.data;
}

export async function deleteCmsPage(id: string): Promise<void> {
  await api.delete(`${CMS_PREFIX}/pages/${id}`);
}

export async function fetchCmsPageVersions(
  id: string
): Promise<{ data: Array<{ id: number; version_number: number; created_at: string; created_by: number | null }> }> {
  const response = await api.get<{ data: Array<{ id: number; version_number: number; created_at: string; created_by: number | null }> }>(
    `${CMS_PREFIX}/pages/${id}/versions`
  );
  return response.data;
}

export async function rollbackCmsPage(id: string, versionNumber: number): Promise<CmsPage> {
  const response = await api.post<CmsPage>(`${CMS_PREFIX}/pages/${id}/rollback`, { version_number: versionNumber });
  return response.data;
}

// ——— CMS blog (admin) ———

export interface AdminCmsBlogPostsParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  category_id?: number | string | null;
  tag_id?: number | string | null;
}

export async function fetchCmsBlogPosts(params?: AdminCmsBlogPostsParams): Promise<{
  data: CmsBlogListItem[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}> {
  const response = await api.get<{
    data: CmsBlogListItem[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
  }>(`${CMS_PREFIX}/blog`, { params });
  return response.data;
}

export async function fetchCmsBlogPostById(id: number): Promise<CmsBlogPost> {
  const response = await api.get<CmsBlogPost>(`${CMS_PREFIX}/blog/${id}`);
  return response.data;
}

export interface CmsBlogSeoPayload {
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  focus_keyword?: string | null;
  og_image?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  canonical_url?: string | null;
  robots?: string | null;
  structured_data?: Record<string, unknown> | null;
}

export async function createCmsBlogPost(payload: {
  slug?: string | null;
  title: string;
  excerpt?: string;
  content?: any;
  featured_image?: string | null;
  status: string;
  publish_at?: string | null;
  reading_time?: number | null;
  category_ids?: number[];
  tag_ids?: number[];
  seo?: CmsBlogSeoPayload;
}): Promise<CmsBlogPost> {
  const response = await api.post<CmsBlogPost>(`${CMS_PREFIX}/blog`, payload);
  return response.data;
}

export async function updateCmsBlogPost(
  id: number,
  payload: Partial<{
    slug: string;
    title: string;
    excerpt?: string;
    content?: any;
    featured_image?: string | null;
    status: string;
    publish_at?: string | null;
    reading_time?: number | null;
    category_ids?: number[];
    tag_ids?: number[];
    seo?: CmsBlogSeoPayload;
  }>
): Promise<CmsBlogPost> {
  const response = await api.put<CmsBlogPost>(`${CMS_PREFIX}/blog/${id}`, payload);
  return response.data;
}

export async function deleteCmsBlogPost(id: number): Promise<void> {
  await api.delete(`${CMS_PREFIX}/blog/${id}`);
}

export async function fetchCmsBlogCategories(): Promise<CmsBlogCategory[]> {
  const response = await api.get<{ data: CmsBlogCategory[] }>(`${CMS_PREFIX}/blog-categories`);
  return response.data.data;
}

export async function createCmsBlogCategory(name: string): Promise<CmsBlogCategory> {
  const response = await api.post<CmsBlogCategory>(`${CMS_PREFIX}/blog-categories`, { name });
  return response.data;
}

export async function updateCmsBlogCategory(id: number, payload: { name?: string; slug?: string }): Promise<CmsBlogCategory> {
  const response = await api.put<CmsBlogCategory>(`${CMS_PREFIX}/blog-categories/${id}`, payload);
  return response.data;
}

export async function deleteCmsBlogCategory(id: number): Promise<void> {
  await api.delete(`${CMS_PREFIX}/blog-categories/${id}`);
}

export async function fetchCmsBlogTags(): Promise<CmsBlogTag[]> {
  const response = await api.get<{ data: CmsBlogTag[] }>(`${CMS_PREFIX}/blog-tags`);
  return response.data.data;
}

export async function createCmsBlogTag(name: string): Promise<CmsBlogTag> {
  const response = await api.post<CmsBlogTag>(`${CMS_PREFIX}/blog-tags`, { name });
  return response.data;
}

export async function updateCmsBlogTag(id: number, payload: { name?: string; slug?: string }): Promise<CmsBlogTag> {
  const response = await api.put<CmsBlogTag>(`${CMS_PREFIX}/blog-tags/${id}`, payload);
  return response.data;
}

export async function deleteCmsBlogTag(id: number): Promise<void> {
  await api.delete(`${CMS_PREFIX}/blog-tags/${id}`);
}

// ——— CMS campaigns (admin) ———

export async function fetchCmsCampaigns(params?: {
  page?: number;
  per_page?: number;
}): Promise<{ data: CmsCampaign[]; meta: { current_page: number; last_page: number; total: number } }> {
  const response = await api.get<{ data: CmsCampaign[]; meta: { current_page: number; last_page: number; total: number } }>(
    `${CMS_PREFIX}/campaigns`,
    { params }
  );
  return response.data;
}

export async function fetchCmsCampaignById(id: number): Promise<CmsCampaign> {
  const response = await api.get<CmsCampaign>(`${CMS_PREFIX}/campaigns/${id}`);
  return response.data;
}

export async function createCmsCampaign(payload: {
  name: string;
  slug?: string;
  theme_config?: any;
  start_at?: string | null;
  end_at?: string | null;
  is_active?: boolean;
  priority?: number;
}): Promise<CmsCampaign> {
  const response = await api.post<CmsCampaign>(`${CMS_PREFIX}/campaigns`, payload);
  return response.data;
}

export async function updateCmsCampaign(
  id: number,
  payload: Partial<{
    name: string;
    slug: string;
    theme_config: any;
    start_at: string | null;
    end_at: string | null;
    is_active: boolean;
    priority: number;
  }>
): Promise<CmsCampaign> {
  const response = await api.put<CmsCampaign>(`${CMS_PREFIX}/campaigns/${id}`, payload);
  return response.data;
}

export async function deleteCmsCampaign(id: number): Promise<void> {
  await api.delete(`${CMS_PREFIX}/campaigns/${id}`);
}

// ——— CMS media (admin) ———

export async function fetchCmsMedia(params?: {
  folder?: string;
  page?: number;
  per_page?: number;
}): Promise<{ data: CmsMediaItem[]; meta: { current_page: number; last_page: number; total: number } }> {
  const response = await api.get<{ data: CmsMediaItem[]; meta: { current_page: number; last_page: number; total: number } }>(
    `${CMS_PREFIX}/media`,
    { params }
  );
  return response.data;
}

export async function uploadCmsMedia(payload: {
  file: File;
  folder?: string;
  alt_text?: string;
}): Promise<CmsMediaItem> {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.folder) formData.append('folder', payload.folder);
  if (payload.alt_text) formData.append('alt_text', payload.alt_text);
  const response = await api.post<CmsMediaItem>(`${CMS_PREFIX}/media`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function deleteCmsMedia(id: number): Promise<void> {
  await api.delete(`${CMS_PREFIX}/media/${id}`);
}
