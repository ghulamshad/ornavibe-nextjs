/**
 * Minimal HTML sanitization for product descriptions in the storefront.
 * Strips scripts, event handlers, and embedding tags; keeps common text markup.
 */
export function sanitizeProductHtml(html: string): string {
  if (!html?.trim()) return '';
  if (typeof window === 'undefined') return '';

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    doc.querySelectorAll('script, style, iframe, object, embed, link, meta, base').forEach((el) => el.remove());
    doc.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        const n = attr.name.toLowerCase();
        if (n.startsWith('on') || n === 'srcdoc' || (n === 'href' && /^\s*javascript:/i.test(attr.value))) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return doc.body.innerHTML.trim();
  } catch {
    return '';
  }
}

/** Plain preview for card body (no raw HTML tags). */
export function stripHtmlToPreview(html: string | undefined, maxLen = 140): string {
  if (!html?.trim()) return '';
  const t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!t) return '';
  return t.length > maxLen ? `${t.slice(0, maxLen).trim()}…` : t;
}
