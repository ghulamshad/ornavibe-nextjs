'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Paper,
  Stack,
  Skeleton,
  Pagination,
  FormControlLabel,
  Checkbox,
  Slider,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  MenuItem,
  Link as MuiLink,
  Rating,
  Divider,
  useTheme,
} from '@mui/material';
import { paperTranslucent, surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import {
  Home,
  NavigateNext,
  Search as SearchIcon,
  ShoppingBagOutlined,
  Clear as ClearIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { addItemRequest } from '@/redux/slices/cart.slice';
import { fetchWishlistRequest, addWishlistRequest, removeWishlistRequest } from '@/redux/slices/wishlist.slice';
import { fetchProducts, fetchProductByIdOrSlug, fetchCategories } from '@/lib/api/catalog.service';
import type { Product, Category, PaginatedResponse } from '@/types/catalog';
import ProductCard from '@/components/ui/ProductCard';

const PER_PAGE = 12;
const PRICE_MIN = 0;
const PRICE_MAX = 1000;

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';

export default function ProductsPage() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);

  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState<number>(() => {
    const p = searchParams.get('page');
    return p ? Math.max(1, parseInt(p, 10) || 1) : 1;
  });
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(() => searchParams.get('category') ?? '');
  const [search, setSearch] = useState<string>(() => searchParams.get('search') ?? '');
  const [sort, setSort] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min = searchParams.get('min_price');
    const max = searchParams.get('max_price');
    return [
      min != null && min !== '' ? Number(min) : PRICE_MIN,
      max != null && max !== '' ? Number(max) : PRICE_MAX,
    ];
  });
  const [inStock, setInStock] = useState<boolean | null>(() => {
    const v = searchParams.get('in_stock');
    if (v === '1' || v === 'true') return true;
    if (v === '0' || v === 'false') return false;
    return null;
  });
  const [onSale, setOnSale] = useState<boolean>(() => searchParams.get('on_sale') === '1' || searchParams.get('on_sale') === 'true');
  const [minRating, setMinRating] = useState<number | null>(() => {
    const r = searchParams.get('min_rating');
    if (r == null || r === '') return null;
    const n = parseInt(r, 10);
    return n >= 1 && n <= 5 ? n : null;
  });

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewLoading, setQuickViewLoading] = useState(false);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [quickViewImageIndex, setQuickViewImageIndex] = useState(0);
  const [quickViewVariantId, setQuickViewVariantId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchWishlistRequest());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((list) => {
        if (!cancelled) setCategories(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const updateUrl = (updates: {
    page?: number;
    category?: string;
    search?: string;
    sort?: SortOption;
    min_price?: number;
    max_price?: number;
    in_stock?: boolean | null;
    on_sale?: boolean;
    min_rating?: number | null;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.page !== undefined) {
      if (updates.page > 1) params.set('page', String(updates.page));
      else params.delete('page');
    }
    if (updates.category !== undefined) {
      updates.category ? params.set('category', updates.category) : params.delete('category');
    }
    if (updates.search !== undefined) {
      updates.search ? params.set('search', updates.search) : params.delete('search');
    }
    if (updates.sort !== undefined) {
      updates.sort && updates.sort !== 'newest' ? params.set('sort', updates.sort) : params.delete('sort');
    }
    if (updates.min_price !== undefined) {
      updates.min_price > PRICE_MIN ? params.set('min_price', String(updates.min_price)) : params.delete('min_price');
    }
    if (updates.max_price !== undefined) {
      updates.max_price < PRICE_MAX ? params.set('max_price', String(updates.max_price)) : params.delete('max_price');
    }
    if (updates.in_stock !== undefined) {
      if (updates.in_stock === true) params.set('in_stock', '1');
      else if (updates.in_stock === false) params.set('in_stock', '0');
      else params.delete('in_stock');
    }
    if (updates.on_sale !== undefined) {
      updates.on_sale ? params.set('on_sale', '1') : params.delete('on_sale');
    }
    if (updates.min_rating !== undefined) {
      updates.min_rating != null ? params.set('min_rating', String(updates.min_rating)) : params.delete('min_rating');
    }
    const q = params.toString();
    router.replace(q ? `/products?${q}` : '/products', { scroll: false });
  };

  const handleApplyFilters = () => {
    setPage(1);
    updateUrl({
      page: 1,
      category: categoryId || '',
      search: search.trim() || '',
      sort,
      min_price: priceRange[0] > PRICE_MIN ? priceRange[0] : undefined,
      max_price: priceRange[1] < PRICE_MAX ? priceRange[1] : undefined,
      in_stock: inStock,
      on_sale: onSale,
      min_rating: minRating,
    });
  };

  const hasActiveFilter = !!(
    search.trim() ||
    categoryId ||
    sort !== 'newest' ||
    priceRange[0] > PRICE_MIN ||
    priceRange[1] < PRICE_MAX ||
    inStock !== null ||
    onSale ||
    minRating != null
  );

  const handleClearFilters = () => {
    setCategoryId('');
    setSearch('');
    setSort('newest');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setInStock(null);
    setOnSale(false);
    setMinRating(null);
    setPage(1);
    updateUrl({
      page: 1,
      category: '',
      search: '',
      sort: 'newest',
      min_price: PRICE_MIN,
      max_price: PRICE_MAX,
      in_stock: null,
      on_sale: false,
      min_rating: null,
    });
  };

  useEffect(() => {
    const p = searchParams.get('page');
    setPage(p ? Math.max(1, parseInt(p, 10) || 1) : 1);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const minPrice = priceRange[0] > PRICE_MIN ? priceRange[0] : undefined;
    const maxPrice = priceRange[1] < PRICE_MAX ? priceRange[1] : undefined;

    fetchProducts({
      page,
      per_page: PER_PAGE,
      category_id: categoryId || undefined,
      search: search.trim() || undefined,
      sort,
      min_price: minPrice,
      max_price: maxPrice,
      in_stock: inStock ?? undefined,
      on_sale: onSale || undefined,
      min_rating: minRating ?? undefined,
    })
      .then((res) => {
        if (cancelled) return;
        let data: Product[] = [];
        let meta: PaginatedResponse<Product>['meta'] | undefined;
        if (Array.isArray(res)) {
          data = res;
          meta = undefined;
        } else {
          data = res.data;
          meta = res.meta;
        }
        setItems(data);
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
  }, [page, categoryId, search, sort, priceRange, inStock, onSale, minRating]);

  const openQuickView = async (p: Product) => {
    setQuickViewProduct(null);
    setQuickViewQty(1);
    setQuickViewImageIndex(0);
    setQuickViewVariantId(null);
    setQuickViewLoading(true);
    try {
      const full = await fetchProductByIdOrSlug(p.slug || p.id);
      setQuickViewProduct(full);
      if (full.variants?.length) {
        setQuickViewVariantId(full.variants[0].id);
      }
    } finally {
      setQuickViewLoading(false);
    }
  };

  const handleQuickViewAddToCart = () => {
    if (quickViewProduct) {
      const payload: { product_id: string | number; quantity: number; product_variant_id?: number } = {
        product_id: quickViewProduct.id,
        quantity: quickViewQty,
      };
      if (quickViewVariantId) payload.product_variant_id = quickViewVariantId;
      dispatch(addItemRequest(payload));
      setQuickViewProduct(null);
    }
  };

  const handleAddToCart = (p: Product) => {
    dispatch(addItemRequest({ product_id: p.id, quantity: 1 }));
  };

  const imageFor = (p: Product) => {
    if (p.images?.length) return p.images[0];
    return p.image_url || null;
  };

  const from = useMemo(() => (total === 0 ? 0 : (page - 1) * PER_PAGE + 1), [page, total]);
  const to = useMemo(() => Math.min(page * PER_PAGE, total), [page, total]);

  const rootCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Breadcrumb + title */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/" color="text.secondary" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home fontSize="small" sx={{ mr: 0.5 }} /> Home
          </MuiLink>
          <NavigateNext fontSize="small" color="action" />
          <Typography variant="body2" color="text.primary" fontWeight={600}>
            Shop
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          All products
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Gift baskets and curated collections from Ornavibe.
        </Typography>

        <Grid container spacing={3}>
          {/* Sidebar - col-lg-3 */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: { lg: 'sticky' }, top: 100 }}>
              {/* Search */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Search
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ mb: 3 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search products"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                />
                <IconButton color="primary" onClick={handleApplyFilters} aria-label="Search">
                  <SearchIcon />
                </IconButton>
              </Stack>

              {/* Category */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Category
              </Typography>
              <List dense disablePadding sx={{ mb: 3 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={!categoryId}
                    onClick={() => {
                      setCategoryId('');
                      setPage(1);
                      updateUrl({ category: '', page: 1 });
                    }}
                    sx={{ borderRadius: 1 }}
                  >
                    <Typography variant="body2">All categories</Typography>
                  </ListItemButton>
                </ListItem>
                {rootCategories.map((c) => (
                  <ListItem key={c.id} disablePadding>
                    <ListItemButton
                      selected={categoryId === c.id}
                      component={Link}
                      href={`/products?category=${c.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setCategoryId(c.id);
                        setPage(1);
                        updateUrl({ category: c.id, page: 1 });
                      }}
                      sx={{ borderRadius: 1 }}
                    >
                      <Typography variant="body2">{c.name}</Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>

              {/* Price range */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Price range
              </Typography>
              <Box sx={{ px: 0.5, mb: 3 }}>
                <Slider
                  value={priceRange}
                  onChange={(_, v) => setPriceRange(v as [number, number])}
                  valueLabelDisplay="auto"
                  min={PRICE_MIN}
                  max={PRICE_MAX}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="caption" color="text.secondary">
                  ${priceRange[0]} – ${priceRange[1]}
                </Typography>
              </Box>

              {/* Sales / availability */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Availability
              </Typography>
              <Stack spacing={0.5} sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={onSale}
                      onChange={(e) => setOnSale(e.target.checked)}
                    />
                  }
                  label={<Typography variant="body2">On sale</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={inStock === true}
                      onChange={(e) => setInStock(e.target.checked ? true : null)}
                    />
                  }
                  label={<Typography variant="body2">In stock</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={inStock === false}
                      onChange={(e) => setInStock(e.target.checked ? false : null)}
                    />
                  }
                  label={<Typography variant="body2">Out of stock</Typography>}
                />
              </Stack>

              {/* Ratings */}
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Rating
              </Typography>
              <Stack spacing={0.5} sx={{ mb: 3 }}>
                {[5, 4, 3, 2, 1].map((r) => (
                  <FormControlLabel
                    key={r}
                    control={
                      <Checkbox
                        size="small"
                        checked={minRating === r}
                        onChange={(e) => setMinRating(e.target.checked ? r : null)}
                      />
                    }
                    label={
                      <Typography variant="body2">
                        {r} star{r > 1 ? 's' : ''} & up
                      </Typography>
                    }
                  />
                ))}
              </Stack>

              <Button variant="contained" fullWidth onClick={handleApplyFilters} sx={{ mb: 1 }}>
                Apply filters
              </Button>
              <Button variant="outlined" fullWidth onClick={handleClearFilters} disabled={!hasActiveFilter}>
                Clear
              </Button>
            </Paper>
          </Grid>

          {/* Main - col-lg-9 */}
          <Grid size={{ xs: 12, lg: 9 }}>
            {/* Sort bar */}
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
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
                <IconButton
                  size="small"
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <GridViewIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
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
            ) : items.length === 0 ? (
              <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 2 }}>
                <ShoppingBagOutlined sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {hasActiveFilter ? 'No products match the filters' : 'No products yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {hasActiveFilter ? 'Try changing filters or clear them.' : 'Products will appear here once added.'}
                </Typography>
                {hasActiveFilter && (
                  <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
                    Clear filters
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                <Grid container spacing={2}>
                  {items.map((p) => {
                    const isWishlisted = wishlistItems.some((w) => String(w.id) === String(p.id));
                    return (
                      <Grid size={viewMode === 'list' ? 12 : { xs: 12, sm: 6, md: 4 }} key={p.id}>
                        <ProductCard
                          product={p}
                          imageUrl={imageFor(p)}
                          onQuickView={() => openQuickView(p)}
                          isWishlisted={isWishlisted}
                          onToggleWishlist={() =>
                            dispatch(isWishlisted ? removeWishlistRequest(p.id) : addWishlistRequest(p.id))
                          }
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
        <Dialog open={!!quickViewProduct || quickViewLoading} onClose={() => setQuickViewProduct(null)} maxWidth="md" fullWidth>
          <DialogTitle>Quick view</DialogTitle>
          <DialogContent>
            {quickViewLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : quickViewProduct ? (
              <>
                {(() => {
                  const images = quickViewProduct.images?.length
                    ? quickViewProduct.images
                    : quickViewProduct.image_url
                      ? [quickViewProduct.image_url]
                      : [];
                  const variants = quickViewProduct.variants ?? [];
                  const selectedVariant =
                    variants.find((v) => v.id === quickViewVariantId) ?? variants[0] ?? null;
                  const basePrice =
                    typeof quickViewProduct.price === 'number'
                      ? quickViewProduct.price
                      : Number(quickViewProduct.price || 0);
                  const modifier = selectedVariant ? Number(selectedVariant.price_modifier || 0) : 0;
                  const effectivePrice = Math.max(0, basePrice + modifier);
                  const compareAt =
                    quickViewProduct.badge_discount_percent && quickViewProduct.badge_discount_percent > 0
                      ? effectivePrice / (1 - quickViewProduct.badge_discount_percent / 100)
                      : null;
                  const stockQty =
                    selectedVariant?.stock_quantity ?? (quickViewProduct.stock_quantity ?? 0);
                  const inStock = stockQty > 0;

                  return (
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box
                          sx={{
                            position: 'relative',
                            aspectRatio: '1',
                            bgcolor: surfaceSoft(theme),
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            mb: 1.5,
                          }}
                        >
                          {images.length > 0 ? (
                            <Box
                              component="img"
                              src={images[Math.min(quickViewImageIndex, images.length - 1)]}
                              alt={quickViewProduct.name}
                              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <Typography color="text.secondary">No image</Typography>
                            </Box>
                          )}

                          {images.length > 1 && (
                            <>
                              <IconButton
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  left: 8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  bgcolor: paperTranslucent(theme, 0.92),
                                }}
                                onClick={() =>
                                  setQuickViewImageIndex((idx) => (idx <= 0 ? images.length - 1 : idx - 1))
                                }
                              >
                                <ChevronLeft fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  right: 8,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  bgcolor: paperTranslucent(theme, 0.92),
                                }}
                                onClick={() =>
                                  setQuickViewImageIndex((idx) => (idx >= images.length - 1 ? 0 : idx + 1))
                                }
                              >
                                <ChevronRight fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>

                        {images.length > 1 && (
                          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                            {images.map((img, idx) => (
                              <Box
                                key={`${img}-${idx}`}
                                onClick={() => setQuickViewImageIndex(idx)}
                                sx={{
                                  width: 62,
                                  height: 62,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: idx === quickViewImageIndex ? 'primary.main' : 'divider',
                                  cursor: 'pointer',
                                  overflow: 'hidden',
                                  flexShrink: 0,
                                }}
                              >
                                <Box component="img" src={img} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.75 }}>
                          {quickViewProduct.name}
                        </Typography>
                        {!!quickViewProduct.category?.name && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            By {quickViewProduct.category.name}
                          </Typography>
                        )}
                        {(quickViewProduct.reviews_count ?? 0) > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                            <Rating value={quickViewProduct.reviews_avg_rating ?? 0} precision={0.1} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                              ({quickViewProduct.reviews_count})
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ mb: 1.5 }}>
                          {compareAt && (
                            <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                              Rs.{compareAt.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </Typography>
                          )}
                          <Typography variant="h5" color="primary" fontWeight={700}>
                            Rs.{effectivePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </Typography>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          {quickViewProduct.description || ''}
                        </Typography>

                        {variants.length > 0 && (
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.75 }}>
                              Size / Variant
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {variants.map((v) => (
                                <Button
                                  key={v.id}
                                  size="small"
                                  variant={selectedVariant?.id === v.id ? 'contained' : 'outlined'}
                                  onClick={() => setQuickViewVariantId(v.id)}
                                >
                                  {v.name}
                                </Button>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        <Typography
                          variant="body2"
                          sx={{
                            color: inStock ? 'success.main' : 'error.main',
                            fontWeight: 600,
                            mb: 1.25,
                          }}
                        >
                          {inStock ? 'In stock' : 'Out of stock'}
                        </Typography>

                        <Divider sx={{ mb: 1.5 }} />

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setQuickViewQty((q) => Math.max(1, q - 1))}
                          >
                            -
                          </Button>
                          <TextField
                            type="number"
                            size="small"
                            label="Qty"
                            value={quickViewQty}
                            onChange={(e) => setQuickViewQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            inputProps={{ min: 1 }}
                            sx={{ width: 92 }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setQuickViewQty((q) => q + 1)}
                          >
                            +
                          </Button>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            variant="contained"
                            onClick={handleQuickViewAddToCart}
                            disabled={!inStock}
                          >
                            Add to cart
                          </Button>
                          <Button
                            component={Link}
                            href={`/products/${quickViewProduct.slug || quickViewProduct.id}`}
                            onClick={() => setQuickViewProduct(null)}
                          >
                            View full details
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  );
                })()}
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
