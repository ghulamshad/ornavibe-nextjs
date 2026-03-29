'use client';

import React from 'react';
import { Box } from '@mui/material';
import HeroSliderSection, { HeroSlide } from './HeroSliderSection';
import HeroBanner from './HeroBanner';
import type { SmallBannerItem } from './SmallBannersSection';

interface HeroWithBannerProps {
  banner?: SmallBannerItem; // currently unused, kept for API compatibility
  slides: HeroSlide[];
  /** `full_bleed` = Tohfay-style full-width image carousel; `overlay` = text + background image slider. */
  variant?: 'overlay' | 'full_bleed';
}

export default function HeroWithBannerSection({ banner: _banner, slides, variant = 'overlay' }: HeroWithBannerProps) {
  return (
    <Box
      sx={{
        width: '100%',
        px: 0,
        pt: 0,
        pb: { xs: variant === 'full_bleed' ? 2 : 4, md: variant === 'full_bleed' ? 3 : 6 },
      }}
    >
      {variant === 'full_bleed' ? <HeroBanner slides={slides} /> : <HeroSliderSection slides={slides} />}
    </Box>
  );
}

