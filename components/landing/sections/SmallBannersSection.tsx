'use client';

import React from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import Link from 'next/link';
import { ArrowForward } from '@mui/icons-material';
import SectionContainer from '@/components/ui/SectionContainer';
import { resolveMediaUrl } from '@/lib/utils/media';
import { softHeroGradient, mediaScrimLight } from '@/lib/theme/storefrontSurfaces';

export interface SmallBannerItem {
  eyebrow: string;
  title: string;
  cta_text: string;
  cta_href: string;
  image_url: string;
}

export default function SmallBannersSection({ items }: { items: SmallBannerItem[] }) {
  const theme = useTheme();
  const list =
    Array.isArray(items) && items.length >= 3
      ? items.slice(0, 3)
      : [
          {
            eyebrow: 'Gift Box',
            title: 'Awesome Gifts Box Collections',
            cta_text: 'Shop Now',
            cta_href: '/products',
            image_url: '',
          },
          {
            eyebrow: 'Occasion Gift',
            title: 'Best Occasion Gifts Collections',
            cta_text: 'Discover Now',
            cta_href: '/categories',
            image_url: '',
          },
          {
            eyebrow: 'Hot Sale',
            title: 'Combo Sets Gift Box Up To 50% Off',
            cta_text: 'Discover Now',
            cta_href: '/products',
            image_url: '',
          },
        ] as SmallBannerItem[];

  return (
    <SectionContainer>
      <Grid container spacing={3}>
        {list.map((banner, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index}>
            <Box
              component={Link}
              href={banner.cta_href || '/products'}
              sx={{
                display: 'block',
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                minHeight: 220,
                background: banner.image_url
                  ? `url(${resolveMediaUrl(banner.image_url)}) center/cover`
                  : softHeroGradient(theme),
                textDecoration: 'none',
                color: 'text.primary',
                '&:hover .banner-cta': { transform: 'translateX(4px)' },
              }}
              data-aos="fade-up"
              data-aos-delay={index * 80}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: mediaScrimLight(theme),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: 3,
                }}
              >
                <Typography
                  variant="overline"
                  sx={{ letterSpacing: '0.12em', color: 'primary.main', fontWeight: 600 }}
                >
                  {banner.eyebrow}
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, mb: 1.5 }}>
                  {banner.title}
                </Typography>
                <Typography
                  component="span"
                  className="banner-cta"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontWeight: 600,
                    color: 'primary.main',
                    transition: 'transform 0.2s',
                  }}
                >
                  {banner.cta_text}
                  <ArrowForward fontSize="small" />
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  );
}

