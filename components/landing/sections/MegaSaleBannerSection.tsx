'use client';

import React from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Link from 'next/link';
import { promoStripeGradient, softDropShadow } from '@/lib/theme/storefrontSurfaces';

interface PromoBannerContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href?: string;
}

export default function MegaSaleBannerSection({ banner }: { banner: PromoBannerContent }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: { xs: 5, md: 6 },
        bgcolor: 'transparent',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            borderRadius: 4,
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 3,
            background: promoStripeGradient(theme),
            color: 'common.white',
          }}
          data-aos="fade-up"
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 600,
                opacity: 0.9,
              }}
            >
              {banner.eyebrow}
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, mt: 1, mb: 0.5 }}
            >
              {banner.title}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92 }}>
              {banner.subtitle}
            </Typography>
          </Box>
          <Button
            component={Link}
            href={banner.cta_href || '/products'}
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'background.paper',
              color: 'primary.main',
              borderRadius: 999,
              px: 4,
              py: 1.4,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: softDropShadow(theme),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.14),
              },
            }}
            >
              {banner.cta_label}
            </Button>
        </Box>
      </Container>
    </Box>
  );
}

