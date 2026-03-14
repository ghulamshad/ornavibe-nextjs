'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import BannerIcon from '@mui/icons-material/Campaign';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import {
  fetchLandingHeroSlides,
  createLandingHeroSlide,
  updateLandingHeroSlide,
  deleteLandingHeroSlide,
  fetchLandingHeroBanner,
  updateLandingHeroBanner,
  fetchLandingSmallBanners,
  createLandingSmallBanner,
  updateLandingSmallBanner,
  deleteLandingSmallBanner,
  uploadCmsMedia,
} from '@/lib/api/admin.service';
import type {
  AdminLandingHeroSlide,
  AdminLandingHeroBanner,
  AdminLandingSmallBanner,
} from '@/types/admin';
import { useToast } from '@/components/common/Toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const emptySlide: Partial<AdminLandingHeroSlide> = {
  sub_title: '',
  title: '',
  description: '',
  cta_primary_text: '',
  cta_primary_href: '',
  cta_secondary_text: '',
  cta_secondary_href: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
};

const emptyHeroBanner: Partial<AdminLandingHeroBanner> = {
  eyebrow: '',
  title: '',
  cta_text: '',
  cta_href: '',
  image_url: '',
  is_active: true,
};

const emptySmallBanner: Partial<AdminLandingSmallBanner> = {
  eyebrow: '',
  title: '',
  cta_text: '',
  cta_href: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
};

type TabValue = 0 | 1 | 2;

export default function AdminLandingPage() {
  const toast = useToast();
  const [tab, setTab] = useState<TabValue>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [slides, setSlides] = useState<AdminLandingHeroSlide[]>([]);
  const [heroBanner, setHeroBanner] = useState<AdminLandingHeroBanner | null>(null);
  const [smallBanners, setSmallBanners] = useState<AdminLandingSmallBanner[]>([]);

  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<AdminLandingHeroSlide | null>(null);
  const [slideForm, setSlideForm] = useState<Partial<AdminLandingHeroSlide>>(emptySlide);

  const [heroBannerForm, setHeroBannerForm] = useState<Partial<AdminLandingHeroBanner>>(emptyHeroBanner);
  const [heroBannerSaving, setHeroBannerSaving] = useState(false);

  const [smallDialogOpen, setSmallDialogOpen] = useState(false);
  const [editingSmall, setEditingSmall] = useState<AdminLandingSmallBanner | null>(null);
  const [smallForm, setSmallForm] = useState<Partial<AdminLandingSmallBanner>>(emptySmallBanner);

  const [uploadingSlideImage, setUploadingSlideImage] = useState(false);
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);
  const [uploadingSmallImage, setUploadingSmallImage] = useState(false);

  const [slideMenuAnchor, setSlideMenuAnchor] = useState<null | HTMLElement>(null);
  const [slideMenuSlide, setSlideMenuSlide] = useState<AdminLandingHeroSlide | null>(null);
  const [smallMenuAnchor, setSmallMenuAnchor] = useState<null | HTMLElement>(null);
  const [smallMenuBanner, setSmallMenuBanner] = useState<AdminLandingSmallBanner | null>(null);
  const [deleteSlideId, setDeleteSlideId] = useState<number | null>(null);
  const [deleteSmallId, setDeleteSmallId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const [slidesRes, bannerRes, smallRes] = await Promise.all([
        fetchLandingHeroSlides(),
        fetchLandingHeroBanner(),
        fetchLandingSmallBanners(),
      ]);
      setSlides(slidesRes ?? []);
      setHeroBanner(bannerRes ?? null);
      setHeroBannerForm(bannerRes ?? emptyHeroBanner);
      setSmallBanners(smallRes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load landing content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openNewSlide = () => {
    setEditingSlide(null);
    setSlideForm(emptySlide);
    setSlideDialogOpen(true);
  };

  const openEditSlide = (slide: AdminLandingHeroSlide) => {
    setEditingSlide(slide);
    setSlideForm(slide);
    setSlideDialogOpen(true);
    setSlideMenuAnchor(null);
    setSlideMenuSlide(null);
  };

  const handleSaveSlide = async () => {
    try {
      if (!slideForm.title?.trim()) {
        toast.showError('Slide title is required');
        return;
      }
      if (editingSlide) {
        const updated = await updateLandingHeroSlide(editingSlide.id, slideForm);
        setSlides((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        toast.showSuccess('Slide updated');
      } else {
        const created = await createLandingHeroSlide(slideForm);
        setSlides((prev) => [...prev, created]);
        toast.showSuccess('Slide created');
      }
      setSlideDialogOpen(false);
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to save slide');
    }
  };

  const handleDeleteSlideConfirm = async () => {
    if (deleteSlideId == null) return;
    try {
      await deleteLandingHeroSlide(deleteSlideId);
      setSlides((prev) => prev.filter((s) => s.id !== deleteSlideId));
      toast.showSuccess('Slide deleted');
      setDeleteSlideId(null);
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to delete slide');
      setDeleteSlideId(null);
    }
  };

  const openNewSmall = () => {
    setEditingSmall(null);
    setSmallForm(emptySmallBanner);
    setSmallDialogOpen(true);
  };

  const openEditSmall = (banner: AdminLandingSmallBanner) => {
    setEditingSmall(banner);
    setSmallForm(banner);
    setSmallDialogOpen(true);
    setSmallMenuAnchor(null);
    setSmallMenuBanner(null);
  };

  const handleSaveSmall = async () => {
    try {
      if (!smallForm.title?.trim()) {
        toast.showError('Banner title is required');
        return;
      }
      if (editingSmall) {
        const updated = await updateLandingSmallBanner(editingSmall.id, smallForm);
        setSmallBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        toast.showSuccess('Banner updated');
      } else {
        const created = await createLandingSmallBanner(smallForm);
        setSmallBanners((prev) => [...prev, created]);
        toast.showSuccess('Banner created');
      }
      setSmallDialogOpen(false);
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to save banner');
    }
  };

  const handleDeleteSmallConfirm = async () => {
    if (deleteSmallId == null) return;
    try {
      await deleteLandingSmallBanner(deleteSmallId);
      setSmallBanners((prev) => prev.filter((b) => b.id !== deleteSmallId));
      toast.showSuccess('Banner deleted');
      setDeleteSmallId(null);
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to delete banner');
      setDeleteSmallId(null);
    }
  };

  const handleSaveHeroBanner = async () => {
    if (!heroBannerForm.title?.trim()) {
      toast.showError('Title is required');
      return;
    }
    setHeroBannerSaving(true);
    try {
      const updated = await updateLandingHeroBanner(heroBannerForm);
      setHeroBanner(updated);
      setHeroBannerForm(updated);
      toast.showSuccess('Hero banner saved');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to save hero banner');
    } finally {
      setHeroBannerSaving(false);
    }
  };

  const handleUploadImage = async (
    file: File,
    folder: string,
    setForm: React.Dispatch<React.SetStateAction<Partial<AdminLandingHeroSlide> | Partial<AdminLandingSmallBanner> | Partial<AdminLandingHeroBanner>>>,
    setUploading: React.Dispatch<React.SetStateAction<boolean>>,
    alt?: string
  ) => {
    try {
      setUploading(true);
      const media = await uploadCmsMedia({ file, folder, alt_text: alt });
      setForm((prev) => ({ ...prev, image_url: media.url }));
      toast.showSuccess('Image uploaded');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Failed to upload image');
    } finally {
      setUploading(false);
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Landing page
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage hero slider, hero banner, and small banners for the storefront homepage. Changes appear on the live site.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v as TabValue)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab icon={<ViewCarouselIcon />} iconPosition="start" label="Hero slider" id="landing-tab-0" aria-controls="landing-panel-0" />
        <Tab icon={<BannerIcon />} iconPosition="start" label="Hero banner" id="landing-tab-1" aria-controls="landing-panel-1" />
        <Tab icon={<DashboardCustomizeIcon />} iconPosition="start" label="Small banners" id="landing-tab-2" aria-controls="landing-panel-2" />
      </Tabs>

      {/* Tab 1: Hero Slider */}
      <Box role="tabpanel" hidden={tab !== 0} id="landing-panel-0" aria-labelledby="landing-tab-0">
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Hero slider slides
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Full-width carousel on the homepage. Order by sort order.
              </Typography>
            </Box>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openNewSlide}>
              Add slide
            </Button>
          </Box>
          {slides.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <ViewCarouselIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary">No slides yet. Add one to start the hero slider.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={72}>Image</TableCell>
                    <TableCell width={64}>Order</TableCell>
                    <TableCell>Subtitle</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" width={56} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slides.map((slide) => (
                    <TableRow key={slide.id} hover>
                      <TableCell>
                        {slide.image_url ? (
                          <Box component="img" src={slide.image_url} alt="" sx={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 1 }} />
                        ) : (
                          <Box sx={{ width: 56, height: 36, bgcolor: 'grey.200', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon sx={{ fontSize: 20, color: 'grey.500' }} />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{slide.sort_order ?? 0}</TableCell>
                      <TableCell>{slide.sub_title || '—'}</TableCell>
                      <TableCell>{slide.title}</TableCell>
                      <TableCell>
                        <Chip label={slide.is_active !== false ? 'Active' : 'Inactive'} size="small" color={slide.is_active !== false ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => { setSlideMenuAnchor(e.currentTarget); setSlideMenuSlide(slide); }}>
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Tab 2: Hero Banner */}
      <Box role="tabpanel" hidden={tab !== 1} id="landing-panel-1" aria-labelledby="landing-tab-1">
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Hero banner (side column)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Single banner shown next to the hero slider. Leave empty to hide.
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField fullWidth label="Eyebrow" value={heroBannerForm.eyebrow ?? ''} onChange={(e) => setHeroBannerForm((p) => ({ ...p, eyebrow: e.target.value }))} sx={{ mb: 2 }} />
              <TextField fullWidth label="Title" value={heroBannerForm.title ?? ''} onChange={(e) => setHeroBannerForm((p) => ({ ...p, title: e.target.value }))} required sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="CTA text" value={heroBannerForm.cta_text ?? ''} onChange={(e) => setHeroBannerForm((p) => ({ ...p, cta_text: e.target.value }))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField fullWidth label="CTA href" value={heroBannerForm.cta_href ?? ''} onChange={(e) => setHeroBannerForm((p) => ({ ...p, cta_href: e.target.value }))} placeholder="/products" />
                </Grid>
              </Grid>
              <TextField fullWidth label="Image URL" value={heroBannerForm.image_url ?? ''} onChange={(e) => setHeroBannerForm((p) => ({ ...p, image_url: e.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon /></InputAdornment> }} sx={{ mt: 2 }} />
              <Button component="label" variant="outlined" size="small" sx={{ mt: 1 }} disabled={uploadingBannerImage}>
                {uploadingBannerImage ? 'Uploading…' : 'Upload image'}
                <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f, 'hero', setHeroBannerForm, setUploadingBannerImage, heroBannerForm.title || undefined); e.target.value = ''; }} />
              </Button>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel control={<Switch checked={heroBannerForm.is_active !== false} onChange={(e) => setHeroBannerForm((p) => ({ ...p, is_active: e.target.checked }))} />} label="Active" />
              </Box>
              <Button variant="contained" onClick={handleSaveHeroBanner} disabled={heroBannerSaving} sx={{ mt: 2 }}>
                {heroBannerSaving ? 'Saving…' : 'Save hero banner'}
              </Button>
            </Grid>
            {heroBannerForm.image_url && (
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom>Preview</Typography>
                <Box component="img" src={heroBannerForm.image_url} alt="" sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 2 }} />
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>

      {/* Tab 3: Small Banners */}
      <Box role="tabpanel" hidden={tab !== 2} id="landing-panel-2" aria-labelledby="landing-tab-2">
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Small banners (3-card section)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Up to three mini banners below the hero. Order by sort order.
              </Typography>
            </Box>
            <Button startIcon={<AddIcon />} variant="contained" onClick={openNewSmall}>
              Add banner
            </Button>
          </Box>
          {smallBanners.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <DashboardCustomizeIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
              <Typography color="text.secondary">No small banners yet. Add up to three for the mini banners section.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={72}>Image</TableCell>
                    <TableCell width={64}>Order</TableCell>
                    <TableCell>Eyebrow</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right" width={56} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {smallBanners.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        {b.image_url ? (
                          <Box component="img" src={b.image_url} alt="" sx={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 1 }} />
                        ) : (
                          <Box sx={{ width: 56, height: 36, bgcolor: 'grey.200', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ImageIcon sx={{ fontSize: 20, color: 'grey.500' }} />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>{b.sort_order ?? 0}</TableCell>
                      <TableCell>{b.eyebrow || '—'}</TableCell>
                      <TableCell>{b.title}</TableCell>
                      <TableCell>
                        <Chip label={b.is_active !== false ? 'Active' : 'Inactive'} size="small" color={b.is_active !== false ? 'success' : 'default'} variant="outlined" />
                      </TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton size="small" onClick={(e) => { setSmallMenuAnchor(e.currentTarget); setSmallMenuBanner(b); }}>
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Slide menu */}
      <Menu anchorEl={slideMenuAnchor} open={Boolean(slideMenuAnchor)} onClose={() => { setSlideMenuAnchor(null); setSlideMenuSlide(null); }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem component="a" href="/" target="_blank" rel="noopener noreferrer" onClick={() => { setSlideMenuAnchor(null); setSlideMenuSlide(null); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View on store</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => slideMenuSlide && openEditSlide(slideMenuSlide)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (slideMenuSlide) setDeleteSlideId(slideMenuSlide.id); setSlideMenuAnchor(null); setSlideMenuSlide(null); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Small banner menu */}
      <Menu anchorEl={smallMenuAnchor} open={Boolean(smallMenuAnchor)} onClose={() => { setSmallMenuAnchor(null); setSmallMenuBanner(null); }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem component="a" href="/" target="_blank" rel="noopener noreferrer" onClick={() => { setSmallMenuAnchor(null); setSmallMenuBanner(null); }}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View on store</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => smallMenuBanner && openEditSmall(smallMenuBanner)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (smallMenuBanner) setDeleteSmallId(smallMenuBanner.id); setSmallMenuAnchor(null); setSmallMenuBanner(null); }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Slide dialog */}
      <Dialog open={slideDialogOpen} onClose={() => setSlideDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSlide ? 'Edit hero slide' : 'Add hero slide'}</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth label="Subtitle" value={slideForm.sub_title ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, sub_title: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Title (supports HTML)" value={slideForm.title ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, title: e.target.value }))} margin="normal" required />
          <TextField fullWidth label="Description" value={slideForm.description ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, description: e.target.value }))} multiline rows={3} margin="normal" />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Primary CTA text" value={slideForm.cta_primary_text ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, cta_primary_text: e.target.value }))} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Primary CTA href" value={slideForm.cta_primary_href ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, cta_primary_href: e.target.value }))} margin="normal" placeholder="/products" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Secondary CTA text" value={slideForm.cta_secondary_text ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, cta_secondary_text: e.target.value }))} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Secondary CTA href" value={slideForm.cta_secondary_href ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, cta_secondary_href: e.target.value }))} margin="normal" />
            </Grid>
          </Grid>
          <TextField fullWidth label="Image URL" value={slideForm.image_url ?? ''} onChange={(e) => setSlideForm((p) => ({ ...p, image_url: e.target.value }))} margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon /></InputAdornment> }} />
          <Button component="label" variant="outlined" size="small" sx={{ mt: 1 }} disabled={uploadingSlideImage}>
            {uploadingSlideImage ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f, 'hero', setSlideForm, setUploadingSlideImage, slideForm.title || undefined); e.target.value = ''; }} />
          </Button>
          <TextField fullWidth type="number" label="Sort order" value={slideForm.sort_order ?? 0} onChange={(e) => setSlideForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} margin="normal" inputProps={{ min: 0 }} />
          <FormControlLabel control={<Switch checked={slideForm.is_active !== false} onChange={(e) => setSlideForm((p) => ({ ...p, is_active: e.target.checked }))} />} label="Active" sx={{ mt: 1, display: 'block' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlideDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSlide} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Small banner dialog */}
      <Dialog open={smallDialogOpen} onClose={() => setSmallDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSmall ? 'Edit small banner' : 'Add small banner'}</DialogTitle>
        <DialogContent dividers>
          <TextField fullWidth label="Eyebrow" value={smallForm.eyebrow ?? ''} onChange={(e) => setSmallForm((p) => ({ ...p, eyebrow: e.target.value }))} margin="normal" />
          <TextField fullWidth label="Title" value={smallForm.title ?? ''} onChange={(e) => setSmallForm((p) => ({ ...p, title: e.target.value }))} margin="normal" required />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="CTA text" value={smallForm.cta_text ?? ''} onChange={(e) => setSmallForm((p) => ({ ...p, cta_text: e.target.value }))} margin="normal" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="CTA href" value={smallForm.cta_href ?? ''} onChange={(e) => setSmallForm((p) => ({ ...p, cta_href: e.target.value }))} margin="normal" placeholder="/products" />
            </Grid>
          </Grid>
          <TextField fullWidth label="Image URL" value={smallForm.image_url ?? ''} onChange={(e) => setSmallForm((p) => ({ ...p, image_url: e.target.value }))} margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><ImageIcon /></InputAdornment> }} />
          <Button component="label" variant="outlined" size="small" sx={{ mt: 1 }} disabled={uploadingSmallImage}>
            {uploadingSmallImage ? 'Uploading…' : 'Upload image'}
            <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadImage(f, 'banners', setSmallForm, setUploadingSmallImage, smallForm.title || undefined); e.target.value = ''; }} />
          </Button>
          <TextField fullWidth type="number" label="Sort order" value={smallForm.sort_order ?? 0} onChange={(e) => setSmallForm((p) => ({ ...p, sort_order: Number(e.target.value) }))} margin="normal" inputProps={{ min: 0 }} />
          <FormControlLabel control={<Switch checked={smallForm.is_active !== false} onChange={(e) => setSmallForm((p) => ({ ...p, is_active: e.target.checked }))} />} label="Active" sx={{ mt: 1, display: 'block' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmallDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSmall} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={deleteSlideId != null} title="Delete slide" message="Are you sure you want to delete this hero slide?" confirmLabel="Delete" severity="destructive" onConfirm={handleDeleteSlideConfirm} onCancel={() => setDeleteSlideId(null)} />
      <ConfirmDialog open={deleteSmallId != null} title="Delete banner" message="Are you sure you want to delete this small banner?" confirmLabel="Delete" severity="destructive" onConfirm={handleDeleteSmallConfirm} onCancel={() => setDeleteSmallId(null)} />
    </Box>
  );
}
