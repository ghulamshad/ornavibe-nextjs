'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Tab,
  Tabs,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { fetchCmsPages, fetchAdminCategories, fetchAdminProducts } from '@/lib/api/admin.service';
import type { CmsPageListItem } from '@/types/cms';
import type { Category, Product } from '@/types/catalog';

type TabKey = 'pages' | 'categories' | 'products' | 'custom';

interface MenuBuilderSidebarProps {
  busy?: boolean;
  onAddPage: (page: CmsPageListItem) => void;
  onAddCategory: (category: Category) => void;
  onAddProduct: (product: Product) => void;
  onAddCustomUrl: (title: string, url: string) => void;
}

export default function MenuBuilderSidebar({
  busy,
  onAddPage,
  onAddCategory,
  onAddProduct,
  onAddCustomUrl,
}: MenuBuilderSidebarProps) {
  const [tab, setTab] = useState<TabKey>('pages');
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<CmsPageListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  useEffect(() => {
    if (tab !== 'pages') return;
    setLoading(true);
    fetchCmsPages({ per_page: 50, search: search.trim() || undefined })
      .then((r) => setPages(r.data))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => {
    if (tab !== 'categories') return;
    setLoading(true);
    fetchAdminCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== 'products') return;
    setLoading(true);
    fetchAdminProducts({ per_page: 40, search: search.trim() || undefined })
      .then((r) => setProducts(r.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [tab, search]);

  const filteredCategories = search.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories;

  return (
    <Box sx={{ position: 'sticky', top: 16 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        Add menu items
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 1 }}>
        <Tab value="pages" label="Pages" />
        <Tab value="categories" label="Categories" />
        <Tab value="products" label="Products" />
        <Tab value="custom" label="URL" />
      </Tabs>

      {tab !== 'custom' && (
        <TextField
          size="small"
          fullWidth
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      )}

      {tab === 'custom' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <TextField
            label="Label"
            size="small"
            fullWidth
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
          <TextField
            label="URL (path or https)"
            size="small"
            fullWidth
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            helperText="Relative paths like /about or full URLs."
          />
          <Button
            variant="contained"
            disabled={busy || !customTitle.trim() || !customUrl.trim()}
            onClick={() => {
              onAddCustomUrl(customTitle.trim(), customUrl.trim());
              setCustomTitle('');
              setCustomUrl('');
            }}
          >
            Add link
          </Button>
        </Box>
      )}

      {tab !== 'custom' && (
        <Box sx={{ maxHeight: 'min(60vh, 520px)', overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <List dense disablePadding>
              {tab === 'pages' &&
                pages.map((p) => (
                  <ListItem key={p.id} divider>
                    <ListItemText primary={p.title} secondary={p.slug} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="Add page" disabled={busy} onClick={() => onAddPage(p)}>
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              {tab === 'categories' &&
                filteredCategories.map((c) => (
                  <ListItem key={c.id} divider>
                    <ListItemText primary={c.name} secondary={c.slug} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="Add category" disabled={busy} onClick={() => onAddCategory(c)}>
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              {tab === 'products' &&
                products.map((p) => (
                  <ListItem key={String(p.id)} divider>
                    <ListItemText primary={p.name} secondary={p.slug} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="Add product" disabled={busy} onClick={() => onAddProduct(p)}>
                        <AddIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          )}
        </Box>
      )}
    </Box>
  );
}
