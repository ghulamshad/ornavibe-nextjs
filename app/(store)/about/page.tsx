'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Skeleton,
  Paper,
  Grid,
  Stack,
  Divider,
  Button,
  Chip,
  Link as MuiLink,
  useTheme,
} from '@mui/material';
import { pageHeroBg, onHeroPaper, surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import { Home, NavigateNext, InfoOutlined, VerifiedOutlined, LocalShippingOutlined, SupportAgentOutlined, ArrowForward } from '@mui/icons-material';
import { useSiteContent } from '@/contexts/SiteContentContext';

export default function AboutPage() {
  const theme = useTheme();
  const content = useSiteContent();
  const about = (content?.about ?? { title: 'About', body: '', bullet_list: [] as string[] }) as {
    title?: string;
    body?: string;
    bullet_list?: string[];
  };

  const bullets = useMemo(() => {
    const list = (about.bullet_list ?? []).map((s) => String(s).trim()).filter(Boolean);
    if (list.length > 0) return list.slice(0, 8);
    return [
      'Curated gift baskets for every occasion',
      'Reliable fulfillment and careful packaging',
      'Quality-first sourcing and presentation',
      'Dedicated support from checkout to delivery',
    ];
  }, [about.bullet_list]);

  const values = useMemo(
    () => [
      {
        icon: <VerifiedOutlined fontSize="medium" />,
        title: 'Quality & care',
        body: 'Every basket is assembled with attention to detail—so it looks as good as it feels to receive.',
      },
      {
        icon: <LocalShippingOutlined fontSize="medium" />,
        title: 'Reliable delivery',
        body: 'We focus on clear timelines and dependable fulfillment to help you gift confidently.',
      },
      {
        icon: <SupportAgentOutlined fontSize="medium" />,
        title: 'Human support',
        body: 'Need help picking a gift or adjusting an order? Our team is here to help.',
      },
    ],
    []
  );

  return (
    <Box component="article" sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: pageHeroBg(theme),
          color: onHeroPaper(theme),
          py: { xs: 4, md: 6 },
          mb: 4,
          borderRadius: 0,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
            <MuiLink
              component={Link}
              href="/"
              color="inherit"
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', color: onHeroPaper(theme, 0.55) }}
            >
              <Home fontSize="small" sx={{ mr: 0.5 }} /> Home
            </MuiLink>
            <NavigateNext fontSize="small" sx={{ color: onHeroPaper(theme, 0.45) }} />
            <Typography variant="body2" sx={{ color: onHeroPaper(theme, 0.65) }}>
              About
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <InfoOutlined sx={{ color: onHeroPaper(theme, 0.75) }} />
            <Typography component="h1" variant="h3" fontWeight={700} sx={{ color: onHeroPaper(theme) }}>
              {about.title || <Skeleton width={220} />}
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: onHeroPaper(theme, 0.72), maxWidth: 680 }}>
            Ornavibe by Rason Business — curated gifts designed to feel personal, premium, and effortless to send.
          </Typography>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Grid container spacing={3}>
          {/* Mission / story */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Our story
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {about.body || (
                  <>
                    <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="90%" height={24} />
                  </>
                )}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                What you can expect
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {bullets.map((b) => (
                  <Chip key={b} label={b} variant="outlined" />
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Trust / stats + CTA */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={3}>
              <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom>
                  Built for moments that matter
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                  From birthdays to business gifting, we focus on quality, clarity, and consistency—so your gift lands with the right impact.
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="h4" fontWeight={800}>
                      Premium
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Presentation
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="h4" fontWeight={800}>
                      Fast
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ordering
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="h4" fontWeight={800}>
                      Curated
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Collections
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="h4" fontWeight={800}>
                      Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You can reach
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  bgcolor: surfaceSoft(theme),
                }}
              >
                <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                  Need help choosing a gift?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Tell us what you’re celebrating—we’ll point you to the right collection.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button component={Link} href="/categories" variant="contained" endIcon={<ArrowForward />} sx={{ borderRadius: 2 }}>
                    Browse categories
                  </Button>
                  <Button component={Link} href="/contact" variant="outlined" sx={{ borderRadius: 2 }}>
                    Contact us
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Values */}
          <Grid size={{ xs: 12 }}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mt: 1 }}>
              <Typography variant="h5" fontWeight={800} gutterBottom>
                How we work
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 860, lineHeight: 1.8 }}>
                Enterprise-grade gifting is about consistency. We design every step—selection, presentation, and fulfillment—to feel premium and predictable.
              </Typography>
              <Grid container spacing={2}>
                {values.map((v) => (
                  <Grid key={v.title} size={{ xs: 12, md: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        height: '100%',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {v.icon}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={800}>
                          {v.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        {v.body}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
