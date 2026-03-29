'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Skeleton,
  Chip,
  IconButton,
  Button,
  useTheme,
} from '@mui/material';
import { ArrowBackIosNew, ArrowForwardIos } from '@mui/icons-material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';
import type { RootState, AppDispatch } from '@/redux/store';
import { getApiBaseURL } from '@/lib/api/axios';
import {
  fetchCategoriesRequest,
  fetchProductsRequest,
} from '@/redux/slices/catalog.slice';
import { categoryRibbonGradient } from '@/lib/theme/storefrontSurfaces';

const resolveImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${getApiBaseURL()}${url}`;
};

export default function CategorySliderSection() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, products } = useSelector(
    (state: RootState) => state.catalog
  );
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategoriesRequest());
    if (!products.length) dispatch(fetchProductsRequest());
  }, [categories.length, products.length, dispatch]);

  const rootCategories = categories.filter((c) => !c.parent_id);

  // ✅ Optimized count
  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const id = String(p.category_id || p.category?.id);
      if (!map[id]) map[id] = 0;
      map[id]++;
    });
    return map;
  }, [products]);

  // 🔥 Keen slider config
  const [sliderRef, instanceRef] = useKeenSlider({
    loop: false,
    mode: 'free-snap',
    slides: {
      perView: 6,
      spacing: 16,
    },
    breakpoints: {
      '(max-width: 1400px)': { slides: { perView: 5 } },
      '(max-width: 1200px)': { slides: { perView: 4 } },
      '(max-width: 900px)': { slides: { perView: 3 } },
      '(max-width: 600px)': { slides: { perView: 2 } },
      '(max-width: 400px)': { slides: { perView: 1.2 } }, // 👀 peek
    },
    created() {
      setLoaded(true);
    },
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  if (!rootCategories.length) {
    return (
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box display="flex" gap={2} sx={{ overflow: 'hidden' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={160}
                height={180}
                sx={{ borderRadius: 3 }}
              />
            ))}
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 5, md: 9 },
        background: (theme) =>
          `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[50]} 100%)`,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          mb={{ xs: 3, md: 4 }}
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={850}
              sx={{ letterSpacing: -0.5, lineHeight: 1.1 }}
            >
              Shop by category
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Browse popular categories and jump straight to what you need.
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/categories"
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderRadius: 999,
              px: 2.25,
              py: 1,
              fontWeight: 650,
              alignSelf: { xs: 'flex-start', md: 'auto' },
            }}
          >
            View all
          </Button>
        </Box>

        {/* Slider */}
        <Box sx={{ position: 'relative' }}>
          {/* Desktop arrows */}
          {loaded && instanceRef.current && (
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                pointerEvents: 'none',
              }}
            >
              <IconButton
                aria-label="Previous categories"
                onClick={() => instanceRef.current?.prev()}
                disabled={currentSlide === 0}
                sx={{
                  pointerEvents: 'auto',
                  position: 'absolute',
                  left: -18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  border: (t) => `1px solid ${t.palette.divider}`,
                  boxShadow: 2,
                  width: 44,
                  height: 44,
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 4 },
                  '&.Mui-disabled': { opacity: 0.35 },
                }}
              >
                <ArrowBackIosNew fontSize="small" />
              </IconButton>

              <IconButton
                aria-label="Next categories"
                onClick={() => instanceRef.current?.next()}
                disabled={
                  currentSlide >=
                  (instanceRef.current.track.details?.slides?.length ?? 1) - 1
                }
                sx={{
                  pointerEvents: 'auto',
                  position: 'absolute',
                  right: -18,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'background.paper',
                  border: (t) => `1px solid ${t.palette.divider}`,
                  boxShadow: 2,
                  width: 44,
                  height: 44,
                  '&:hover': { bgcolor: 'background.paper', boxShadow: 4 },
                  '&.Mui-disabled': { opacity: 0.35 },
                }}
              >
                <ArrowForwardIos fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box
            ref={sliderRef}
            className="keen-slider"
            sx={{
              // give the first/last cards some breathing room on wide screens
              px: { xs: 0, md: 0.5 },
            }}
          >
          {rootCategories.map((cat) => (
            <Box
              key={cat.id}
              className="keen-slider__slide"
            >
              <Box
                component={Link}
                href={`/categories/${cat.slug}`}
                sx={{ textDecoration: 'none' }}
              >
                <Box
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: (t) => `1px solid ${t.palette.divider}`,
                    textAlign: 'left',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.75,
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px)',
                      borderColor: 'primary.main',
                    },
                    '&:hover img': {
                      transform: 'scale(1.04)',
                    },
                    '&:focus-visible': {
                      outline: '3px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  {/* Badge */}
                  <Chip
                    label={productCountMap[cat.id] || 0}
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      fontWeight: 700,
                    }}
                  />

                  {/* Image */}
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '16 / 10',
                      borderRadius: 2.5,
                      background: categoryRibbonGradient(theme),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: (t) => `1px solid ${t.palette.divider}`,
                    }}
                  >
                    {cat.image_url ? (
                      <Box
                        component="img"
                        src={resolveImageUrl(cat.image_url)}
                        alt={cat.name}
                        loading="lazy"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.35s ease',
                        }}
                      />
                    ) : (
                      <Typography fontWeight={800} color="primary.main">
                        {cat.name.charAt(0)}
                      </Typography>
                    )}
                  </Box>

                  {/* Text */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  <Typography fontWeight={800} sx={{ letterSpacing: -0.2 }}>
                    {cat.name}
                  </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {productCountMap[cat.id] || 0} items
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}