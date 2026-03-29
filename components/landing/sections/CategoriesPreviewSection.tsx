'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchCategoriesRequest } from '@/redux/slices/catalog.slice';
import type { Category } from '@/types/catalog';
import { softPrimaryTint } from '@/lib/theme/storefrontSurfaces';

const iconForCategory = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('gift')) return '🎁';
  if (n.includes('home') || n.includes('living')) return '🏡';
  if (n.includes('jewel')) return '💍';
  if (n.includes('office') || n.includes('stationery')) return '🖊️';
  if (n.includes('care')) return '🧺';
  if (n.includes('personal')) return '✨';
  if (n.includes('occasion')) return '🎉';
  return '🎀';
};

export default function CategoriesPreviewSection() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, error } = useSelector((state: RootState) => state.catalog);

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategoriesRequest());
    }
  }, [categories.length, dispatch]);

  const rootCategories = categories.filter((c) => !c.parent_id).slice(0, 6);

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="overline"
            sx={{
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'primary.main',
              fontWeight: 600,
            }}
            data-aos="fade-up"
          >
            Gifts Category
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mt: 1 }}
            data-aos="fade-up"
            data-aos-delay="80"
          >
            Browse By Category
          </Typography>
        </Box>

        {error && !categories.length && (
          <Box textAlign="center" data-aos="fade-up">
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        )}

        {!error && !categories.length && (
          <Box textAlign="center" py={4} data-aos="fade-up">
            <CircularProgress />
          </Box>
        )}

        {!!rootCategories.length && (
          <Grid container spacing={2.5}>
            {rootCategories.map((cat, index) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 4 }}
                key={cat.id}
                data-aos="fade-up"
                data-aos-delay={index * 80}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    borderColor: (theme) => theme.palette.divider,
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={`/categories/${cat.slug}`}
                    sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '999px',
                        bgcolor: softPrimaryTint(theme),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                      }}
                    >
                      {iconForCategory(cat.name)}
                    </Box>
                    <CardContent
                      sx={{
                        p: 0,
                        '&:last-child': { pb: 0 },
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={700}>
                        {cat.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {cat.description || 'Explore curated gifts and baskets.'}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

