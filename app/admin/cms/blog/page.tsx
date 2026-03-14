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
  Autocomplete,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ImageIcon from '@mui/icons-material/Image';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import type { CmsBlogPost, CmsBlogCategory, CmsBlogTag } from '@/types/cms';
import {
  fetchCmsBlogPosts,
  fetchCmsBlogPostById,
  createCmsBlogPost,
  updateCmsBlogPost,
  deleteCmsBlogPost,
  fetchCmsBlogCategories,
  fetchCmsBlogTags,
  createCmsBlogCategory,
  createCmsBlogTag,
  uploadCmsMedia,
} from '@/lib/api/admin.service';

type AdminBlogListItem = CmsBlogPost & { updated_at?: string; categories?: CmsBlogCategory[]; tags?: CmsBlogTag[] };

type Status = 'draft' | 'review' | 'approved' | 'published' | 'archived';

const STATUS_OPTIONS: Status[] = ['draft', 'review', 'approved', 'published', 'archived'];

interface BlogSeoState {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  focus_keyword: string;
  og_image: string;
  og_title: string;
  og_description: string;
  canonical_url: string;
  robots: string;
  structured_data_json: string;
}

const emptySeo: BlogSeoState = {
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  focus_keyword: '',
  og_image: '',
  og_title: '',
  og_description: '',
  canonical_url: '',
  robots: 'index,follow',
  structured_data_json: '',
};

interface BlogFormState {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  status: Status;
  publish_at: string;
  reading_time: string;
  body: string;
  featured_image: string;
  category_ids: number[];
  tag_ids: number[];
  seo: BlogSeoState;
}

const emptyForm: BlogFormState = {
  slug: '',
  title: '',
  excerpt: '',
  status: 'draft',
  publish_at: '',
  reading_time: '',
  body: '',
  featured_image: '',
  category_ids: [],
  tag_ids: [],
  seo: { ...emptySeo },
};

export default function AdminCmsBlogPage() {
  const toast = useToast();
  const [items, setItems] = useState<AdminBlogListItem[]>([]);
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [categories, setCategories] = useState<CmsBlogCategory[]>([]);
  const [tags, setTags] = useState<CmsBlogTag[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filters, setFilters] = useState({ search: '', status: '' as string, category_id: '' as string, tag_id: '' as string });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuPost, setMenuPost] = useState<AdminBlogListItem | null>(null);

  const loadPosts = (overrides?: { page?: number; per_page?: number; search?: string; status?: string; category_id?: string; tag_id?: string }) => {
    setLoading(true);
    const params = {
      page: overrides?.page ?? page + 1,
      per_page: overrides?.per_page ?? rowsPerPage,
      search: overrides?.search ?? (filters.search.trim() || undefined),
      status: overrides?.status ?? (filters.status || undefined),
      category_id: overrides?.category_id ?? (filters.category_id || undefined),
      tag_id: overrides?.tag_id ?? (filters.tag_id || undefined),
    };
    fetchCmsBlogPosts(params)
      .then((res) => {
        setItems(res.data as unknown as AdminBlogListItem[]);
        setMeta(res.meta);
        setError(null);
      })
      .catch(() => setError('Unable to load blog posts.'))
      .finally(() => setLoading(false));
  };

  const loadData = () => {
    loadPosts();
  };

  useEffect(() => {
    fetchCmsBlogCategories()
      .then(setCategories)
      .catch(() => {});
    fetchCmsBlogTags()
      .then(setTags)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPosts();
  }, [page, rowsPerPage]);

  const handleApplyFilters = () => {
    setPage(0);
    loadPosts({
      page: 1,
      per_page: rowsPerPage,
      search: filters.search.trim() || undefined,
      status: filters.status || undefined,
      category_id: filters.category_id || undefined,
      tag_id: filters.tag_id || undefined,
    });
  };

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', category_id: '', tag_id: '' });
    setPage(0);
    loadPosts({ page: 1, per_page: rowsPerPage, search: undefined, status: undefined, category_id: undefined, tag_id: undefined });
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, post: AdminBlogListItem) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuPost(post);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuPost(null);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const post = await fetchCmsBlogPostById(id);
      const seo = (post as { seo?: { meta_title?: string; meta_description?: string; meta_keywords?: string; focus_keyword?: string; og_image?: string; og_title?: string; og_description?: string; canonical_url?: string; robots?: string; structured_data?: Record<string, unknown> } })?.seo;
      const sd = seo?.structured_data;
      const metaKeywords = sd?.meta_keywords;
      setForm({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? '',
        status: post.status as Status,
        publish_at: post.publish_at ?? '',
        reading_time: post.reading_time != null ? String(post.reading_time) : '',
        body: Array.isArray(post.content)
          ? (post.content as { content?: string }[]).map((b) => b.content ?? '').join('\n\n')
          : '',
        featured_image: post.featured_image ?? '',
        category_ids: post.categories?.map((c) => c.id) ?? [],
        tag_ids: post.tags?.map((t) => t.id) ?? [],
        seo: {
          meta_title: seo?.meta_title ?? '',
          meta_description: seo?.meta_description ?? '',
          meta_keywords: Array.isArray(metaKeywords) ? metaKeywords.join(', ') : (typeof metaKeywords === 'string' ? metaKeywords : ''),
          focus_keyword: (sd?.focus_keyword as string) ?? '',
          og_image: seo?.og_image ?? '',
          og_title: (sd?.og_title as string) ?? '',
          og_description: (sd?.og_description as string) ?? '',
          canonical_url: seo?.canonical_url ?? '',
          robots: seo?.robots ?? 'index,follow',
          structured_data_json: typeof seo?.structured_data === 'object' && seo.structured_data
            ? JSON.stringify(seo.structured_data, null, 2)
            : '',
        },
      });
      setFormOpen(true);
    } catch {
      toast.showError('Unable to load blog post.');
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.showError('Title is required.');
      return;
    }
    setSaving(true);
    const contentBlocks = form.body
      ? form.body.split(/\n{2,}/).map((p) => ({ type: 'paragraph', content: p.trim() }))
      : [];
    let structuredData: Record<string, unknown> | null = null;
    if (form.seo.structured_data_json.trim()) {
      try {
        structuredData = JSON.parse(form.seo.structured_data_json) as Record<string, unknown>;
      } catch {
        toast.showError('Invalid JSON in AEO / Structured Data.');
        setSaving(false);
        return;
      }
    }
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || undefined,
      content: contentBlocks,
      featured_image: form.featured_image.trim() || null,
      status: form.status,
      publish_at: form.publish_at || null,
      reading_time: form.reading_time ? Number(form.reading_time) : null,
      category_ids: form.category_ids,
      tag_ids: form.tag_ids,
      seo: {
        meta_title: form.seo.meta_title.trim() || null,
        meta_description: form.seo.meta_description.trim() || null,
        meta_keywords: form.seo.meta_keywords.trim() || null,
        focus_keyword: form.seo.focus_keyword.trim() || null,
        og_image: form.seo.og_image.trim() || null,
        og_title: form.seo.og_title.trim() || null,
        og_description: form.seo.og_description.trim() || null,
        canonical_url: form.seo.canonical_url.trim() || null,
        robots: form.seo.robots || null,
        structured_data: structuredData,
      },
    };
    try {
      if (form.id) {
        await updateCmsBlogPost(form.id, payload);
        toast.showSuccess('Blog post updated.');
      } else {
        await createCmsBlogPost(payload);
        toast.showSuccess('Blog post created.');
      }
      setFormOpen(false);
      setForm({ ...emptyForm, seo: { ...emptySeo } });
      loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.showError(err?.response?.data?.message ?? 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const media = await uploadCmsMedia({ file, folder: 'blog', alt_text: form.title || undefined });
      setForm((f) => ({ ...f, featured_image: media.url }));
      toast.showSuccess('Image uploaded.');
    } catch {
      toast.showError('Failed to upload image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteId == null) return;
    try {
      await deleteCmsBlogPost(deleteId);
      toast.showSuccess('Blog post deleted.');
      setDeleteId(null);
      loadData();
    } catch {
      toast.showError('Failed to delete blog post.');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const cat = await createCmsBlogCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, cat]);
      setNewCategoryName('');
      toast.showSuccess('Category created.');
    } catch {
      toast.showError('Failed to create category.');
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const tag = await createCmsBlogTag(newTagName.trim());
      setTags((prev) => [...prev, tag]);
      setNewTagName('');
      toast.showSuccess('Tag created.');
    } catch {
      toast.showError('Failed to create tag.');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          CMS Blog
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>
          Add blog post
        </Button>
      </Box>

      {/* Quick categories/tags creation */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <TextField
            size="small"
            label="New category"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button size="small" variant="outlined" onClick={handleCreateCategory}>
            Add
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <TextField size="small" label="New tag" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} />
          <Button size="small" variant="outlined" onClick={handleCreateTag}>
            Add
          </Button>
        </Stack>
      </Stack>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FilterListIcon fontSize="small" /> Filters
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, alignItems: 'end' }}>
          <TextField
            size="small"
            label="Search"
            placeholder="Title, slug, excerpt"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            select
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
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
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Tag"
            value={filters.tag_id}
            onChange={(e) => setFilters((f) => ({ ...f, tag_id: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            {tags.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="contained" onClick={handleApplyFilters} startIcon={<FilterListIcon />}>Apply</Button>
          <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>Clear</Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {loading && items.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Categories</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right" width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      {filters.search || filters.status || filters.category_id || filters.tag_id
                        ? 'No blog posts match the filters. Try different criteria or clear filters.'
                        : 'No blog posts yet. Add one to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>{p.slug}</TableCell>
                      <TableCell>
                        <Chip size="small" label={p.status} variant="outlined" />
                      </TableCell>
                      <TableCell>{(p as AdminBlogListItem).author?.name ?? '—'}</TableCell>
                      <TableCell>
                        {(p as AdminBlogListItem).categories?.length
                          ? (p as AdminBlogListItem).categories!.map((c) => c.name).join(', ')
                          : '—'}
                      </TableCell>
                      <TableCell>{p.publish_at ? new Date(p.publish_at).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>{(p as AdminBlogListItem).updated_at ? new Date((p as AdminBlogListItem).updated_at!).toLocaleDateString() : '—'}</TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => openMenu(e, p as AdminBlogListItem)} aria-label="Blog post actions">
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
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor && menuPost)} onClose={closeMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
            <MenuItem component="a" href={menuPost ? `/blog/${menuPost.slug}` : '#'} target="_blank" rel="noopener noreferrer" onClick={closeMenu}>
              <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
              <ListItemText>View on store</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { if (menuPost) openEdit(menuPost.id); closeMenu(); }}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { if (menuPost) setDeleteId(menuPost.id); closeMenu(); }} sx={{ color: 'error.main' }}>
              <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
          {meta && meta.total > 0 && (
            <TablePagination
              component="div"
              count={meta.total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 15, 25, 50]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
            />
          )}
        </Paper>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{form.id ? 'Edit blog post' : 'Add blog post'}</DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <Accordion defaultExpanded disableGutters sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Content</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ flexDirection: 'column', display: 'flex', gap: 2 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth label="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                <TextField fullWidth select label="Status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}>
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Stack>
              {form.id && form.slug && (
                <TextField fullWidth label="URL slug" value={form.slug} InputProps={{ readOnly: true }} helperText="Auto-generated from title. Used in the post URL." size="small" />
              )}
              <TextField fullWidth label="Excerpt / Short description" value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} multiline rows={2} helperText="Used in listings and meta description fallback." />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth label="Publish at" value={form.publish_at} onChange={(e) => setForm((f) => ({ ...f, publish_at: e.target.value }))} placeholder="2026-03-01T12:00:00Z" />
                <TextField fullWidth label="Reading time (minutes)" value={form.reading_time} onChange={(e) => setForm((f) => ({ ...f, reading_time: e.target.value }))} type="number" inputProps={{ min: 0 }} />
              </Stack>
              <Autocomplete multiple options={categories} getOptionLabel={(o) => o.name} value={categories.filter((c) => form.category_ids.includes(c.id))} onChange={(_, value) => setForm((f) => ({ ...f, category_ids: value.map((v) => v.id) }))} renderInput={(params) => <TextField {...params} label="Categories" />} />
              <Autocomplete multiple options={tags} getOptionLabel={(o) => o.name} value={tags.filter((t) => form.tag_ids.includes(t.id))} onChange={(_, value) => setForm((f) => ({ ...f, tag_ids: value.map((v) => v.id) }))} renderInput={(params) => <TextField {...params} label="Tags" />} />
              <TextField fullWidth label="Body" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} multiline minRows={8} helperText="Separate paragraphs with blank lines." />
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ImageIcon fontSize="small" /> Featured image
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ flexDirection: 'column', display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Featured image URL" value={form.featured_image} onChange={(e) => setForm((f) => ({ ...f, featured_image: e.target.value }))} placeholder="https://..." InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon /></InputAdornment> }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" component="label" disabled={uploadingImage}> {uploadingImage ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/*" hidden onChange={handleFeaturedImageUpload} /></Button>
                {form.featured_image && (
                  <Box component="img" src={form.featured_image} alt="Preview" sx={{ maxHeight: 80, borderRadius: 1, objectFit: 'cover' }} onError={() => {}} />
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SearchIcon fontSize="small" /> SEO &amp; meta data
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ flexDirection: 'column', display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Meta title" value={form.seo.meta_title} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, meta_title: e.target.value } }))} helperText="Title for search results (recommended 50–60 chars)." placeholder={form.title || 'e.g. Post title | Brand'} />
              <TextField fullWidth label="Meta description" value={form.seo.meta_description} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, meta_description: e.target.value } }))} multiline rows={2} helperText="Short description for search results (recommended 150–160 chars)." />
              <TextField fullWidth label="Focus keyword" value={form.seo.focus_keyword} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, focus_keyword: e.target.value } }))} placeholder="e.g. gift baskets" />
              <TextField fullWidth label="Meta keywords" value={form.seo.meta_keywords} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, meta_keywords: e.target.value } }))} placeholder="keyword1, keyword2, keyword3" helperText="Comma-separated keywords." />
              <TextField fullWidth label="Canonical URL" value={form.seo.canonical_url} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, canonical_url: e.target.value } }))} placeholder="https://..." />
              <TextField fullWidth select label="Robots" value={form.seo.robots} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, robots: e.target.value } }))}>
                <MenuItem value="index,follow">index, follow</MenuItem>
                <MenuItem value="noindex,follow">noindex, follow</MenuItem>
                <MenuItem value="index,nofollow">index, nofollow</MenuItem>
                <MenuItem value="noindex,nofollow">noindex, nofollow</MenuItem>
              </TextField>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Open Graph / Social</Typography>
              <TextField fullWidth label="OG image URL" value={form.seo.og_image} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, og_image: e.target.value } }))} placeholder="https://... (defaults to featured image)" />
              <TextField fullWidth label="OG title" value={form.seo.og_title} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, og_title: e.target.value } }))} placeholder="Override for social shares" />
              <TextField fullWidth label="OG description" value={form.seo.og_description} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, og_description: e.target.value } }))} multiline rows={2} placeholder="Override for social shares" />
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CodeIcon fontSize="small" /> AEO / Structured data
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField fullWidth label="Structured data (JSON)" value={form.seo.structured_data_json} onChange={(e) => setForm((f) => ({ ...f, seo: { ...f.seo, structured_data_json: e.target.value } }))} multiline minRows={6} placeholder='{"@context":"https://schema.org","@type":"Article",...}' helperText="Optional JSON-LD for Article, FAQPage, etc. Leave empty if not needed." sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId != null}
        title="Delete blog post"
        message="Are you sure you want to delete this blog post?"
        confirmLabel="Delete"
        severity="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}

