'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import Link from 'next/link';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { HeroSlide } from './HeroSliderSection';

/** Image fills the slide frame. `cover` is correct for full-bleed art at every breakpoint. */
const HeroSlideImage = styled(Image)({
  objectFit: 'cover',
  objectPosition: 'center',
});

function publicApiOrigin(): string {
  let base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
  if (base.endsWith('/api/v1')) base = base.slice(0, -'/api/v1'.length);
  if (base.endsWith('/api')) base = base.slice(0, -'/api'.length);
  try {
    return new URL(base).origin;
  } catch {
    return '';
  }
}

function heroImageUnoptimized(src: string): boolean {
  if (!src || src.startsWith('data:')) return true;
  if (!/^https?:\/\//i.test(src)) return false;
  try {
    const api = publicApiOrigin();
    if (!api) return true;
    return new URL(src).origin !== api;
  } catch {
    return true;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Image-aware sizing: phones/tablets use an aspect-ratio so the 16:9 master fits naturally
 * (avoids ~70% horizontal crop you'd get when forcing 100svh on portrait phones).
 * Desktop falls back to "full screen minus header spacer" (HEADER 76 + TOPBAR 42 = 118px).
 */
const HERO_ASPECT = {
  xs: '16 / 12', // ~4:3 on small phones — keeps subject visible
  sm: '16 / 10', // ~8:5 on large phones / small tablets
  md: 'auto', // desktop drives by height instead
} as const;
const HERO_HEIGHT_FALLBACK = {
  xs: 'auto',
  md: 'calc(100vh - 118px)',
} as const;
const HERO_HEIGHT_SVH = {
  xs: 'auto',
  md: 'calc(100svh - 118px)',
} as const;
const HERO_MIN_HEIGHT = {
  xs: 320,
  sm: 420,
  md: 540,
  lg: 600,
  xl: 660,
} as const;
const HERO_MAX_HEIGHT_FALLBACK = {
  xs: 'calc(100vh - 76px)',
  md: 'none',
} as const;
const HERO_MAX_HEIGHT_SVH = {
  xs: 'calc(100svh - 76px)',
  md: 'none',
} as const;

const HERO_SIZES = '100vw';

export interface HeroBannerProps {
  slides: HeroSlide[];
}

/**
 * Full-screen enterprise hero carousel:
 * - Fills viewport minus header spacer; gradient overlay for legibility.
 * - Per-slide eyebrow / HTML title / description / dual CTAs.
 * - Autoplay + swipe + keyboard nav (←/→); no on-screen pagination or arrow controls.
 */
export default function HeroBanner({ slides }: HeroBannerProps) {
  const sliderRef = useRef<Slider | null>(null);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const list = useMemo(() => {
    const raw = Array.isArray(slides) && slides.length > 0 ? slides : [];
    return raw.filter((s) => Boolean(s.image_url?.trim()));
  }, [slides]);

  const settings: Settings = useMemo(
    () => ({
      dots: false,
      infinite: list.length > 1,
      speed: prefersReducedMotion ? 0 : 900,
      fade: !prefersReducedMotion && list.length > 1,
      cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: !prefersReducedMotion && list.length > 1,
      autoplaySpeed: 6000,
      arrows: false,
      pauseOnHover: true,
      pauseOnFocus: true,
      accessibility: true,
      swipe: list.length > 1,
    }),
    [list.length, prefersReducedMotion]
  );

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      sliderRef.current?.slickPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      sliderRef.current?.slickNext();
    }
  }, []);

  if (list.length === 0) {
    return null;
  }

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional hero banners"
      tabIndex={0}
      onKeyDown={onKeyDown}
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'common.black',
        outline: 'none',
        // Phones/tablets: aspect-ratio drives height so the image isn't cropped to a sliver.
        aspectRatio: HERO_ASPECT,
        // Desktop: nearly full viewport (`100vh` fallback + `100svh` upgrade).
        height: HERO_HEIGHT_FALLBACK,
        maxHeight: HERO_MAX_HEIGHT_FALLBACK,
        '@supports (height: 100svh)': {
          height: HERO_HEIGHT_SVH,
          maxHeight: HERO_MAX_HEIGHT_SVH,
        },
        minHeight: HERO_MIN_HEIGHT,
        // Stretch slick to the full hero height (fade mode positions slides absolutely, height must be set explicitly).
        '& .hero-banner-slick': { height: '100%' },
        '& .hero-banner-slick .slick-list': { height: '100%' },
        '& .hero-banner-slick .slick-list .slick-track': { height: '100%' },
        '& .hero-banner-slick .slick-slide': { height: '100%' },
        '& .hero-banner-slick .slick-slide > div': { height: '100%', lineHeight: 0 },
        // Staged content reveal once a slide becomes active.
        '& .hero-banner-slick .slick-slide .hero-text': {
          opacity: 0,
          transform: 'translateY(16px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        },
        '& .hero-banner-slick .slick-slide.slick-active .hero-text': {
          opacity: 1,
          transform: 'translateY(0)',
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& .hero-banner-slick .slick-slide .hero-text': {
            opacity: 1,
            transform: 'none',
            transition: 'none',
          },
        },
      }}
    >
      <Slider ref={sliderRef} {...settings} className="hero-banner-slick product_row1 hero_slider">
        {list.map((slide, index) => {
          const src = slide.image_url ? resolveMediaUrl(slide.image_url) : '';
          const hrefPrimary = slide.cta_primary_href?.trim() || '';
          const hrefSecondary = slide.cta_secondary_href?.trim() || '';
          const titleHtml = slide.title?.trim() || '';
          const subtitle = slide.sub_title?.trim() || '';
          const description = slide.description?.trim() || '';
          const ctaPrimary = slide.cta_primary_text?.trim() || '';
          const ctaSecondary = slide.cta_secondary_text?.trim() || '';
          const alt =
            slide.image_alt?.trim() ||
            stripHtml(titleHtml) ||
            subtitle ||
            'Promotional banner';
          const newTab = Boolean(slide.open_in_new_tab);
          const isLcp = index === 0;
          const unoptimized = heroImageUnoptimized(src);

          const hasOverlay =
            Boolean(titleHtml || subtitle || description || ctaPrimary || ctaSecondary);

          const primaryButton =
            ctaPrimary && hrefPrimary ? (
              isExternalHref(hrefPrimary) ? (
                <Button
                  component="a"
                  href={hrefPrimary}
                  {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    minHeight: 48,
                    px: { xs: 2.5, md: 3.5 },
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {ctaPrimary}
                </Button>
              ) : (
                <Button
                  component={Link}
                  href={hrefPrimary}
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{
                    minHeight: 48,
                    px: { xs: 2.5, md: 3.5 },
                    borderRadius: 999,
                    fontWeight: 700,
                  }}
                >
                  {ctaPrimary}
                </Button>
              )
            ) : null;

          const secondaryButton =
            ctaSecondary && hrefSecondary ? (
              isExternalHref(hrefSecondary) ? (
                <Button
                  component="a"
                  href={hrefSecondary}
                  {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  variant="outlined"
                  size="large"
                  sx={{
                    minHeight: 48,
                    px: { xs: 2.5, md: 3.5 },
                    borderRadius: 999,
                    fontWeight: 700,
                    color: 'common.white',
                    borderColor: alpha('#fff', 0.7),
                    bgcolor: alpha('#fff', 0.08),
                    backdropFilter: 'blur(6px)',
                    '&:hover': { borderColor: 'common.white', bgcolor: alpha('#fff', 0.18) },
                  }}
                >
                  {ctaSecondary}
                </Button>
              ) : (
                <Button
                  component={Link}
                  href={hrefSecondary}
                  variant="outlined"
                  size="large"
                  sx={{
                    minHeight: 48,
                    px: { xs: 2.5, md: 3.5 },
                    borderRadius: 999,
                    fontWeight: 700,
                    color: 'common.white',
                    borderColor: alpha('#fff', 0.7),
                    bgcolor: alpha('#fff', 0.08),
                    backdropFilter: 'blur(6px)',
                    '&:hover': { borderColor: 'common.white', bgcolor: alpha('#fff', 0.18) },
                  }}
                >
                  {ctaSecondary}
                </Button>
              )
            ) : null;

          return (
            <Box
              key={`${slide.title || 'slide'}-${index}`}
              sx={{ position: 'relative', height: '100%', outline: 'none' }}
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${list.length}`}
            >
              {src ? (
                <HeroSlideImage
                  src={src}
                  alt={alt}
                  fill
                  sizes={HERO_SIZES}
                  priority={isLcp}
                  quality={88}
                  unoptimized={unoptimized}
                />
              ) : (
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'grey.900' }} />
              )}

              {/* Cinematic gradient: bottom-up on mobile, left-to-right on desktop, keeps copy readable on any art. */}
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: {
                    xs:
                      'linear-gradient(180deg, rgba(0,0,0,0.50) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.70) 100%)',
                    md:
                      'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.05) 80%, rgba(0,0,0,0) 100%)',
                  },
                  pointerEvents: 'none',
                }}
              />

              {hasOverlay && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    px: { xs: 2, sm: 4, md: 8, lg: 12, xl: 16 },
                  }}
                >
                  <Stack
                    className="hero-text"
                    spacing={{ xs: 1.5, md: 2.5 }}
                    sx={{
                      maxWidth: { xs: '100%', sm: 560, md: 640, lg: 720 },
                      width: '100%',
                      color: 'common.white',
                      textAlign: { xs: 'center', md: 'left' },
                      alignItems: { xs: 'center', md: 'flex-start' },
                    }}
                  >
                    {subtitle && (
                      <Typography
                        component="p"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: 2,
                          textTransform: 'uppercase',
                          fontSize: { xs: 11, sm: 12, md: 13 },
                          color: alpha('#fff', 0.88),
                          px: 1.25,
                          py: 0.5,
                          borderRadius: 999,
                          bgcolor: alpha('#fff', 0.12),
                          backdropFilter: 'blur(6px)',
                          border: `1px solid ${alpha('#fff', 0.18)}`,
                        }}
                      >
                        {subtitle}
                      </Typography>
                    )}
                    {titleHtml && (
                      <Typography
                        component="h1"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.05,
                          letterSpacing: -0.6,
                          // Clamp scales smoothly without intermediate jumps on every device.
                          fontSize: {
                            xs: 'clamp(1.5rem, 6.5vw, 2.25rem)',
                            sm: 'clamp(2rem, 5.5vw, 2.75rem)',
                            md: 'clamp(2.5rem, 4.2vw, 3.5rem)',
                            lg: 'clamp(3rem, 3.8vw, 4rem)',
                            xl: 'clamp(3.5rem, 3.4vw, 4.5rem)',
                          },
                          textShadow: '0 2px 16px rgba(0,0,0,0.25)',
                          // Cap title at 3 lines on phones so 2-CTA layouts always fit.
                          display: { xs: '-webkit-box', md: 'block' },
                          WebkitLineClamp: { xs: 3, md: 'unset' },
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: { xs: 'hidden', md: 'visible' },
                          '& p': { m: 0 },
                          '& span': { color: 'inherit' },
                        }}
                        dangerouslySetInnerHTML={{ __html: titleHtml }}
                      />
                    )}
                    {description && (
                      <Typography
                        component="p"
                        sx={{
                          color: alpha('#fff', 0.92),
                          fontSize: { xs: '0.9rem', md: '1.0625rem' },
                          lineHeight: 1.55,
                          maxWidth: { xs: '100%', md: 560 },
                          // Hide on tiny screens to keep the eyebrow + title + CTA visible.
                          display: { xs: 'none', sm: '-webkit-box' },
                          WebkitLineClamp: { sm: 2, md: 3 },
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                        }}
                      >
                        {description}
                      </Typography>
                    )}
                    {(primaryButton || secondaryButton) && (
                      <Stack
                        direction={{ xs: 'row', sm: 'row' }}
                        spacing={{ xs: 1, sm: 1.5 }}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{
                          width: { xs: '100%', sm: 'auto' },
                          pt: { xs: 0.5, md: 1 },
                          justifyContent: { xs: 'center', md: 'flex-start' },
                          alignItems: 'center',
                        }}
                      >
                        {primaryButton}
                        {secondaryButton}
                      </Stack>
                    )}
                  </Stack>
                </Box>
              )}
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
}
