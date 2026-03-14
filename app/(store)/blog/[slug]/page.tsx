'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
} from '@mui/material';
import { Home, NavigateNext } from '@mui/icons-material';
import type { CmsBlogPost } from '@/types/cms';
import { fetchPublicBlogPost } from '@/lib/api/cmsPublic.service';

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [post, setPost] = useState<CmsBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchPublicBlogPost(slug)
      .then((data) => {
        if (!mounted) return;
        setPost(data);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Post not found');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!post) return;
    const title = post.seo?.meta_title || post.title;
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && post.seo?.meta_description) {
      metaDesc.setAttribute('content', post.seo.meta_description);
    }
  }, [post]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Skeleton width={200} height={24} sx={{ mb: 2 }} />
          <Skeleton width="90%" height={48} sx={{ mb: 2 }} />
          <Skeleton width={180} height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2, mb: 3 }} />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="60%" />
        </Container>
      </Box>
    );
  }

  if (error || !post) {
    notFound();
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <MuiLink component={Link} href="/" color="inherit" underline="hover">
            Home
          </MuiLink>
          <MuiLink component={Link} href="/blog" color="inherit" underline="hover">
            Blog
          </MuiLink>
          <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
            {post.title}
          </Typography>
        </Breadcrumbs>

        <Typography component="h1" variant="h4" fontWeight={700} gutterBottom>
          {post.title}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 2 }}>
          {post.publish_at && (
            <Typography variant="body2" color="text.secondary">
              {new Date(post.publish_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </Typography>
          )}
          {post.reading_time != null && (
            <Typography variant="body2" color="text.secondary">
              · {post.reading_time} min read
            </Typography>
          )}
          {post.author?.name && (
            <Typography variant="body2" color="text.secondary">
              · {post.author.name}
            </Typography>
          )}
        </Box>

        {(post.categories?.length > 0 || post.tags?.length > 0) && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {post.categories?.map((c) => (
              <Chip key={c.id} size="small" label={c.name} component={Link} href={`/blog?category=${c.id}`} clickable sx={{ textDecoration: 'none' }} />
            ))}
            {post.tags?.map((t) => (
              <Chip key={t.id} size="small" label={t.name} variant="outlined" component={Link} href={`/blog?tag=${t.id}`} clickable sx={{ textDecoration: 'none' }} />
            ))}
          </Box>
        )}

        {post.featured_image && (
          <Box
            component="img"
            src={post.featured_image}
            alt={post.title}
            sx={{ width: '100%', borderRadius: 2, mb: 3, objectFit: 'cover', maxHeight: 400 }}
          />
        )}

        {Array.isArray(post.content) ? (
          <Box
            component="article"
            sx={{
              '& p': { mb: 2, lineHeight: 1.8 },
              '& h2': { fontSize: '1.25rem', fontWeight: 600, mt: 3, mb: 1 },
              '& h3': { fontSize: '1.1rem', fontWeight: 600, mt: 2, mb: 1 },
              '& ul, & ol': { pl: 3, mb: 2 },
            }}
          >
            {post.content.map((block: { type?: string; content?: string }, idx: number) => (
              <Typography key={idx} variant="body1" component={block.type === 'heading' ? 'h2' : 'p'}>
                {typeof block === 'string' ? block : block.content ?? ''}
              </Typography>
            ))}
          </Box>
        ) : null}

        <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <MuiLink component={Link} href="/blog" underline="hover">
            ← Back to Blog
          </MuiLink>
        </Box>
      </Container>
    </Box>
  );
}
