'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

interface PromoBannerContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href?: string;
}

export default function MegaSaleBannerSection({ banner }: { banner: PromoBannerContent }) {
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
            background:
              'linear-gradient(120deg, #ffb2c4, #ff4f72)',
            color: '#ffffff',
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
              bgcolor: '#ffffff',
              color: '#ff4f72',
              borderRadius: 999,
              px: 4,
              py: 1.4,
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 18px 40px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: '#ffe7f0',
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

