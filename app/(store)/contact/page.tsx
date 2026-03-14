'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Link as MuiLink,
  Skeleton,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { submitContactForm } from '@/lib/api/site.service';

export default function ContactPage() {
  const content = useSiteContent();
  const contact = content?.contact ?? { title: 'Contact', body: '', email: '', phone: '', success_message: '' };

  const title = contact.title || 'Contact';
  const body = contact.body || '';
  const email = contact.email || '';
  const phone = contact.phone || '';
  const successMessage = contact.success_message || 'Thank you. Your message has been sent. We will get back to you soon.';

  const [name, setName] = useState('');
  const [emailVal, setEmailVal] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorText, setErrorText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setStatus('submitting');
    try {
      await submitContactForm({ name, email: emailVal, subject: subject || undefined, message });
      setStatus('success');
      setName('');
      setEmailVal('');
      setSubject('');
      setMessage('');
    } catch (err: unknown) {
      setStatus('error');
      setErrorText(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <Box
      component="article"
      sx={{
        pt: { xs: 4, md: 6 },
        pb: { xs: 6, md: 10 },
        minHeight: '60vh',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="md">
        <Typography
          component="h1"
          variant="h4"
          fontWeight="bold"
          align="center"
          gutterBottom
          sx={{ mb: 3 }}
        >
          {title || <Skeleton width={200} />}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {body || (
            <>
              <Skeleton variant="text" width="100%" height={22} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="90%" height={22} />
            </>
          )}
        </Typography>
        {(email || phone) && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {email && (
              <Typography variant="body2" component="span" color="text.secondary" sx={{ mr: 1 }}>
                <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {email}
                </a>
              </Typography>
            )}
            {email && phone && (
              <Typography component="span" color="text.secondary">
                {' · '}
              </Typography>
            )}
            {phone && (
              <Typography variant="body2" component="span" color="text.secondary">
                <a href={`tel:${phone}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                  {phone}
                </a>
              </Typography>
            )}
          </Box>
        )}

        {status === 'success' ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {status === 'error' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorText}
              </Alert>
            )}
            <TextField
              fullWidth
              required
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              autoComplete="name"
            />
            <TextField
              fullWidth
              required
              type="email"
              label="Email"
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              margin="normal"
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              required
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              margin="normal"
              multiline
              rows={4}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={status === 'submitting'}
              sx={{ mt: 2 }}
            >
              {status === 'submitting' ? <CircularProgress size={24} /> : 'Send message'}
            </Button>
          </Box>
        )}

        <Typography variant="body2" align="center" color="text.secondary">
          See <MuiLink component={Link} href="/legal/terms">Terms</MuiLink> for support information.
        </Typography>
      </Container>
    </Box>
  );
}
