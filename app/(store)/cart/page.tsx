'use client';

import React, { useEffect } from 'react';
import { Box, Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, IconButton, TextField } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchCartRequest, removeItemRequest, applyDiscountRequest } from '@/redux/slices/cart.slice';
import Link from 'next/link';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { formatCurrency } from '@/lib/utils/currency';

export default function CartPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, loading, error } = useSelector((state: RootState) => state.cart);
  const content = useSiteContent();
  const currencySymbol = content.store?.currency_symbol ?? 'Rs.';
  const [code, setCode] = React.useState('');

  useEffect(() => {
    dispatch(fetchCartRequest());
  }, [dispatch]);

  if (loading && !cart) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>;
  }
  const isEmpty = !cart?.items?.length;

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom>Your Cart</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Ornavibe · Rason Business</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {isEmpty ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>Your cart is empty.</Typography>
            <Button component={Link} href="/products" variant="contained">Shop gift baskets</Button>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead><TableRow><TableCell>Product</TableCell><TableCell align="right">Price</TableCell><TableCell align="center">Qty</TableCell><TableCell align="right">Total</TableCell><TableCell /></TableRow></TableHead>
                <TableBody>
                  {cart?.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name || (item as any).product_name || `Item ${item.id}`}</TableCell>
                      <TableCell align="right">{formatCurrency(item.price, currencySymbol)}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(Number(item.price) * item.quantity, currencySymbol)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => dispatch(removeItemRequest(item.id))}><DeleteIcon /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Discount code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={{ minWidth: 200 }}
              />
              <Button variant="outlined" onClick={() => code.trim() && dispatch(applyDiscountRequest(code.trim()))}>Apply</Button>
              {cart?.discount_code && (
                <Typography variant="body2" color="success.main">Code &quot;{cart.discount_code}&quot; applied (−{formatCurrency(cart.discount_amount ?? 0, currencySymbol)})</Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="body1">Subtotal: {formatCurrency(cart?.subtotal ?? 0, currencySymbol)}</Typography>
                {cart?.discount_amount != null && Number(cart.discount_amount) > 0 && (
                  <Typography variant="body1" color="text.secondary">Discount: −{formatCurrency(cart.discount_amount, currencySymbol)}</Typography>
                )}
                <Typography variant="h6">Total: {formatCurrency(cart?.total ?? 0, currencySymbol)}</Typography>
              </Box>
              <Button component={Link} href="/checkout" variant="contained" size="large">Proceed to checkout</Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
