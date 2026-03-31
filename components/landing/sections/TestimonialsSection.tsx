'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Button, useMediaQuery, useTheme } from '@mui/material';
import { neutralSlate } from '@/lib/theme/storefrontSurfaces';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import Link from 'next/link';
import Rating from '@mui/material/Rating';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { resolveMediaUrl } from '@/lib/utils/media';

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  avatar_url?: string;
  rating?: number;
}

export interface TestimonialsSectionProps {
  items: TestimonialItem[];
  title?: string;
  exploreMoreHref?: string;
  exploreMoreLabel?: string;
}

export default function TestimonialsSection({
  items,
  title = 'Testimonials',
  exploreMoreHref = '/testimonials',
  exploreMoreLabel = 'Explore More',
}: TestimonialsSectionProps) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const list = useMemo(
    () => (Array.isArray(items) ? items.filter((t) => t.quote?.trim() || t.name?.trim()) : []),
    [items]
  );

  const settings: Settings = useMemo(() => {
    const n = list.length;
    const cap = (max: number) => Math.min(max, Math.max(1, n));
    const slidesToShow = isXs ? (n <= 1 ? 1 : 1.08) : isSm ? cap(2) : isMd ? cap(3) : n <= 2 ? cap(2) : 3.6;
    return {
      centerMode: false,
      centerPadding: '0',
      arrows: false,
      rows: 1,
      infinite: false,
      slidesToShow,
      slidesToScroll: 1,
      autoplay: n > 2,
      speed: 1000,
      autoplaySpeed: 5000,
      dots: false,
      pauseOnHover: true,
      swipe: true,
      touchThreshold: 8,
    };
  }, [list.length, isXs, isSm, isMd]);

  if (!list.length) {
    return null;
  }

  /** Fixed card height per breakpoint so every testimonial tile matches. */
  const cardHeight = { xs: 300, sm: 316, md: 332, lg: 348 };

  return (
    <Box
      component="section"
      className="cnt-lg"
      sx={{
        py: { xs: 3, sm: 4, md: 6 },
        px: { xs: 0, sm: 0 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        bgcolor: 'background.default',
        '& .testimonials-slick.slick-slider': { width: '100%', mb: 0 },
        '& .testimonials-slick .slick-list': {
          overflow: 'hidden',
          mx: { xs: 0, sm: 0 },
          px: { xs: 0.5, sm: 0 },
        },
        '& .testimonials-slick .slick-track': {
          display: 'flex !important',
          alignItems: 'stretch',
        },
        '& .testimonials-slick .slick-slide': {
          height: 'auto',
          display: 'flex !important',
          px: { xs: 0.75, sm: 1 },
          boxSizing: 'border-box',
          '& > div': {
            width: '100%',
            minWidth: 0,
            display: 'flex',
            alignItems: 'stretch',
          },
        },
      }}
    >
      <Box
        className="testi_slider"
        data-section="FeaturedCollection"
        sx={{ maxWidth: 'xl', mx: 'auto', px: { xs: 1.5, sm: 2, md: 3 }, width: '100%' }}
      >
        <Box
          className="section_title"
          sx={{ mb: { xs: 2, md: 3 }, textAlign: { xs: 'center', md: 'left' }, px: { xs: 0.5, sm: 0 } }}
        >
          <Typography
            variant="h4"
            component="h2"
            fontWeight={700}
            sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem', md: '2rem' }, lineHeight: { xs: 1.3, md: 1.2 } }}
          >
            {title}
          </Typography>
        </Box>

        <Box className="product_area" sx={{ width: '100%' }}>
          <Box className="product_container bottom" sx={{ position: 'relative', width: '100%' }}>
            <Slider key={`${list.length}-${isXs ? 'xs' : isSm ? 'sm' : isMd ? 'md' : 'lg'}`} {...settings} className="testimonial_active product_row1 testimonials-slick">
              {list.map((t, index) => {
                const avatar = t.avatar_url?.trim() ? resolveMediaUrl(t.avatar_url) : '';
                const rating = typeof t.rating === 'number' && t.rating > 0 ? Math.min(5, t.rating) : 5;

                return (
                  <Box
                    key={`${t.name}-${index}`}
                    className="single_testimonial"
                    sx={{ outline: 'none', width: '100%', display: 'flex', alignItems: 'stretch' }}
                  >
                    <Box
                      className="box"
                      sx={{
                        width: '100%',
                        height: cardHeight,
                        minHeight: cardHeight,
                        maxHeight: cardHeight,
                        p: { xs: 2, sm: 2.25, md: 2.5 },
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: { xs: 1, md: 2 },
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        className="imgs flex_center"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: { xs: 1, sm: 1.5 },
                          mb: { xs: 1.25, sm: 1.5 },
                          flexShrink: 0,
                        }}
                      >
                        {avatar ? (
                          <Box
                            component="img"
                            src={avatar}
                            alt=""
                            className="profile_img"
                            loading="lazy"
                            sx={{
                              width: { xs: 48, sm: 52, md: 56 },
                              height: { xs: 48, sm: 52, md: 56 },
                              borderRadius: '50%',
                              objectFit: 'cover',
                              flexShrink: 0,
                              bgcolor: neutralSlate(theme, 0.12),
                            }}
                          />
                        ) : (
                          <Box
                            className="profile_img"
                            sx={{
                              width: { xs: 48, sm: 52, md: 56 },
                              height: { xs: 48, sm: 52, md: 56 },
                              borderRadius: '50%',
                              flexShrink: 0,
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: { xs: '1rem', md: '1.1rem' },
                              fontWeight: 700,
                            }}
                            aria-hidden
                          >
                            {(t.name || 'U').charAt(0).toUpperCase()}
                          </Box>
                        )}
                        <Rating
                          name={`testi-rating-${index}`}
                          value={rating}
                          readOnly
                          size="small"
                          className="rating_img"
                          sx={{
                            flexShrink: 0,
                            '& .MuiSvgIcon-root': { fontSize: { xs: '1.1rem', sm: '1.25rem' } },
                          }}
                        />
                      </Box>

                      <Typography
                        component="span"
                        className="name"
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                          flexShrink: 0,
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {t.name}
                      </Typography>
                      <Box sx={{ minHeight: { xs: 18, sm: 20 }, mb: 0.5, flexShrink: 0 }}>
                        {t.role?.trim() ? (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.35 }}>
                            {t.role}
                          </Typography>
                        ) : null}
                      </Box>
                      <Typography
                        component="p"
                        color="text.secondary"
                        sx={{
                          m: 0,
                          flex: 1,
                          minHeight: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 5, sm: 6, md: 7 },
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: { xs: 1.55, sm: 1.6 },
                          fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                        }}
                      >
                        {t.quote}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Slider>
          </Box>
        </Box>
      </Box>

      {exploreMoreHref ? (
        <Box
          className="mb-5"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: { xs: 2.5, md: 3 },
            mb: { xs: 4, md: 5 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Button
            component={Link}
            href={exploreMoreHref}
            className="btn_one"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{
              textTransform: 'none',
              px: { xs: 3, sm: 4 },
              py: { xs: 1.25, sm: 1 },
              borderRadius: 2,
              fontWeight: 600,
              maxWidth: { xs: '100%', sm: 360 },
            }}
          >
            {exploreMoreLabel}
          </Button>
        </Box>
      ) : null}
    </Box>
  );
}
