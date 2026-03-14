'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 3,
        zIndex: 1300,
        borderRadius: 0,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight={500} gutterBottom>
              We use cookies to enhance your experience
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We use cookies to analyze site usage, personalize content, and improve our services. 
              By clicking "Accept", you consent to our use of cookies.{' '}
              <MuiLink component={Link} href="/legal/cookies" color="primary">
                Learn more
              </MuiLink>
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={handleReject} size="small">
              Reject
            </Button>
            <Button variant="contained" onClick={handleAccept} size="small">
              Accept
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
