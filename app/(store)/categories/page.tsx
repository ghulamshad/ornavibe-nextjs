'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  TextField,
  MenuItem,
  Button,
  Paper,
  Alert,
  Stack,
  Skeleton,
  Chip,
  List,
  ListItem,
  ListItemButton,
  IconButton,
  Link as MuiLink,
  useTheme,
} from '@mui/material';
import { surfaceSoft, neutralSlate } from '@/lib/theme/storefrontSurfaces';
import { Home, NavigateNext, Search as SearchIcon, Clear as ClearIcon, Category as CategoryIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchCategoriesRequest } from '@/redux/slices/catalog.slice';
import type { Category } from '@/types/catalog';

const VIEW_ALL = 'all';
const VIEW_ROOT_ONLY = 'root_only';
const VIEW_SUB_ONLY = 'has_parent';

function filterCategories(
  categories: Category[],
  search: string,
  view: string,
  parentId: string
): Category[] {
  let list = categories;
  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        (c.slug ?? '').toLowerCase().includes(q)
    );
  }
  if (view === VIEW_ROOT_ONLY) list = list.filter((c) => !c.parent_id);
  else if (view === VIEW_SUB_ONLY) list = list.filter((c) => !!c.parent_id);
  if (parentId) list = list.filter((c) => c.parent_id === parentId);
  return list;
}

export default function StoreCategoriesPage() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, categoriesLoading, error } = useSelector((state: RootState) => state.catalog);

  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [view, setView] = useState(() => searchParams.get('view') ?? VIEW_ALL);
  const [parentId, setParentId] = useState(() => searchParams.get('parent') ?? '');

  const rootCategories = useMemo(() => categories.filter((c) => !c.parent_id), [categories]);
  const filtered = useMemo(
    () => filterCategories(categories, search, view, parentId),
    [categories, search, view, parentId]
  );

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  const updateUrl = (updates: { search?: string; view?: string; parent?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    if (updates.search !== undefined) (updates.search ? params.set('search', updates.search) : params.delete('search'));
    if (updates.view !== undefined) (updates.view && updates.view !== VIEW_ALL ? params.set('view', updates.view) : params.delete('view'));
    if (updates.parent !== undefined) (updates.parent ? params.set('parent', updates.parent) : params.delete('parent'));
    const q = params.toString();
    router.replace(q ? `/categories?${q}` : '/categories', { scroll: false });
  };

  const handleApply = () => {
    updateUrl({ search: search.trim() || undefined, view: view !== VIEW_ALL ? view : undefined, parent: parentId || undefined });
  };

  const hasActiveFilter = !!(search.trim() || view !== VIEW_ALL || parentId);
  const handleClear = () => {
    setSearch('');
    setView(VIEW_ALL);
    setParentId('');
    router.replace('/categories', { scroll: false });
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: { xs: 3, md: 4 } }}>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/" color="text.secondary" underline="hover" sx={{ display: 'flex', alignItems: 'center' }}>
            <Home fontSize="small" sx={{ mr: 0.5 }} /> Home
          </MuiLink>
          <NavigateNext fontSize="small" color="action" />
          <Typography variant="body2" color="text.primary" fontWeight={600}>
            Categories
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Categories
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Browse by category and subcategory. Ornavibe by Rason Business.
        </Typography>

        <Grid container spacing={3}>
          {/* Sidebar - col-lg-3 */}
          <Grid size={{ xs: 12, lg: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: { lg: 'sticky' }, top: 100 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Search
              </Typography>
              <Stack direction="row" spacing={0.5} sx={{ mb: 3 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search categories"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' } }}
                />
                <IconButton color="primary" onClick={handleApply} aria-label="Search">
                  <SearchIcon />
                </IconButton>
              </Stack>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Type
              </Typography>
              <List dense disablePadding sx={{ mb: 3 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={view === VIEW_ALL}
                    onClick={() => setView(VIEW_ALL)}
                    sx={{ borderRadius: 1 }}
                  >
                    <Typography variant="body2">All</Typography>
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={view === VIEW_ROOT_ONLY}
                    onClick={() => setView(VIEW_ROOT_ONLY)}
                    sx={{ borderRadius: 1 }}
                  >
                    <Typography variant="body2">Root only</Typography>
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={view === VIEW_SUB_ONLY}
                    onClick={() => setView(VIEW_SUB_ONLY)}
                    sx={{ borderRadius: 1 }}
                  >
                    <Typography variant="body2">Subcategories only</Typography>
                  </ListItemButton>
                </ListItem>
              </List>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Parent category
              </Typography>
              <TextField
                size="small"
                fullWidth
                select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                sx={{ mb: 3 }}
              >
                <MenuItem value="">Any</MenuItem>
                {rootCategories.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button variant="contained" fullWidth onClick={handleApply} sx={{ mb: 1 }}>
                Apply filters
              </Button>
              <Button variant="outlined" fullWidth onClick={handleClear} disabled={!hasActiveFilter}>
                Clear
              </Button>
            </Paper>
          </Grid>

          {/* Main - col-lg-9 */}
          <Grid size={{ xs: 12, lg: 9 }}>
            <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'}
              </Typography>
              {hasActiveFilter && (
                <Chip size="small" label={`${filtered.length} result${filtered.length !== 1 ? 's' : ''}`} color="primary" variant="outlined" />
              )}
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {categoriesLoading && categories.length === 0 ? (
              <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <Skeleton variant="rectangular" height={160} />
                      <Box sx={{ p: 2 }}>
                        <Skeleton variant="text" width="70%" height={28} />
                        <Skeleton variant="text" width="90%" height={20} sx={{ mt: 1 }} />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : filtered.length === 0 ? (
              <Paper variant="outlined" sx={{ textAlign: 'center', py: 8, px: 2 }}>
                <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {hasActiveFilter ? 'No categories match the filters' : 'No categories yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {hasActiveFilter ? 'Try different search or filter criteria, or clear filters.' : 'Categories will appear here once they are added.'}
                </Typography>
                {hasActiveFilter && (
                  <Button variant="outlined" onClick={handleClear} startIcon={<ClearIcon />}>
                    Clear filters
                  </Button>
                )}
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {filtered.map((cat: Category) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cat.id}>
                    <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, overflow: 'hidden' }}>
                      <CardActionArea
                        component={Link}
                        href={`/categories/${cat.slug}`}
                        sx={{ height: '100%', flexDirection: 'column', alignItems: 'stretch' }}
                      >
                        {cat.image_url ? (
                          <Box sx={{ aspectRatio: '16/10', bgcolor: surfaceSoft(theme) }}>
                            <CardMedia
                              component="img"
                              image={cat.image_url}
                              alt={cat.name}
                              sx={{ objectFit: 'cover', height: '100%' }}
                            />
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              aspectRatio: '16/10',
                              bgcolor: neutralSlate(theme, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CategoryIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                          </Box>
                        )}
                        <CardContent sx={{ p: 2, flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {cat.name}
                          </Typography>
                          {cat.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {cat.description}
                            </Typography>
                          )}
                          {cat.children && cat.children.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }} flexWrap="wrap">
                              <Chip size="small" label={`${cat.children.length} subcategories`} variant="outlined" />
                            </Stack>
                          )}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
