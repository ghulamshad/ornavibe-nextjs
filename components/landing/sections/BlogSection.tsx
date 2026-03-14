'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { ArrowForward } from '@mui/icons-material';
import { fetchPublicBlogList } from '@/lib/api/cmsPublic.service';
import type { CmsBlogListItem } from '@/types/cms';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

function formatDate(s: string | null) {
  if (!s) return '';
  try {
    return new Date(s).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

export default function BlogSection() {
  const [posts, setPosts] = useState<CmsBlogListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicBlogList({ per_page: 3 })
      .then((res) => setPosts(res.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading && !posts.length) {
    return (
      <SectionContainer>
        <Box textAlign="center" py={6}>
          <CircularProgress />
        </Box>
      </SectionContainer>
    );
  }

  if (!posts.length) return null;

  return (
    <SectionContainer>
      <SectionHeader eyebrow="Our Blog" title="Our Latest News & Blog" />

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid size={{ xs: 12, md: 4 }} key={post.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                '&:hover': { boxShadow: 4 },
              }}
            >
              <CardActionArea
                component={Link}
                href={`/blog/${post.slug}`}
                sx={{ height: '100%', flexDirection: 'column', alignItems: 'stretch' }}
              >
                <Box sx={{ pt: '56%', position: 'relative', bgcolor: 'grey.200' }}>
                  {post.featured_image && (
                    <CardMedia
                      component="img"
                      image={post.featured_image}
                      alt={post.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 12,
                      left: 12,
                      bgcolor: 'background.paper',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(post.publish_at)}
                    </Typography>
                  </Box>
                </Box>
                <CardContent sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.excerpt || 'Read more.'}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: 'primary.main',
                      fontWeight: 600,
                    }}
                  >
                    Read More
                    <ArrowForward fontSize="small" />
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  );
}
