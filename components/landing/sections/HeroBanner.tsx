'use client';

import React, { useMemo, useRef } from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import Link from 'next/link';
import Image from 'next/image';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { HeroSlide } from './HeroSliderSection';

/** `object-fit` tracks MUI breakpoints (mobile: full-width visible; md+: cover). */
const HeroSlideImage = styled(Image)(({ theme }) => ({
  objectFit: 'contain',
  objectPosition: 'center',
  [theme.breakpoints.up('md')]: {
    objectFit: 'cover',
  },
}));

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
  return html.replace(/<[^>]*>/g, '').trim() || 'Banner';
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Fluid heights per MUI breakpoint: scales with viewport between caps so phones, tablets, and desktops stay proportionally similar without jumps.
 */
const HERO_HEIGHT = {
  xs: 'clamp(12.5rem, 52vw, 17.5rem)',
  sm: 'clamp(15rem, 38vw, 20rem)',
  md: 'clamp(17.5rem, 32vw, 25rem)',
  lg: 'clamp(20rem, 28vw, 27.5rem)',
  xl: 'clamp(22.5rem, 24vw, 30rem)',
} as const;

const HERO_SIZES =
  '(max-width: 600px) 100vw, (max-width: 900px) 100vw, (max-width: 1200px) 100vw, (max-width: 1536px) 100vw, 100vw';

export interface HeroBannerProps {
  slides: HeroSlide[];
}

export default function HeroBanner({ slides }: HeroBannerProps) {
  const theme = useTheme();
  const sliderRef = useRef<Slider | null>(null);

  const list = useMemo(() => {
    const raw = Array.isArray(slides) && slides.length > 0 ? slides : [];
    return raw.filter((s) => Boolean(s.image_url?.trim()));
  }, [slides]);

  const settings: Settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    pauseOnHover: true,
    accessibility: true,
  };

  if (list.length === 0) {
    return null;
  }

  return (
    <Box
      className="cnt-lg"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional hero banners"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        overflow: 'hidden',
        '& .hero-banner-slick .slick-list': {
          minHeight: {
            xs: HERO_HEIGHT.xs,
            sm: HERO_HEIGHT.sm,
            md: HERO_HEIGHT.md,
            lg: HERO_HEIGHT.lg,
            xl: HERO_HEIGHT.xl,
          },
        },
        '& .hero-banner-slick .slick-slide > div': { lineHeight: 0 },
      }}
    >
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Slider ref={sliderRef} {...settings} className="hero-banner-slick product_row1 hero_slider">
          {list.map((slide, index) => {
            const src = slide.image_url ? resolveMediaUrl(slide.image_url) : '';
            const href = slide.cta_primary_href?.trim() || '';
            const alt = slide.image_alt?.trim() || stripHtml(slide.title || slide.sub_title || '');
            const newTab = Boolean(slide.open_in_new_tab);
            const isLcp = index === 0;
            const unoptimized = heroImageUnoptimized(src);

            const frame = (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '100%',
                  height: {
                    xs: HERO_HEIGHT.xs,
                    sm: HERO_HEIGHT.sm,
                    md: HERO_HEIGHT.md,
                    lg: HERO_HEIGHT.lg,
                    xl: HERO_HEIGHT.xl,
                  },
                  bgcolor: 'grey.100',
                  overflow: 'hidden',
                }}
              >
                <HeroSlideImage
                  src={src}
                  alt={alt}
                  fill
                  sizes={HERO_SIZES}
                  priority={isLcp}
                  quality={88}
                  unoptimized={unoptimized}
                />
              </Box>
            );

            const inner =
              href && src ? (
                isExternalHref(href) ? (
                  <a
                    href={href}
                    {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    style={{ display: 'block', lineHeight: 0, width: '100%' }}
                  >
                    {frame}
                  </a>
                ) : (
                  <Link href={href} style={{ display: 'block', lineHeight: 0, width: '100%' }}>
                    {frame}
                  </Link>
                )
              ) : (
                frame
              );

            return (
              <Box
                key={`${slide.title}-${index}`}
                sx={{ outline: 'none' }}
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${list.length}`}
              >
                {inner}
              </Box>
            );
          })}
        </Slider>

        <IconButton
          type="button"
          aria-label="Previous slide"
          onClick={() => sliderRef.current?.slickPrev()}
          className="prev_arrow"
          sx={{
            position: 'absolute',
            left: {
              xs: 'max(4px, env(safe-area-inset-left, 0px))',
              sm: 'max(8px, env(safe-area-inset-left, 0px))',
              md: 12,
            },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: theme.palette.common.white,
            bgcolor: 'transparent',
            boxShadow: 'none',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))',
            minWidth: { xs: 44, md: 48 },
            minHeight: { xs: 44, md: 48 },
            '&:hover': { bgcolor: 'rgba(0,0,0,0.12)', color: theme.palette.common.white, boxShadow: 'none' },
            touchAction: 'manipulation',
          }}
          size="large"
        >
          <ChevronLeft sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }} />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Next slide"
          onClick={() => sliderRef.current?.slickNext()}
          className="next_arrow"
          sx={{
            position: 'absolute',
            right: {
              xs: 'max(4px, env(safe-area-inset-right, 0px))',
              sm: 'max(8px, env(safe-area-inset-right, 0px))',
              md: 12,
            },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: theme.palette.common.white,
            bgcolor: 'transparent',
            boxShadow: 'none',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))',
            minWidth: { xs: 44, md: 48 },
            minHeight: { xs: 44, md: 48 },
            '&:hover': { bgcolor: 'rgba(0,0,0,0.12)', color: theme.palette.common.white, boxShadow: 'none' },
            touchAction: 'manipulation',
          }}
          size="large"
        >
          <ChevronRight sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }} />
        </IconButton>
      </Box>
    </Box>
  );
}
