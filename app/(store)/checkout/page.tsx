'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Alert,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import Link from 'next/link';
import { placeOrderRequest } from '@/redux/slices/checkout.slice';
import type { CreateOrderPayload, ShippingAddress } from '@/types/order';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { formatCurrency } from '@/lib/utils/currency';

const initialAddress: ShippingAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const { placing, orderId, error } = useSelector((state: RootState) => state.checkout);
  const content = useSiteContent();
  const currencySymbol = content.store?.currency_symbol ?? 'Rs.';

  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [giftMessage, setGiftMessage] = useState('');
  const stripeEnabled = content.store?.payment_gateway_stripe_enabled ?? true;
  const bankDepositEnabled = content.store?.payment_gateway_bank_deposit_enabled ?? true;
  const defaultGateway: 'stripe' | 'bank_deposit' = stripeEnabled ? 'stripe' : 'bank_deposit';
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'bank_deposit'>(defaultGateway);

  useEffect(() => {
    if (typeof window !== 'undefined' && (!isAuthenticated || !user)) {
      router.replace('/auth/login?returnUrl=/checkout');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (!stripeEnabled && bankDepositEnabled && paymentGateway === 'stripe') setPaymentGateway('bank_deposit');
    if (stripeEnabled && !bankDepositEnabled && paymentGateway === 'bank_deposit') setPaymentGateway('stripe');
  }, [stripeEnabled, bankDepositEnabled, paymentGateway]);

  const isEmpty = !cart?.items?.length;

  const handlePlaceOrder = () => {
    const payload: CreateOrderPayload = {
      shipping_address: address,
      gift_message: giftMessage || undefined,
      payment_gateway: paymentGateway,
    };
    dispatch(placeOrderRequest(payload));
  };

  const valid =
    address.line1.trim() &&
    address.city.trim() &&
    address.postal_code.trim() &&
    address.country.trim();

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Checkout
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Ornavibe by Rason Business.
        </Typography>
        {!isAuthenticated || !user ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              Please sign in to checkout.
            </Typography>
            <Button component={Link} href="/auth/login" variant="contained">
              Sign in
            </Button>
          </Paper>
        ) : isEmpty ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              Your cart is empty.
            </Typography>
            <Button component={Link} href="/products" variant="contained">
              Shop gift baskets
            </Button>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
                {error}
              </Alert>
            )}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Shipping address
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address line 1"
                  required
                  value={address.line1}
                  onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Address line 2"
                  value={address.line2}
                  onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="City"
                  required
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="State / Province"
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Postal code"
                  required
                  value={address.postal_code}
                  onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Country"
                  required
                  value={address.country}
                  onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Gift message (optional)"
              multiline
              rows={2}
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
              Payment method
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
              {(content.store?.payment_gateway_stripe_enabled ?? true) && (
                <Button
                  variant={paymentGateway === 'stripe' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentGateway('stripe')}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  Pay online (Stripe)
                </Button>
              )}
              {(content.store?.payment_gateway_bank_deposit_enabled ?? true) && (
                <Button
                  variant={paymentGateway === 'bank_deposit' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentGateway('bank_deposit')}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  Bank deposit
                </Button>
              )}
            </Box>
            {paymentGateway === 'bank_deposit' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                After placing your order, you&apos;ll receive bank account details. Please upload your
                deposit slip on the order detail page so our team can verify and approve your payment.
              </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6">
                Total: {formatCurrency(cart?.total ?? 0, currencySymbol)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={Link} href="/cart" variant="outlined" disabled={placing}>
                  Back to cart
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePlaceOrder}
                  disabled={placing || !valid}
                >
                  {placing ? <CircularProgress size={24} /> : 'Place order'}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
