'use client';

import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchSiteContentRequest } from '@/redux/slices/site.slice';
import { resolveStoreLogoSrc } from '@/lib/utils/branding';

export interface PublicSiteBranding {
  logoSrc: string;
  brandName: string;
  companyLine: string;
}

/**
 * Admin shell branding: triggers the same site-content saga as the storefront and derives logo/name from Redux.
 */
export function usePublicSiteBranding(): PublicSiteBranding {
  const dispatch = useDispatch<AppDispatch>();
  const raw = useSelector((s: RootState) => s.site.content);

  useEffect(() => {
    dispatch(fetchSiteContentRequest());
  }, [dispatch]);

  return useMemo(
    (): PublicSiteBranding => ({
      logoSrc: resolveStoreLogoSrc(raw?.store?.logo_url ?? null),
      brandName: raw?.footer?.brand?.trim() || 'Store',
      companyLine:
        [raw?.footer?.company, 'Admin'].filter(Boolean).join(' · ') ||
        'Admin',
    }),
    [raw?.footer?.brand, raw?.footer?.company, raw?.store?.logo_url]
  );
}
