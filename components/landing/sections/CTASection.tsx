'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import Link from 'next/link';
import { alpha } from '@mui/material/styles';
import { ctaBandGradient } from '@/lib/theme/storefrontSurfaces';

interface CTAContent {
  title: string;
  subtitle: string;
}

export default function CTASection({ content }: { content: CTAContent }) {
  const theme = useTheme();
  return (
    <Box
      id="cta"
      sx={{
        py: { xs: 8, md: 12 },
        background: ctaBandGradient(theme),
        color: 'common.white',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }} data-aos="fade-up">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: 'common.white',
            }}
          >
            {content.title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: alpha(theme.palette.common.white, 0.9),
              lineHeight: 1.8,
            }}
          >
            {content.subtitle}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              component={Link}
              href="/products"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'background.paper',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 4,
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.92),
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Shop Gift Baskets
            </Button>
            <Button
              component={Link}
              href="/auth/register"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'common.white',
                color: 'common.white',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'common.white',
                  bgcolor: alpha(theme.palette.common.white, 0.12),
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
