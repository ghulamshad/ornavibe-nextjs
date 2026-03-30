import type { Product } from '@/types/catalog';
import { stripHtmlToPreview } from '@/lib/utils/sanitizeProductHtml';

/**
 * HTML/text used on cards & quick view: prefer storefront short copy, then full description.
 * Matches common APIs (`short_description` snake_case from Django/DRF).
 */
export function getProductRichHtmlSource(product: Product): string {
  const short = (product.short_description ?? product.shortDescription)?.trim();
  const full = product.description?.trim();
  return short || full || '';
}

/** Plain preview line under the title (strips tags). */
export function getProductPlainPreview(product: Product, maxLen = 140): string {
  return stripHtmlToPreview(getProductRichHtmlSource(product), maxLen);
}
