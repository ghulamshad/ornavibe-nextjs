'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Breadcrumbs } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuTreeEditor from '@/components/admin/menus/MenuTreeEditor';
import MenuBuilderSidebar from '@/components/admin/menus/MenuBuilderSidebar';
import {
  fetchAdminMenuItems,
  createAdminMenuItem,
  updateAdminMenuItem,
  deleteAdminMenuItem,
  bulkReorderMenuItems,
} from '@/lib/api/adminMenus.service';
import type { AdminMenuItem } from '@/types/menus';
import type { CmsPageListItem } from '@/types/cms';
import type { Category, Product } from '@/types/catalog';
import { useToast } from '@/components/common/Toast';

export default function AdminMenuBuilderPage() {
  const params = useParams();
  const menuId = String(params.menuId ?? '');
  const toast = useToast();
  const [flat, setFlat] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadItems = useCallback(async () => {
    if (!menuId) return;
    setLoading(true);
    try {
      const { flat: next } = await fetchAdminMenuItems(menuId);
      setFlat(next);
      setError(null);
    } catch {
      setError('Could not load menu items.');
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    return () => {
      if (reorderTimer.current) clearTimeout(reorderTimer.current);
    };
  }, []);

  const scheduleReorder = useCallback(
    (next: AdminMenuItem[]) => {
      if (reorderTimer.current) clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(() => {
        reorderTimer.current = null;
        const payload = next.map((i) => ({ id: i.id, parent_id: i.parent_id, sort_order: i.sort_order }));
        bulkReorderMenuItems(menuId, payload)
          .then((res) => setFlat(res.flat))
          .catch(() => {
            toast.showError('Could not save menu order.');
            void loadItems();
          });
      }, 450);
    },
    [menuId, loadItems, toast]
  );

  const onPersist = useCallback(
    (next: AdminMenuItem[]) => {
      scheduleReorder(next);
    },
    [scheduleReorder]
  );

  const onItemUpdate = useCallback(
    async (id: string, patch: Partial<Pick<AdminMenuItem, 'title' | 'parent_id' | 'target' | 'url'>>) => {
      setBusy(true);
      try {
        await updateAdminMenuItem(id, patch);
        await loadItems();
      } catch {
        toast.showError('Could not update item.');
        await loadItems();
      } finally {
        setBusy(false);
      }
    },
    [loadItems, toast]
  );

  const onDeleteItem = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        await deleteAdminMenuItem(id);
        await loadItems();
        toast.showSuccess('Item removed.');
      } catch {
        toast.showError('Could not delete item.');
      } finally {
        setBusy(false);
      }
    },
    [loadItems, toast]
  );

  const nextRootSortOrder = () => {
    const roots = flat.filter((i) => !i.parent_id);
    if (roots.length === 0) return 0;
    return Math.max(...roots.map((r) => r.sort_order)) + 1;
  };

  const addItem = async (payload: Partial<AdminMenuItem> & { menu_id: string; title: string; type: string }) => {
    setBusy(true);
    try {
      await createAdminMenuItem({
        ...payload,
        sort_order: payload.sort_order ?? nextRootSortOrder(),
        target: payload.target ?? '_self',
      });
      await loadItems();
      toast.showSuccess('Item added.');
    } catch {
      toast.showError('Could not add item.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddPage = (p: CmsPageListItem) => {
    void addItem({ menu_id: menuId, title: p.title, type: 'page', reference_id: p.id });
  };

  const handleAddCategory = (c: Category) => {
    void addItem({ menu_id: menuId, title: c.name, type: 'category', reference_id: c.id });
  };

  const handleAddProduct = (p: Product) => {
    void addItem({
      menu_id: menuId,
      title: p.name,
      type: 'product',
      reference_id: String(p.id),
    });
  };

  const handleAddCustomUrl = (title: string, url: string) => {
    void addItem({ menu_id: menuId, title, type: 'url', url });
  };

  if (!menuId) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Button component={Link} href="/admin/menus" startIcon={<ArrowBackIcon />} size="small">
          Menus
        </Button>
        <Typography color="text.primary" variant="body2">
          Edit
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight={800} gutterBottom>
        Menu builder
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Drag rows to reorder. Order saves automatically. Title, parent, target, and URL save on change.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1fr) 340px' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Paper variant="outlined" sx={{ p: 2 }}>
            {busy && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Saving…
              </Typography>
            )}
            <MenuTreeEditor
              flat={flat}
              setFlat={setFlat}
              onPersist={onPersist}
              onDeleteItem={onDeleteItem}
              onItemUpdate={onItemUpdate}
            />
          </Paper>
          <MenuBuilderSidebar
            busy={busy}
            onAddPage={handleAddPage}
            onAddCategory={handleAddCategory}
            onAddProduct={handleAddProduct}
            onAddCustomUrl={handleAddCustomUrl}
          />
        </Box>
      )}
    </Box>
  );
}
