import { resolveMediaUrl } from '@/lib/utils/media';

/** Fallback when no logo is configured in settings (public path on Next). */
export const DEFAULT_STORE_LOGO_PATH = '/assets/logo.jpg';

/**
 * Resolved img src for storefront/admin. Uses API/storage URL when `logo_url` is set.
 */
export function resolveStoreLogoSrc(logoUrl?: string | null): string {
  const t = logoUrl?.trim();
  if (!t) return DEFAULT_STORE_LOGO_PATH;
  return resolveMediaUrl(t);
}
