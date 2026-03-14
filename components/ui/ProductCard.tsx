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
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Link from 'next/link';
import type { Product } from '@/types/catalog';

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
  const [hover, setHover] = useState(false);
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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      sx={{
        position: 'relative',
        aspectRatio: '1',
        width: isList ? 160 : '100%',
        minWidth: isList ? 160 : undefined,
        bgcolor: 'grey.100',
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
            zIndex: 2,
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
            color: 'white',
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
            zIndex: 2,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
          }}
        >
          {isWishlisted ? (
            <FavoriteIcon sx={{ color: '#ff4f72', fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          )}
        </IconButton>
      )}
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt={product.name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            p: 1,
            transition: 'transform 0.2s',
            ...(hover && { transform: 'scale(1.03)' }),
          }}
        />
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
      {(onQuickView || onAddToCart) && hover && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5,
            p: 1,
            bgcolor: 'rgba(0,0,0,0.5)',
            zIndex: 1,
          }}
        >
          {onQuickView && (
            <IconButton
              size="small"
              sx={{ bgcolor: 'white', color: 'text.primary' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              aria-label="Quick view"
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          )}
          {onAddToCart && (
            <IconButton
              size="small"
              sx={{ bgcolor: 'white', color: 'text.primary' }}
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
        </Box>
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
        {product.description || 'Product'}
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
        component={Link}
        href={href}
        sx={{
          display: 'flex',
          flexDirection: isList ? 'row' : 'column',
          flex: 1,
          minWidth: 0,
          textDecoration: 'none',
          color: 'inherit',
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
