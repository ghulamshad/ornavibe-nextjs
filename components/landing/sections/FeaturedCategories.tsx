'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Box, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import { paperTranslucent, neutralSlate } from '@/lib/theme/storefrontSurfaces';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchCategoriesRequest } from '@/redux/slices/catalog.slice';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { Category } from '@/types/catalog';

export interface FeaturedCategoriesProps {
  title?: string;
}

function sortRootCategories(list: Category[]): Category[] {
  return [...list].sort((a, b) => {
    const ao = a.sort_order ?? 9999;
    const bo = b.sort_order ?? 9999;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name);
  });
}

export default function FeaturedCategories({ title = 'Featured Categories' }: FeaturedCategoriesProps) {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { categories, categoriesLoading } = useSelector((state: RootState) => state.catalog);
  const sliderRef = useRef<Slider | null>(null);

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategoriesRequest());
  }, [categories.length, dispatch]);

  const rootCategories = useMemo(() => {
    const roots = categories.filter((c) => !c.parent_id && c.slug);
    return sortRootCategories(roots);
  }, [categories]);

  const settings: Settings = useMemo(() => {
    const n = rootCategories.length;
    const slides = (cap: number) => Math.min(cap, Math.max(1, n));
    return {
      centerMode: n > 1,
      centerPadding: '0',
      infinite: n > 1,
      speed: 1000,
      rows: 1,
      slidesToShow: slides(7),
      slidesToScroll: 1,
      autoplay: n > 3,
      autoplaySpeed: 4000,
      arrows: false,
      pauseOnHover: true,
      responsive: [
        { breakpoint: 1500, settings: { slidesToShow: slides(7), centerMode: n > 1 } },
        { breakpoint: 1400, settings: { slidesToShow: slides(7), centerMode: n > 1 } },
        { breakpoint: 1200, settings: { slidesToShow: slides(5), centerMode: n > 1 } },
        { breakpoint: 900, settings: { slidesToShow: slides(4), centerMode: n > 1 } },
        {
          breakpoint: 480,
          settings: { slidesToShow: slides(3), centerMode: n > 1, arrows: false },
        },
      ],
    };
  }, [rootCategories.length]);

  if (categoriesLoading && !rootCategories.length) {
    return (
      <Box component="section" className="cnt-lg" sx={{ py: { xs: 4, md: 6 }, width: '100%' }}>
        <Box className="home_cats" data-section="FeaturedCollection" sx={{ maxWidth: 'xl', mx: 'auto', px: { xs: 2, md: 3 } }}>
          <Box className="section_title" sx={{ mb: 3 }}>
            <Typography variant="h4" component="h2" fontWeight={700}>
              {title}
            </Typography>
          </Box>
          <Box display="flex" gap={2} sx={{ overflow: 'hidden' }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={154} height={154} sx={{ flexShrink: 0, borderRadius: 2 }} />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (!rootCategories.length) {
    return null;
  }

  return (
    <Box
      component="section"
      className="cnt-lg"
      sx={{
        py: { xs: 4, md: 6 },
        width: '100%',
        '& .featured-categories-slick .slick-slide': { px: 0.5 },
        '& .featured-categories-slick .slick-list': { mx: { xs: 0, sm: 4 } },
        '& .featured-categories-slick .slick-track': { display: 'flex', alignItems: 'stretch' },
        '& .featured-categories-slick .slick-slide > div': { height: '100%' },
      }}
    >
      <Box
        className="home_cats"
        data-section="FeaturedCollection"
        sx={{ maxWidth: 'xl', mx: 'auto', px: { xs: 2, md: 3 } }}
      >
        <Box className="section_title" sx={{ mb: { xs: 2, md: 3 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography variant="h4" component="h2" fontWeight={700}>
            {title}
          </Typography>
        </Box>

        <Box className="product_area">
          <Box className="product_container bottom" sx={{ position: 'relative' }}>
            <Slider
              ref={sliderRef}
              {...settings}
              className="custom-row product_row1 featured-categories-slick"
            >
              {rootCategories.map((cat) => {
                const href = `/categories/${cat.slug}`;
                const src = cat.image_url ? resolveMediaUrl(cat.image_url) : '';

                const thumb = src ? (
                  <Box
                    component="img"
                    src={src}
                    alt={cat.name}
                    loading="lazy"
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: 2,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: neutralSlate(theme, 0.1),
                      typography: 'subtitle1',
                      fontWeight: 700,
                      color: 'text.secondary',
                      px: 1,
                      textAlign: 'center',
                    }}
                  >
                    {cat.name.slice(0, 2).toUpperCase()}
                  </Box>
                );

                return (
                  <Box key={cat.id} className="item" sx={{ px: 1, outline: 'none' }}>
                    <Link href={href} style={{ display: 'block', textDecoration: 'none' }}>
                      {thumb}
                      <Typography
                        variant="caption"
                        component="span"
                        sx={{
                          mt: 1,
                          display: 'block',
                          textAlign: 'center',
                          color: 'text.primary',
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        {cat.name}
                      </Typography>
                    </Link>
                  </Box>
                );
              })}
            </Slider>

            <IconButton
              type="button"
              aria-label="Previous categories"
              onClick={() => sliderRef.current?.slickPrev()}
              className="prev_arrow slick-arrow"
              sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: paperTranslucent(theme, 0.92),
                boxShadow: 2,
                '&:hover': { bgcolor: paperTranslucent(theme, 0.98) },
                '@media (max-width: 480px)': { display: 'none' },
                left: { xs: 0, md: -8 },
              }}
              size="large"
            >
              <ChevronLeft fontSize="large" />
            </IconButton>
            <IconButton
              type="button"
              aria-label="Next categories"
              onClick={() => sliderRef.current?.slickNext()}
              className="next_arrow slick-arrow"
              sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: paperTranslucent(theme, 0.92),
                boxShadow: 2,
                '&:hover': { bgcolor: paperTranslucent(theme, 0.98) },
                '@media (max-width: 480px)': { display: 'none' },
                right: { xs: 0, md: -8 },
              }}
              size="large"
            >
              <ChevronRight fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
