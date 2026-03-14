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
  TextField,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Chip,
  TablePagination,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchListRequest as fetchCategoriesRequest } from '@/redux/slices/admin/adminCategories.slice';
import { fetchListRequest } from '@/redux/slices/admin/adminInventory.slice';
import type { AdminInventoryItem } from '@/lib/api/admin.service';

function stockStatus(stock: number, threshold: number): 'ok' | 'low' | 'out' {
  if (stock <= 0) return 'out';
  if (stock <= threshold) return 'low';
  return 'ok';
}

export default function AdminInventoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, meta, threshold, loading, error } = useSelector((state: RootState) => state.adminInventory);
  const { list: categories } = useSelector((state: RootState) => state.adminCategories);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filters, setFilters] = useState({
    search: '',
    category_id: '' as string,
    stock_filter: '' as string,
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<AdminInventoryItem | null>(null);

  const load = () => {
    dispatch(
      fetchListRequest({
        page: page + 1,
        per_page: rowsPerPage,
        search: filters.search.trim() || undefined,
        category_id: filters.category_id || undefined,
        stock_filter: filters.stock_filter || undefined,
      })
    );
  };

  useEffect(() => {
    dispatch(fetchCategoriesRequest({}));
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [dispatch, page, rowsPerPage]);

  const handleApplyFilters = () => {
    setPage(0);
    load();
  };

  const handleClearFilters = () => {
    setFilters({ search: '', category_id: '', stock_filter: '' });
    setPage(0);
    dispatch(
      fetchListRequest({
        page: 1,
        per_page: rowsPerPage,
      })
    );
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, row: AdminInventoryItem) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuItem(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuItem(null);
  };

  const total = meta?.total ?? 0;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Inventory
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Low-stock threshold: <strong>{threshold}</strong> (Settings → Inventory)
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FilterListIcon fontSize="small" /> Filters
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
            alignItems: 'end',
          }}
        >
          <TextField
            size="small"
            label="Search"
            placeholder="Name or slug"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            fullWidth
          />
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
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Stock"
            value={filters.stock_filter}
            onChange={(e) => setFilters((f) => ({ ...f, stock_filter: e.target.value }))}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="low_stock">Low stock only</MenuItem>
            <MenuItem value="out_of_stock">Out of stock only</MenuItem>
          </TextField>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="contained" onClick={handleApplyFilters} startIcon={<FilterListIcon />}>
            Apply
          </Button>
          <Button variant="outlined" onClick={handleClearFilters} startIcon={<ClearIcon />}>
            Clear
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {loading && list.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right" width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      {filters.search || filters.category_id || filters.stock_filter
                        ? 'No inventory matches the filters. Try different criteria or clear filters.'
                        : 'No products in inventory.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((row) => {
                    const status = stockStatus(row.stock_quantity, threshold);
                    return (
                      <TableRow key={String(row.id)} hover>
                        <TableCell>
                          {row.image_url ? (
                            <Box
                              component="img"
                              src={row.image_url}
                              alt=""
                              sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                            />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{row.name}</Typography>
                          {row.slug && (
                            <Typography variant="caption" color="text.secondary">
                              {row.slug}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{row.category?.name ?? '—'}</TableCell>
                        <TableCell align="right">{row.stock_quantity}</TableCell>
                        <TableCell>
                          <Chip
                            label={status === 'out' ? 'Out of stock' : status === 'low' ? 'Low stock' : 'OK'}
                            size="small"
                            color={status === 'out' ? 'error' : status === 'low' ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" padding="none">
                          <Tooltip title="Actions">
                            <IconButton size="small" onClick={(e) => openMenu(e, row)} aria-label="Inventory actions">
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor && menuItem)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              component={Link}
              href={menuItem ? `/products/${menuItem.slug || menuItem.id}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>View on store</ListItemText>
            </MenuItem>
            <MenuItem
              component={Link}
              href="/admin/products"
              onClick={closeMenu}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit product</ListItemText>
            </MenuItem>
          </Menu>
          {meta && meta.total > 0 && (
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 15, 25, 50]}
              labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count}`}
            />
          )}
        </Paper>
      )}
    </Box>
  );
}
