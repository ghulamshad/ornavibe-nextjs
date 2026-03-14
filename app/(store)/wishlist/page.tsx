'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import {
  fetchWishlistRequest,
  removeWishlistRequest,
} from '@/redux/slices/wishlist.slice';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { items, loading, error } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login?returnUrl=/wishlist');
      return;
    }
    dispatch(fetchWishlistRequest());
  }, [isAuthenticated, dispatch, router]);

  const isEmpty = !items.length && !loading;

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Wishlist
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your saved favourites from Ornavibe.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !items.length ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : isEmpty ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              You have no items in your wishlist.
            </Typography>
            <Button component={Link} href="/products" variant="contained">
              Browse products
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {items.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={p.id}>
                <ProductCard
                  product={p}
                  imageUrl={p.images?.[0] || p.image_url || null}
                  isWishlisted
                  onToggleWishlist={() => dispatch(removeWishlistRequest(p.id))}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}

