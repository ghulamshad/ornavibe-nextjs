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
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  fetchListRequest,
  createRequest,
  updateRequest,
  deleteRequest,
} from '@/redux/slices/admin/adminPages.slice';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/Toast';
import type { Page } from '@/types/admin';
import { RichTextEditor } from '@/components/cms/RichTextEditor';

const PAGE_TYPES = [
  { value: 'legal', label: 'Legal' },
  { value: 'custom', label: 'Custom' },
  { value: '', label: '—' },
];

export default function AdminPagesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { list, loading, error, saveLoading, deleteLoading } = useSelector(
    (state: RootState) => state.adminPages
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editPage, setEditPage] = useState<Page | null>(null);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDescription, setFormMetaDescription] = useState('');
  const [formType, setFormType] = useState<string>('');
  const [formPublished, setFormPublished] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);

  useEffect(() => {
    dispatch(fetchListRequest());
  }, [dispatch]);

  const openAdd = () => {
    setFormSlug('');
    setFormTitle('');
    setFormContent('');
    setFormMetaTitle('');
    setFormMetaDescription('');
    setFormType('legal');
    setFormPublished(true);
    setFormSortOrder(0);
    setAddOpen(true);
  };

  const openEdit = (p: Page) => {
    setEditPage(p);
    setFormSlug(p.slug);
    setFormTitle(p.title);
    setFormContent(p.content);
    setFormMetaTitle(p.meta_title ?? '');
    setFormMetaDescription(p.meta_description ?? '');
    setFormType(p.type ?? '');
    setFormPublished(p.is_published);
    setFormSortOrder(p.sort_order ?? 0);
  };

  const handleCreate = () => {
    if (!formTitle.trim()) {
      toast.showError('Title is required');
      return;
    }
    const slug = formSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || undefined;
    if (!slug) {
      toast.showError('Slug is required (e.g. privacy, terms-of-service)');
      return;
    }
    dispatch(
      createRequest({
        slug,
        title: formTitle.trim(),
        content: formContent.trim() || '<p></p>',
        meta_title: formMetaTitle.trim() || null,
        meta_description: formMetaDescription.trim() || null,
        type: formType || null,
        is_published: formPublished,
        sort_order: formSortOrder,
      })
    );
    setAddOpen(false);
  };

  const handleUpdate = () => {
    if (!editPage) return;
    if (!formTitle.trim()) {
      toast.showError('Title is required');
      return;
    }
    const slug = formSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    dispatch(
      updateRequest({
        id: editPage.id,
        slug: slug || undefined,
        title: formTitle.trim(),
        content: formContent.trim(),
        meta_title: formMetaTitle.trim() || null,
        meta_description: formMetaDescription.trim() || null,
        type: formType || null,
        is_published: formPublished,
        sort_order: formSortOrder,
      })
    );
    setEditPage(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteId != null) dispatch(deleteRequest(deleteId));
  };

  const prevSaveLoading = React.useRef(saveLoading);
  useEffect(() => {
    if (prevSaveLoading.current && !saveLoading && !error) {
      toast.showSuccess('Page saved successfully');
    }
    prevSaveLoading.current = saveLoading;
  }, [saveLoading, error, toast]);

  const prevDeleteLoading = React.useRef(deleteLoading);
  useEffect(() => {
    if (prevDeleteLoading.current && !deleteLoading) {
      if (error) toast.showError(error);
      else if (deleteId != null) {
        toast.showSuccess('Page deleted');
        setDeleteId(null);
      }
    }
    prevDeleteLoading.current = deleteLoading;
  }, [deleteLoading, error, deleteId, toast]);

  const formDialog = (
    <Dialog
      open={addOpen || !!editPage}
      onClose={() => {
        setAddOpen(false);
        setEditPage(null);
      }}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>{editPage ? 'Edit page' : 'Add page'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <TextField
          autoFocus
          fullWidth
          label="Title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          required
          placeholder="e.g. Privacy Policy"
        />
        <TextField
          fullWidth
          label="URL slug"
          value={formSlug}
          onChange={(e) => setFormSlug(e.target.value)}
          placeholder="e.g. privacy, terms-of-service"
          helperText="Lowercase letters, numbers, hyphens only. Used in /legal/[slug] and /site/pages/[slug]."
        />
        <TextField
          fullWidth
          select
          label="Type"
          value={formType}
          onChange={(e) => setFormType(e.target.value)}
        >
          {PAGE_TYPES.map((t) => (
            <MenuItem key={t.value || 'none'} value={t.value}>{t.label}</MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={<Switch checked={formPublished} onChange={(e) => setFormPublished(e.target.checked)} />}
          label="Published"
        />
        <TextField
          fullWidth
          type="number"
          label="Sort order"
          value={formSortOrder}
          onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)}
          inputProps={{ min: 0 }}
        />
        <TextField
          fullWidth
          label="Meta title (SEO)"
          value={formMetaTitle}
          onChange={(e) => setFormMetaTitle(e.target.value)}
          placeholder="Optional"
        />
        <TextField
          fullWidth
          label="Meta description (SEO)"
          value={formMetaDescription}
          onChange={(e) => setFormMetaDescription(e.target.value)}
          multiline
          rows={2}
          placeholder="Optional"
        />
        <RichTextEditor
          value={formContent}
          onChange={setFormContent}
          placeholder="<h2>Section</h2><p>Paragraph text...</p>"
          minHeight={200}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => { setAddOpen(false); setEditPage(null); }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={editPage ? handleUpdate : handleCreate}
          disabled={saveLoading || !formTitle.trim()}
        >
          {saveLoading ? 'Saving…' : editPage ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Pages
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add page
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage legal and custom content (Privacy, Terms, Cookies, etc.). Published pages are available at /legal/[slug] and via the public API.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
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
                <TableCell>Title</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {list.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    No pages yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                list.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.title}</TableCell>
                    <TableCell>{p.slug}</TableCell>
                    <TableCell>{p.type ? <Chip size="small" label={p.type} /> : '—'}</TableCell>
                    <TableCell>
                      <Chip size="small" label={p.is_published ? 'Published' : 'Draft'} color={p.is_published ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell>{p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(p)} aria-label="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(p.id)}
                        aria-label="Delete"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {formDialog}

      <ConfirmDialog
        open={deleteId != null}
        title="Delete page"
        message={
          deleteId != null
            ? `Are you sure you want to delete "${list.find((p) => p.id === deleteId)?.title ?? deleteId}"?`
            : ''
        }
        confirmLabel="Delete"
        severity="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />
    </Box>
  );
}
