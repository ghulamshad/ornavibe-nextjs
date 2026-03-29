'use client';

import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Send } from '@mui/icons-material';

export interface NewsletterCopy {
  title: string;
  subtitle: string;
  button_text: string;
}

export default function NewsletterSection({ copy }: { copy?: NewsletterCopy }) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const title = copy?.title ?? 'Get 20% Off Discount Coupon';
  const subtitle = copy?.subtitle ?? 'By Subscribe Our Newsletter';
  const buttonText = copy?.button_text ?? 'Subscribe';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    // TODO: wire to API when backend endpoint exists
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 800);
  };

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
      <Container maxWidth="md">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            textAlign: 'center',
            '& .MuiTextField-root': { bgcolor: 'background.paper', borderRadius: 2 },
            '& .MuiOutlinedInput-root': { borderRadius: 2 },
          }}
        >
          <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            {subtitle}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              maxWidth: 520,
              mx: 'auto',
            }}
          >
            <TextField
              fullWidth
              type="email"
              placeholder="Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  '& fieldset': { borderColor: 'transparent' },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              endIcon={<Send />}
              disabled={status === 'loading'}
              sx={{
                bgcolor: 'background.paper',
                color: 'primary.main',
                borderRadius: 2,
                px: 3,
                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) },
              }}
            >
              {status === 'loading' ? '...' : buttonText}
            </Button>
          </Box>
          {status === 'success' && (
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
              Thanks for subscribing!
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}
