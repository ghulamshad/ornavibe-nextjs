'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { alpha, darken } from '@mui/material/styles';
import { ArrowForward } from '@mui/icons-material';
import Link from 'next/link';
import {
  heroDecorativeSpots,
  heroRadialBackground,
  cardSpotlightGradient,
  elevatedCardShadow,
} from '@/lib/theme/storefrontSurfaces';

interface HeroContent {
  title: string;
  subtitle: string;
  cta_primary: string;
  cta_secondary: string;
}

interface HeroStat {
  label: string;
  value: string;
}

export default function HeroSection({ content, stats }: { content: HeroContent; stats?: HeroStat[] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      id="hero"
      sx={{
        position: 'relative',
        pt: { xs: 10, md: 14 },
        pb: { xs: 10, md: 14 },
        background: heroRadialBackground(theme),
        color: 'text.primary',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.7,
          backgroundImage: heroDecorativeSpots(theme),
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left: copy */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'primary.main',
                fontWeight: 600,
                mb: 1.5,
              }}
              data-aos="fade-up"
            >
              Best Gift Shop
            </Typography>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                fontWeight: 800,
                lineHeight: 1.2,
                mb: 2,
                color: 'text.primary',
              }}
              data-aos="fade-up"
            >
              {content.title}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontWeight: 400,
                lineHeight: 1.6,
                mb: 4,
                color: 'text.secondary',
                maxWidth: 560,
              }}
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {content.subtitle}
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mb: 4 }}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <Button
                component={Link}
                href="/products"
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 999,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: darken(theme.palette.primary.main, 0.12),
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {content.cta_primary}
              </Button>
              <Button
                component={Link}
                href="/categories"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  px: 4,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 999,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'text.secondary',
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                  },
                }}
              >
                {content.cta_secondary}
              </Button>
            </Stack>

            {stats && stats.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  mt: 4,
                }}
                data-aos="fade-up"
                data-aos-delay="300"
              >
                {stats.map((s) => (
                  <Box key={s.label}>
                    <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
                      {s.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {s.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>

          {/* Right: highlighted gift box card */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: 460,
                borderRadius: 4,
                bgcolor: 'background.paper',
                boxShadow: elevatedCardShadow(theme),
                p: 2,
                overflow: 'hidden',
              }}
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 999,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Start from $10.99
              </Box>
              <Box
                sx={{
                  borderRadius: 3,
                  height: 260,
                  background: cardSpotlightGradient(theme),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'common.white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  mb: 2,
                }}
              >
                Special Gifts Box
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}
              >
                Special Gifts Box For Your Love
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 1.5 }}
              >
                Curated premium gift set with free wrapping and handwritten card.
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  $29.99
                </Typography>
                <Button
                  component={Link}
                  href="/products"
                  size="small"
                  variant="contained"
                  color="primary"
                  sx={{
                    ml: 'auto',
                    borderRadius: 999,
                    px: 2.5,
                    '&:hover': { bgcolor: darken(theme.palette.primary.main, 0.1) },
                  }}
                >
                  Shop Now
                </Button>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
