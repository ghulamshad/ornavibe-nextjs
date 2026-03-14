'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import { Home, NavigateNext } from '@mui/icons-material';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
  contactEmail?: string;
}

export default function LegalPageLayout({ title, lastUpdated, children, contactEmail = 'hello@ornavibe.com' }: LegalPageLayoutProps) {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <MuiLink component={Link} href="/" color="inherit">
            Home
          </MuiLink>
          <MuiLink component={Link} href="/legal" color="inherit">
            Legal
          </MuiLink>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>

        <Paper elevation={2} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last Updated: {lastUpdated}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>

          <Box sx={{ '& > *': { mb: 2 } }}>
            {children}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              For questions about this document, please contact us at{' '}
              <MuiLink href={`mailto:${contactEmail}`}>{contactEmail}</MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
