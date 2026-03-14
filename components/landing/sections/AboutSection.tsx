'use client';

import React from 'react';
import { Box, Container, Typography, Button, Grid } from '@mui/material';
import Link from 'next/link';
import { ArrowForward } from '@mui/icons-material';
import { CheckCircle } from '@mui/icons-material';

interface AboutContent {
  title: string;
  body: string;
  bullet_list?: string[];
}

export default function AboutSection({ content }: { content: AboutContent }) {
  const bullets = content.bullet_list && content.bullet_list.length > 0
    ? content.bullet_list
    : ['We Made Awesome Products', 'Competitive Price & Easy To Shop', 'Affordable Modern Design', 'Streamlined Shipping Experience'];

  return (
    <Box id="about" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Grid container spacing={6} alignItems="center">
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'grey.100',
                minHeight: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              data-aos="fade-right"
            >
              <Typography color="text.secondary">About image</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: '#ff4f72', fontWeight: 600 }}>
              About Us
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
              {content.body}
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 3, '& li': { display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 } }}>
              {bullets.map((item, i) => (
                <Box component="li" key={i}>
                  <CheckCircle sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography component="span">{item}</Typography>
                </Box>
              ))}
            </Box>
            <Button
              component={Link}
              href="/contact"
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ borderRadius: 2 }}
            >
              Discover More
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
