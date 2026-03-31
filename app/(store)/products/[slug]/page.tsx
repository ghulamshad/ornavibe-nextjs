'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Rating,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
} from '@mui/material';
import { paperTranslucent, surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import ZoomIn from '@mui/icons-material/ZoomIn';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchProductDetailRequest, clearProductDetail } from '@/redux/slices/catalog.slice';
import { addItemRequest } from '@/redux/slices/cart.slice';
import { submitProductReview } from '@/lib/api/catalog.service';
import type { Product, ProductReview } from '@/types/catalog';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

const priceNum = (p: string | number): number => (typeof p === 'number' ? p : Number(p));

export default function ProductDetailPage() {
  const theme = useTheme();
  const params = useParams();
  const slug = params?.slug as string;
  const dispatch = useDispatch<AppDispatch>();
  const { productDetail, detailLoading, error } = useSelector((state: RootState) => state.catalog);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartError = useSelector((state: RootState) => state.cart.error);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [magnifierOpen, setMagnifierOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [magnifier, setMagnifier] = useState({ x: 0, y: 0, show: false });

  const images = productDetail?.images?.length
    ? productDetail.images
    : productDetail?.image_url
      ? [productDetail.image_url]
      : [];

  useEffect(() => {
    if (slug) dispatch(fetchProductDetailRequest(slug));
    return () => { dispatch(clearProductDetail()); };
  }, [slug, dispatch]);

  useEffect(() => {
    if (productDetail?.reviews) setReviews(productDetail.reviews);
  }, [productDetail?.reviews]);

  useEffect(() => {
    if (productDetail?.variants?.length && selectedVariantId == null) {
      const firstInStock = productDetail.variants.find((v) => v.stock_quantity > 0);
      if (firstInStock) setSelectedVariantId(firstInStock.id);
    }
  }, [productDetail?.variants, selectedVariantId]);

  useEffect(() => {
    if (!productDetail) return;
    const title = productDetail.meta_title || `${productDetail.name} | Ornavibe`;
    const desc = productDetail.meta_description || productDetail.description || undefined;
    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (desc) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', desc.slice(0, 160));
    }
    return () => { document.title = 'Ornavibe'; };
  }, [productDetail]);

  const handleAddToCart = () => {
    if (productDetail) dispatch(addItemRequest({ product_id: productDetail.id, quantity }));
  };

  const handleSubmitReview = useCallback(async () => {
    if (!productDetail || reviewSubmitting) return;
    setReviewError(null);
    setReviewSubmitting(true);
    try {
      const { submitProductReview } = await import('@/lib/api/catalog.service');
      const created = await submitProductReview(productDetail.slug || productDetail.id, {
        rating: reviewForm.rating,
        body: reviewForm.body.trim() || undefined,
      });
      setReviews((prev) => [{ ...created, user: { name: 'You' } } as ProductReview, ...prev]);
      setReviewForm({ rating: 5, body: '' });
    } catch (e: unknown) {
      setReviewError(e instanceof Error ? e.message : 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  }, [productDetail, reviewForm, reviewSubmitting]);

  if (detailLoading && !productDetail) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !productDetail) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!productDetail) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Product not found.</Typography>
      </Container>
    );
  }

  const mainImage = images[selectedImageIndex];
  const selectedVariant = productDetail.variants?.find((v) => v.id === selectedVariantId);
  const displayPrice = selectedVariant
    ? priceNum(productDetail.price) + priceNum(selectedVariant.price_modifier)
    : priceNum(productDetail.price);
  const availableStock = selectedVariant != null
    ? selectedVariant.stock_quantity
    : (productDetail.stock_quantity ?? 0);

  return (
    <SectionContainer>
      <Container maxWidth="lg">
        <SectionHeader
          eyebrow="Product"
          title={productDetail.name}
          subtitle={productDetail.meta_description || productDetail.description || 'Gift baskets and curated gifts from Ornavibe.'}
          align="left"
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Image gallery + magnifier */}
          <Box sx={{ flex: '1 1 340px', minWidth: 0 }}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '1',
                bgcolor: surfaceSoft(theme),
                borderRadius: 2,
                overflow: 'hidden',
              }}
              onMouseEnter={() => setMagnifier((m) => ({ ...m, show: true }))}
              onMouseLeave={() => setMagnifier({ x: 0, y: 0, show: false })}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setMagnifier((m) => ({
                  ...m,
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                }));
              }}
            >
              {mainImage ? (
                <>
                  <Box
                    component="img"
                    src={mainImage}
                    alt={productDetail.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      cursor: magnifierOpen ? 'zoom-out' : 'zoom-in',
                      pointerEvents: 'none',
                    }}
                    draggable={false}
                  />
                  {magnifier.show && !magnifierOpen && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        width: 120,
                        height: 120,
                        borderRadius: 1,
                        border: '2px solid',
                        borderColor: 'divider',
                        bgcolor: surfaceSoft(theme),
                        overflow: 'hidden',
                        pointerEvents: 'none',
                        boxShadow: 2,
                      }}
                    >
                      <Box
                        component="img"
                        src={mainImage}
                        alt=""
                        draggable={false}
                        sx={{
                          position: 'absolute',
                          width: '300%',
                          height: '300%',
                          left: `${50 - magnifier.x * 3}%`,
                          top: `${50 - magnifier.y * 3}%`,
                          objectFit: 'none',
                        }}
                      />
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: paperTranslucent(theme, 0.92) }}
                    onClick={() => setMagnifierOpen(true)}
                    aria-label="Full screen zoom"
                  >
                    <ZoomIn />
                  </IconButton>
                </>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No image</Typography>
                </Box>
              )}
            </Box>
            {images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {images.map((url, i) => (
                  <Box
                    key={i}
                    component="button"
                    onClick={() => setSelectedImageIndex(i)}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 1,
                      border: 2,
                      borderColor: selectedImageIndex === i ? 'primary.main' : 'divider',
                      p: 0,
                      overflow: 'hidden',
                      bgcolor: surfaceSoft(theme),
                      cursor: 'pointer',
                    }}
                  >
                    <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: '1 1 300px' }}>
            {(productDetail.reviews_count ?? 0) > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Rating value={productDetail.reviews_avg_rating ?? 0} readOnly size="small" precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  ({productDetail.reviews_count} review{productDetail.reviews_count !== 1 ? 's' : ''})
                </Typography>
              </Box>
            )}
            <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
              ${displayPrice.toFixed(2)}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {productDetail.description || 'Curated by Rason Business.'}
            </Typography>

            {productDetail.variants && productDetail.variants.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Variant</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {productDetail.variants.map((v) => (
                    <Button
                      key={v.id}
                      size="small"
                      variant={selectedVariantId === v.id ? 'contained' : 'outlined'}
                      onClick={() => { setSelectedVariantId(v.id); setAddToCartError(null); }}
                      disabled={v.stock_quantity <= 0}
                    >
                      {v.name} {v.stock_quantity <= 0 ? '(out of stock)' : `(${v.stock_quantity})`}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {availableStock <= 0 && !productDetail.variants?.length && (
              <Typography color="error" variant="body2" sx={{ mb: 1 }}>Out of stock</Typography>
            )}

            {(addToCartError || cartError) && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => { setAddToCartError(null); }}>
                {addToCartError || cartError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <TextField
                type="number"
                size="small"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                inputProps={{ min: 1, max: availableStock }}
                sx={{ width: 100 }}
              />
              <Button
                variant="contained"
                size="large"
                onClick={handleAddToCart}
                disabled={availableStock < quantity}
              >
                Add to cart
              </Button>
              {availableStock > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {availableStock} in stock
                </Typography>
              )}
            </Box>

            <Typography variant="body2" color="text.secondary">
              Ornavibe by Rason Business. Secure checkout, delivery available.
            </Typography>
          </Box>
        </Box>

        {/* Reviews */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Reviews
          </Typography>
          {reviews.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reviews.map((r) => (
                <Box key={r.id} sx={{ py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                  <Rating value={r.rating} readOnly size="small" />
                  {r.body && <Typography variant="body2" sx={{ mt: 0.5 }}>{r.body}</Typography>}
                  <Typography variant="caption" color="text.secondary">
                    {r.user?.name ?? 'Guest'} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No reviews yet. Be the first to review.</Typography>
          )}

          {isAuthenticated && (
            <>
              <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Write a review</Typography>
              {reviewError && <Alert severity="error" sx={{ mb: 1 }}>{reviewError}</Alert>}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
                <Rating
                  value={reviewForm.rating}
                  onChange={(_, v) => setReviewForm((f) => ({ ...f, rating: v ?? 5 }))}
                />
                <TextField
                  multiline
                  rows={3}
                  placeholder="Your review (optional)"
                  value={reviewForm.body}
                  onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                  size="small"
                />
                <Button variant="outlined" onClick={handleSubmitReview} disabled={reviewSubmitting}>
                  {reviewSubmitting ? <CircularProgress size={24} /> : 'Submit review'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Container>

      {/* Magnifier modal */}
      <Dialog open={magnifierOpen} onClose={() => setMagnifierOpen(false)} maxWidth={false} fullScreen>
        <DialogTitle>Zoom</DialogTitle>
        <DialogContent>
          {mainImage && (
            <Box
              component="img"
              src={mainImage}
              alt={productDetail.name}
              sx={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </SectionContainer>
  );
}
