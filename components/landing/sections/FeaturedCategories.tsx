'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Box, IconButton, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { neutralSlate } from '@/lib/theme/storefrontSurfaces';
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

const SECTION_TITLE_ID = 'featured-categories-heading';

export default function FeaturedCategories({ title = 'Featured Categories' }: FeaturedCategoriesProps) {
  const theme = useTheme();
  // Arrows on desktop only; mobile/tablet should rely on swipe (better UX + more space).
  const showNavArrows = useMediaQuery(theme.breakpoints.up('md'));
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
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
    const cap = (max: number) => Math.min(max, Math.max(1, n));
    const motionMs = reduceMotion ? 220 : 450;
    return {
      // CenterMode makes tiny “7 per row” looking tiles on small screens; keep it desktop-only.
      centerMode: !isSmDown && n > 1,
      centerPadding: '0',
      infinite: n > 1,
      speed: motionMs,
      cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
      rows: 1,
      slidesToShow: cap(7),
      slidesToScroll: 1,
      swipe: true,
      swipeToSlide: true,
      touchThreshold: 5,
      touchMove: true,
      autoplay: !reduceMotion && n > 3,
      autoplaySpeed: 4500,
      pauseOnHover: true,
      pauseOnFocus: true,
      accessibility: true,
      arrows: false,
      responsive: [
        { breakpoint: 1536, settings: { slidesToShow: cap(6), centerMode: n > 1, slidesToScroll: 1 } },
        { breakpoint: 1200, settings: { slidesToShow: cap(5), centerMode: n > 1, slidesToScroll: 1 } },
        // Tablet
        { breakpoint: 900, settings: { slidesToShow: cap(4), centerMode: false, slidesToScroll: 1 } },
        // Phones: match product grid feel (2 columns)
        { breakpoint: 600, settings: { slidesToShow: cap(2), centerMode: false, slidesToScroll: 1, infinite: n > 2 } },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: cap(2),
            centerMode: false,
            slidesToScroll: 1,
            infinite: n > 2,
          },
        },
      ],
    };
  }, [rootCategories, reduceMotion, isSmDown]);

  if (categoriesLoading && !rootCategories.length) {
    return (
      <Box
        component="section"
        className="cnt-lg"
        aria-busy="true"
        aria-labelledby={SECTION_TITLE_ID}
        sx={{
          py: { xs: 3, sm: 4, md: 6 },
          width: '100%',
          pl: { xs: 'max(12px, env(safe-area-inset-left, 0px))', sm: 2, md: 3 },
          pr: { xs: 'max(12px, env(safe-area-inset-right, 0px))', sm: 2, md: 3 },
        }}
      >
        <Box className="home_cats" data-section="FeaturedCollection" sx={{ maxWidth: 'xl', mx: 'auto' }}>
          <Box className="section_title" sx={{ mb: { xs: 2, md: 3 }, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography id={SECTION_TITLE_ID} variant="h4" component="h2" fontWeight={700} sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem', md: '2.125rem' } }}>
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              overflowX: 'auto',
              overflowY: 'hidden',
              pb: 0.5,
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              mx: { xs: -0.5, sm: 0 },
              px: { xs: 0.5, sm: 0 },
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                sx={{
                  flex: '0 0 auto',
                  width: { xs: 'min(42vw, 168px)', sm: 140, md: 154 },
                  height: { xs: 'min(42vw, 168px)', sm: 140, md: 154 },
                  borderRadius: 2,
                  scrollSnapAlign: 'start',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  if (!rootCategories.length) {
    return null;
  }

  const mobileCard = (cat: Category) => {
    const href = `/categories/${cat.slug}`;
    const src = cat.image_url ? resolveMediaUrl(cat.image_url) : '';
    return (
      <Box
        key={cat.id}
        component={Link}
        href={href}
        sx={{
          flex: '0 0 auto',
          width: 'calc(50% - 6px)',
          minWidth: 150,
          textDecoration: 'none',
          color: 'inherit',
          scrollSnapAlign: 'start',
        }}
      >
        {src ? (
          <Box
            component="img"
            src={src}
            alt=""
            loading="lazy"
            sx={{ width: '100%', aspectRatio: '1', borderRadius: 2, objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: 2,
              bgcolor: neutralSlate(theme, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: 'text.secondary',
            }}
          >
            {cat.name.slice(0, 2).toUpperCase()}
          </Box>
        )}
        <Typography
          component="span"
          sx={{
            mt: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '0.85rem',
            lineHeight: 1.35,
          }}
        >
          {cat.name}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      component="section"
      className="cnt-lg"
      aria-labelledby={SECTION_TITLE_ID}
      sx={{
        py: { xs: 3, sm: 4, md: 6 },
        width: '100%',
        maxWidth: '100%',
        pl: { xs: 'max(12px, env(safe-area-inset-left, 0px))', sm: 2, md: 3 },
        pr: { xs: 'max(12px, env(safe-area-inset-right, 0px))', sm: 2, md: 3 },
        boxSizing: 'border-box',
        '& .featured-categories-slick .slick-slide': { px: { xs: 0.5, sm: 0.625, md: 0.5 } },
        '& .featured-categories-slick .slick-list': {
          // Only add side space when desktop arrows are visible.
          mx: { xs: 0, md: showNavArrows ? 5 : 0 },
          overflow: 'hidden',
        },
        '& .featured-categories-slick .slick-track': { display: 'flex', alignItems: 'stretch' },
        '& .featured-categories-slick .slick-slide > div': { height: '100%' },
      }}
    >
      <Box className="home_cats" data-section="FeaturedCollection" sx={{ maxWidth: 'xl', mx: 'auto' }}>
        <Box className="section_title" sx={{ mb: { xs: 2, md: 3 }, textAlign: { xs: 'center', md: 'left' } }}>
          <Typography
            id={SECTION_TITLE_ID}
            variant="h4"
            component="h2"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem', md: '2.125rem' }, lineHeight: { xs: 1.35, md: 1.2 } }}
          >
            {title}
          </Typography>
        </Box>

        <Box className="product_area">
          {!isMdUp ? (
            <Box
              sx={{
                display: 'flex',
                gap: 1.5,
                overflowX: 'auto',
                overflowY: 'hidden',
                pb: 0.75,
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
              }}
            >
              {rootCategories.map(mobileCard)}
            </Box>
          ) : (
            <Box className="product_container bottom" sx={{ position: 'relative' }}>
              <Slider
                ref={sliderRef}
                {...settings}
                key={`${rootCategories.length}-${isSmDown ? 'sm' : 'lg'}`}
                className="custom-row product_row1 featured-categories-slick"
              >
                {rootCategories.map((cat) => {
                  const href = `/categories/${cat.slug}`;
                  const src = cat.image_url ? resolveMediaUrl(cat.image_url) : '';

                  const thumb = src ? (
                    <Box
                      component="img"
                      src={src}
                      alt=""
                      loading="lazy"
                      sizes="(max-width: 480px) 45vw, (max-width: 900px) 30vw, 180px"
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
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      }}
                    >
                      {cat.name.slice(0, 2).toUpperCase()}
                    </Box>
                  );

                  return (
                    <Box key={cat.id} className="item" sx={{ px: { xs: 0.5, sm: 0.75 }, outline: 'none', height: '100%' }}>
                      <Box
                        component={Link}
                        href={href}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          textDecoration: 'none',
                          color: 'inherit',
                          borderRadius: 2,
                          minWidth: 0,
                          '&:focus-visible': {
                            outline: `2px solid ${theme.palette.primary.main}`,
                            outlineOffset: 3,
                          },
                        }}
                      >
                        {thumb}
                        <Typography
                          component="span"
                          sx={{
                            mt: { xs: 1, sm: 1.25 },
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textAlign: 'center',
                            color: 'text.primary',
                            fontWeight: 600,
                            lineHeight: 1.35,
                            fontSize: { xs: '0.8rem', sm: '0.8125rem', md: '0.875rem' },
                            minHeight: { xs: '2.7em', sm: 'auto' },
                            px: 0.25,
                            wordBreak: 'break-word',
                          }}
                        >
                          {cat.name}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Slider>

              {showNavArrows ? (
                <>
                  <IconButton
                    type="button"
                    aria-label="Previous categories"
                    onClick={() => sliderRef.current?.slickPrev()}
                    className="prev_arrow slick-arrow"
                    sx={{
                      position: 'absolute',
                      top: '42%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      color: 'text.primary',
                      bgcolor: 'transparent',
                      boxShadow: 'none',
                      width: { sm: 44, md: 48 },
                      height: { sm: 44, md: 48 },
                      '&:hover': { bgcolor: 'transparent', boxShadow: 'none' },
                      left: { sm: -4, md: -8 },
                    }}
                    size="large"
                  >
                    <ChevronLeft fontSize="medium" />
                  </IconButton>
                  <IconButton
                    type="button"
                    aria-label="Next categories"
                    onClick={() => sliderRef.current?.slickNext()}
                    className="next_arrow slick-arrow"
                    sx={{
                      position: 'absolute',
                      top: '42%',
                      transform: 'translateY(-50%)',
                      zIndex: 2,
                      color: 'text.primary',
                      bgcolor: 'transparent',
                      boxShadow: 'none',
                      width: { sm: 44, md: 48 },
                      height: { sm: 44, md: 48 },
                      '&:hover': { bgcolor: 'transparent', boxShadow: 'none' },
                      right: { sm: -4, md: -8 },
                    }}
                    size="large"
                  >
                    <ChevronRight fontSize="medium" />
                  </IconButton>
                </>
              ) : null}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
