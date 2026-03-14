'use client';

import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AttachMoney as RevenueIcon,
  ShoppingCart as OrdersIcon,
  Schedule as RecentIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { fetchStatsRequest } from '@/redux/slices/admin/adminDashboard.slice';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading, error } = useSelector((state: RootState) => state.adminDashboard);

  useEffect(() => {
    dispatch(fetchStatsRequest());
  }, [dispatch]);

  if (loading && !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <RevenueIcon color="primary" />
                <Typography color="textSecondary" variant="body2">
                  Revenue
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats?.revenue != null
                  ? new Intl.NumberFormat('en-PK', {
                      style: 'currency',
                      currency: 'PKR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(stats.revenue)
                  : '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <OrdersIcon color="primary" />
                <Typography color="textSecondary" variant="body2">
                  Orders
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats?.order_count ?? '—'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <RecentIcon color="primary" />
                <Typography color="textSecondary" variant="body2">
                  Recent
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats?.recent_orders?.length ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent orders
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              <TableCell>Order</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats?.recent_orders?.length
              ? stats.recent_orders.slice(0, 10).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{ color: theme.palette.primary.main, textDecoration: 'none' }}
                      >
                        #{order.id}
                      </Link>
                    </TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell align="right">
                      {typeof order.total === 'number'
                        ? new Intl.NumberFormat('en-PK', {
                            style: 'currency',
                            currency: 'PKR',
                          }).format(order.total)
                        : order.total}
                    </TableCell>
                    <TableCell>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : '—'}
                    </TableCell>
                  </TableRow>
                ))
              : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      No recent orders. Connect your Laravel API to see data.
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
