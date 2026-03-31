'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Tabs,
  Tab,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import Link from 'next/link';
import { fetchOrdersRequest } from '@/redux/slices/orders.slice';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { formatCurrency } from '@/lib/utils/currency';
import type { OrderStatus } from '@/types/order';

export default function OrdersPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { list: orders, loading, error } = useSelector((state: RootState) => state.orders);
  const content = useSiteContent();
  const currencySymbol = content.store?.currency_symbol ?? 'Rs.';
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (typeof window !== 'undefined' && (!isAuthenticated || !user)) {
      router.replace('/auth/login?returnUrl=/orders');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchOrdersRequest());
    }
  }, [isAuthenticated, user, dispatch]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

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

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          My Orders
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Ornavibe · Rason Business
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading && !orders?.length ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
        ) : !orders?.length ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>You have no orders yet.</Typography>
            <Button component={Link} href="/products" variant="contained">Shop gift baskets</Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Tabs
                value={statusFilter}
                onChange={(_, v) => setStatusFilter(v)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="All" value="all" />
                <Tab label="Pending" value="pending" />
                <Tab label="Processing" value="processing" />
                <Tab label="Shipped" value="shipped" />
                <Tab label="Delivered" value="delivered" />
                <Tab label="Cancelled" value="cancelled" />
                <Tab label="Refunded" value="refunded" />
              </Tabs>
            </Box>
            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Items</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={order.status}
                          color={statusChipColor(order.status)}
                          variant={order.status === 'delivered' ? 'filled' : 'outlined'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(order.total, currencySymbol)}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component={Link}
                          href={`/orders/${order.id}`}
                          size="small"
                          variant="outlined"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Container>
    </Box>
  );
}
