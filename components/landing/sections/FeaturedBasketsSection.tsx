'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CircularProgress,
  Button,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchProductsRequest } from '@/redux/slices/catalog.slice';
import Link from 'next/link';

interface FeaturedContent {
  title: string;
  subtitle: string;
}

export default function FeaturedBasketsSection({ featured }: { featured: FeaturedContent }) {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector((state: RootState) => state.catalog);

  useEffect(() => {
    dispatch(fetchProductsRequest());
  }, [dispatch]);

  if (loading && products.length === 0) {
    return (
      <Box id="featured" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const featuredList = products.slice(0, 6);
  const title = featured?.title ?? 'Featured Gift Baskets';
  const subtitle = featured?.subtitle ?? 'Handpicked for every occasion.';

  return (
    <Box
      id="featured"
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xl">
        <Typography
          variant="h4"
          fontWeight="bold"
          align="center"
          gutterBottom
          data-aos="fade-up"
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 4, maxWidth: 560, mx: 'auto' }}
          data-aos="fade-up"
        >
          {subtitle}
        </Typography>

        {featuredList.length === 0 ? (
          <Box textAlign="center" py={4} data-aos="fade-up">
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Gift baskets will appear here once your catalog is set up.
            </Typography>
            <Button component={Link} href="/products" variant="outlined">
              View all
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {featuredList.map((product, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                <Card
                  variant="outlined"
                  sx={{ height: '100%', borderRadius: 2 }}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <CardActionArea component={Link} href={`/products/${product.slug || product.id}`} sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.description || 'Gift basket'}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        {typeof product.price === 'number'
                          ? `$${product.price.toFixed(2)}`
                          : `$${Number(product.price).toFixed(2)}`}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {featuredList.length > 0 && products.length > 6 && (
          <Box textAlign="center" mt={4}>
            <Button component={Link} href="/products" variant="contained" size="large">
              View all gift baskets
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}
