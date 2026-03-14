'use client';

import React from 'react';
import { Box, Container, Typography, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

interface ContactContent {
  title: string;
  body: string;
  email: string;
  phone: string;
}

export default function ContactSection({ content }: { content: ContactContent }) {
  return (
    <Box id="contact" sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" align="center" gutterBottom>
          {content.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 2 }}>
          {content.body}
        </Typography>
        {(content.email || content.phone) && (
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1 }}>
            {content.email && <><a href={`mailto:${content.email}`}>{content.email}</a>{content.phone && ' · '}</>}
            {content.phone && <a href={`tel:${content.phone}`}>{content.phone}</a>}
          </Typography>
        )}
        <Typography variant="body2" align="center" color="text.secondary">
          See{' '}
          <MuiLink component={Link} href="/legal/terms">
            Terms
          </MuiLink>{' '}
          for support information.
        </Typography>
      </Container>
    </Box>
  );
}
