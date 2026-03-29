'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Link as MuiLink,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { loginRequest } from '@/redux/slices/auth.slice';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveStoreLogoSrc } from '@/lib/utils/branding';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { footer, store } = useSiteContent();
  const logoSrc = resolveStoreLogoSrc(store?.logo_url);
  const brandLine = [footer?.brand, footer?.company].filter(Boolean).join(' · ') || 'Sign in';
  const { loading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const searchParams = useSearchParams();
  const returnUrlParam = searchParams?.get('returnUrl') || '';
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!loading && isAuthenticated && user && token) {
      const role = user.role;
      if (role === 'customer') {
        // Prefer an explicit returnUrl (e.g. /checkout) if provided and safe
        const safeReturnUrl =
          returnUrlParam && returnUrlParam.startsWith('/') && !returnUrlParam.startsWith('/auth')
            ? returnUrlParam
            : '/';
        router.replace(safeReturnUrl);
      } else if (role === 'admin' || role === 'super_admin') {
        router.replace('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, loading, router, returnUrlParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginRequest({ email: formData.email, password: formData.password }));
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, sm: 8 },
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box
              component="img"
              src={logoSrc}
              alt={footer?.brand || 'Store'}
              sx={{ height: { xs: 44, sm: 52 }, width: 'auto', maxWidth: 200, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom align="center" fontWeight="bold">
            {brandLine}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoFocus
              disabled={loading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading || !formData.email || !formData.password}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

            <Box textAlign="center" sx={{ mt: 1 }}>
              <MuiLink component={Link} href="/auth/forgot-password" color="primary" variant="body2">
                Forgot Password?
              </MuiLink>
            </Box>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <MuiLink component={Link} href="/auth/register" color="primary">
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
