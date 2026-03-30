'use client';

import React, { useMemo, useRef } from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Slider from 'react-slick';
import type { Settings } from 'react-slick';
import Link from 'next/link';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { resolveMediaUrl } from '@/lib/utils/media';
import type { HeroSlide } from './HeroSliderSection';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim() || 'Banner';
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export interface HeroBannerProps {
  slides: HeroSlide[];
}

/**
 * Full-bleed image hero carousel (Tohfay-style): one slide = full-width image, optional link from primary CTA href.
 */
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
  };

  if (list.length === 0) {
    return null;
  }

  return (
    <Box
      className="cnt-lg"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        mx: 'auto',
        '& .hero-banner-slick .slick-list': {
          minHeight: { xs: 200, sm: 260, md: 320 },
        },
        '& .hero-banner-slick .slick-slide > div': { lineHeight: 0 },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Slider ref={sliderRef} {...settings} className="hero-banner-slick product_row1 hero_slider">
          {list.map((slide, index) => {
            const src = slide.image_url ? resolveMediaUrl(slide.image_url) : '';
            const href = slide.cta_primary_href?.trim() || '';
            const alt = slide.image_alt?.trim() || stripHtml(slide.title || slide.sub_title || '');
            const newTab = Boolean(slide.open_in_new_tab);

            const img = (
              <Box
                component="img"
                src={src || undefined}
                alt={alt}
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover',
                  maxHeight: { xs: 220, sm: 300, md: 380 },
                  minHeight: { xs: 180, sm: 240, md: 300 },
                  bgcolor: src ? 'transparent' : 'grey.200',
                  cursor: href ? 'pointer' : 'default',
                }}
              />
            );

            const inner =
              href && src ? (
                isExternalHref(href) ? (
                  <a
                    href={href}
                    {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    style={{ display: 'block', lineHeight: 0 }}
                  >
                    {img}
                  </a>
                ) : (
                  <Link href={href} style={{ display: 'block', lineHeight: 0 }}>
                    {img}
                  </Link>
                )
              ) : (
                img
              );

            return (
              <Box key={`${slide.title}-${index}`} sx={{ outline: 'none' }}>
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
            left: { xs: 4, md: 12 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: theme.palette.common.white,
            bgcolor: 'transparent',
            boxShadow: 'none',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))',
            '&:hover': { bgcolor: 'transparent', color: theme.palette.common.white, boxShadow: 'none' },
          }}
          size="large"
        >
          <ChevronLeft fontSize="large" />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Next slide"
          onClick={() => sliderRef.current?.slickNext()}
          className="next_arrow"
          sx={{
            position: 'absolute',
            right: { xs: 4, md: 12 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            color: theme.palette.common.white,
            bgcolor: 'transparent',
            boxShadow: 'none',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.55))',
            '&:hover': { bgcolor: 'transparent', color: theme.palette.common.white, boxShadow: 'none' },
          }}
          size="large"
        >
          <ChevronRight fontSize="large" />
        </IconButton>
      </Box>
    </Box>
  );
}
