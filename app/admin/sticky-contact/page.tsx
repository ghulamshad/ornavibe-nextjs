'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';
import {
  fetchStickyContact,
  updateStickyContactBar,
  createStickyContactItem,
  updateStickyContactItem,
  deleteStickyContactItem,
  uploadCmsMedia,
} from '@/lib/api/admin.service';
import type { AdminStickyContactBar, AdminStickyContactItem } from '@/types/admin';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const PLACEMENTS: { value: string; label: string }[] = [
  { value: 'middle_right', label: 'Middle right (default)' },
  { value: 'middle_left', label: 'Middle left' },
  { value: 'bottom_right', label: 'Bottom right' },
  { value: 'bottom_left', label: 'Bottom left' },
  { value: 'top_right', label: 'Top right' },
  { value: 'top_left', label: 'Top left' },
  { value: 'custom', label: 'Custom (CSS positions below)' },
];

const emptyItem: Partial<AdminStickyContactItem> = {
  item_type: 'whatsapp',
  phone: '',
  message: 'Hi.',
  href: '',
  image_url: '',
  label: '',
  sort_order: 0,
  is_active: true,
  open_in_new_tab: true,
};

export default function AdminStickyContactPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [barForm, setBarForm] = useState<Partial<AdminStickyContactBar>>({});
  const [items, setItems] = useState<AdminStickyContactItem[]>([]);
  const [barSaving, setBarSaving] = useState(false);

  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminStickyContactItem | null>(null);
  const [itemForm, setItemForm] = useState<Partial<AdminStickyContactItem>>(emptyItem);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStickyContact();
      setBarForm(res.bar);
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sticky contact');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSaveBar = async () => {
    if (!barForm.placement) {
      toast.showError('Placement is required');
      return;
    }
    setBarSaving(true);
    try {
      const res = await updateStickyContactBar({
        is_enabled: barForm.is_enabled,
        placement: barForm.placement,
        edge_offset: barForm.edge_offset,
        vertical_offset: barForm.vertical_offset,
        custom_top: barForm.custom_top || null,
        custom_right: barForm.custom_right || null,
        custom_bottom: barForm.custom_bottom || null,
        custom_left: barForm.custom_left || null,
      });
      setBarForm(res.bar);
      setItems(res.items ?? []);
      toast.showSuccess('Sticky contact settings saved');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setBarSaving(false);
    }
  };

  const openNewItem = () => {
    setEditingItem(null);
    setItemForm({ ...emptyItem, sort_order: items.length });
    setItemDialogOpen(true);
  };

  const openEditItem = (row: AdminStickyContactItem) => {
    setEditingItem(row);
    setItemForm(row);
    setItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      if (editingItem) {
        const updated = await updateStickyContactItem(editingItem.id, itemForm);
        setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
        toast.showSuccess('Item updated');
      } else {
        const created = await createStickyContactItem(itemForm);
        setItems((prev) => [...prev, created]);
        toast.showSuccess('Item created');
      }
      setItemDialogOpen(false);
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to save item');
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteItemId == null) return;
    try {
      await deleteStickyContactItem(deleteItemId);
      setItems((prev) => prev.filter((x) => x.id !== deleteItemId));
      toast.showSuccess('Item deleted');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleteItemId(null);
    }
  };

  const handleUploadImage = async (file: File) => {
    try {
      setUploadingImage(true);
      const media = await uploadCmsMedia({ file, folder: 'sticky', alt_text: itemForm.label || undefined });
      setItemForm((p) => ({ ...p, image_url: media.url }));
      toast.showSuccess('Image uploaded');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Sticky contact (WhatsApp / phone)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Floating buttons on the storefront (fixed position). Configure placement and add WhatsApp, phone, or custom links.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Bar settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(barForm.is_enabled)}
              onChange={(e) => setBarForm((p) => ({ ...p, is_enabled: e.target.checked }))}
            />
          }
          label="Show on storefront"
        />
        <FormControl fullWidth sx={{ mt: 2, maxWidth: 400 }}>
          <InputLabel id="placement-label">Position</InputLabel>
          <Select
            labelId="placement-label"
            label="Position"
            value={barForm.placement ?? 'middle_right'}
            onChange={(e) => setBarForm((p) => ({ ...p, placement: e.target.value }))}
          >
            {PLACEMENTS.map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          type="number"
          label="Gap from edge (px)"
          value={barForm.edge_offset ?? 16}
          onChange={(e) => setBarForm((p) => ({ ...p, edge_offset: Number(e.target.value) }))}
          sx={{ mt: 2, maxWidth: 200 }}
          inputProps={{ min: 0, max: 200 }}
          helperText="Distance from the side (or top/bottom for corner modes)"
        />
        <TextField
          fullWidth
          type="number"
          label="Vertical nudge (px)"
          value={barForm.vertical_offset ?? 0}
          onChange={(e) => setBarForm((p) => ({ ...p, vertical_offset: Number(e.target.value) }))}
          sx={{ mt: 2, maxWidth: 200 }}
          helperText="Fine-tune middle-left / middle-right (positive moves down)"
        />
        {barForm.placement === 'custom' && (
          <Box sx={{ mt: 2, display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <TextField label="CSS top" value={barForm.custom_top ?? ''} onChange={(e) => setBarForm((p) => ({ ...p, custom_top: e.target.value }))} placeholder="e.g. 120px or 20%" />
            <TextField label="CSS right" value={barForm.custom_right ?? ''} onChange={(e) => setBarForm((p) => ({ ...p, custom_right: e.target.value }))} placeholder="16px" />
            <TextField label="CSS bottom" value={barForm.custom_bottom ?? ''} onChange={(e) => setBarForm((p) => ({ ...p, custom_bottom: e.target.value }))} />
            <TextField label="CSS left" value={barForm.custom_left ?? ''} onChange={(e) => setBarForm((p) => ({ ...p, custom_left: e.target.value }))} />
          </Box>
        )}
        <Button variant="contained" onClick={() => void handleSaveBar()} disabled={barSaving} sx={{ mt: 2 }}>
          {barSaving ? 'Saving…' : 'Save bar settings'}
        </Button>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Buttons
          </Typography>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openNewItem}>
            Add button
          </Button>
        </Box>
        {items.length === 0 ? (
          <Typography color="text.secondary">No buttons yet. Add WhatsApp, phone, or a custom link.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={56} />
                  <TableCell>Type</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" width={100} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      {row.image_url ? (
                        <Box component="img" src={row.image_url} alt="" sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }} />
                      ) : (
                        <Chip label={row.item_type} size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{row.item_type}</TableCell>
                    <TableCell>{row.label || '—'}</TableCell>
                    <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.resolved_href || row.href || row.phone || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.is_active !== false ? 'Active' : 'Off'} color={row.is_active !== false ? 'success' : 'default'} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditItem(row)} aria-label="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteItemId(row.id)} aria-label="Delete">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit button' : 'Add button'}</DialogTitle>
        <DialogContent dividers>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              label="Type"
              value={itemForm.item_type ?? 'whatsapp'}
              onChange={(e) => setItemForm((p) => ({ ...p, item_type: e.target.value as AdminStickyContactItem['item_type'] }))}
            >
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
              <MenuItem value="phone">Phone (tel:)</MenuItem>
              <MenuItem value="link">Custom URL</MenuItem>
            </Select>
          </FormControl>
          {(itemForm.item_type === 'whatsapp' || itemForm.item_type === 'phone') && (
            <TextField
              fullWidth
              label="Phone number"
              value={itemForm.phone ?? ''}
              onChange={(e) => setItemForm((p) => ({ ...p, phone: e.target.value }))}
              margin="normal"
              helperText="WhatsApp: country code + number, digits only (e.g. 923323349668). Phone: as shown to customers."
            />
          )}
          {itemForm.item_type === 'whatsapp' && (
            <TextField
              fullWidth
              label="Prefill message (WhatsApp)"
              value={itemForm.message ?? ''}
              onChange={(e) => setItemForm((p) => ({ ...p, message: e.target.value }))}
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label="Custom URL (optional)"
            value={itemForm.href ?? ''}
            onChange={(e) => setItemForm((p) => ({ ...p, href: e.target.value }))}
            margin="normal"
            helperText="Overrides auto link for this type. Required for type “Custom URL”."
          />
          <TextField fullWidth label="Label / alt text" value={itemForm.label ?? ''} onChange={(e) => setItemForm((p) => ({ ...p, label: e.target.value }))} margin="normal" />
          <TextField
            fullWidth
            label="Image URL"
            value={itemForm.image_url ?? ''}
            onChange={(e) => setItemForm((p) => ({ ...p, image_url: e.target.value }))}
            margin="normal"
            InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon /></InputAdornment> }}
          />
          <Button component="label" variant="outlined" size="small" sx={{ mt: 1 }} disabled={uploadingImage}>
            {uploadingImage ? 'Uploading…' : 'Upload image'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUploadImage(f);
                e.target.value = '';
              }}
            />
          </Button>
          <TextField
            fullWidth
            type="number"
            label="Sort order"
            value={itemForm.sort_order ?? 0}
            onChange={(e) => setItemForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          <FormControlLabel
            control={<Switch checked={itemForm.is_active !== false} onChange={(e) => setItemForm((p) => ({ ...p, is_active: e.target.checked }))} />}
            label="Active"
          />
          <FormControlLabel
            control={<Switch checked={Boolean(itemForm.open_in_new_tab)} onChange={(e) => setItemForm((p) => ({ ...p, open_in_new_tab: e.target.checked }))} />}
            label="Open in new tab"
            sx={{ display: 'block' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleSaveItem()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteItemId != null}
        title="Delete button"
        message="Remove this sticky button?"
        confirmLabel="Delete"
        severity="destructive"
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteItemId(null)}
      />
    </Box>
  );
}
