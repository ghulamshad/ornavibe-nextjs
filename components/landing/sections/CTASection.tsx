'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import Link from 'next/link';

interface CTAContent {
  title: string;
  subtitle: string;
}

export default function CTASection({ content }: { content: CTAContent }) {
  return (
    <Box
      id="cta"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, #ffb2c4 0%, #ff4f72 55%, #ff7f98 100%)',
        color: 'white',
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
              color: 'white',
            }}
          >
            {content.title}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: 'rgba(255, 255, 255, 0.9)',
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
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: 4,
                '&:hover': {
                  bgcolor: 'grey.100',
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
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
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
