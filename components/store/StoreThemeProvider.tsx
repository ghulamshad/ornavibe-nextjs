'use client';

import React, { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { mergeStorefrontTheme } from '@/lib/theme/mergeStoreTheme';

/**
 * Nested ThemeProvider for the storefront: merges API-driven primary / background
 * into the base MUI theme so components can use `primary.main`, `background.default`, etc.
 */
export default function StoreThemeProvider({ children }: { children: React.ReactNode }) {
  const site = useSiteContent();
  const theme = useMemo(() => mergeStorefrontTheme(site.theme), [site.theme]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
