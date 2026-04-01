'use client';

import React, { useEffect, useMemo } from 'react';
import { Box, Grid, Typography, Skeleton, Rating, useTheme } from '@mui/material';
import { neutralSlate, surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import Link from 'next/link';
import type { Product } from '@/types/catalog';
import { resolveMediaUrl } from '@/lib/utils/media';
import { formatCurrency } from '@/lib/utils/currency';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchProductsRequest } from '@/redux/slices/catalog.slice';

export interface FeaturedProductsProps {
  title?: string;
  /** Max cards to show (grid is filled from catalog). */
  limit?: number;
}

const imageFor = (p: Product) => resolveMediaUrl(p.images?.[0] ? p.images[0] : p.image_url || '');

function badgeLabel(product: Product, index: number): string | null {
  const explicit = product.badge_type;
  const discount = product.badge_discount_percent ?? undefined;

  if (explicit === 'oos') return 'Out of stock';
  if (explicit === 'new') return 'New';
  if (explicit === 'hot') return 'Hot';
  if (explicit === 'discount' && typeof discount === 'number') return `${discount}% off`;

  if (typeof product.stock_quantity === 'number' && product.stock_quantity <= 0) {
    return 'Out of stock';
  }

  if (product.created_at) {
    const created = new Date(product.created_at);
    const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (!Number.isNaN(days) && days <= 30) return 'New';
  }

  const mod = index % 4;
  if (mod === 0) return 'New';
  if (mod === 1) return 'Hot';
  return null;
}

function originalPriceForDiscount(current: number, percent: number): number | null {
  if (!percent || percent <= 0 || percent >= 100) return null;
  return current / (1 - percent / 100);
}

export default function FeaturedProducts({ title = 'Featured Products', limit = 48 }: FeaturedProductsProps) {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector((state: RootState) => state.catalog);
  const site = useSiteContent();
  const symbol = site.store?.currency_symbol ?? 'Rs.';

  useEffect(() => {
    dispatch(fetchProductsRequest(undefined));
  }, [dispatch]);

  const list = useMemo(() => {
    return [...products]
      .filter((p) => p.is_active !== false && p.slug)
      .sort((a, b) => {
        const ta = a.is_trending ? 1 : 0;
        const tb = b.is_trending ? 1 : 0;
        if (tb !== ta) return tb - ta;
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      })
      .slice(0, limit);
  }, [products, limit]);

  if (!loading && !list.length) {
    return null;
  }

  return (
    <Box
      component="section"
      className="cnt-lg"
      sx={{
        py: { xs: 4, md: 6 },
        width: '100%',
        maxWidth: '100%',
        bgcolor: 'background.default',
        px: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      <Box className="home_products" sx={{ maxWidth: 'xl', mx: 'auto' }}>
        <Box className="section_title" sx={{ mb: { xs: 2, md: 3 }, textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography variant="h4" component="h2" fontWeight={700} sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem', md: undefined } }}>
            {title}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 2 }} className="row">
          {loading && !list.length
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid key={i} size={{ xs: 6, md: 6, lg: 3 }} className="col-md-6 col-lg-3 col-6">
                  <Box className="single_product">
                    <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
                    <Skeleton width="80%" sx={{ mt: 1.5 }} />
                    <Skeleton width="50%" sx={{ mt: 0.5 }} />
                  </Box>
                </Grid>
              ))
            : list.map((product, index) => {
                const img = imageFor(product);
                const href = `/products/${product.slug}`;
                const badge = badgeLabel(product, index);
                const priceNum = Number(product.price);
                const discountPct =
                  product.badge_type === 'discount' && typeof product.badge_discount_percent === 'number'
                    ? product.badge_discount_percent
                    : null;
                const oldPrice =
                  discountPct != null ? originalPriceForDiscount(priceNum, discountPct) : null;
                const rating =
                  typeof product.reviews_avg_rating === 'number' ? product.reviews_avg_rating : null;
                const categoryLine = product.category?.name?.trim() || '';

                return (
                  <Grid
                    key={String(product.id)}
                    size={{ xs: 6, md: 6, lg: 3 }}
                    className="col-md-6 col-lg-3 col-6"
                  >
                    <Box
                      className="single_product"
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: 3 },
                      }}
                    >
                      <Box className="product_thumb" sx={{ position: 'relative' }}>
                        <Link href={href} className="image-wrap" style={{ display: 'block', lineHeight: 0 }}>
                          {img ? (
                            <Box
                              component="img"
                              src={img}
                              alt={product.name}
                              loading="lazy"
                              sx={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                objectFit: 'contain',
                                bgcolor: surfaceSoft(theme),
                                display: 'block',
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                aspectRatio: '1 / 1',
                                bgcolor: neutralSlate(theme, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                typography: 'caption',
                                color: 'text.secondary',
                                px: 1,
                                textAlign: 'center',
                              }}
                            >
                              No image
                            </Box>
                          )}
                        </Link>
                        {badge && (
                          <Box
                            component="span"
                            className="badge_sale"
                            sx={{
                              position: 'absolute',
                              top: 10,
                              left: 10,
                              px: 1,
                              py: 0.25,
                              borderRadius: 0.5,
                              bgcolor: 'primary.main',
                              color: 'primary.contrastText',
                              fontSize: 11,
                              fontWeight: 700,
                              lineHeight: 1.4,
                              textTransform: 'uppercase',
                              letterSpacing: 0.02,
                            }}
                          >
                            {badge}
                          </Box>
                        )}
                      </Box>

                      <Box className="product_content" sx={{ p: { xs: 1.25, sm: 1.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography
                          component="h3"
                          className="popup_cart_title"
                          variant="subtitle2"
                          fontWeight={700}
                          sx={{
                            mb: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: { xs: 36, sm: 40 },
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          }}
                        >
                          <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {product.name}
                          </Link>
                        </Typography>

                        <Box
                          className="flex_center"
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 1,
                            mt: 'auto',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            {categoryLine ? (
                              <Typography className="tag_cate" variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                {categoryLine}
                              </Typography>
                            ) : (
                              <Box className="tag_cate" sx={{ minHeight: 18 }} />
                            )}
                            <Box className="price_box">
                              <Typography
                                component="span"
                                className="current_price"
                                variant="body2"
                                fontWeight={700}
                                color="primary"
                                sx={{ display: 'block', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                              >
                                {formatCurrency(Number.isFinite(priceNum) ? priceNum : 0, symbol)}
                              </Typography>
                              {oldPrice != null && Number.isFinite(oldPrice) && oldPrice > priceNum && (
                                <Typography
                                  component="span"
                                  className="old_price"
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ textDecoration: 'line-through', display: 'block' }}
                                >
                                  {formatCurrency(oldPrice, symbol)}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          {rating != null && rating > 0 ? (
                            <Rating value={rating} readOnly precision={0.5} size="small" sx={{ flexShrink: 0 }} />
                          ) : (
                            <Box sx={{ width: { xs: 76, sm: 88 }, flexShrink: 0 }} aria-hidden />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
        </Grid>
      </Box>
    </Box>
  );
}
