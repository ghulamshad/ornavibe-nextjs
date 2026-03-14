'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchProductsRequest } from '@/redux/slices/catalog.slice';
import type { Product } from '@/types/catalog';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';

const badgeForProduct = (product: Product, index: number): { label: string } | null => {
  // If admin explicitly chose a badge, prefer that
  const explicit = product.badge_type;
  const discount = product.badge_discount_percent ?? undefined;

  if (explicit === 'oos') {
    return { label: 'Out Of Stock' };
  }
  if (explicit === 'new') {
    return { label: 'New' };
  }
  if (explicit === 'hot') {
    return { label: 'Hot' };
  }
  if (explicit === 'discount' && typeof discount === 'number') {
    return { label: `${discount}% Off` };
  }

  // 1) Fallback real out-of-stock badge
  if (typeof product.stock_quantity === 'number' && product.stock_quantity <= 0) {
    return { label: 'Out Of Stock' };
  }

  // 2) "New" if created in last 30 days
  if (product.created_at) {
    const created = new Date(product.created_at);
    const daysSince =
      (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (!Number.isNaN(daysSince) && daysSince <= 30) {
      return { label: 'New' };
    }
  }

  // 3) Simple heuristic for discount-style items
  const text = `${product.name} ${product.description ?? ''}`.toLowerCase();
  if (text.includes('sale') || text.includes('discount') || text.includes('offer')) {
    return { label: '10% Off' };
  }

  // 4) Fallback rotation to keep variety
  const mod = index % 3;
  if (mod === 0) return { label: 'Hot' };
  if (mod === 1) return { label: 'New' };
  return { label: '10% Off' };
};

const hasImage = (p: Product) => !!(p.images?.[0] || p.image_url);
const imageFor = (p: Product) => (p.images?.[0] ? p.images[0] : p.image_url || '');

interface TrendingCopy {
  title?: string;
  view_more_label?: string;
}

export default function TrendingItemsSection({ copy }: { copy?: TrendingCopy }) {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector((state: RootState) => state.catalog);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProductsRequest());
    }
  }, [dispatch, products.length]);

  const list = products.filter((p) => p.is_trending).slice(0, 12);
  const title = copy?.title || 'Trending Items';
  const viewMore = copy?.view_more_label || 'View More';

  const sliderSettings: Settings = {
    dots: false,
    infinite: list.length > 4,
    speed: 450,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 2 } },
      { breakpoint: 960, settings: { slidesToShow: 3, slidesToScroll: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  };

  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            data-aos="fade-down"
            data-aos-delay="60"
          >
            {title}
          </Typography>
          <Button
            component={Link}
            href="/products"
            variant="text"
            size="medium"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'primary.main',
            }}
            data-aos="fade-down"
            data-aos-delay="120"
          >
            {viewMore}
          </Button>
        </Box>

        {error && !products.length && (
          <Box textAlign="center" data-aos="fade-up">
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

        {loading && !products.length && (
          <Box textAlign="center" py={4} data-aos="fade-up">
            <CircularProgress />
          </Box>
        )}

        {!!list.length && (
          <Box
            sx={{
              mt: 1,
              '& .slick-slide': { px: 1.25 },
              '& .slick-list': { mx: -1.25 },
            }}
            data-aos="fade-up"
            data-aos-delay="120"
          >
            <Slider {...sliderSettings}>
              {list.map((product, index) => {
                const badge = badgeForProduct(product, index);

                return (
                  <Box key={product.id}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-3px)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'relative',
                          bgcolor: 'grey.100',
                          aspectRatio: '1',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          component={Link}
                          href={`/products/${product.slug || product.id}`}
                          sx={{ display: 'block', width: '100%', height: '100%' }}
                        >
                          {hasImage(product) ? (
                            <Box
                              component="img"
                              src={imageFor(product)}
                              alt={product.name}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                p: 1.5,
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                height: '100%',
                              }}
                            >
                              <Typography variant="body2" color="text.secondary">
                                No image
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {badge && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              px: 1.25,
                              py: 0.25,
                              borderRadius: 999,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              bgcolor:
                                badge.label === 'Out Of Stock'
                                  ? 'grey.800'
                                  : badge.label.includes('% Off')
                                  ? '#ff4f72'
                                  : '#1fbf75',
                              color: '#ffffff',
                            }}
                          >
                            {badge.label}
                          </Box>
                        )}
                      </Box>

                      <Box
                        sx={{
                          px: 2,
                          py: 1.75,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            sx={{
                              fontSize: '0.96rem',
                              mb: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: '0.82rem',
                            }}
                          >
                            {typeof product.price === 'number'
                              ? `$${product.price.toFixed(2)}`
                              : `$${Number(product.price).toFixed(2)}`}
                          </Typography>
                        </Box>
                        <Button
                          component={Link}
                          href={`/products/${product.slug || product.id}`}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 0,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            p: 0,
                          }}
                          aria-label="Add to cart"
                        >
                          <ShoppingBagIcon fontSize="small" />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Slider>
          </Box>
        )}
      </Container>
    </Box>
  );
}

