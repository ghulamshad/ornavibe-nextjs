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
  Divider,
  Grid,
  Link as MuiLink,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchRequest, updateRequest } from '@/redux/slices/admin/adminSettings.slice';
import { uploadCmsMedia } from '@/lib/api/admin.service';
import { resolveMediaUrl } from '@/lib/utils/media';
import { useToast } from '@/components/common/Toast';
import TestimonialsSettingsEditor from '@/components/admin/TestimonialsSettingsEditor';

const TESTIMONIAL_SETTING_KEYS = [
  'site_testimonials',
  'site_testimonials_title',
  'site_testimonials_explore_href',
  'site_testimonials_explore_label',
] as const;

type SettingsTabId = 'store' | 'home' | 'pages' | 'testimonials';

const TAB_CONFIG: { id: SettingsTabId; label: string; description?: string }[] = [
  { id: 'store', label: 'Store & checkout', description: 'Store identity, payments, bank deposit, and inventory alerts.' },
  { id: 'home', label: 'Homepage & site chrome', description: 'Hero copy, top bar, featured section, CTA, and footer text.' },
  { id: 'pages', label: 'About & contact', description: 'Public About and Contact page content.' },
  { id: 'testimonials', label: 'Testimonials', description: 'Homepage testimonials carousel and “Explore more” link.' },
];

const SECTIONS: {
  tab: SettingsTabId;
  title: string;
  description?: string;
  fields: { key: string; label: string; multiline?: boolean; helperText?: string; select?: { value: string; label: string }[] }[];
}[] = [
  {
    tab: 'store',
    title: 'Store & contact info',
    description: 'Store name, currency, and contact details. Email and phone are shown on the public Contact page (/contact).',
    fields: [
      { key: 'store_name', label: 'Store name' },
      {
        key: 'store_logo_url',
        label: 'Store logo URL',
        helperText:
          'Paste a URL or path, or use Upload. Saved path is used on the header, footer, and auth pages. Clear and save to use the default /assets/logo.jpg.',
      },
      { key: 'currency', label: 'Currency (e.g. PKR)', helperText: 'Default: PKR. Used for new orders and storefront display.' },
      { key: 'store_email', label: 'Store email', helperText: 'Shown on /contact and in legal pages' },
      { key: 'store_phone', label: 'Store phone', helperText: 'Shown on /contact' },
    ],
  },
  {
    tab: 'store',
    title: 'Storefront theme (colors)',
    description:
      'Controls MUI primary color, page background, and surfaces on the public shop. Leave fields empty to use built-in defaults (#f2acb4 primary, white background). Save all settings after editing.',
    fields: [
      { key: 'site_theme_primary', label: 'Primary brand color (hex)', helperText: 'Buttons, accents, badges. Example: #f2acb4' },
      { key: 'site_theme_secondary', label: 'Secondary color (hex)', helperText: 'Optional; leave empty to match primary.' },
      { key: 'site_theme_background', label: 'Page background (hex)', helperText: 'Main storefront canvas. Example: #ffffff' },
      { key: 'site_theme_paper', label: 'Paper / cards (hex)', helperText: 'Header bar, cards. Example: #ffffff' },
    ],
  },
  {
    tab: 'store',
    title: 'Payment gateways',
    description: 'Enable or disable payment methods at checkout. 1 = enabled, 0 = disabled.',
    fields: [
      { key: 'payment_gateway_stripe_enabled', label: 'Stripe (pay online)', select: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }] },
      { key: 'payment_gateway_bank_deposit_enabled', label: 'Bank deposit', select: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }] },
      { key: 'payment_gateway_cod_enabled', label: 'Cash on delivery (COD)', select: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }] },
    ],
  },
  {
    tab: 'store',
    title: 'Shipping & delivery',
    description:
      'Primary configuration is in Admin → Shipping (zones + delivery methods with per-zone rates). Address-based quotes use that data. The JSON below is a legacy fallback only when no shipping methods exist in the database.',
    fields: [
      {
        key: 'shipping_options_json',
        label: 'Legacy shipping methods JSON (fallback)',
        multiline: true,
        helperText:
          'Used only if the Shipping admin has no active methods. Prefer Admin → Shipping for production. Format: [{"code","label","rate","carrier"}].',
      },
      {
        key: 'shipping_free_min_subtotal',
        label: 'Free shipping from subtotal (0 = never)',
        helperText: 'When cart subtotal is at or above this amount, delivery charge becomes 0 (still shows selected method). Use 0 to always charge the method rate.',
      },
      { key: 'cod_fee', label: 'COD handling fee', helperText: 'Added to order total when customer pays with COD. Use 0 for no extra fee.' },
    ],
  },
  {
    tab: 'store',
    title: 'Bank account (Bank deposit)',
    description: 'Shown to customers when they choose Bank deposit. Used for deposit slip instructions on the order detail page.',
    fields: [
      { key: 'bank_name', label: 'Bank name' },
      { key: 'bank_account_name', label: 'Account name' },
      { key: 'bank_account_number', label: 'Account number' },
      { key: 'bank_bsb_sort_code', label: 'BSB / Sort code' },
      { key: 'bank_deposit_instructions', label: 'Instructions for customer', multiline: true, helperText: 'e.g. Transfer the order total, use order number as reference, then upload your slip.' },
    ],
  },
  {
    tab: 'store',
    title: 'Inventory',
    description: 'Stock alert threshold. Products with stock at or below this value appear in Admin → Inventory (low stock).',
    fields: [{ key: 'stock_alert_threshold', label: 'Low stock threshold', helperText: 'Alert when product stock ≤ this number' }],
  },
  {
    tab: 'home',
    title: 'Hero (homepage)',
    fields: [
      { key: 'site_hero_title', label: 'Hero title' },
      { key: 'site_hero_subtitle', label: 'Hero subtitle', multiline: true },
      { key: 'site_hero_cta_primary', label: 'Primary CTA button text' },
      { key: 'site_hero_cta_secondary', label: 'Secondary CTA button text' },
    ],
  },
  {
    tab: 'home',
    title: 'Header topbar',
    description:
      'Controls the thin top strip above the main header (social links, center promo text, phone). Social links must be a JSON array like [{"label":"Facebook","href":"https://..."}].',
    fields: [
      { key: 'site_topbar_enabled', label: 'Topbar enabled', select: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }] },
      { key: 'site_topbar_bg', label: 'Topbar background color (hex)', helperText: 'Example: #444444' },
      { key: 'site_topbar_text_color', label: 'Topbar base text color (hex)', helperText: 'Example: #ffffff' },
      { key: 'site_topbar_center_text', label: 'Center promo text' },
      { key: 'site_topbar_center_text_color', label: 'Center promo text color (hex)', helperText: 'Example: #fff3e3' },
      { key: 'site_topbar_center_link', label: 'Center promo link (optional)' },
      { key: 'site_topbar_phone', label: 'Phone text (optional)', helperText: 'Example: +92 300 1233953' },
      { key: 'site_topbar_phone_color', label: 'Phone color (hex)', helperText: 'Example: #fff3e3' },
      {
        key: 'site_topbar_social_links',
        label: 'Social links JSON',
        multiline: true,
        helperText: 'Example: [{"label":"Facebook","href":"https://facebook.com/yourpage"},{"label":"Instagram","href":"https://instagram.com/yourpage"}]',
      },
    ],
  },
  {
    tab: 'home',
    title: 'Featured products',
    fields: [
      { key: 'site_featured_title', label: 'Featured section title' },
      { key: 'site_featured_subtitle', label: 'Featured section subtitle' },
    ],
  },
  {
    tab: 'home',
    title: 'CTA block',
    fields: [
      { key: 'site_cta_title', label: 'CTA title' },
      { key: 'site_cta_subtitle', label: 'CTA subtitle', multiline: true },
    ],
  },
  {
    tab: 'home',
    title: 'Footer & branding',
    description:
      'Footer colors apply to the storefront footer (background and main text). Secondary lines and links use softer tints of the text color.',
    fields: [
      { key: 'site_footer_bg', label: 'Footer background color (hex)', helperText: 'Example: #1a1a1a or #0f172a' },
      { key: 'site_footer_text_color', label: 'Footer text color (hex)', helperText: 'Headings and primary copy. Example: #f5f5f5' },
      { key: 'site_footer_brand', label: 'Footer brand name' },
      { key: 'site_footer_company', label: 'Footer company name' },
      { key: 'site_footer_tagline', label: 'Footer tagline' },
    ],
  },
  {
    tab: 'pages',
    title: 'About page (/about)',
    description: 'Content for the public About page. Edit here to update /about.',
    fields: [
      { key: 'site_about_title', label: 'About page title' },
      { key: 'site_about_body', label: 'About page body', multiline: true },
    ],
  },
  {
    tab: 'pages',
    title: 'Contact page (/contact)',
    description: 'Content for the public Contact page. Email and phone come from Store & contact. Form success message is shown after a visitor submits the contact form.',
    fields: [
      { key: 'site_contact_title', label: 'Contact page title' },
      { key: 'site_contact_body', label: 'Contact page body', multiline: true },
      { key: 'site_contact_success_message', label: 'Form success message', helperText: 'Shown after the contact form is submitted' },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

const THEME_SETTING_KEYS = ['site_theme_primary', 'site_theme_secondary', 'site_theme_background', 'site_theme_paper'] as const;

function sectionsForTab(tab: SettingsTabId) {
  return SECTIONS.filter((s) => s.tab === tab);
}

export default function AdminSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { settings, loading, updateLoading, error } = useSelector((state: RootState) => state.adminSettings);
  const [form, setForm] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState(0);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchRequest());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      const next: Record<string, string> = {};
      ALL_FIELDS.forEach((key) => {
        let v = (settings as Record<string, string>)[key] ?? '';
        if (key === 'payment_gateway_cod_enabled') {
          if (v !== '0' && v !== '1') v = '0';
        } else if (
          key === 'payment_gateway_stripe_enabled' ||
          key === 'payment_gateway_bank_deposit_enabled' ||
          key === 'site_topbar_enabled'
        ) {
          if (v !== '0' && v !== '1') v = '1';
        }
        next[key] = v;
      });
      TESTIMONIAL_SETTING_KEYS.forEach((key) => {
        const raw = (settings as Record<string, string | undefined>)[key];
        if (key === 'site_testimonials') {
          next[key] = raw != null && String(raw).trim() !== '' ? String(raw) : '[]';
          return;
        }
        if (key === 'site_testimonials_explore_href') {
          if (raw === undefined) next[key] = '/testimonials';
          else next[key] = String(raw);
          return;
        }
        if (key === 'site_testimonials_title') {
          next[key] = raw != null && String(raw).trim() !== '' ? String(raw) : 'Testimonials';
          return;
        }
        if (key === 'site_testimonials_explore_label') {
          next[key] = raw != null && String(raw).trim() !== '' ? String(raw) : 'Explore More';
          return;
        }
      });
      setForm(next);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleStoreLogoUpload = async (file: File) => {
    try {
      setLogoUploading(true);
      const media = await uploadCmsMedia({ file, folder: 'branding', alt_text: 'Store logo' });
      handleChange('store_logo_url', media.url);
      toast.showSuccess('Logo uploaded — click Save all settings to apply');
    } catch (e) {
      toast.showError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    ALL_FIELDS.forEach((key) => {
      const v = form[key];
      if (v !== undefined && v !== '') payload[key] = v;
    });
    if (form.site_testimonials !== undefined) {
      payload.site_testimonials = form.site_testimonials;
    }
    if (form.site_testimonials_title !== undefined && form.site_testimonials_title !== '') {
      payload.site_testimonials_title = form.site_testimonials_title;
    }
    if (form.site_testimonials_explore_label !== undefined && form.site_testimonials_explore_label !== '') {
      payload.site_testimonials_explore_label = form.site_testimonials_explore_label;
    }
    if (form.site_testimonials_explore_href !== undefined) {
      payload.site_testimonials_explore_href = form.site_testimonials_explore_href;
    }
    if (form.store_logo_url !== undefined) {
      payload.store_logo_url = form.store_logo_url;
    }
    THEME_SETTING_KEYS.forEach((key) => {
      if (form[key] !== undefined) {
        payload[key] = form[key];
      }
    });
    if (form.shipping_options_json !== undefined) {
      payload.shipping_options_json = form.shipping_options_json;
    }
    dispatch(updateRequest(payload));
    toast.showSuccess('Settings saved');
  };

  if (loading && !settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Site content and branding. Changes apply to the storefront, including{' '}
        <MuiLink component={Link} href="/about" target="_blank">
          /about
        </MuiLink>{' '}
        and{' '}
        <MuiLink component={Link} href="/contact" target="_blank">
          /contact
        </MuiLink>
        . Use the tabs to jump between areas — one save updates everything.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Paper variant="outlined" sx={{ maxWidth: 960, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: { xs: 1, sm: 2 }, bgcolor: 'background.default' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Settings sections"
              sx={{
                minHeight: 48,
                '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 600 },
              }}
            >
              {TAB_CONFIG.map((t, i) => (
                <Tab key={t.id} label={t.label} id={`settings-tab-${i}`} aria-controls={`settings-tabpanel-${i}`} />
              ))}
            </Tabs>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {TAB_CONFIG.map((tabMeta, tabIndex) => (
              <Box
                key={tabMeta.id}
                role="tabpanel"
                hidden={activeTab !== tabIndex}
                id={`settings-tabpanel-${tabIndex}`}
                aria-labelledby={`settings-tab-${tabIndex}`}
              >
                {activeTab === tabIndex ? (
                  <Box>
                    {tabMeta.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {tabMeta.description}
                      </Typography>
                    )}

                    {tabMeta.id === 'testimonials' ? (
                      <Box>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              label="Section heading"
                              value={form.site_testimonials_title ?? 'Testimonials'}
                              onChange={(e) => handleChange('site_testimonials_title', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                              fullWidth
                              label="Explore more — button label"
                              value={form.site_testimonials_explore_label ?? 'Explore More'}
                              onChange={(e) => handleChange('site_testimonials_explore_label', e.target.value)}
                              margin="normal"
                            />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <TextField
                              fullWidth
                              label="Explore more — link URL"
                              value={form.site_testimonials_explore_href ?? ''}
                              onChange={(e) => handleChange('site_testimonials_explore_href', e.target.value)}
                              margin="normal"
                              helperText="Use /testimonials or any path. Clear this field and save to hide the button on the storefront."
                              placeholder="/testimonials"
                            />
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 2 }}>
                          <TestimonialsSettingsEditor
                            value={form.site_testimonials ?? '[]'}
                            onChange={(json) => handleChange('site_testimonials', json)}
                          />
                        </Box>
                      </Box>
                    ) : (
                      sectionsForTab(tabMeta.id).map((section, idx, arr) => (
                        <Box key={section.title} sx={{ mb: idx < arr.length - 1 ? 4 : 0 }}>
                          {idx > 0 && <Divider sx={{ my: 3 }} />}
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            {section.title}
                          </Typography>
                          {section.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {section.description}
                            </Typography>
                          )}
                          <Grid container spacing={2}>
                            {section.fields.map((f) => (
                              <Grid
                                size={{ xs: 12, sm: f.key === 'store_logo_url' ? 12 : f.multiline ? 12 : 6 }}
                                key={f.key}
                              >
                                {f.select ? (
                                  <FormControl fullWidth margin="normal">
                                    <InputLabel>{f.label}</InputLabel>
                                    <Select
                                      label={f.label}
                                      value={form[f.key] ?? ''}
                                      onChange={(e) => handleChange(f.key, e.target.value)}
                                    >
                                      {f.select.map((opt) => (
                                        <MenuItem key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                    {f.helperText && (
                                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {f.helperText}
                                      </Typography>
                                    )}
                                  </FormControl>
                                ) : f.key === 'store_logo_url' ? (
                                  <Box sx={{ mt: 1 }}>
                                    {form.store_logo_url?.trim() ? (
                                      <Box
                                        component="img"
                                        src={resolveMediaUrl(form.store_logo_url)}
                                        alt="Store logo preview"
                                        sx={{
                                          maxHeight: 72,
                                          maxWidth: 220,
                                          objectFit: 'contain',
                                          display: 'block',
                                          mb: 1.5,
                                          borderRadius: 1,
                                          border: 1,
                                          borderColor: 'divider',
                                          bgcolor: 'background.default',
                                        }}
                                      />
                                    ) : null}
                                    <TextField
                                      fullWidth
                                      label={f.label}
                                      value={form[f.key] ?? ''}
                                      onChange={(e) => handleChange(f.key, e.target.value)}
                                      margin="normal"
                                      helperText={f.helperText}
                                    />
                                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                                      <Button
                                        component="label"
                                        variant="outlined"
                                        size="small"
                                        startIcon={logoUploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                        disabled={logoUploading}
                                      >
                                        {logoUploading ? 'Uploading…' : 'Upload logo'}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          hidden
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              void handleStoreLogoUpload(file);
                                              e.target.value = '';
                                            }
                                          }}
                                        />
                                      </Button>
                                      <Typography variant="caption" color="text.secondary">
                                        PNG, JPG, WebP, SVG — stored in CMS Media (branding).
                                      </Typography>
                                    </Box>
                                  </Box>
                                ) : (
                                  <TextField
                                    fullWidth
                                    label={f.label}
                                    value={form[f.key] ?? ''}
                                    onChange={(e) => handleChange(f.key, e.target.value)}
                                    margin="normal"
                                    multiline={f.multiline}
                                    rows={f.multiline ? (f.key === 'shipping_options_json' ? 10 : 3) : undefined}
                                    helperText={f.helperText}
                                  />
                                )}
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ))
                    )}
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>

          <Divider />
          <Box sx={{ p: { xs: 2, sm: 3 }, pt: 2 }}>
            <Button type="submit" variant="contained" size="large" disabled={updateLoading}>
              {updateLoading ? 'Saving…' : 'Save all settings'}
            </Button>
          </Box>
        </Paper>
      </form>
    </Box>
  );
}
