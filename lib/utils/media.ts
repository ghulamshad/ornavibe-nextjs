import { getApiBaseURL } from '@/lib/api/axios';

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  const base = getApiBaseURL();
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

