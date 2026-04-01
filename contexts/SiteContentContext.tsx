'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchSiteContentRequest } from '@/redux/slices/site.slice';
import type { SiteContent } from '@/lib/api/site.service';
import { defaultSiteContent } from '@/lib/site/defaultSiteContent';

export type { SiteContent };

/**
 * Bootstraps public CMS payload (hero, testimonials, footer, store settings, etc.) via Redux + Saga once per app tree.
 */
export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchSiteContentRequest());
  }, [dispatch]);

  return <>{children}</>;
}

/** Resolved site copy: API data when loaded, otherwise built-in defaults (includes testimonials placeholders). */
export function useSiteContent(): SiteContent {
  const raw = useSelector((s: RootState) => s.site.content);
  return raw ?? defaultSiteContent;
}

export { defaultSiteContent };
