'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Rating,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { paperTranslucent, scrim, surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Link from 'next/link';
import type { Product } from '@/types/catalog';
import { resolveMediaUrl } from '@/lib/utils/media';
import { getProductPlainPreview, getProductRichHtmlSource } from '@/lib/utils/productContent';
import ProductRichDescription from '@/components/ui/ProductRichDescription';

export interface ProductCardProps {
  product: Product;
  imageUrl?: string | null;
  onQuickView?: () => void;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
  isWishlisted?: boolean;
  viewMode?: 'grid' | 'list';
}

function BadgeLabel({ product }: { product: Product }) {
  const type = product.badge_type;
  const pct = product.badge_discount_percent;
  if (type === 'oos') {
    return <span>Out of stock</span>;
  }
  if (type === 'new') return <span>New</span>;
  if (type === 'hot') return <span>Hot</span>;
  if (type === 'discount' || (pct != null && pct > 0)) {
    return <span>{pct != null ? `${pct}% Off` : 'Sale'}</span>;
  }
  if (product.is_trending) return <span>Trending</span>;
  return null;
}

export default function ProductCard({
  product,
  imageUrl,
  onQuickView,
  onToggleWishlist,
  onAddToCart,
  isWishlisted,
  viewMode = 'grid',
}: ProductCardProps) {
  const theme = useTheme();
  const [hover, setHover] = useState(false);
  /** Touch / coarse-pointer devices: no real hover — keep quick actions visible. */
  const isCoarsePrimary = useMediaQuery('(hover: none)', { noSsr: true, defaultMatches: false });
  const showHoverActions = isCoarsePrimary || hover;
  const canFineHover = !isCoarsePrimary;
  const richHtmlSource = getProductRichHtmlSource(product);

  const primarySrc = imageUrl ? resolveMediaUrl(imageUrl) : '';
  const secondaryRaw =
    product.images && product.images.length > 1
      ? product.images[1]
      : product.variants?.find((v) => v.image_url)?.image_url;
  const secondarySrc = secondaryRaw ? resolveMediaUrl(secondaryRaw) : '';
  const showImageSwap = Boolean(
    primarySrc && secondarySrc && secondarySrc !== primarySrc && hover && canFineHover
  );
  const showDescriptionOverlay = Boolean(richHtmlSource && hover && canFineHover);
  const hasBottomActions = Boolean((onQuickView || onAddToCart) && showHoverActions);
  const actionBarReservePx = hasBottomActions ? 44 : 0;

  const href = `/products/${product.slug || product.id}`;
  const price =
    typeof product.price === 'number'
      ? product.price.toFixed(2)
      : Number(product.price).toFixed(2);
  const badge = BadgeLabel({ product });
  const rating = product.reviews_avg_rating ?? 0;
  const reviewCount = product.reviews_count ?? 0;
  const isList = viewMode === 'list';

  const imageBlock = (
    <Box
      className="card-media-wrap"
      sx={{
        position: 'relative',
        aspectRatio: '1',
        width: isList ? 160 : '100%',
        minWidth: isList ? 160 : undefined,
        bgcolor: surfaceSoft(theme),
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {badge && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 5,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor:
              product.badge_type === 'oos'
                ? 'grey.700'
                : product.badge_type === 'discount' || product.badge_discount_percent
                  ? 'error.main'
                  : product.badge_type === 'hot'
                    ? 'error.main'
                    : 'primary.main',
            color: 'common.white',
            typography: 'caption',
            fontWeight: 700,
          }}
        >
          <BadgeLabel product={product} />
        </Box>
      )}
      {onToggleWishlist && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist();
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 5,
            bgcolor: paperTranslucent(theme, 0.92),
            '&:hover': { bgcolor: paperTranslucent(theme, 1) },
          }}
        >
          {isWishlisted ? (
            <FavoriteIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          )}
        </IconButton>
      )}
      {primarySrc ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            p: 1,
            zIndex: 0,
          }}
        >
          <Box
            component="img"
            src={primarySrc}
            alt={product.name}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transition: 'opacity 0.35s ease, transform 0.25s ease',
              opacity: showImageSwap ? 0 : 1,
              transform: hover && canFineHover ? 'scale(1.03)' : 'scale(1)',
            }}
          />
          {secondarySrc ? (
            <Box
              component="img"
              src={secondarySrc}
              alt=""
              sx={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transition: 'opacity 0.35s ease, transform 0.25s ease',
                opacity: showImageSwap ? 1 : 0,
                transform: hover && canFineHover ? 'scale(1.03)' : 'scale(1)',
                pointerEvents: 'none',
              }}
            />
          ) : null}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No image
          </Typography>
        </Box>
      )}

      {showDescriptionOverlay && (
        <Box
          className="product-short-description"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: actionBarReservePx,
            maxHeight: actionBarReservePx ? '50%' : '56%',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto',
          }}
        >
          <ProductRichDescription
            htmlSource={richHtmlSource}
            elevation={3}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '12px 12px 0 0',
              px: 1.5,
              py: 1.25,
              bgcolor: (t) => alpha(t.palette.background.paper, 0.97),
              border: 1,
              borderColor: 'divider',
              borderBottom: 'none',
            }}
          />
        </Box>
      )}

      {(onQuickView || onAddToCart) && showHoverActions && (
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            bgcolor: scrim(theme, 0.5),
            zIndex: 4,
            pointerEvents: 'auto',
          }}
        >
          {onQuickView && (
            <Button
              type="button"
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<VisibilityOutlinedIcon fontSize="small" />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              aria-label="Quick view"
              sx={{
                textTransform: 'none',
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1,
                fontWeight: 600,
                pr: { xs: 1, sm: 1.5 },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Quick view
              </Box>
            </Button>
          )}
          {onAddToCart && (
            <IconButton
              size="small"
              sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              aria-label="Add to cart"
            >
              <ShoppingBagOutlinedIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      )}
    </Box>
  );

  const contentBlock = (
    <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography
        component={Link}
        href={href}
        variant="subtitle1"
        fontWeight={600}
        gutterBottom
        noWrap
        sx={{ color: 'text.primary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
      >
        {product.name}
      </Typography>
      {reviewCount > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Rating value={rating} readOnly size="small" precision={0.1} />
          <Typography variant="caption" color="text.secondary">
            ({reviewCount})
          </Typography>
        </Box>
      )}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {getProductPlainPreview(product) || 'Product'}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" color="primary">
          ${price}
        </Typography>
        {onAddToCart && (
          <Button
            size="small"
            variant="contained"
            startIcon={<ShoppingBagOutlinedIcon fontSize="small" />}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart();
            }}
          >
            Add to cart
          </Button>
        )}
      </Box>
    </CardContent>
  );

  return (
    <Card
      className="product-card"
      variant="outlined"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: isList ? 'row' : 'column',
        alignItems: 'stretch',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isList ? 'row' : 'column',
          flex: 1,
          minWidth: 0,
        }}
      >
        {imageBlock}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {contentBlock}
        </Box>
      </Box>
    </Card>
  );
}
