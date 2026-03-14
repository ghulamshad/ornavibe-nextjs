'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Tabs,
  Tab,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchProductsRequest, fetchCategoriesRequest } from '@/redux/slices/catalog.slice';
import type { Product, Category } from '@/types/catalog';

const badgeForIndex = (index: number): { label: string; color: 'default' | 'primary' | 'secondary' } => {
  const mod = index % 4;
  if (mod === 0) return { label: 'New', color: 'primary' };
  if (mod === 1) return { label: 'Hot', color: 'secondary' };
  if (mod === 2) return { label: 'Out Of Stock', color: 'default' };
  return { label: '10% Off', color: 'primary' };
};

const imageFor = (p: Product) => (p.images?.[0] ? p.images[0] : p.image_url || '');

export default function PopularItemsSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, categories, loading } = useSelector((state: RootState) => state.catalog);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (!categories.length) dispatch(fetchCategoriesRequest());
    if (!products.length) dispatch(fetchProductsRequest());
  }, [dispatch, categories.length, products.length]);

  const tabCategories = useMemo(() => categories.filter((c) => !c.parent_id).slice(0, 4), [categories]);
  const activeCategory = tabCategories[tabIndex];
  const productsForTab = useMemo(() => {
    if (!activeCategory) return products.slice(0, 8);
    return products.filter((p) => String(p.category_id) === String(activeCategory.id)).slice(0, 8);
  }, [products, activeCategory]);

  const fallbackProducts = products.slice(0, 8);

  const displayList = productsForTab.length ? productsForTab : fallbackProducts;

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
          <Typography variant="h4" fontWeight={800}>
            Popular Items
          </Typography>
          {tabCategories.length > 0 && (
            <Tabs
              value={tabIndex}
              onChange={(_, v) => setTabIndex(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 48, '& .MuiTab-root': { minHeight: 48 } }}
            >
              {tabCategories.map((cat, i) => (
                <Tab key={cat.id} label={cat.name} id={`popular-tab-${i}`} aria-controls={`popular-tabpanel-${i}`} />
              ))}
            </Tabs>
          )}
        </Box>

        {loading && !products.length ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {displayList.map((product, index) => {
              const badge = badgeForIndex(index);
              const img = imageFor(product);
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <CardActionArea component={Link} href={`/products/${product.slug}`}>
                      <Box sx={{ position: 'relative', pt: '100%', bgcolor: 'grey.100' }}>
                        {badge.label && (
                          <Chip
                            size="small"
                            label={badge.label}
                            color={badge.color}
                            sx={{
                              position: 'absolute',
                              top: 12,
                              left: 12,
                              zIndex: 1,
                            }}
                          />
                        )}
                        {img && (
                          <CardMedia
                            component="img"
                            image={img}
                            alt={product.name}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              p: 1,
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight={700}>
                          ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
