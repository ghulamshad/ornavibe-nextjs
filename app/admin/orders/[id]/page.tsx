'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Divider,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchDetailRequest, updateStatusRequest } from '@/redux/slices/admin/adminOrders.slice';
import { useToast } from '@/components/common/Toast';
import type { OrderStatus } from '@/types/order';
import { usePublicSiteBranding } from '@/hooks/usePublicSiteBranding';

const STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

function paymentGatewayLabel(gateway: string): string {
  if (gateway === 'bank_deposit') return 'Bank deposit';
  if (gateway === 'cod') return 'Cash on delivery (COD)';
  if (gateway === 'stripe') return 'Stripe (online)';
  return gateway;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const branding = usePublicSiteBranding();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { detail, detailLoading, error } = useSelector((state: RootState) => state.adminOrders);
  const [statusValue, setStatusValue] = useState<string>('');

  useEffect(() => {
    if (id) dispatch(fetchDetailRequest(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (detail) setStatusValue(detail.status);
  }, [detail?.status]);

  const handleStatusChange = () => {
    if (!id || !statusValue || statusValue === detail?.status) return;
    dispatch(updateStatusRequest({ orderId: id, status: statusValue }));
    toast.showSuccess('Order status updated');
  };

  if (detailLoading && !detail) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  const currencyCode =
    detail?.currency && /^[A-Z]{3}$/i.test(String(detail.currency))
      ? String(detail.currency).toUpperCase()
      : 'PKR';

  const formatCurrency = (v: string | number | undefined) => {
    if (v == null) return '—';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(Number(v));
    } catch {
      return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(Number(v));
    }
  };

  const formatDate = (d: string | undefined) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button component={Link} href="/admin/orders" size="small">
          ← Back to orders
        </Button>
      </Box>
      {branding ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            '@media print': { breakInside: 'avoid' },
          }}
        >
          <Box
            component="img"
            src={branding.logoSrc}
            alt={branding.brandName}
            sx={{ height: 40, width: 'auto', maxWidth: 160, objectFit: 'contain' }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              {branding.brandName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Order document
            </Typography>
          </Box>
        </Box>
      ) : null}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Order #{id}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!detail ? (
        <Typography color="text.secondary">Order not found.</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.items?.map((item) => (
                      <TableRow key={String(item.id)}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            item.total ?? Number(item.price) * item.quantity
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            {detail.gift_message && (
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Gift message
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.gift_message}
                </Typography>
              </Paper>
            )}
            {detail.shipping_address && (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Shipping address
                </Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {[
                    detail.shipping_address.name,
                    detail.shipping_address.line1,
                    detail.shipping_address.line2,
                    [detail.shipping_address.city, detail.shipping_address.state, detail.shipping_address.postal_code]
                      .filter(Boolean)
                      .join(', '),
                    detail.shipping_address.country,
                    detail.shipping_address.phone,
                  ]
                    .filter(Boolean)
                    .join('\n')}
                </Typography>
              </Paper>
            )}
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Fulfillment
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping method
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {detail.shipping_method?.trim() || '—'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Carrier
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'right', textTransform: 'uppercase' }}>
                    {detail.delivery_carrier?.trim() || '—'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Summary
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="body2">{formatCurrency(detail.subtotal)}</Typography>
                </Box>
                {detail.discount_amount != null && Number(detail.discount_amount) !== 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="body2">-{formatCurrency(detail.discount_amount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Shipping
                  </Typography>
                  <Typography variant="body2">{formatCurrency(detail.shipping_amount ?? 0)}</Typography>
                </Box>
                {(Number(detail.cod_fee) > 0 || detail.payments?.some((p) => p.gateway === 'cod')) && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      COD fee
                    </Typography>
                    <Typography variant="body2">{formatCurrency(detail.cod_fee ?? 0)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight="bold">Total</Typography>
                  <Typography fontWeight="bold">{formatCurrency(detail.total)}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Currency: {currencyCode}
                </Typography>
              </Box>
            </Paper>
            <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Customer
              </Typography>
              {detail.user ? (
                <Typography variant="body2">
                  {detail.user.name && `${detail.user.name}\n`}
                  {detail.user.email}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  —
                </Typography>
              )}
            </Paper>
            {detail.payments && detail.payments.length > 0 && (
              <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Payment
                </Typography>
                {detail.payments.map((p) => (
                  <Box key={String(p.id)} sx={{ mb: 2, '&:last-child': { mb: 0 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="600">
                        {paymentGatewayLabel(p.gateway)}
                      </Typography>
                      <Chip label={p.status} size="small" color={p.status === 'completed' ? 'success' : p.status === 'failed' ? 'error' : 'default'} variant="outlined" />
                    </Box>
                    {p.amount != null && (
                      <Typography variant="body2" color="text.secondary">
                        Amount: {formatCurrency(p.amount)} {p.currency && `(${p.currency})`}
                      </Typography>
                    )}
                    {p.external_id && (
                      <Typography variant="body2" color="text.secondary">
                        Transaction ref: <Box component="span" sx={{ fontFamily: 'monospace' }}>{p.external_id}</Box>
                      </Typography>
                    )}
                    {p.proof_url && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <Button size="small" component="a" href={p.proof_url} target="_blank" rel="noopener noreferrer">
                          View deposit slip
                        </Button>
                      </Typography>
                    )}
                    {p.approved_at && (
                      <Typography variant="caption" color="text.secondary">
                        Approved: {formatDate(p.approved_at)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Paper>
            )}
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Status
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  select
                  size="small"
                  label="Order status"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  {STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleStatusChange}
                  disabled={detailLoading || statusValue === detail.status}
                >
                  {detailLoading ? 'Updating…' : 'Update'}
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Created: {formatDate(detail.created_at)}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
