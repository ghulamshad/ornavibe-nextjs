'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { CmsPage } from '@/types/cms';
import { CmsPageRenderer } from '@/components/cms/CmsPageRenderer';
import { fetchPublicCmsPage } from '@/lib/api/cmsPublic.service';
import { Box, CircularProgress } from '@mui/material';

export default function CmsDynamicPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPublicCmsPage(slug)
      .then((data) => {
        if (!mounted) return;
        setPage(data);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Page not found');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !page) {
    notFound();
  }

  return <CmsPageRenderer page={page} />;
}

