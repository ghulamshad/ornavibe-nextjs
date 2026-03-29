'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  useTheme,
} from '@mui/material';
import { surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import Link from 'next/link';
import { fetchOrderDetailRequest } from '@/redux/slices/orders.slice';
import { uploadDepositSlip } from '@/lib/api/orders.service';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import type { OrderStatus } from '@/types/order';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { formatCurrency } from '@/lib/utils/currency';

export default function OrderDetailPage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { detail: order, detailLoading, error } = useSelector((state: RootState) => state.orders);
  const content = useSiteContent();
  const currencySymbol = content.store?.currency_symbol ?? 'Rs.';
  const [uploading, setUploading] = React.useState(false);
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (!isAuthenticated || !user)) {
      router.replace('/auth/login?returnUrl=/orders/' + id);
    }
  }, [isAuthenticated, user, router, id]);

  useEffect(() => {
    if (isAuthenticated && user && id) {
      dispatch(fetchOrderDetailRequest(id));
    }
  }, [isAuthenticated, user, dispatch, id]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const statusChipColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
      case 'refunded':
        return 'error';
      default:
        return 'default';
    }
  };

  if (detailLoading && !order) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Order not found'}</Alert>
        <Button component={Link} href="/orders" variant="contained">Back to orders</Button>
      </Container>
    );
  }

  const latestBankDeposit =
    order.payments?.find?.((p: any) => p.gateway === 'bank_deposit') ?? null;

  const handleDepositUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !order) return;
    try {
      setUploading(true);
      setUploadMessage(null);
      await uploadDepositSlip(order.id, file);
      setUploadMessage('Deposit slip uploaded. Our team will review and confirm your payment.');
      dispatch(fetchOrderDetailRequest(String(order.id)));
    } catch (err) {
      const extracted = extractErrorMessage(err as Parameters<typeof extractErrorMessage>[0]);
      setUploadMessage(extracted.message || 'Failed to upload deposit slip. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Order #{order.id}
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Order status
              </Typography>
              <Chip
                label={order.status}
                color={statusChipColor(order.status as OrderStatus)}
                sx={{ textTransform: 'capitalize', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Placed: {new Date(order.created_at).toLocaleString()}
              </Typography>
            </Paper>
          </Grid>
          {/* Payment method & bank deposit details */}
          {(order.payments?.length ?? 0) > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Payment method
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {order.payments!.some((p: { gateway: string }) => p.gateway === 'bank_deposit')
                    ? 'Bank deposit'
                    : order.payments!.map((p: { gateway: string }) => p.gateway).join(', ')}
                </Typography>
                {order.bank_account && (order.bank_account.account_name || order.bank_account.account_number || order.bank_account.bank_name) && (
                  <Box sx={{ mt: 2, p: 1.5, bgcolor: surfaceSoft(theme), borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Bank account details
                    </Typography>
                    {order.bank_account.bank_name && (
                      <Typography variant="body2"><strong>Bank:</strong> {order.bank_account.bank_name}</Typography>
                    )}
                    {order.bank_account.account_name && (
                      <Typography variant="body2"><strong>Account name:</strong> {order.bank_account.account_name}</Typography>
                    )}
                    {order.bank_account.account_number && (
                      <Typography variant="body2"><strong>Account number:</strong> {order.bank_account.account_number}</Typography>
                    )}
                    {order.bank_account.bsb_or_sort_code && (
                      <Typography variant="body2"><strong>BSB / Sort code:</strong> {order.bank_account.bsb_or_sort_code}</Typography>
                    )}
                    {order.bank_account.instructions && (
                      <Typography variant="body2" sx={{ mt: 1 }}>{order.bank_account.instructions}</Typography>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
          {order.shipping_address && (
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Shipping address
                </Typography>
                <Typography variant="body2">
                  {order.shipping_address.name ?? user?.name}
                </Typography>
                <Typography variant="body2">
                  {order.shipping_address.line1}
                </Typography>
                {order.shipping_address.line2 && (
                  <Typography variant="body2">
                    {order.shipping_address.line2}
                  </Typography>
                )}
                <Typography variant="body2">
                  {order.shipping_address.city}
                  {order.shipping_address.state ? `, ${order.shipping_address.state}` : ''}
                  {' '}
                  {order.shipping_address.postal_code}
                </Typography>
                <Typography variant="body2">
                  {order.shipping_address.country}
                </Typography>
                {order.shipping_address.phone && (
                  <Typography variant="body2">
                    Phone: {order.shipping_address.phone}
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}
          {latestBankDeposit && (
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Bank deposit payment
                </Typography>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="body2" component="span">Status:</Typography>
                  <Chip
                    size="small"
                    label={latestBankDeposit.status}
                    sx={{ textTransform: 'capitalize' }}
                    color={
                      latestBankDeposit.status === 'completed'
                        ? 'success'
                        : latestBankDeposit.status === 'failed'
                        ? 'error'
                        : 'warning'
                    }
                  />
                </Box>
                {latestBankDeposit.proof_url && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Current deposit slip:{' '}
                    <Button
                      component="a"
                      href={latestBankDeposit.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      View
                    </Button>
                  </Typography>
                )}
                {uploadMessage && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {uploadMessage}
                  </Typography>
                )}
                {latestBankDeposit.status !== 'completed' && (
                  <Button
                    component="label"
                    size="small"
                    variant="outlined"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading…' : 'Upload / replace deposit slip'}
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      hidden
                      onChange={handleDepositUpload}
                    />
                  </Button>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="center">Qty</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{formatCurrency(item.price, currencySymbol)}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.total ?? 0, currencySymbol)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2">Subtotal: {formatCurrency(order.subtotal, currencySymbol)}</Typography>
          {Number(order.discount_amount ?? 0) > 0 && (
            <Typography variant="body2">Discount: −{formatCurrency(order.discount_amount ?? 0, currencySymbol)}</Typography>
          )}
          <Typography variant="h6">Total: {formatCurrency(order.total, currencySymbol)}</Typography>
        </Paper>
        {order.gift_message && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Gift message: {order.gift_message}
          </Typography>
        )}
        <Button component={Link} href="/orders" variant="outlined">Back to orders</Button>
      </Container>
    </Box>
  );
}
