'use client';

import React, { useMemo } from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import Slider from 'react-slick';
import Link from 'next/link';
import { ArrowForward } from '@mui/icons-material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { resolveMediaUrl } from '@/lib/utils/media';
import { softHeroGradient } from '@/lib/theme/storefrontSurfaces';

export interface HeroSlide {
  sub_title: string;
  title: string;
  description: string;
  cta_primary_text: string;
  cta_primary_href: string;
  cta_secondary_text: string;
  cta_secondary_href: string;
  image_url: string;
  /** Full-bleed hero: image alt text (optional; falls back to title without HTML). */
  image_alt?: string;
  /** Full-bleed hero: open primary link in a new tab (external promos). */
  open_in_new_tab?: boolean;
}

export default function HeroSliderSection({ slides }: { slides: HeroSlide[] }) {
  const theme = useTheme();
  const list = useMemo(() => {
    if (Array.isArray(slides) && slides.length > 0) return slides;
    return [
      {
        sub_title: 'Start From $15.99',
        title: 'Discover the latest trends and unique gifts for you',
        description: 'There are many variations of passages available but the majority have suffered alteration in some form.',
        cta_primary_text: 'About Us',
        cta_primary_href: '/about',
        cta_secondary_text: 'Shop Now',
        cta_secondary_href: '/products',
        image_url: '',
      },
    ] as HeroSlide[];
  }, [slides]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    // arrows: true,
    fade: true,
  };

  return (
    <Box
      id="hero-slider"
      sx={{
        position: 'relative',
        minHeight: { xs: 420, md: 560 },
        '& .slick-dots': { bottom: 24 },
        '& .slick-prev, & .slick-next': { zIndex: 2 },
        '& .slick-prev': { left: 16 },
        '& .slick-next': { right: 16 },
      }}
    >
      <Slider {...settings}>
        {list.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              minHeight: { xs: 420, md: 560 },
              backgroundImage: slide.image_url
                ? `url(${resolveMediaUrl(slide.image_url)})`
                : softHeroGradient(theme),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  maxWidth: 560,
                  ml: { xs: 2, sm: 4, md: 6 },
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
                      to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
                    },
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 1.5,
                    opacity: 0,
                    animation: 'fadeInUp 0.7s ease-out forwards',
                    animationDelay: '0.25s',
                    
                  }}
                >
                  {slide.sub_title}
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    '@keyframes fadeInRight': {
                      from: { opacity: 0, transform: 'translate3d(40px, 0, 0)' },
                      to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
                    },
                    fontSize: { xs: '2rem', md: '2.75rem', lg: '3.25rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 2,
                    opacity: 0,
                    animation: 'fadeInRight 0.8s ease-out forwards',
                    animationDelay: '0.5s',
                  }}
                >
                  {slide.title}
                </Typography>
                <Typography
                  sx={{
                    '@keyframes fadeInLeft': {
                      from: { opacity: 0, transform: 'translate3d(-40px, 0, 0)' },
                      to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
                    },
                    mb: 3,
                    color: 'text.secondary',
                    maxWidth: 480,
                    opacity: 0,
                    animation: 'fadeInLeft 0.8s ease-out forwards',
                    animationDelay: '0.75s',
                  }}
                >
                  {slide.description}
                </Typography>
                <Box
                  sx={{
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translate3d(0, 24px, 0)' },
                      to: { opacity: 1, transform: 'translate3d(0, 0, 0)' },
                    },
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    opacity: 0,
                    animation: 'fadeInUp 0.8s ease-out forwards',
                    animationDelay: '1s',
                  }}
                >
                  <Button
                    component={Link}
                    href={slide.cta_primary_href || '/products'}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    {slide.cta_primary_text}
                  </Button>
                  <Button
                    component={Link}
                    href={slide.cta_secondary_href || slide.cta_primary_href || '/products'}
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 2, px: 3 }}
                  >
                    {slide.cta_secondary_text}
                  </Button>
                </Box>
              </Box>
            </Container>
          </Box>
        ))}
      </Slider>
    </Box>
  );
}
