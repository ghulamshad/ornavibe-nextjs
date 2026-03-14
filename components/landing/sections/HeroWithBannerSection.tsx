'use client';

import React from 'react';
import { Box } from '@mui/material';
import HeroSliderSection, { HeroSlide } from './HeroSliderSection';
import type { SmallBannerItem } from './SmallBannersSection';

interface HeroWithBannerProps {
  banner?: SmallBannerItem; // currently unused, kept for API compatibility
  slides: HeroSlide[];
}

export default function HeroWithBannerSection({ banner: _banner, slides }: HeroWithBannerProps) {
  return (
    <Box
      sx={{
        width: '100%',
        px: 0,
        pt: { xs: 0, md: 1 },
        pb: { xs: 4, md: 6 },
      }}
    >
      <HeroSliderSection slides={slides} />
    </Box>
  );
}

