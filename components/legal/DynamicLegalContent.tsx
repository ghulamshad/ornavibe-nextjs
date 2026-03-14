'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import { fetchLegalPage, fetchPageBySlug, type LegalPageContent } from '@/lib/api/site.service';

const LEGAL_SLUGS = ['privacy', 'terms', 'cookies'];

interface DynamicLegalContentProps {
  slug: string;
  contactEmail?: string;
  /** Fallback title when slug is not one of the known legal slugs (e.g. "SLA") */
  fallbackTitle?: string;
}

export default function DynamicLegalContent({ slug, contactEmail, fallbackTitle }: DynamicLegalContentProps) {
  const [data, setData] = useState<LegalPageContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = LEGAL_SLUGS.includes(slug)
      ? () => fetchLegalPage(slug as 'privacy' | 'terms' | 'cookies')
      : () => fetchPageBySlug(slug);
    fetch()
      .then(setData)
      .catch(() => setError('Unable to load this page.'));
  }, [slug]);

  const defaultTitle = fallbackTitle ?? (slug === 'privacy' ? 'Privacy Policy' : slug === 'terms' ? 'Terms of Service' : slug === 'cookies' ? 'Cookie Policy' : slug.replace(/-/g, ' '));
  if (error) {
    return (
      <LegalPageLayout title={defaultTitle} lastUpdated="">
        <Alert severity="error">{error}</Alert>
      </LegalPageLayout>
    );
  }

  if (!data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const email = contactEmail ?? data.contact_email ?? 'hello@ornavibe.com';

  return (
    <LegalPageLayout title={data.title} lastUpdated={data.last_updated} contactEmail={email}>
      <Box
        component="article"
        sx={{
          '& h2': { fontSize: '1.25rem', fontWeight: 600, mt: 3, mb: 1 },
          '& h2:first-of-type': { mt: 0 },
          '& p': { mb: 2, lineHeight: 1.8 },
          '& strong': { fontWeight: 600 },
        }}
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </LegalPageLayout>
  );
}
