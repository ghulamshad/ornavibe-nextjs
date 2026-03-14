'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  Divider,
  IconButton,
} from '@mui/material';
import { Facebook, Instagram, Twitter } from '@mui/icons-material';
import Link from 'next/link';
import { useSiteContent } from '@/contexts/SiteContentContext';

export default function LandingFooter() {
  const { footer, contact } = useSiteContent();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'grey.100',
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand / about */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {footer.brand}
            </Typography>
            <Typography variant="body2" color="grey.400" sx={{ mb: 2, maxWidth: 320 }}>
              {footer.tagline}
            </Typography>
            <Typography variant="body2" color="grey.500">
              Trusted by gift lovers for curated baskets and premium wrapping.
            </Typography>
          </Grid>

          {/* Shop links */}
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
              Shop
            </Typography>
            <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: 'Gift Baskets', href: '/products' },
                { label: 'Categories', href: '/categories' },
                { label: 'Cart', href: '/cart' },
                { label: 'Orders', href: '/orders' },
              ].map((link) => (
                <MuiLink
                  key={link.label}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Help / info */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
              Help &amp; Info
            </Typography>
            <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { label: 'Contact', href: '/contact' },
                { label: 'Shipping & Returns', href: '/legal/terms' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Privacy Policy', href: '/legal/privacy' },
                { label: 'Terms of Service', href: '/legal/terms' },
              ].map((link) => (
                <MuiLink
                  key={link.label}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </MuiLink>
              ))}
            </Box>
          </Grid>

          {/* Contact / newsletter */}
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
              Contact
            </Typography>
            {contact?.email && (
              <Typography variant="body2" color="grey.400">
                Email:{' '}
                <MuiLink
                  href={`mailto:${contact.email}`}
                  sx={{ color: 'grey.200', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {contact.email}
                </MuiLink>
              </Typography>
            )}
            {contact?.phone && (
              <Typography variant="body2" color="grey.400">
                Phone:{' '}
                <MuiLink
                  href={`tel:${contact.phone}`}
                  sx={{ color: 'grey.200', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {contact.phone}
                </MuiLink>
              </Typography>
            )}
            <Typography variant="body2" color="grey.400" sx={{ mt: 2 }}>
              Follow us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <IconButton size="small" sx={{ color: 'grey.300' }} aria-label="Facebook">
                <Facebook fontSize="inherit" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }} aria-label="Instagram">
                <Instagram fontSize="inherit" />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.300' }} aria-label="Twitter">
                <Twitter fontSize="inherit" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.800' }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="grey.500">
            © {currentYear} {footer.company}. {footer.brand} gift baskets. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <MuiLink
              component={Link}
              href="/legal/privacy"
              sx={{ color: 'grey.500', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              Privacy
            </MuiLink>
            <MuiLink
              component={Link}
              href="/legal/terms"
              sx={{ color: 'grey.500', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              Terms
            </MuiLink>
            <MuiLink
              component={Link}
              href="/legal/cookies"
              sx={{ color: 'grey.500', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              Cookies
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
