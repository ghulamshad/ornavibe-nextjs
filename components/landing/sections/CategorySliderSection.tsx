'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import Slider from 'react-slick';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchCategoriesRequest, fetchProductsRequest } from '@/redux/slices/catalog.slice';
import type { Category, Product } from '@/types/catalog';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const backendBase =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:8000';

const resolveImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${backendBase}${url}`;
};

export default function CategorySliderSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, products } = useSelector((state: RootState) => state.catalog);

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategoriesRequest());
    if (!products.length) dispatch(fetchProductsRequest());
  }, [categories.length, products.length, dispatch]);

  const rootCategories = categories.filter((c) => !c.parent_id);

  const countItemsForCategory = (cat: Category, allProducts: Product[]) => {
    const id = String(cat.id);
    return allProducts.filter(
      (p) => (p.category_id && String(p.category_id) === id) || (p.category && String(p.category.id) === id)
    ).length;
  };

  const settings = {
    dots: false,
    infinite: rootCategories.length > 4,
    speed: 400,
    slidesToShow: 5,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4 } },
      { breakpoint: 960, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
    ],
  };

  if (!rootCategories.length) {
    return (
      <Box sx={{ py: 6, bgcolor: 'background.paper' }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: { xs: 5, md: 8 }, // ~py-80
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            '& .slick-slide': { px: 1.25 },
            '& .slick-list': { mx: -1.25 },
          }}
        >
          <Slider {...settings}>
            {rootCategories.map((cat) => (
              <Box key={cat.id}>
                <Box
                  component={Link}
                  href={`/categories/${cat.slug}`}
                  sx={{
                    display: 'block',
                    textDecoration: 'none',
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      px: 2.25,
                      py: 2,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.75,
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 4,
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#ffe7f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}
                    >
                      {cat.image_url ? (
                        <Box
                          component="img"
                          src={resolveImageUrl(cat.image_url)}
                          alt={cat.name}
                          sx={{ width: 40, height: 40, objectFit: 'contain' }}
                        />
                      ) : (
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {cat.name.charAt(0)}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ fontSize: '0.98rem' }}
                      >
                        {cat.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {countItemsForCategory(cat, products)} Items
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Slider>
        </Box>
      </Container>
    </Box>
  );
}
