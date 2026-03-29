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
  Chip,
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
  InputAdornment,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewOrderIcon,
  Receipt as SlipIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import {
  fetchListRequest,
  approveRequest,
  rejectRequest,
} from '@/redux/slices/admin/adminPayments.slice';
import { useToast } from '@/components/common/Toast';
import type { AdminPaymentListItem } from '@/types/admin';

const GATEWAY_OPTIONS = [
  { value: '', label: 'All gateways' },
  { value: 'bank_deposit', label: 'Bank deposit' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'cod', label: 'Cash on delivery (COD)' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'razorpay', label: 'Razorpay' },
];

function paymentGatewayCellLabel(gateway: string): string {
  if (gateway === 'bank_deposit') return 'Bank deposit';
  if (gateway === 'cod') return 'COD';
  if (gateway === 'stripe') return 'Stripe';
  return gateway;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminPaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { list, loading, error, meta, actionLoading } = useSelector(
    (state: RootState) => state.adminPayments
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [filters, setFilters] = useState({
    gateway: '',
    status: '',
    order_id: '',
    date_from: '',
    date_to: '',
    external_id: '',
  });
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuPayment, setMenuPayment] = useState<AdminPaymentListItem | null>(null);

  const load = () => {
    dispatch(
      fetchListRequest({
        gateway: filters.gateway || undefined,
        status: filters.status || undefined,
        order_id: filters.order_id.trim() || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        external_id: filters.external_id.trim() || undefined,
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
    setFilters({
      gateway: '',
      status: '',
      order_id: '',
      date_from: '',
      date_to: '',
      external_id: '',
    });
    setPage(0);
    setTimeout(() => load(), 0);
  };

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—';

  const formatCurrency = (v: string | number | undefined) =>
    v != null
      ? new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(Number(v))
      : '—';

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'error';
      case 'pending_review':
        return 'warning';
      default:
        return 'default';
    }
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, payment: AdminPaymentListItem) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuPayment(payment);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuPayment(null);
  };

  const handleApprove = () => {
    if (!menuPayment) return;
    dispatch(approveRequest(menuPayment.id));
    toast.showSuccess('Payment approved');
    closeMenu();
  };
  const handleReject = () => {
    if (!menuPayment) return;
    dispatch(rejectRequest({ paymentId: menuPayment.id }));
    toast.showSuccess('Payment rejected');
    closeMenu();
  };

  const canApproveReject = (p: AdminPaymentListItem) =>
    p.gateway === 'bank_deposit' &&
    (p.status === 'pending' || p.status === 'pending_review');

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          Payments
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
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
            gap: 2,
            alignItems: 'end',
          }}
        >
          <TextField
            select
            size="small"
            label="Gateway"
            value={filters.gateway}
            onChange={(e) => setFilters((f) => ({ ...f, gateway: e.target.value }))}
            fullWidth
          >
            {GATEWAY_OPTIONS.map((o) => (
              <MenuItem key={o.value || 'all'} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            fullWidth
          >
            {STATUS_OPTIONS.map((o) => (
              <MenuItem key={o.value || 'all'} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Order ID"
            placeholder="e.g. 1"
            value={filters.order_id}
            onChange={(e) => setFilters((f) => ({ ...f, order_id: e.target.value }))}
            fullWidth
          />
          <TextField
            size="small"
            label="Date from"
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            size="small"
            label="Date to"
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            size="small"
            label="Transaction ref"
            placeholder="Search by ref"
            value={filters.external_id}
            onChange={(e) => setFilters((f) => ({ ...f, external_id: e.target.value }))}
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
                  <TableCell>Payment</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Gateway</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right" width={56} />
                </TableRow>
              </TableHead>
              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                      No payments found. Use filters or wait for customer payments.
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((payment) => (
                    <TableRow key={String(payment.id)} hover>
                      <TableCell>#{payment.id}</TableCell>
                      <TableCell>
                        <MuiLink component={Link} href={`/admin/orders/${payment.order_id}`} fontWeight={600}>
                          #{payment.order_id}
                        </MuiLink>
                      </TableCell>
                      <TableCell>
                        {payment.order?.user
                          ? `${payment.order.user.name ?? payment.order.user.email}`
                          : '—'}
                      </TableCell>
                      <TableCell>{paymentGatewayCellLabel(payment.gateway)}</TableCell>
                      <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={payment.status}
                          size="small"
                          color={getStatusColor(payment.status)}
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {payment.proof_url ? (
                          <MuiLink href={payment.proof_url} target="_blank" rel="noopener noreferrer">
                            Deposit slip
                          </MuiLink>
                        ) : payment.external_id ? (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {String(payment.external_id).slice(0, 16)}…
                          </Typography>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(payment.created_at)}</TableCell>
                      <TableCell align="right" padding="none">
                        <Tooltip title="Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => openMenu(e, payment)}
                            aria-label="Payment actions"
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
            open={Boolean(menuAnchor && menuPayment)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem component={Link} href={menuPayment ? `/admin/orders/${menuPayment.order_id}` : '#'} onClick={closeMenu}>
              <ListItemIcon><ViewOrderIcon fontSize="small" /></ListItemIcon>
              <ListItemText>View order</ListItemText>
            </MenuItem>
            {menuPayment?.proof_url && (
              <MenuItem
                component="a"
                href={menuPayment.proof_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
              >
                <ListItemIcon><SlipIcon fontSize="small" /></ListItemIcon>
                <ListItemText>View deposit slip</ListItemText>
              </MenuItem>
            )}
            {menuPayment && canApproveReject(menuPayment) && [
              <MenuItem key="approve" onClick={handleApprove} disabled={actionLoading}>
                <ListItemIcon><ApproveIcon fontSize="small" color="success" /></ListItemIcon>
                <ListItemText>Approve payment</ListItemText>
              </MenuItem>,
              <MenuItem key="reject" onClick={handleReject} disabled={actionLoading}>
                <ListItemIcon><RejectIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Reject payment</ListItemText>
              </MenuItem>,
            ]}
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
