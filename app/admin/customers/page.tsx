'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  TablePagination,
  Button,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ShoppingBag as OrdersIcon,
  ContentCopy as CopyIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchListRequest } from '@/redux/slices/admin/adminCustomers.slice';
import { useToast } from '@/components/common/Toast';
import type { AdminCustomer } from '@/types/admin';

export default function AdminCustomersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { list, loading, error, meta } = useSelector((state: RootState) => state.adminCustomers);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filters, setFilters] = useState({
    email: '',
    name: '',
    date_from: '',
    date_to: '',
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuCustomer, setMenuCustomer] = useState<AdminCustomer | null>(null);

  const load = () => {
    dispatch(
      fetchListRequest({
        email: filters.email.trim() || undefined,
        name: filters.name.trim() || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        page: page + 1,
        per_page: rowsPerPage,
      })
    );
  };

  useEffect(() => {
    load();
  }, [page, rowsPerPage]);

  const handleApplyFilters = () => {
    setPage(0);
    load();
  };

  const handleClearFilters = () => {
    setFilters({ email: '', name: '', date_from: '', date_to: '' });
    setPage(0);
    setTimeout(() => load(), 0);
  };

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';

  const openMenu = (e: React.MouseEvent<HTMLElement>, customer: AdminCustomer) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuCustomer(customer);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuCustomer(null);
  };

  const handleCopyEmail = () => {
    if (!menuCustomer?.email) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(menuCustomer.email);
      toast.showSuccess('Email copied');
    }
    closeMenu();
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Customers
        </Typography>
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FilterIcon fontSize="small" /> Filters
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2,
            alignItems: 'end',
          }}
        >
          <TextField
            size="small"
            label="Email"
            placeholder="Search by email"
            value={filters.email}
            onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            label="Name"
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            label="Joined from"
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            size="small"
            label="Joined to"
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="contained" onClick={handleApplyFilters} startIcon={<FilterIcon />}>
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
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell>Last order</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell align="right" width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No customers found. Use filters or wait for new registrations.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>{customer.name ?? '—'}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell align="right">{customer.order_count ?? 0}</TableCell>
                      <TableCell>{formatDate(customer.last_order_at ?? undefined)}</TableCell>
                      <TableCell>{formatDate(customer.created_at)}</TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, customer)}
                            aria-label="Customer actions"
                          >
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
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor && menuCustomer)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              component={Link}
              href={menuCustomer ? `/admin/orders?user_id=${menuCustomer.id}` : '#'}
              onClick={closeMenu}
            >
              <ListItemIcon><OrdersIcon fontSize="small" /></ListItemIcon>
              <ListItemText>View orders</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleCopyEmail}>
              <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Copy email</ListItemText>
            </MenuItem>
          </Menu>
          {meta && meta.total > 0 && (
            <TablePagination
              component="div"
              count={meta.total}
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
