'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Chip,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  ListItemIcon,
  Link as MuiLink,
  Tooltip,
  Checkbox,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchListRequest as fetchCategoriesRequest } from '@/redux/slices/admin/adminCategories.slice';
import {
  fetchListRequest,
  createRequest,
  updateRequest,
  deleteRequest,
} from '@/redux/slices/admin/adminProducts.slice';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/Toast';
import type { Product } from '@/types/catalog';
import {
  fetchProductImages,
  addProductImage,
  deleteProductImage,
  fetchProductVariants,
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
  uploadCmsMedia,
  bulkUpdateProducts,
  bulkDeleteProducts,
  type ProductImageRecord,
  type ProductVariantRecord,
} from '@/lib/api/admin.service';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

const defaultProductForm = {
  name: '',
  slug: '',
  description: '',
  price: '',
  category_id: '' as string | null,
  stock_quantity: 0,
  is_active: true,
  image_url: '',
  is_trending: false,
  badge_type: '' as '' | 'new' | 'hot' | 'discount' | 'oos',
  badge_discount_percent: '' as number | '' | null,
};

export default function AdminProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { list, meta, loading, error, saveLoading, deleteLoading } = useSelector(
    (state: RootState) => state.adminProducts
  );
  const { list: categories } = useSelector((state: RootState) => state.adminCategories);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [form, setForm] = useState(defaultProductForm);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '' as string,
    is_active: '',
    is_trending: '',
    low_stock: '',
    stock_threshold: 10,
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuProduct, setMenuProduct] = useState<Product | null>(null);
  const [productImages, setProductImages] = useState<ProductImageRecord[]>([]);
  const [productVariants, setProductVariants] = useState<ProductVariantRecord[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVariant, setNewVariant] = useState({ name: '', sku: '', price_modifier: 0, stock_quantity: 0 });
  const [imagesLoading, setImagesLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  const load = () => {
    dispatch(
      fetchListRequest({
        page: page + 1,
        per_page: rowsPerPage,
        search: filters.search.trim() || undefined,
        category_id: filters.category_id || undefined,
        is_active: filters.is_active || undefined,
        is_trending: filters.is_trending || undefined,
        low_stock: filters.low_stock || undefined,
        stock_threshold: filters.stock_threshold,
      })
    );
  };

  useEffect(() => {
    load();
  }, [dispatch, page, rowsPerPage]);

  const handleApplyFilters = () => {
    setSelectedIds(new Set());
    setPage(0);
    load();
  };

  const handleClearFilters = () => {
    setSelectedIds(new Set());
    setFilters({
      search: '',
      category_id: '',
      is_active: '',
      is_trending: '',
      low_stock: '',
      stock_threshold: 10,
    });
    setPage(0);
    setTimeout(() => load(), 0);
  };

  const openAdd = () => {
    setForm(defaultProductForm);
    setAddOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      slug: p.slug ?? '',
      description: p.description ?? '',
      price: String(p.price ?? ''),
      category_id: p.category_id ? String(p.category_id) : null,
      stock_quantity: p.stock_quantity ?? 0,
      is_active: p.is_active ?? true,
      image_url: p.image_url ?? '',
      is_trending: p.is_trending ?? false,
      badge_type: (p.badge_type as any) ?? '',
      badge_discount_percent: p.badge_discount_percent ?? '',
    });
    setProductImages((p as { images?: ProductImageRecord[] }).images ?? []);
    setProductVariants((p as { variants?: ProductVariantRecord[] }).variants ?? []);
    setNewImageUrl('');
    setNewVariant({ name: '', sku: '', price_modifier: 0, stock_quantity: 0 });
  };

  useEffect(() => {
    if (!editProduct) return;
    let cancelled = false;
    setImagesLoading(true);
    setVariantsLoading(true);
    Promise.all([
      fetchProductImages(editProduct.id),
      fetchProductVariants(editProduct.id),
    ]).then(([imgs, vars]) => {
      if (!cancelled) {
        setProductImages(imgs);
        setProductVariants(vars);
      }
    }).finally(() => {
      if (!cancelled) {
        setImagesLoading(false);
        setVariantsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [editProduct?.id]);

  const loadProductImages = async () => {
    if (!editProduct) return;
    setImagesLoading(true);
    try {
      const imgs = await fetchProductImages(editProduct.id);
      setProductImages(imgs);
    } finally {
      setImagesLoading(false);
    }
  };

  const loadProductVariants = async () => {
    if (!editProduct) return;
    setVariantsLoading(true);
    try {
      const vars = await fetchProductVariants(editProduct.id);
      setProductVariants(vars);
    } finally {
      setVariantsLoading(false);
    }
  };

  const handleAddImage = async () => {
    if (!editProduct || !newImageUrl.trim()) return;
    try {
      await addProductImage(editProduct.id, newImageUrl.trim());
      setNewImageUrl('');
      await loadProductImages();
      toast.showSuccess('Image added');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to add image');
    }
  };

  const handleUploadMainImage = async (file: File) => {
    try {
      setUploadingMainImage(true);
      const media = await uploadCmsMedia({ file, folder: 'products', alt_text: form.name || undefined });
      setForm((f) => ({ ...f, image_url: media.url }));
      toast.showSuccess('Main image uploaded');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to upload image');
    } finally {
      setUploadingMainImage(false);
    }
  };

  const handleUploadGalleryImages = async (files: FileList) => {
    if (!editProduct || files.length === 0) return;
    try {
      setUploadingGalleryImages(true);
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const media = await uploadCmsMedia({ file, folder: 'products', alt_text: editProduct.name });
        await addProductImage(editProduct.id, media.url);
      }
      await loadProductImages();
      toast.showSuccess('Gallery images uploaded');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to upload images');
    } finally {
      setUploadingGalleryImages(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editProduct) return;
    try {
      await deleteProductImage(editProduct.id, imageId);
      await loadProductImages();
      toast.showSuccess('Image removed');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to remove image');
    }
  };

  const handleAddVariant = async () => {
    if (!editProduct || !newVariant.name.trim()) {
      toast.showError('Variant name is required');
      return;
    }
    try {
      await addProductVariant(editProduct.id, {
        name: newVariant.name.trim(),
        sku: newVariant.sku.trim() || undefined,
        price_modifier: newVariant.price_modifier,
        stock_quantity: newVariant.stock_quantity,
      });
      setNewVariant({ name: '', sku: '', price_modifier: 0, stock_quantity: 0 });
      await loadProductVariants();
      toast.showSuccess('Variant added');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to add variant');
    }
  };

  const handleDeleteVariant = async (variantId: number) => {
    if (!editProduct) return;
    try {
      await deleteProductVariant(editProduct.id, variantId);
      await loadProductVariants();
      toast.showSuccess('Variant removed');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to remove variant');
    }
  };

  const handleCreate = () => {
    if (!form.name.trim()) {
      toast.showError('Name is required');
      return;
    }
    const price = parseFloat(String(form.price));
    if (Number.isNaN(price) || price < 0) {
      toast.showError('Valid price is required');
      return;
    }
    dispatch(
      createRequest({
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        price,
        category_id: form.category_id || null,
        stock_quantity: form.stock_quantity,
        is_active: form.is_active,
        image_url: form.image_url.trim() || undefined,
        is_trending: form.is_trending,
        badge_type: form.badge_type || undefined,
        badge_discount_percent:
          form.badge_type === 'discount' && form.badge_discount_percent !== ''
            ? Number(form.badge_discount_percent)
            : undefined,
      })
    );
    setAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editProduct) return;
    if (!form.name.trim()) {
      toast.showError('Name is required');
      return;
    }
    const price = parseFloat(String(form.price));
    if (Number.isNaN(price) || price < 0) {
      toast.showError('Valid price is required');
      return;
    }
    dispatch(
      updateRequest({
        id: editProduct.id,
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        price,
        category_id: form.category_id || null,
        stock_quantity: form.stock_quantity,
        is_active: form.is_active,
        image_url: form.image_url.trim() || undefined,
        is_trending: form.is_trending,
        badge_type: form.badge_type || undefined,
        badge_discount_percent:
          form.badge_type === 'discount' && form.badge_discount_percent !== ''
            ? Number(form.badge_discount_percent)
            : undefined,
      })
    );
    setEditProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteId != null) dispatch(deleteRequest(deleteId));
  };

  const displayList = list;
  const total = meta?.total ?? 0;

  const pageRowIds = React.useMemo(() => displayList.map((p) => String(p.id)), [displayList]);
  const allPageSelected = pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageRowIds.some((id) => selectedIds.has(id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const everyOnPageSelected =
        pageRowIds.length > 0 && pageRowIds.every((id) => next.has(id));
      if (everyOnPageSelected) {
        pageRowIds.forEach((id) => next.delete(id));
      } else {
        pageRowIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleRowSelected = (id: string | number) => {
    const key = String(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runBulkPatch = async (patch: { is_active?: boolean; is_trending?: boolean }) => {
    if (selectedIds.size === 0) return;
    setBulkWorking(true);
    try {
      const ids = [...selectedIds].map((id) => (/^\d+$/.test(id) ? Number(id) : id));
      const { updated } = await bulkUpdateProducts({
        ids,
        ...patch,
      });
      toast.showSuccess(`Updated ${updated} product(s).`);
      setSelectedIds(new Set());
      load();
    } catch (err) {
      toast.showError(extractErrorMessage(err as object).message);
    } finally {
      setBulkWorking(false);
    }
  };

  const runBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkWorking(true);
    try {
      const ids = [...selectedIds].map((id) => (/^\d+$/.test(id) ? Number(id) : id));
      const { deleted } = await bulkDeleteProducts(ids);
      toast.showSuccess(`Deleted ${deleted} product(s).`);
      setBulkDeleteOpen(false);
      setSelectedIds(new Set());
      load();
    } catch (err) {
      toast.showError(extractErrorMessage(err as object).message);
    } finally {
      setBulkWorking(false);
    }
  };

  const prevSaveLoading = React.useRef(saveLoading);
  useEffect(() => {
    if (prevSaveLoading.current && !saveLoading && !error) toast.showSuccess('Product saved');
    prevSaveLoading.current = saveLoading;
  }, [saveLoading, error, toast]);

  const prevDeleteLoading = React.useRef(deleteLoading);
  useEffect(() => {
    if (prevDeleteLoading.current && !deleteLoading) {
      if (error) toast.showError(error);
      else if (deleteId != null) {
        toast.showSuccess('Product deleted');
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(String(deleteId));
          return next;
        });
        setDeleteId(null);
      }
    }
    prevDeleteLoading.current = deleteLoading;
  }, [deleteLoading, error, deleteId, toast]);

  const openMenu = (e: React.MouseEvent<HTMLElement>, p: Product) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuProduct(p);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuProduct(null);
  };
  const formatPrice = (v: string | number | undefined) =>
    v != null
      ? new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(Number(v))
      : '—';

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Products
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add product
        </Button>
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FilterListIcon fontSize="small" /> Filters
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(6, 1fr)' },
            gap: 2,
            alignItems: 'end',
          }}
        >
          <TextField
            size="small"
            label="Search"
            placeholder="Name or slug"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            select
            label="Category"
            value={filters.category_id}
            onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Status"
            value={filters.is_active}
            onChange={(e) => setFilters((f) => ({ ...f, is_active: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">Active</MenuItem>
            <MenuItem value="0">Inactive</MenuItem>
          </TextField>
          <TextField
            size="small"
            select
            label="Trending"
            value={filters.is_trending}
            onChange={(e) => setFilters((f) => ({ ...f, is_trending: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">Yes</MenuItem>
            <MenuItem value="0">No</MenuItem>
          </TextField>
          <TextField
            size="small"
            select
            label="Low stock"
            value={filters.low_stock}
            onChange={(e) => setFilters((f) => ({ ...f, low_stock: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">No</MenuItem>
            <MenuItem value="1">Only low stock</MenuItem>
          </TextField>
          <TextField
            size="small"
            label="Stock threshold"
            type="number"
            inputProps={{ min: 0 }}
            value={filters.stock_threshold}
            onChange={(e) => setFilters((f) => ({ ...f, stock_threshold: parseInt(e.target.value, 10) || 0 }))}
            fullWidth
            helperText="Used when Low stock = Yes"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="contained" onClick={handleApplyFilters} startIcon={<FilterListIcon />}>
            Apply
          </Button>
          <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
            Clear
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {selectedIds.size > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 2,
            p: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
            bgcolor: 'action.selected',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" fontWeight={700} sx={{ mr: 0.5 }}>
            {selectedIds.size} selected
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CheckCircleOutlineIcon />}
            disabled={bulkWorking}
            onClick={() => void runBulkPatch({ is_active: true })}
          >
            Activate
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<BlockIcon />}
            disabled={bulkWorking}
            onClick={() => void runBulkPatch({ is_active: false })}
          >
            Deactivate
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<WhatshotIcon />}
            disabled={bulkWorking}
            onClick={() => void runBulkPatch({ is_trending: true })}
          >
            Mark trending
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<RemoveCircleOutlineIcon />}
            disabled={bulkWorking}
            onClick={() => void runBulkPatch({ is_trending: false })}
          >
            Clear trending
          </Button>
          <Button size="small" variant="outlined" disabled={bulkWorking} onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            startIcon={<DeleteOutlineIcon />}
            disabled={bulkWorking}
            onClick={() => setBulkDeleteOpen(true)}
          >
            Delete
          </Button>
        </Paper>
      )}

      {loading && list.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={somePageSelected && !allPageSelected}
                      checked={allPageSelected}
                      onChange={toggleSelectAllOnPage}
                      disabled={displayList.length === 0 || loading}
                      inputProps={{ 'aria-label': 'Select all products on this page' }}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="center">Images</TableCell>
                  <TableCell align="center">Variants</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                      {filters.search || filters.category_id || filters.is_active !== '' || filters.is_trending !== '' || filters.low_stock
                        ? 'No products match the filters. Try different criteria or clear filters.'
                        : 'No products yet. Add one to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayList.map((p) => (
                    <TableRow key={String(p.id)} selected={selectedIds.has(String(p.id))} hover>
                      <TableCell
                        padding="checkbox"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Checkbox
                          checked={selectedIds.has(String(p.id))}
                          onChange={() => toggleRowSelected(p.id)}
                          disabled={bulkWorking}
                          inputProps={{ 'aria-label': `Select ${p.name}` }}
                        />
                      </TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.slug ?? '—'}</TableCell>
                      <TableCell align="right">{formatPrice(p.price)}</TableCell>
                      <TableCell>{(p as { category?: { name?: string } }).category?.name ?? '—'}</TableCell>
                      <TableCell align="right">{p.stock_quantity ?? 0}</TableCell>
                      <TableCell align="center">
                        {(p as { images?: unknown[] }).images?.length ?? 0}
                      </TableCell>
                      <TableCell align="center">
                        {(p as { variants?: unknown[] }).variants?.length ?? 0}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={p.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={p.is_active ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => openMenu(e, p)} aria-label="Product actions">
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor && menuProduct)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              component="a"
              href={menuProduct ? `/products/${(menuProduct as { slug?: string }).slug || menuProduct.id}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
              <ListItemText>View on store</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (menuProduct) openEdit(menuProduct);
                closeMenu();
              }}
            >
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (menuProduct) setDeleteId(menuProduct.id);
                closeMenu();
              }}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
          {meta && meta.total > 0 && (
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 15, 25, 50]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
            />
          )}
        </Paper>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            margin="normal"
            placeholder="Auto-generated if empty"
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={form.category_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || null }))}
            margin="normal"
          >
            <MenuItem value="">None</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Stock quantity"
            type="number"
            inputProps={{ min: 0 }}
            value={form.stock_quantity}
            onChange={(e) => setForm((f) => ({ ...f, stock_quantity: parseInt(e.target.value, 10) || 0 }))}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_trending}
                onChange={(e) => setForm((f) => ({ ...f, is_trending: e.target.checked }))}
              />
            }
            label="Show in Trending slider"
          />
          <TextField
            fullWidth
            select
            label="Badge type"
            value={form.badge_type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                badge_type: e.target.value as typeof f.badge_type,
              }))
            }
            margin="normal"
            helperText="Controls the small label on the product card"
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="hot">Hot</MenuItem>
            <MenuItem value="discount">Discount</MenuItem>
            <MenuItem value="oos">Out Of Stock</MenuItem>
          </TextField>
          {form.badge_type === 'discount' && (
            <TextField
              fullWidth
              label="Discount percent"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={form.badge_discount_percent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  badge_discount_percent: e.target.value === '' ? '' : Number(e.target.value) || 0,
                }))
              }
              margin="normal"
            />
          )}
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_trending}
                onChange={(e) => setForm((f) => ({ ...f, is_trending: e.target.checked }))}
              />
            }
            label="Show in Trending slider"
          />
          <TextField
            fullWidth
            select
            label="Badge type"
            value={form.badge_type}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                badge_type: e.target.value as typeof f.badge_type,
              }))
            }
            margin="normal"
            helperText="Controls the small label on the product card"
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="hot">Hot</MenuItem>
            <MenuItem value="discount">Discount</MenuItem>
            <MenuItem value="oos">Out Of Stock</MenuItem>
          </TextField>
          {form.badge_type === 'discount' && (
            <TextField
              fullWidth
              label="Discount percent"
              type="number"
              inputProps={{ min: 0, max: 100 }}
              value={form.badge_discount_percent}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  badge_discount_percent: e.target.value === '' ? '' : Number(e.target.value) || 0,
                }))
              }
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label="Image URL"
            value={form.image_url}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            margin="normal"
          />
          <Box sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={uploadingMainImage}
            >
              {uploadingMainImage ? 'Uploading…' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUploadMainImage(file);
                    e.target.value = '';
                  }
                }}
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saveLoading}>
            {saveLoading ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editProduct} onClose={() => setEditProduct(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={form.category_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || null }))}
            margin="normal"
          >
            <MenuItem value="">None</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Stock quantity"
            type="number"
            inputProps={{ min: 0 }}
            value={form.stock_quantity}
            onChange={(e) => setForm((f) => ({ ...f, stock_quantity: parseInt(e.target.value, 10) || 0 }))}
            margin="normal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
            }
            label="Active"
          />
          <TextField
            fullWidth
            label="Image URL (main)"
            value={form.image_url}
            onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
            margin="normal"
          />
          <Box sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={uploadingMainImage}
            >
              {uploadingMainImage ? 'Uploading…' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUploadMainImage(file);
                    e.target.value = '';
                  }
                }}
              />
            </Button>
          </Box>

          <Accordion variant="outlined" sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Gallery images</AccordionSummary>
            <AccordionDetails>
              {imagesLoading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <List dense>
                    {productImages.map((img) => (
                      <ListItem key={img.id}>
                        <ListItemText primary={img.url} secondary={`Order: ${img.sort_order}`} />
                        <ListItemSecondaryAction>
                          <IconButton size="small" onClick={() => handleDeleteImage(img.id)} aria-label="Delete image">
                            <DeleteOutlineIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Image URL"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        sx={{ flex: 1 }}
                      />
                      <Button size="small" variant="outlined" onClick={handleAddImage}>Add</Button>
                    </Box>
                    <Box>
                      <Button
                        component="label"
                        size="small"
                        variant="outlined"
                        disabled={uploadingGalleryImages}
                      >
                        {uploadingGalleryImages ? 'Uploading…' : 'Upload images'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              void handleUploadGalleryImages(files);
                              e.target.value = '';
                            }
                          }}
                        />
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion variant="outlined">
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>Variants</AccordionSummary>
            <AccordionDetails>
              {variantsLoading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <List dense>
                    {productVariants.map((v) => (
                      <ListItem key={v.id}>
                        <ListItemText
                          primary={v.name}
                          secondary={`SKU: ${v.sku || '—'} · +${Number(v.price_modifier).toFixed(2)} · Stock: ${v.stock_quantity}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton size="small" onClick={() => handleDeleteVariant(v.id)} aria-label="Delete variant">
                            <DeleteOutlineIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    <TextField size="small" placeholder="Variant name" value={newVariant.name} onChange={(e) => setNewVariant((f) => ({ ...f, name: e.target.value }))} sx={{ minWidth: 120 }} />
                    <TextField size="small" placeholder="SKU" value={newVariant.sku} onChange={(e) => setNewVariant((f) => ({ ...f, sku: e.target.value }))} sx={{ width: 100 }} />
                    <TextField size="small" type="number" label="Price modifier" value={newVariant.price_modifier} onChange={(e) => setNewVariant((f) => ({ ...f, price_modifier: Number(e.target.value) || 0 }))} sx={{ width: 110 }} inputProps={{ step: 0.01 }} />
                    <TextField size="small" type="number" label="Stock" value={newVariant.stock_quantity} onChange={(e) => setNewVariant((f) => ({ ...f, stock_quantity: parseInt(e.target.value, 10) || 0 }))} sx={{ width: 80 }} inputProps={{ min: 0 }} />
                    <Button size="small" variant="outlined" onClick={handleAddVariant}>Add variant</Button>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditProduct(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={saveLoading}>
            {saveLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteId != null}
        title="Delete product"
        message={
          deleteId != null
            ? `Are you sure you want to delete "${list.find((p) => String(p.id) === String(deleteId))?.name ?? deleteId}"?`
            : ''
        }
        confirmLabel="Delete"
        severity="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete selected products"
        message={`Permanently delete ${selectedIds.size} product(s)? Related images and variants will be removed.`}
        confirmLabel="Delete all"
        severity="destructive"
        onConfirm={() => void runBulkDelete()}
        onCancel={() => setBulkDeleteOpen(false)}
        loading={bulkWorking}
      />
    </Box>
  );
}
