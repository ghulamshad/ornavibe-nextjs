'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { fetchAdminMenus, createAdminMenu, deleteAdminMenu, fetchAdminMenuItems } from '@/lib/api/adminMenus.service';
import type { AdminMenu, MenuLocation } from '@/types/menus';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const LOCATIONS: MenuLocation[] = ['header', 'footer', 'mobile'];

export default function AdminMenusPage() {
  const toast = useToast();
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formLocation, setFormLocation] = useState<MenuLocation>('header');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [seedWarning, setSeedWarning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminMenus();
      setMenus(data);
      const headerMain = data.find((m) => m.slug === 'header-main');
      if (!headerMain) {
        setSeedWarning('Seeded header menu `header-main` is missing. Run menu seeder or create this slug.');
      } else {
        try {
          const items = await fetchAdminMenuItems(headerMain.id);
          setSeedWarning(items.flat.length === 0 ? 'Seeded header menu `header-main` has no items.' : null);
        } catch {
          setSeedWarning('Unable to verify seeded header menu items.');
        }
      }
      setError(null);
    } catch {
      setError('Unable to load menus.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!formName.trim() || !formSlug.trim()) {
      toast.showError('Name and slug are required.');
      return;
    }
    setCreating(true);
    try {
      await createAdminMenu({
        name: formName.trim(),
        slug: formSlug.trim().toLowerCase().replace(/\s+/g, '-'),
        location: formLocation,
        is_active: true,
      });
      toast.showSuccess('Menu created.');
      setDialogOpen(false);
      setFormName('');
      setFormSlug('');
      setFormLocation('header');
      await load();
    } catch {
      toast.showError('Could not create menu. Check slug is unique.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAdminMenu(deleteId);
      toast.showSuccess('Menu deleted.');
      setDeleteId(null);
      await load();
    } catch {
      toast.showError('Could not delete menu.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Navigation menus
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New menu
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Build header, footer, and mobile menus. The storefront reads the active menu by slug (default header:{' '}
        <strong>header-main</strong>).
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {seedWarning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {seedWarning}
        </Alert>
      )}

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : menus.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      No menus yet. Seed sample data or create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                menus.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {m.slug}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.location}</TableCell>
                    <TableCell>
                      <Chip size="small" label={m.is_active ? 'Active' : 'Inactive'} color={m.is_active ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton component={Link} href={`/admin/menus/${m.id}`} aria-label="Edit menu" size="small" color="primary">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton aria-label="Delete menu" size="small" color="error" onClick={() => setDeleteId(m.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !creating && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create menu</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} fullWidth autoFocus />
          <TextField
            label="Slug"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            fullWidth
            helperText="Used in API: /api/v1/public/menus/{slug}"
          />
          <TextField
            select
            label="Location"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value as MenuLocation)}
            fullWidth
          >
            {LOCATIONS.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void handleCreate()} disabled={creating}>
            {creating ? 'Saving…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete menu?"
        message="All items in this menu will be removed."
        confirmLabel="Delete"
        severity="destructive"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void handleDelete()}
      />
    </Box>
  );
}
