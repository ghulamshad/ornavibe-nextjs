'use client';

import React, { useEffect, useState } from 'react';
import { Paper, type PaperProps } from '@mui/material';
import { sanitizeProductHtml } from '@/lib/utils/sanitizeProductHtml';

export interface ProductRichDescriptionProps extends Omit<PaperProps, 'children'> {
  /** Raw HTML from your product (`short_description` or `description`). */
  htmlSource: string;
}

/**
 * Sanitized product copy with MUI Paper + theme typography hooks for nested tags.
 */
export default function ProductRichDescription({ htmlSource, sx, elevation = 0, ...paperProps }: ProductRichDescriptionProps) {
  const [safeHtml, setSafeHtml] = useState('');

  useEffect(() => {
    setSafeHtml(sanitizeProductHtml(htmlSource || ''));
  }, [htmlSource]);

  if (!safeHtml) return null;

  return (
    <Paper
      elevation={elevation}
      {...paperProps}
      sx={[
        (theme) => ({
          color: 'text.primary',
          typography: 'body2',
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          '& h4': { ...theme.typography.subtitle1, fontWeight: 700, mt: 0, mb: 1 },
          '& h5': { ...theme.typography.subtitle2, fontWeight: 700, mt: 0, mb: 0.75 },
          '& h6': { ...theme.typography.body2, fontWeight: 700, mt: 1, mb: 0.5 },
          '& ul, & ol': { m: 0, pl: 2.5, mb: 1 },
          '& li': { mb: 0.4 },
          '& a': { color: 'primary.main', wordBreak: 'break-word', fontWeight: 500 },
          '& p': { m: 0, mb: 0.75 },
          '& strong, & b': { fontWeight: 700 },
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
