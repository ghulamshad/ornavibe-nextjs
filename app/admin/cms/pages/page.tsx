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
  Chip,
  Stack,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Pagination,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { AdminBlockEditor } from '@/components/cms/AdminBlockEditor';
import type { CmsBlock, CmsPageListItem, CmsPage } from '@/types/cms';
import {
  fetchCmsPages,
  fetchCmsPageById,
  createCmsPage,
  updateCmsPage,
  deleteCmsPage,
  fetchCmsPageVersions,
  rollbackCmsPage,
} from '@/lib/api/admin.service';

const PER_PAGE = 15;
type Status = 'draft' | 'review' | 'approved' | 'published' | 'archived';

const STATUS_OPTIONS: Status[] = ['draft', 'review', 'approved', 'published', 'archived'];

interface VersionRow {
  id: number;
  version_number: number;
  created_at: string;
  created_by: number | null;
}

interface PageFormState {
  id?: string;
  slug: string;
  title: string;
  status: Status;
  publish_at: string;
  unpublish_at: string;
  meta_title: string;
  meta_description: string;
  blocks: CmsBlock[];
}

const emptyForm: PageFormState = {
  slug: '',
  title: '',
  status: 'draft',
  publish_at: '',
  unpublish_at: '',
  meta_title: '',
  meta_description: '',
  blocks: [],
};

const statusColor: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  review: 'warning',
  approved: 'primary',
  published: 'success',
  archived: 'default',
};

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'page';
}

export default function AdminCmsPagesPage() {
  const toast = useToast();
  const [items, setItems] = useState<CmsPageListItem[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; total: number }>({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '' as string });
  const [appliedFilters, setAppliedFilters] = useState({ search: '', status: '' as string });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PageFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuPage, setMenuPage] = useState<CmsPageListItem | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [versionsPageId, setVersionsPageId] = useState<string | null>(null);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const loadPages = (pageNum: number = page, search: string = filters.search, status: string = filters.status) => {
    setLoading(true);
    fetchCmsPages({
      per_page: PER_PAGE,
      page: pageNum,
      search: search.trim() || undefined,
      status: status || undefined,
    })
      .then((res) => {
        setItems(res.data);
        setMeta(res.meta);
        setError(null);
      })
      .catch(() => setError('Unable to load CMS pages.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPages(page, appliedFilters.search, appliedFilters.status);
  }, [page, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '' });
    setAppliedFilters({ search: '', status: '' });
    setPage(1);
  };

  const hasActiveFilter = !!(filters.search.trim() || filters.status);

  const openMenu = (e: React.MouseEvent<HTMLElement>, p: CmsPageListItem) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuPage(p);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuPage(null);
  };

  const openAdd = () => {
    setForm({ ...emptyForm, blocks: [] });
    setDialogOpen(true);
  };

  const openEdit = async (id: string) => {
    closeMenu();
    try {
      const pageData = await fetchCmsPageById(id);
      setForm({
        id: pageData.id,
        slug: pageData.slug,
        title: pageData.title,
        status: pageData.status as Status,
        publish_at: pageData.published_at ?? '',
        unpublish_at: '',
        meta_title: pageData.seo?.meta_title ?? '',
        meta_description: pageData.seo?.meta_description ?? '',
        blocks: pageData.blocks ?? [],
      });
      setDialogOpen(true);
    } catch {
      toast.showError('Unable to load page details.');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.showError('Title is required.');
      return;
    }
    const slug = slugify(form.title.trim());
    if (!slug) {
      toast.showError('Title must contain at least one letter or number.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        slug,
        title: form.title.trim(),
        status: form.status,
        publish_at: form.publish_at?.trim() || null,
        unpublish_at: form.unpublish_at?.trim() || null,
        blocks: form.blocks,
        seo: {
          meta_title: form.meta_title || form.title,
          meta_description: form.meta_description || '',
        },
      };
      if (form.id) {
        await updateCmsPage(form.id, payload);
        toast.showSuccess('Page updated.');
      } else {
        await createCmsPage(payload);
        toast.showSuccess('Page created.');
      }
      setDialogOpen(false);
      setForm(emptyForm);
      loadPages(page, filters.search, filters.status);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.showError(msg ?? 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await deleteCmsPage(deleteId);
      toast.showSuccess('Page deleted.');
      setDeleteId(null);
      loadPages(page, filters.search, filters.status);
    } catch {
      toast.showError('Failed to delete page.');
    }
  };

  const openVersions = (id: string) => {
    closeMenu();
    setVersionsOpen(true);
    setVersionsPageId(id);
    setVersions([]);
    setVersionsLoading(true);
    fetchCmsPageVersions(id)
      .then((res) => setVersions(res.data))
      .catch(() => toast.showError('Unable to load versions.'))
      .finally(() => setVersionsLoading(false));
  };

  const handleRollback = async (version: VersionRow) => {
    if (!versionsPageId) return;
    try {
      await rollbackCmsPage(versionsPageId, version.version_number);
      toast.showSuccess('Page rolled back.');
      setVersionsOpen(false);
      loadPages(page, filters.search, filters.status);
    } catch {
      toast.showError('Failed to rollback page.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          CMS Pages
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add page
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          Filter pages
        </Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            label="Search"
            placeholder="Slug or title"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={handleApplyFilters} startIcon={<FilterListIcon />}>
              Apply
            </Button>
            <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />} disabled={!hasActiveFilter}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && items.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Slug</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right" width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      {hasActiveFilter
                        ? 'No pages match the filters. Try different criteria or clear filters.'
                        : 'No CMS pages yet. Add one to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{p.slug}</TableCell>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>
                        <Chip size="small" label={p.status} color={statusColor[p.status] ?? 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell>{p.publish_at ? new Date(p.publish_at).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{new Date(p.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => openMenu(e, p)} aria-label="Page actions">
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

          {meta.last_page > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                page={meta.current_page}
                count={meta.last_page}
                color="primary"
                onChange={(_, value) => setPage(value)}
              />
            </Box>
          )}
        </>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor && menuPage)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          component="a"
          href={menuPage ? `/pages/${menuPage.slug}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={closeMenu}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View on site</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPage) openEdit(menuPage.id);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPage) openVersions(menuPage.id);
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Versions</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuPage) setDeleteId(menuPage.id);
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{form.id ? 'Edit CMS page' : 'Add CMS page'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            fullWidth
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. About Us"
            required
            helperText={`URL slug will be: /pages/${slugify(form.title.trim()) || '...'}`}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Meta title"
            value={form.meta_title}
            onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
          />
          <TextField
            fullWidth
            label="Meta description"
            value={form.meta_description}
            onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
            multiline
            rows={2}
          />
          <AdminBlockEditor value={form.blocks} onChange={(blocks) => setForm((f) => ({ ...f, blocks }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={versionsOpen} onClose={() => setVersionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Page versions</DialogTitle>
        <DialogContent>
          {versionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : versions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No versions yet.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Version</TableCell>
                  <TableCell>Created at</TableCell>
                  <TableCell>Created by</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.version_number}</TableCell>
                    <TableCell>{new Date(v.created_at).toLocaleString()}</TableCell>
                    <TableCell>{v.created_by ?? '—'}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => handleRollback(v)}>
                        Rollback
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setVersionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete CMS page"
        message="Are you sure you want to delete this page? This action can be reverted via database restore."
        confirmLabel="Delete"
        severity="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
