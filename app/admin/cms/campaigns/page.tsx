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
  Switch,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import type { CmsCampaign } from '@/types/cms';
import {
  fetchCmsCampaigns,
  fetchCmsCampaignById,
  createCmsCampaign,
  updateCmsCampaign,
  deleteCmsCampaign,
} from '@/lib/api/admin.service';

interface CampaignFormState {
  id?: number;
  name: string;
  slug: string;
  start_at: string;
  end_at: string;
  is_active: boolean;
  priority: string;
  theme_config: string;
}

const emptyForm: CampaignFormState = {
  name: '',
  slug: '',
  start_at: '',
  end_at: '',
  is_active: false,
  priority: '0',
  theme_config: '',
};

export default function AdminCmsCampaignsPage() {
  const toast = useToast();
  const [items, setItems] = useState<CmsCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CampaignFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = () => {
    setLoading(true);
    fetchCmsCampaigns({ per_page: 50 })
      .then((res) => {
        setItems(res.data);
        setError(null);
      })
      .catch(() => setError('Unable to load campaigns.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const c = await fetchCmsCampaignById(id);
      setForm({
        id: c.id,
        name: c.name,
        slug: c.slug,
        start_at: c.start_at ?? '',
        end_at: c.end_at ?? '',
        is_active: c.is_active,
        priority: String(c.priority ?? 0),
        theme_config: c.theme_config ? JSON.stringify(c.theme_config, null, 2) : '',
      });
      setFormOpen(true);
    } catch {
      toast.showError('Unable to load campaign.');
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.showError('Name is required.');
      return;
    }
    const payload: any = {
      name: form.name.trim(),
      slug: form.slug.trim() || undefined,
      start_at: form.start_at || null,
      end_at: form.end_at || null,
      is_active: form.is_active,
      priority: form.priority ? Number(form.priority) : 0,
    };
    if (form.theme_config) {
      try {
        payload.theme_config = JSON.parse(form.theme_config);
      } catch {
        toast.showError('Theme config must be valid JSON.');
        return;
      }
    }
    setSaving(true);
    try {
      if (form.id) {
        await updateCmsCampaign(form.id, payload);
        toast.showSuccess('Campaign updated.');
      } else {
        await createCmsCampaign(payload);
        toast.showSuccess('Campaign created.');
      }
      setFormOpen(false);
      setForm(emptyForm);
      loadData();
    } catch (e: any) {
      toast.showError(e?.response?.data?.message ?? 'Failed to save campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      await deleteCmsCampaign(deleteId);
      toast.showSuccess('Campaign deleted.');
      setDeleteId(null);
      loadData();
    } catch {
      toast.showError('Failed to delete campaign.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Campaigns
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add campaign
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    No campaigns yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.slug}</TableCell>
                    <TableCell>{c.is_active ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{c.start_at ? new Date(c.start_at).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{c.end_at ? new Date(c.end_at).toLocaleDateString() : '—'}</TableCell>
                    <TableCell>{c.priority}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(c.id)} aria-label="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteId(c.id)}
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

      {/* Add/Edit dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{form.id ? 'Edit campaign' : 'Add campaign'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <TextField
            fullWidth
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            helperText="Optional. Leave empty to derive from name."
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <TextField
              fullWidth
              label="Start at"
              value={form.start_at}
              onChange={(e) => setForm((f) => ({ ...f, start_at: e.target.value }))}
              placeholder="2026-03-01T12:00:00Z"
            />
            <TextField
              fullWidth
              label="End at"
              value={form.end_at}
              onChange={(e) => setForm((f) => ({ ...f, end_at: e.target.value }))}
              placeholder="Optional"
            />
          </Box>
          <TextField
            fullWidth
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
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
            label="Theme config (JSON)"
            value={form.theme_config}
            onChange={(e) => setForm((f) => ({ ...f, theme_config: e.target.value }))}
            multiline
            minRows={4}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId != null}
        title="Delete campaign"
        message="Are you sure you want to delete this campaign?"
        confirmLabel="Delete"
        severity="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

