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
} from '@mui/material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchRequest, updateRequest } from '@/redux/slices/admin/adminSettings.slice';
import { useToast } from '@/components/common/Toast';

const SECTIONS: {
  title: string;
  description?: string;
  fields: { key: string; label: string; multiline?: boolean; helperText?: string; select?: { value: string; label: string }[] }[];
}[] = [
  {
    title: 'Store & contact info',
    description: 'Store name, currency, and contact details. Email and phone are shown on the public Contact page (/contact).',
    fields: [
      { key: 'store_name', label: 'Store name' },
      { key: 'currency', label: 'Currency (e.g. PKR)', helperText: 'Default: PKR. Used for new orders and storefront display.' },
      { key: 'store_email', label: 'Store email', helperText: 'Shown on /contact and in legal pages' },
      { key: 'store_phone', label: 'Store phone', helperText: 'Shown on /contact' },
    ],
  },
  {
    title: 'Payment gateways',
    description: 'Enable or disable payment methods at checkout. 1 = enabled, 0 = disabled.',
    fields: [
      { key: 'payment_gateway_stripe_enabled', label: 'Stripe (pay online)', select: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }] },
      { key: 'payment_gateway_bank_deposit_enabled', label: 'Bank deposit', select: [{ value: '1', label: 'Enabled' }, { value: '0', label: 'Disabled' }] },
    ],
  },
  {
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
    title: 'Hero (homepage)',
    fields: [
      { key: 'site_hero_title', label: 'Hero title' },
      { key: 'site_hero_subtitle', label: 'Hero subtitle', multiline: true },
      { key: 'site_hero_cta_primary', label: 'Primary CTA button text' },
      { key: 'site_hero_cta_secondary', label: 'Secondary CTA button text' },
    ],
  },
  {
    title: 'About page (/about)',
    description: 'Content for the public About page. Edit here to update /about.',
    fields: [
      { key: 'site_about_title', label: 'About page title' },
      { key: 'site_about_body', label: 'About page body', multiline: true },
    ],
  },
  {
    title: 'Contact page (/contact)',
    description: 'Content for the public Contact page. Email and phone come from Store & contact info above. Form success message is shown after a visitor submits the contact form.',
    fields: [
      { key: 'site_contact_title', label: 'Contact page title' },
      { key: 'site_contact_body', label: 'Contact page body', multiline: true },
      { key: 'site_contact_success_message', label: 'Form success message', helperText: 'Shown after the contact form is submitted' },
    ],
  },
  {
    title: 'Footer & branding',
    fields: [
      { key: 'site_footer_brand', label: 'Footer brand name' },
      { key: 'site_footer_company', label: 'Footer company name' },
      { key: 'site_footer_tagline', label: 'Footer tagline' },
    ],
  },
  {
    title: 'CTA block',
    fields: [
      { key: 'site_cta_title', label: 'CTA title' },
      { key: 'site_cta_subtitle', label: 'CTA subtitle', multiline: true },
    ],
  },
  {
    title: 'Featured products',
    fields: [
      { key: 'site_featured_title', label: 'Featured section title' },
      { key: 'site_featured_subtitle', label: 'Featured section subtitle' },
    ],
  },
  {
    title: 'Inventory',
    description: 'Stock alert threshold. Products with stock at or below this value appear in Admin → Inventory (low stock).',
    fields: [
      { key: 'stock_alert_threshold', label: 'Low stock threshold', helperText: 'Alert when product stock ≤ this number' },
    ],
  },
];

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields.map((f) => f.key));

export default function AdminSettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { settings, loading, updateLoading, error } = useSelector((state: RootState) => state.adminSettings);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchRequest());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      const next: Record<string, string> = {};
      ALL_FIELDS.forEach((key) => {
        let v = (settings as Record<string, string>)[key] ?? '';
        if (key === 'payment_gateway_stripe_enabled' || key === 'payment_gateway_bank_deposit_enabled') {
          if (v !== '0' && v !== '1') v = '1';
        }
        next[key] = v;
      });
      setForm(next);
    }
  }, [settings]);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    ALL_FIELDS.forEach((key) => {
      const v = form[key];
      if (v !== undefined && v !== '') payload[key] = v;
    });
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
        Site content and branding. Changes apply to the storefront, including <MuiLink component={Link} href="/about" target="_blank">/about</MuiLink> and <MuiLink component={Link} href="/contact" target="_blank">/contact</MuiLink>.
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 800 }}>
          {SECTIONS.map((section, idx) => (
            <Box key={section.title} sx={{ mb: 4 }}>
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
                  <Grid size={{ xs: 12, sm: f.multiline ? 12 : 6 }} key={f.key}>
                    {f.select ? (
                      <FormControl fullWidth margin="normal">
                        <InputLabel>{f.label}</InputLabel>
                        <Select
                          label={f.label}
                          value={form[f.key] ?? ''}
                          onChange={(e) => handleChange(f.key, e.target.value)}
                        >
                          {f.select.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                          ))}
                        </Select>
                        {f.helperText && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{f.helperText}</Typography>}
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        label={f.label}
                        value={form[f.key] ?? ''}
                        onChange={(e) => handleChange(f.key, e.target.value)}
                        margin="normal"
                        multiline={f.multiline}
                        rows={f.multiline ? 3 : undefined}
                        helperText={f.helperText}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
          <Divider sx={{ my: 3 }} />
          <Button type="submit" variant="contained" size="large" disabled={updateLoading}>
            {updateLoading ? 'Saving…' : 'Save all settings'}
          </Button>
        </Paper>
      </form>
    </Box>
  );
}
