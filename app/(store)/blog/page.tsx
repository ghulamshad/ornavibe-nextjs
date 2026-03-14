'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Pagination,
  Breadcrumbs,
  Link as MuiLink,
  Alert,
  Stack,
  Skeleton,
  Paper,
  useTheme,
} from '@mui/material';
import { Home, NavigateNext, ArticleOutlined } from '@mui/icons-material';
import { fetchPublicBlogList, fetchPublicBlogCategories, fetchPublicBlogTags } from '@/lib/api/cmsPublic.service';
import { useSiteContent } from '@/contexts/SiteContentContext';
import type { CmsBlogListItem, CmsBlogCategory, CmsBlogTag } from '@/types/cms';

const PER_PAGE = 12;

function formatPaginationLabel(from: number, to: number, count: number): string {
  if (count === 0) return '0 posts';
  return `${from}–${to} of ${count}`;
}

export default function BlogIndexPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteContent = useSiteContent();
  const blogContent = siteContent?.blog ?? {
    title: 'Blog',
    subtitle: 'Stories, tips, and updates from our team.',
    meta_title: 'Blog',
    meta_description: 'Read our latest articles, gift ideas, and company updates.',
  };

  const [items, setItems] = useState<CmsBlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [perPage] = useState(PER_PAGE);
  const [categories, setCategories] = useState<CmsBlogCategory[]>([]);
  const [tags, setTags] = useState<CmsBlogTag[]>([]);
  const categoryParam = searchParams.get('category');
  const tagParam = searchParams.get('tag');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(() => (categoryParam ? parseInt(categoryParam, 10) : null));
  const [selectedTagId, setSelectedTagId] = useState<number | null>(() => (tagParam ? parseInt(tagParam, 10) : null));

  useEffect(() => {
    if (blogContent.meta_title) document.title = blogContent.meta_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && blogContent.meta_description) metaDesc.setAttribute('content', blogContent.meta_description);
  }, [blogContent.meta_title, blogContent.meta_description]);

  useEffect(() => {
    const cat = searchParams.get('category');
    const tag = searchParams.get('tag');
    setSelectedCategoryId(cat ? parseInt(cat, 10) : null);
    setSelectedTagId(tag ? parseInt(tag, 10) : null);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    fetchPublicBlogCategories()
      .then((list) => { if (!cancelled) setCategories(list); })
      .catch(() => {});
    fetchPublicBlogTags()
      .then((list) => { if (!cancelled) setTags(list); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPublicBlogList({
      page,
      per_page: perPage,
      category_id: selectedCategoryId ?? undefined,
      tag_id: selectedTagId ?? undefined,
    })
      .then((res) => {
        setItems(res.data);
        setLastPage(res.meta.last_page);
        setTotal(res.meta.total);
      })
      .catch(() => setError('Unable to load blog posts.'))
      .finally(() => setLoading(false));
  }, [page, perPage, selectedCategoryId, selectedTagId]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => setPage(value);

  const hasActiveFilter = selectedCategoryId != null || selectedTagId != null;
  const clearFilters = () => {
    setSelectedCategoryId(null);
    setSelectedTagId(null);
    setPage(1);
    router.replace('/blog', { scroll: false });
  };

  const updateUrl = (category: number | null, tag: number | null) => {
    const params = new URLSearchParams();
    if (category != null) params.set('category', String(category));
    if (tag != null) params.set('tag', String(tag));
    const q = params.toString();
    router.replace(q ? `/blog?${q}` : '/blog', { scroll: false });
  };

  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero / header section - dynamic from backend */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.100',
          py: { xs: 4, md: 6 },
          mb: 4,
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Breadcrumbs
            separator={<NavigateNext fontSize="small" sx={{ color: 'grey.500' }} />}
            sx={{ mb: 2, '& .MuiLink-root': { color: 'grey.400' }, '& .MuiTypography-root': { color: 'grey.300' } }}
          >
            <MuiLink component={Link} href="/" color="inherit" underline="hover">
              Home
            </MuiLink>
            <Typography color="text.primary">{blogContent.title}</Typography>
          </Breadcrumbs>
          <Typography component="h1" variant="h3" fontWeight={700} gutterBottom sx={{ color: 'grey.50' }}>
            {blogContent.title}
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400', maxWidth: 560 }}>
            {blogContent.subtitle}
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
        {/* Filters - from API (categories/tags) */}
        {(categories.length > 0 || tags.length > 0) && (
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            {categories.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                onClick={() => {
                  const next = selectedCategoryId === c.id ? null : c.id;
                  setSelectedCategoryId(next);
                  setSelectedTagId(null);
                  setPage(1);
                  updateUrl(next, null);
                }}
                color={selectedCategoryId === c.id ? 'primary' : 'default'}
                variant={selectedCategoryId === c.id ? 'filled' : 'outlined'}
                size="medium"
              />
            ))}
            {tags.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                onClick={() => {
                  const next = selectedTagId === t.id ? null : t.id;
                  setSelectedTagId(next);
                  setSelectedCategoryId(null);
                  setPage(1);
                  updateUrl(null, next);
                }}
                color={selectedTagId === t.id ? 'primary' : 'default'}
                variant={selectedTagId === t.id ? 'filled' : 'outlined'}
                size="medium"
              />
            ))}
            {hasActiveFilter && (
              <Chip label="Clear filters" onClick={clearFilters} size="medium" variant="outlined" onDelete={clearFilters} />
            )}
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Loading…
            </Typography>
            <Grid container spacing={3}>
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <Card sx={{ height: '100%' }} elevation={0} variant="outlined">
                    <Skeleton variant="rectangular" height={200} animation="wave" />
                    <CardContent>
                      <Skeleton variant="text" width="90%" height={32} />
                      <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="80%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        ) : items.length === 0 ? (
          <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <ArticleOutlined sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {hasActiveFilter ? 'No posts match the selected filter' : 'No posts yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {hasActiveFilter ? 'Try another category or tag, or clear filters.' : 'Check back soon for new articles.'}
            </Typography>
            {hasActiveFilter && (
              <MuiLink component={Link} href="/blog" onClick={clearFilters} underline="hover" fontWeight={600}>
                Clear filters
              </MuiLink>
            )}
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {formatPaginationLabel(from, to, total)}
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {items.map((post) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.id}>
                  <Card
                    component={Link}
                    href={`/blog/${post.slug}`}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: theme.transitions.create(['box-shadow', 'transform'], { duration: 200 }),
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)',
                      },
                    }}
                    elevation={0}
                    variant="outlined"
                  >
                    {post.featured_image ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={post.featured_image}
                        alt={post.title}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: 'grey.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ArticleOutlined sx={{ fontSize: 48, color: 'grey.400' }} />
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, lineHeight: 1.3 }}>
                        {post.title}
                      </Typography>
                      {(post.publish_at || post.author?.name || post.reading_time != null) && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          {post.publish_at && new Date(post.publish_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          {post.reading_time != null && ` · ${post.reading_time} min read`}
                          {post.author?.name && ` · ${post.author.name}`}
                        </Typography>
                      )}
                      {post.excerpt && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flexGrow: 1,
                          }}
                        >
                          {post.excerpt}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {lastPage > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2, mt: 4 }}>
                <Pagination
                  count={lastPage}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="large"
                />
                <Typography variant="body2" color="text.secondary">
                  {formatPaginationLabel(from, to, total)}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
