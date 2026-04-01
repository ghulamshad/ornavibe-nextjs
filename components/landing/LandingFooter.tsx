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
import { alpha } from '@mui/material/styles';
import { Facebook, Instagram, Twitter } from '@mui/icons-material';
import Link from 'next/link';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveStoreLogoSrc } from '@/lib/utils/branding';

export default function LandingFooter() {
  const { footer, contact, store } = useSiteContent();
  const logoSrc = resolveStoreLogoSrc(store?.logo_url);
  const currentYear = new Date().getFullYear();
  const bg = footer?.background?.trim() || '#212121';
  const fg = footer?.text_color?.trim() || '#f5f5f5';
  const fgMuted = alpha(fg, 0.68);
  const fgSoft = alpha(fg, 0.52);
  const fgIcon = alpha(fg, 0.78);
  const borderSubtle = alpha(fg, 0.14);

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: bg,
        color: fg,
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Brand / about */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                component="img"
                src={logoSrc}
                // src="/assets/header-logo.png"
                alt={footer?.brand || 'Store'}
                sx={{ width: 200, height: 80, mr: 1.5, objectFit: 'contain', display: 'block' }}
              />
              <Box>
                {/* <Typography variant="h6" fontWeight={700}>
                  {footer.brand}
                </Typography> */}
                <Typography variant="body2" sx={{ color: fgMuted }}>
                  {footer.company}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, maxWidth: 320, color: fgMuted }}>
              {footer.tagline}
            </Typography>
            <Typography variant="body2" sx={{ color: fgSoft }}>
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
                    color: fgMuted,
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
                    color: fgMuted,
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
              <Typography variant="body2" sx={{ color: fgMuted }}>
                Email:{' '}
                <MuiLink
                  href={`mailto:${contact.email}`}
                  sx={{ color: fg, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {contact.email}
                </MuiLink>
              </Typography>
            )}
            {contact?.phone && (
              <Typography variant="body2" sx={{ color: fgMuted }}>
                Phone:{' '}
                <MuiLink
                  href={`tel:${contact.phone}`}
                  sx={{ color: fg, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                >
                  {contact.phone}
                </MuiLink>
              </Typography>
            )}
            <Typography variant="body2" sx={{ mt: 2, color: fgMuted }}>
              Follow us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <IconButton size="small" sx={{ color: fgIcon }} aria-label="Facebook">
                <Facebook fontSize="inherit" />
              </IconButton>
              <IconButton size="small" sx={{ color: fgIcon }} aria-label="Instagram">
                <Instagram fontSize="inherit" />
              </IconButton>
              <IconButton size="small" sx={{ color: fgIcon }} aria-label="Twitter">
                <Twitter fontSize="inherit" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: borderSubtle }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: fgSoft }}>
            © {currentYear} {footer.company}. {footer.brand} gift baskets. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <MuiLink
              component={Link}
              href="/legal/privacy"
              sx={{ color: fgSoft, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
            >
              Privacy
            </MuiLink>
            <MuiLink
              component={Link}
              href="/legal/terms"
              sx={{ color: fgSoft, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
            >
              Terms
            </MuiLink>
            <MuiLink
              component={Link}
              href="/legal/cookies"
              sx={{ color: fgSoft, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
            >
              Cookies
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
