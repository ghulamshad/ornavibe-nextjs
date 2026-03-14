'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Link,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { forgotPasswordAPI } from '@/lib/api/auth.service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await forgotPasswordAPI({ email });
      if (response.data.message) {
        setSuccess(true);
        // In development, show token info
        if (response.data.reset_token) {
          console.log('Reset Token (DEV ONLY):', response.data.reset_token);
          console.log('Reset UID (DEV ONLY):', response.data.uid);
          console.log('Reset URL (DEV ONLY):', response.data.reset_url);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 4, sm: 8 }, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Forgot Password
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Password reset instructions have been sent to your email address.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
            autoComplete="email"
            disabled={loading || success}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || success}
          >
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </Button>

          <Box textAlign="center">
            <Link
              component="button"
              variant="body2"
              onClick={() => router.push('/auth/login')}
              sx={{ cursor: 'pointer' }}
            >
              Back to Login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
