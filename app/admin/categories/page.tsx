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
  Checkbox,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  fetchListRequest,
  createRequest,
  updateRequest,
  deleteRequest,
} from '@/redux/slices/admin/adminCategories.slice';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/Toast';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import type { Category } from '@/types/catalog';
import { bulkDeleteCategories, bulkUpdateCategories, uploadCmsMedia } from '@/lib/api/admin.service';

export default function AdminCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { list, loading, error, saveLoading, deleteLoading } = useSelector(
    (state: RootState) => state.adminCategories
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formParentId, setFormParentId] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    parent_filter: '' as string,
    parent_id: '' as string,
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuCategory, setMenuCategory] = useState<Category | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkMoveParentId, setBulkMoveParentId] = useState<string>('');

  const load = () => {
    dispatch(
      fetchListRequest({
        search: filters.search.trim() || undefined,
        parent_filter: filters.parent_filter || undefined,
        parent_id: filters.parent_id || undefined,
      })
    );
  };

  useEffect(() => {
    load();
  }, [dispatch]);

  const handleApplyFilters = () => {
    setSelectedIds(new Set());
    load();
  };
  const handleClearFilters = () => {
    setSelectedIds(new Set());
    setBulkMoveParentId('');
    setFilters({ search: '', parent_filter: '', parent_id: '' });
    dispatch(fetchListRequest({}));
  };

  const rootCategories = list.filter((c) => !c.parent_id);

  const openMenu = (e: React.MouseEvent<HTMLElement>, c: Category) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuCategory(c);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuCategory(null);
  };

  const openAdd = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImageUrl('');
    setFormParentId('');
    setAddOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditCategory(c);
    setFormName(c.name);
    setFormSlug(c.slug ?? '');
    setFormDescription(c.description ?? '');
    setFormImageUrl(c.image_url ?? '');
    setFormParentId(c.parent_id ?? '');
  };

  const handleCreate = () => {
    if (!formName.trim()) {
      toast.showError('Name is required');
      return;
    }
    dispatch(
      createRequest({
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim() || undefined,
        image_url: formImageUrl.trim() || undefined,
        parent_id: formParentId.trim() || null,
      })
    );
    setAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editCategory || !formName.trim()) return;
    dispatch(
      updateRequest({
        id: editCategory.id,
        name: formName.trim(),
        slug: formSlug.trim() || undefined,
        description: formDescription.trim() || undefined,
        image_url: formImageUrl.trim() || undefined,
        parent_id: formParentId.trim() || null,
      })
    );
    setEditCategory(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) dispatch(deleteRequest(deleteId));
  };

  const selectableIds = list.map((c) => c.id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));
  const someSelected = selectableIds.some((id) => selectedIds.has(id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const nextEverySelected = allSelected;
      if (nextEverySelected) selectableIds.forEach((id) => next.delete(id));
      else selectableIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleRowSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const runBulkMove = async (parentId: string | null) => {
    if (selectedIds.size === 0) return;
    setBulkWorking(true);
    try {
      const ids = [...selectedIds];
      const { updated } = await bulkUpdateCategories({ ids, parent_id: parentId });
      toast.showSuccess(`Updated ${updated} categor${updated === 1 ? 'y' : 'ies'}.`);
      setSelectedIds(new Set());
      setBulkMoveParentId('');
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
      const ids = [...selectedIds];
      const { deleted } = await bulkDeleteCategories(ids);
      toast.showSuccess(`Deleted ${deleted} categor${deleted === 1 ? 'y' : 'ies'}.`);
      setSelectedIds(new Set());
      setBulkMoveParentId('');
      setBulkDeleteOpen(false);
      load();
    } catch (err) {
      toast.showError(extractErrorMessage(err as object).message);
    } finally {
      setBulkWorking(false);
    }
  };

  const prevSaveLoading = React.useRef(saveLoading);
  useEffect(() => {
    if (prevSaveLoading.current && !saveLoading && !error) {
      toast.showSuccess('Category saved successfully');
    }
    prevSaveLoading.current = saveLoading;
  }, [saveLoading, error, toast]);

  const prevDeleteLoading = React.useRef(deleteLoading);
  useEffect(() => {
    if (prevDeleteLoading.current && !deleteLoading) {
      if (error) toast.showError(error);
      else if (deleteId) {
        toast.showSuccess('Category deleted');
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(deleteId);
          return next;
        });
        setDeleteId(null);
      }
    }
    prevDeleteLoading.current = deleteLoading;
  }, [deleteLoading, error, deleteId, toast]);

  const handleUploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      const media = await uploadCmsMedia({ file, folder: 'categories', alt_text: formName || undefined });
      setFormImageUrl(media.url);
      toast.showSuccess('Image uploaded');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Categories
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add category
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
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
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
            label="Type"
            value={filters.parent_filter}
            onChange={(e) => setFilters((f) => ({ ...f, parent_filter: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="root_only">Root only</MenuItem>
            <MenuItem value="has_parent">Subcategories only</MenuItem>
          </TextField>
          <TextField
            size="small"
            select
            label="Parent category"
            value={filters.parent_id}
            onChange={(e) => setFilters((f) => ({ ...f, parent_id: e.target.value }))}
            fullWidth
            helperText="Show only children of this category"
          >
            <MenuItem value="">Any</MenuItem>
            {rootCategories.map((r) => (
              <MenuItem key={r.id} value={r.id}>
                {r.name}
              </MenuItem>
            ))}
          </TextField>
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
          <Typography variant="body2" fontWeight={700}>
            {selectedIds.size} selected
          </Typography>
          <Button size="small" variant="outlined" disabled={bulkWorking} onClick={() => void runBulkMove(null)}>
            Move to root
          </Button>
          <TextField
            size="small"
            select
            label="Parent"
            value={bulkMoveParentId}
            onChange={(e) => setBulkMoveParentId(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Root</MenuItem>
            {rootCategories
              .filter((r) => !selectedIds.has(r.id))
              .map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
          </TextField>
          <Button
            size="small"
            variant="outlined"
            disabled={bulkWorking}
            onClick={() => void runBulkMove(bulkMoveParentId || null)}
          >
            Move
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            disabled={bulkWorking}
            onClick={() => setBulkDeleteOpen(true)}
            startIcon={<DeleteOutlineIcon />}
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
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={someSelected && !allSelected}
                    checked={allSelected}
                    onChange={toggleSelectAllOnPage}
                    disabled={bulkWorking || selectableIds.length === 0}
                    inputProps={{ 'aria-label': 'Select all categories' }}
                  />
                </TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell align="center">Children</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right" width={56} />
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    {filters.search || filters.parent_filter || filters.parent_id
                      ? 'No categories match the filters. Try different criteria or clear filters.'
                      : 'No categories yet. Add one to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                list.map((c) => (
                  <TableRow key={c.id} hover selected={selectedIds.has(c.id)}>
                    <TableCell
                      padding="checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Checkbox
                        checked={selectedIds.has(c.id)}
                        onChange={() => toggleRowSelected(c.id)}
                        disabled={bulkWorking}
                        inputProps={{ 'aria-label': `Select ${c.name}` }}
                      />
                    </TableCell>
                    <TableCell>
                      {c.image_url ? (
                        <Box component="img" src={c.image_url} alt="" sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }} />
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.slug ?? '—'}</TableCell>
                    <TableCell>{c.parent?.name ?? '—'}</TableCell>
                    <TableCell align="center">{c.children?.length ?? 0}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>{c.description || '—'}</TableCell>
                    <TableCell align="right" padding="none">
                      <Tooltip title="Actions">
                        <IconButton size="small" onClick={(e) => openMenu(e, c)} aria-label="Category actions">
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
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuCategory)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          component="a"
          href={menuCategory ? `/categories/${menuCategory.slug ?? menuCategory.id}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View on store</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCategory) openEdit(menuCategory);
            closeMenu();
          }}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCategory) setDeleteId(menuCategory.id);
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            margin="normal"
            placeholder="Leave empty to auto-generate"
          />
          <TextField
            fullWidth
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Image URL"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
            margin="normal"
            placeholder="https://..."
          />
          <Box sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading…' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUploadImage(file);
                    e.target.value = '';
                  }
                }}
              />
            </Button>
          </Box>
          <TextField
            fullWidth
            select
            label="Parent category"
            value={formParentId}
            onChange={(e) => setFormParentId(e.target.value)}
            margin="normal"
          >
            <MenuItem value="">None (root category)</MenuItem>
            {rootCategories.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saveLoading}>
            {saveLoading ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!editCategory} onClose={() => setEditCategory(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Image URL"
            value={formImageUrl}
            onChange={(e) => setFormImageUrl(e.target.value)}
            margin="normal"
          />
          <Box sx={{ mt: 1 }}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Uploading…' : 'Upload image'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUploadImage(file);
                    e.target.value = '';
                  }
                }}
              />
            </Button>
          </Box>
          <TextField
            fullWidth
            select
            label="Parent category"
            value={formParentId}
            onChange={(e) => setFormParentId(e.target.value)}
            margin="normal"
          >
            <MenuItem value="">None (root category)</MenuItem>
            {rootCategories.filter((r) => r.id !== editCategory?.id).map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditCategory(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={saveLoading}>
            {saveLoading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete category"
        message={
          deleteId
            ? `Are you sure you want to delete "${list.find((c) => c.id === deleteId)?.name ?? deleteId}"? Products in this category may need to be reassigned.`
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
        title="Delete selected categories"
        message={`Permanently delete ${selectedIds.size} categor${selectedIds.size === 1 ? 'y' : 'ies'}? This may require product/category reassignment.`}
        confirmLabel="Delete all"
        severity="destructive"
        onConfirm={() => void runBulkDelete()}
        onCancel={() => {
          setBulkDeleteOpen(false);
        }}
        loading={bulkWorking}
      />
    </Box>
  );
}
