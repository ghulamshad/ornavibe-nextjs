'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  MenuItem,
  TablePagination,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
  Tooltip,
} from '@mui/material';
import { MoreVert as MoreVertIcon, Visibility as ViewIcon, Receipt as SlipIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchListRequest } from '@/redux/slices/admin/adminOrders.slice';
import { useToast } from '@/components/common/Toast';
import { bulkUpdateOrderStatus } from '@/lib/api/admin.service';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import type { Order, OrderPayment } from '@/types/order';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

function paymentRefSummary(payments: OrderPayment[] | undefined): string {
  if (!payments?.length) return '—';
  const p = payments[0];
  const gatewayLabel = p.gateway === 'bank_deposit' ? 'Bank deposit' : p.gateway;
  if (p.proof_url) return `${gatewayLabel} · Slip`;
  if (p.external_id) return `${gatewayLabel} · ${String(p.external_id).slice(0, 12)}…`;
  return `${gatewayLabel} · ${p.status}`;
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get('user_id');
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { list, loading, error } = useSelector((state: RootState) => state.adminOrders);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuOrder, setMenuOrder] = useState<Order | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  useEffect(() => {
    dispatch(
      fetchListRequest({
        status: statusFilter || undefined,
        user_id: userIdFromUrl ?? undefined,
        page: page + 1,
        per_page: rowsPerPage,
      })
    );
  }, [dispatch, statusFilter, userIdFromUrl, page, rowsPerPage]);

  useEffect(() => {
    // Keep bulk selection aligned with the currently displayed list.
    setSelectedIds(new Set());
    setBulkStatus('');
  }, [statusFilter, userIdFromUrl, page, rowsPerPage]);

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';

  const formatCurrency = (v: string | number | undefined) =>
    v != null
      ? new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(Number(v))
      : '—';

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'delivered':
      case 'shipped':
        return 'success';
      case 'cancelled':
      case 'refunded':
        return 'error';
      case 'processing':
        return 'info';
      default:
        return 'default';
    }
  };

  const pageRowIds = list.map((o) => String(o.id));
  const allPageSelected = pageRowIds.length > 0 && pageRowIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageRowIds.some((id) => selectedIds.has(id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageRowIds.forEach((id) => next.delete(id));
      else pageRowIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const toggleRowSelected = (id: number | string) => {
    const key = String(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runBulkSetStatus = async () => {
    if (selectedIds.size === 0) return;
    if (!bulkStatus) {
      toast.showError('Choose a status to apply.');
      return;
    }

    setBulkWorking(true);
    try {
      const ids = [...selectedIds].map((id) => Number(id));
      const { updated } = await bulkUpdateOrderStatus({ ids, status: bulkStatus });
      toast.showSuccess(`Updated ${updated} order(s).`);
      setSelectedIds(new Set());
      setBulkStatus('');
      dispatch(
        fetchListRequest({
          status: statusFilter || undefined,
          user_id: userIdFromUrl ?? undefined,
          page: page + 1,
          per_page: rowsPerPage,
        })
      );
    } catch (err) {
      toast.showError(extractErrorMessage(err as object).message);
    } finally {
      setBulkWorking(false);
    }
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, order: Order) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuOrder(order);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuOrder(null);
  };
  const hasDepositSlip = (order: Order) =>
    order.payments?.some((p) => p.gateway === 'bank_deposit' && p.proof_url);
  const depositSlipUrl = (order: Order) =>
    order.payments?.find((p) => p.gateway === 'bank_deposit' && p.proof_url)?.proof_url ?? null;
  const hasTransactionRef = (order: Order) =>
    order.payments?.some((p) => p.external_id);
  const transactionRef = (order: Order) =>
    order.payments?.find((p) => p.external_id)?.external_id ?? null;
  const handleCopyTransactionRef = () => {
    if (!menuOrder) return;
    const ref = transactionRef(menuOrder);
    if (ref && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(ref);
      toast.showSuccess('Transaction ref copied');
    }
    closeMenu();
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h5" fontWeight="bold">
            Orders
          </Typography>
          {userIdFromUrl && (
            <Typography variant="body2" color="text.secondary">
              (filtered by customer #{userIdFromUrl})
            </Typography>
          )}
        </Box>
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value || 'all'} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {selectedIds.size > 0 && (
        <Paper
          variant="outlined"
          sx={{
            mb: 2,
            p: 1.5,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            {selectedIds.size} selected
          </Typography>
          <TextField
            size="small"
            select
            label="Set status"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="">Choose…</MenuItem>
            {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
              <MenuItem key={o.value} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" disabled={bulkWorking} onClick={() => void runBulkSetStatus()}>
            Apply
          </Button>
          <Button
            variant="outlined"
            disabled={bulkWorking}
            onClick={() => {
              setSelectedIds(new Set());
              setBulkStatus('');
            }}
          >
            Clear selection
          </Button>
        </Paper>
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
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={somePageSelected && !allPageSelected}
                      checked={allPageSelected}
                      onChange={() => toggleSelectAllOnPage()}
                      disabled={bulkWorking || list.length === 0}
                      inputProps={{ 'aria-label': 'Select all orders' }}
                    />
                  </TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right" width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      No orders yet. Orders will appear here when customers place orders.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((order: Order) => (
                    <TableRow key={String(order.id)} hover selected={selectedIds.has(String(order.id))}>
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(String(order.id))}
                          onChange={() => toggleRowSelected(order.id)}
                          disabled={bulkWorking}
                          inputProps={{ 'aria-label': `Select order ${order.id}` }}
                        />
                      </TableCell>
                      <TableCell>
                        <MuiLink component={Link} href={`/admin/orders/${order.id}`} sx={{ fontWeight: 600 }}>
                          #{order.id}
                        </MuiLink>
                      </TableCell>
                      <TableCell>
                        {order.user
                          ? `${order.user.name ?? order.user.email} (${order.user.email})`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Chip label={order.status} size="small" color={getStatusColor(order.status)} variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {paymentRefSummary(order.payments)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(order.total)}</TableCell>
                      <TableCell>{formatDate(order.created_at)}</TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, order)}
                            aria-label="Order actions"
                            aria-haspopup="true"
                            aria-expanded={menuAnchor != null && menuOrder?.id === order.id}
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
            open={Boolean(menuAnchor && menuOrder)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              component={Link}
              href={menuOrder ? `/admin/orders/${menuOrder.id}` : '#'}
              onClick={closeMenu}
            >
              <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
              <ListItemText>View order</ListItemText>
            </MenuItem>
            {menuOrder && hasDepositSlip(menuOrder) && (
              <MenuItem
                component="a"
                href={depositSlipUrl(menuOrder) ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                <ListItemIcon><SlipIcon fontSize="small" /></ListItemIcon>
                <ListItemText>View deposit slip</ListItemText>
              </MenuItem>
            )}
            {menuOrder && hasTransactionRef(menuOrder) && (
              <MenuItem onClick={handleCopyTransactionRef}>
                <ListItemIcon><CopyIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Copy transaction ref</ListItemText>
              </MenuItem>
            )}
          </Menu>
          {list.length >= rowsPerPage && (
            <TablePagination
              component="div"
              count={-1}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 15, 25, 50]}
              labelDisplayedRows={({ from, to }) => `${from}–${to}`}
            />
          )}
        </Paper>
      )}
    </Box>
  );
}
