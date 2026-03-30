'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  Stack,
  Skeleton,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  CircularProgress,
  Link as MuiLink,
  useTheme,
} from '@mui/material';
import { surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import { Home, NavigateNext, Category as CategoryIcon, GridView as GridViewIcon, ViewList as ViewListIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchCategoriesRequest } from '@/redux/slices/catalog.slice';
import { addItemRequest } from '@/redux/slices/cart.slice';
import { fetchWishlistRequest, addWishlistRequest, removeWishlistRequest } from '@/redux/slices/wishlist.slice';
import { fetchProducts, fetchProductByIdOrSlug, fetchCategories } from '@/lib/api/catalog.service';
import type { Product, Category, PaginatedResponse } from '@/types/catalog';
import ProductCard from '@/components/ui/ProductCard';
import ProductRichDescription from '@/components/ui/ProductRichDescription';
import { getProductRichHtmlSource } from '@/lib/utils/productContent';

const PER_PAGE = 12;
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export default function CategorySlugPage() {
  const theme = useTheme();
  const params = useParams();
  const slug = params?.slug as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { categories, categoriesLoading } = useSelector((state: RootState) => state.catalog);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);

  const category = useMemo(() => categories.find((c) => c.slug === slug), [categories, slug]);
  const children = useMemo(() => (category?.children ?? []) as { id: string; name: string; slug: string }[], [category]);

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(() => {
    const p = searchParams.get('page');
    return p ? Math.max(1, parseInt(p, 10) || 1) : 1;
  });
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [quickViewQty, setQuickViewQty] = useState(1);

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
    dispatch(fetchWishlistRequest());
  }, [dispatch]);

  useEffect(() => {
    const p = searchParams.get('page');
    setPage(p ? Math.max(1, parseInt(p, 10) || 1) : 1);
  }, [searchParams]);

  useEffect(() => {
    if (!category?.id) {
      setProducts([]);
      setTotal(0);
      setLastPage(1);
      setLoading(categoriesLoading);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts({
      page,
      per_page: PER_PAGE,
      category_id: category.id,
      sort,
    })
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res) ? res : res.data;
        const meta = Array.isArray(res) ? undefined : (res as PaginatedResponse<Product>).meta;
        setProducts(data);
        if (meta) {
          setLastPage(meta.last_page);
          setTotal(meta.total);
        } else {
          setLastPage(1);
          setTotal(data.length);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load products.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category?.id, page, sort]);

  const updateUrl = (updates: { page?: number; sort?: SortOption }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.page !== undefined) {
      if (updates.page > 1) params.set('page', String(updates.page));
      else params.delete('page');
    }
    if (updates.sort !== undefined) {
      updates.sort && updates.sort !== 'newest' ? params.set('sort', updates.sort) : params.delete('sort');
    }
    const q = params.toString();
    router.replace(q ? `/categories/${slug}?${q}` : `/categories/${slug}`, { scroll: false });
  };

  const openQuickView = async (p: Product) => {
    setQuickViewProduct(null);
    setQuickViewQty(1);
    setQuickViewLoading(true);
    try {
      const full = await fetchProductByIdOrSlug(p.slug || p.id);
      setQuickViewProduct(full);
    } finally {
      setQuickViewLoading(false);
    }
  };

  const handleQuickViewAddToCart = () => {
    if (quickViewProduct) {
      dispatch(addItemRequest({ product_id: quickViewProduct.id, quantity: quickViewQty }));
      setQuickViewProduct(null);
    }
  };

  const handleAddToCart = (p: Product) => {
    dispatch(addItemRequest({ product_id: p.id, quantity: 1 }));
  };

  const imageFor = (p: Product) => (p.images?.length ? p.images[0] : p.image_url || null);

  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const categoryWithExtras = category as { image_url?: string; parent?: { name: string; slug: string } } | undefined;

  if (!slug) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="text.secondary">Invalid category.</Typography>
      </Container>
    );
  }

  const categoryNotFound = !categoriesLoading && !category;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }} flexWrap="wrap">
          <MuiLink component={Link} href="/" color="text.secondary" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home fontSize="small" sx={{ mr: 0.5 }} /> Home
          </MuiLink>
          <NavigateNext fontSize="small" color="action" />
          <MuiLink component={Link} href="/categories" color="text.secondary" underline="hover">
            Categories
          </MuiLink>
          {category && (
            <>
              <NavigateNext fontSize="small" color="action" />
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {category.name}
              </Typography>
            </>
          )}
        </Stack>

        {/* Category header */}
        {categoryWithExtras?.image_url && (
          <Box sx={{ mb: 3, borderRadius: 2, overflow: 'hidden', maxHeight: 220 }}>
            <Box component="img" src={categoryWithExtras.image_url} alt={category?.name ?? ''} sx={{ width: '100%', objectFit: 'cover' }} />
          </Box>
        )}
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {category ? category.name : decodeURIComponent(String(slug))}
        </Typography>
        {category?.description && (
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {category.description}
          </Typography>
        )}

        <Grid container spacing={3}>
          {/* Sidebar - subcategories */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: { lg: 'sticky' }, top: 100 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Subcategories
              </Typography>
              {children.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No subcategories
                </Typography>
              ) : (
                <List dense disablePadding>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} href={`/categories/${slug}`} sx={{ borderRadius: 1 }}>
                      <Typography variant="body2">All in this category</Typography>
                    </ListItemButton>
                  </ListItem>
                  {children.map((ch) => (
                    <ListItem key={ch.id} disablePadding>
                      <ListItemButton component={Link} href={`/categories/${ch.slug}`} sx={{ borderRadius: 1 }}>
                        <Typography variant="body2">{ch.name}</Typography>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
              <Button component={Link} href="/categories" variant="outlined" fullWidth sx={{ mt: 2 }}>
                All categories
              </Button>
            </Paper>
          </Grid>

          {/* Main - products */}
          <Grid size={{ xs: 12, lg: 9 }}>
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Sort by:
              </Typography>
              <TextField
                size="small"
                select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value as SortOption);
                  updateUrl({ sort: e.target.value as SortOption });
                }}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="newest">Default / Newest</MenuItem>
                <MenuItem value="price_asc">Price: low to high</MenuItem>
                <MenuItem value="price_desc">Price: high to low</MenuItem>
                <MenuItem value="name_asc">Name A–Z</MenuItem>
                <MenuItem value="name_desc">Name Z–A</MenuItem>
              </TextField>
              <Box sx={{ flex: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Showing {total > 0 ? `${from}–${to} of ${total}` : '0'} results
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" color={viewMode === 'grid' ? 'primary' : 'default'} onClick={() => setViewMode('grid')} aria-label="Grid view">
                  <GridViewIcon />
                </IconButton>
                <IconButton size="small" color={viewMode === 'list' ? 'primary' : 'default'} onClick={() => setViewMode('list')} aria-label="List view">
                  <ViewListIcon />
                </IconButton>
              </Stack>
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Grid container spacing={2}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid size={viewMode === 'list' ? 12 : { xs: 12, sm: 6, md: 4 }} key={i}>
                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack direction={viewMode === 'list' ? 'row' : 'column'} spacing={2}>
                        <Skeleton variant="rectangular" width={viewMode === 'list' ? 120 : '100%'} height={viewMode === 'list' ? 120 : 180} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton variant="text" width="80%" height={28} />
                          <Skeleton variant="text" width="60%" height={22} />
                          <Skeleton variant="text" width="40%" height={24} />
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : categoryNotFound ? (
              <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 2 }}>
                <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Category not found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  The category may have been removed or the link is incorrect.
                </Typography>
                <Button component={Link} href="/categories" variant="outlined">
                  Browse categories
                </Button>
              </Paper>
            ) : products.length === 0 ? (
              <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 2 }}>
                <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products in this category
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Check back later or browse other categories.
                </Typography>
                <Button component={Link} href="/categories" variant="outlined">
                  Browse categories
                </Button>
              </Paper>
            ) : (
              <>
                <Grid container spacing={2}>
                  {products.map((p) => {
                    const isWishlisted = wishlistItems.some((w) => String(w.id) === String(p.id));
                    return (
                      <Grid size={viewMode === 'list' ? 12 : { xs: 12, sm: 6, md: 4 }} key={p.id}>
                        <ProductCard
                          product={p}
                          imageUrl={imageFor(p)}
                          onQuickView={() => openQuickView(p)}
                          isWishlisted={isWishlisted}
                          onToggleWishlist={() => dispatch(isWishlisted ? removeWishlistRequest(p.id) : addWishlistRequest(p.id))}
                          onAddToCart={() => handleAddToCart(p)}
                          viewMode={viewMode}
                        />
                      </Grid>
                    );
                  })}
                </Grid>
                {lastPage > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      page={page}
                      count={lastPage}
                      color="primary"
                      onChange={(_, value) => {
                        setPage(value);
                        updateUrl({ page: value });
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>

        {/* Quick view modal */}
        <Dialog
          open={!!quickViewProduct || quickViewLoading}
          onClose={() => {
            setQuickViewProduct(null);
            setQuickViewLoading(false);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Quick view</DialogTitle>
          <DialogContent>
            {quickViewLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : quickViewProduct ? (
              <>
                <Box sx={{ aspectRatio: '1', bgcolor: surfaceSoft(theme), borderRadius: 1, mb: 2, overflow: 'hidden' }}>
                  {(quickViewProduct.images?.length ? quickViewProduct.images[0] : quickViewProduct.image_url) ? (
                    <Box
                      component="img"
                      src={quickViewProduct.images?.length ? quickViewProduct.images[0] : quickViewProduct.image_url!}
                      alt={quickViewProduct.name}
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography color="text.secondary">No image</Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  {quickViewProduct.name}
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <ProductRichDescription
                    htmlSource={getProductRichHtmlSource(quickViewProduct)}
                    elevation={0}
                    sx={{ bgcolor: 'transparent', boxShadow: 'none', py: 0.25 }}
                  />
                </Box>
                <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                  ${typeof quickViewProduct.price === 'number' ? quickViewProduct.price.toFixed(2) : Number(quickViewProduct.price).toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField
                    type="number"
                    size="small"
                    label="Qty"
                    value={quickViewQty}
                    onChange={(e) => setQuickViewQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    inputProps={{ min: 1 }}
                    sx={{ width: 80 }}
                  />
                  <Button variant="contained" onClick={handleQuickViewAddToCart}>
                    Add to cart
                  </Button>
                  <Button component={Link} href={`/products/${quickViewProduct.slug || quickViewProduct.id}`} onClick={() => setQuickViewProduct(null)}>
                    View full details
                  </Button>
                </Box>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
