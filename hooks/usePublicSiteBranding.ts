'use client';

import { useEffect, useState } from 'react';
import { fetchSiteContent } from '@/lib/api/site.service';
import { resolveStoreLogoSrc } from '@/lib/utils/branding';

export interface PublicSiteBranding {
  logoSrc: string;
  brandName: string;
  companyLine: string;
}

/**
 * Loads public site content once (no auth) for admin shell branding when SiteContentProvider is not mounted.
 */
export function usePublicSiteBranding(): PublicSiteBranding | null {
  const [data, setData] = useState<PublicSiteBranding | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent()
      .then((c) => {
        if (cancelled) return;
        setData({
          logoSrc: resolveStoreLogoSrc(c.store?.logo_url),
          brandName: c.footer?.brand?.trim() || 'Store',
          companyLine: [c.footer?.company, 'Admin'].filter(Boolean).join(' · ') || 'Admin',
        });
      })
      .catch(() => {
        if (!cancelled) {
          setData({
            logoSrc: resolveStoreLogoSrc(null),
            brandName: 'Store',
            companyLine: 'Admin',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
