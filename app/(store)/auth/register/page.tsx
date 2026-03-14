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
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { registerRequest } from '@/redux/slices/auth.slice';
import type { RegisterPayload } from '@/types/auth';

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { registerLoading, registerError, registerSuccess, isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const searchParams = useSearchParams();
  const returnUrlParam = searchParams?.get('returnUrl') || '';
  const [formData, setFormData] = useState<RegisterPayload & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // If user is already authenticated, redirect them away from register page
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!registerLoading && isAuthenticated && user && token) {
      if (user.role === 'customer') {
        router.replace('/');
      } else {
        router.replace('/admin/dashboard');
      }
    }
  }, [isAuthenticated, user, registerLoading, router]);

  useEffect(() => {
    // After successful registration, send user to login page, preserving returnUrl if present
    if (!registerLoading && registerSuccess) {
      const search = returnUrlParam
        ? `?returnUrl=${encodeURIComponent(returnUrlParam)}`
        : '';
      router.replace(`/auth/login${search}`);
    }
  }, [registerLoading, registerSuccess, router, returnUrlParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    dispatch(
      registerRequest({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password || formData.confirmPassword,
      })
    );
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
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 400 }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            gutterBottom
            align="center"
            fontWeight="bold"
          >
            Ornavibe · Rason Business
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create your account — Gift baskets for every occasion
          </Typography>

          {registerError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registerError}
            </Alert>
          )}
          {registerSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {registerSuccess}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="Name"
              fullWidth
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
              disabled={registerLoading}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={registerLoading}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={registerLoading}
            />
            <TextField
              label="Confirm password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              error={formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0}
              helperText={
                formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0
                  ? 'Passwords do not match'
                  : ''
              }
              disabled={registerLoading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={
                registerLoading ||
                !formData.name ||
                !formData.email ||
                !formData.password ||
                formData.password !== formData.confirmPassword
              }
            >
              {registerLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create account'
              )}
            </Button>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} href="/auth/login" color="primary">
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
