'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  placeOrderRequest,
  previewCheckoutRequest,
  resetCheckoutPreview,
} from '@/redux/slices/checkout.slice';
import type { CreateOrderPayload, ShippingAddress } from '@/types/order';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { formatCurrency } from '@/lib/utils/currency';

const initialAddress: ShippingAddress = {
  line1: '',
  line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'PK',
};

type PaymentGateway = 'stripe' | 'bank_deposit' | 'cod';

type DisplayShippingOption = {
  code: string;
  label: string;
  rate: number;
  eta: string | null;
};

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const { placing, error, preview, previewLoading, previewError } = useSelector(
    (state: RootState) => state.checkout
  );
  const content = useSiteContent();
  const currencySymbol = content.store?.currency_symbol ?? 'Rs.';

  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [giftMessage, setGiftMessage] = useState('');

  const shippingOptionsFromSite = useMemo(() => {
    const raw = content.store?.shipping_options;
    if (raw && raw.length > 0) return raw;
    return [{ code: 'standard', label: 'Standard delivery', rate: 0, carrier: 'store' }];
  }, [content.store?.shipping_options]);

  const stripeEnabled = content.store?.payment_gateway_stripe_enabled ?? true;
  const bankDepositEnabled = content.store?.payment_gateway_bank_deposit_enabled ?? true;
  const codEnabled = content.store?.payment_gateway_cod_enabled === true;

  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>('stripe');

  const [shippingMethod, setShippingMethod] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && (!isAuthenticated || !user)) {
      router.replace('/auth/login?returnUrl=/checkout');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const ok =
      (paymentGateway === 'stripe' && stripeEnabled) ||
      (paymentGateway === 'bank_deposit' && bankDepositEnabled) ||
      (paymentGateway === 'cod' && codEnabled);
    if (ok) return;
    if (stripeEnabled) setPaymentGateway('stripe');
    else if (bankDepositEnabled) setPaymentGateway('bank_deposit');
    else if (codEnabled) setPaymentGateway('cod');
  }, [stripeEnabled, bankDepositEnabled, codEnabled, paymentGateway]);

  useEffect(() => {
    if (!cart?.items?.length || !isAuthenticated) {
      dispatch(resetCheckoutPreview());
      return;
    }
    dispatch(
      previewCheckoutRequest({
        payment_gateway: paymentGateway,
        shipping_method: shippingMethod || undefined,
        shipping_address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postal_code: address.postal_code,
          country: address.country,
        },
      })
    );
  }, [
    dispatch,
    cart?.items?.length,
    isAuthenticated,
    paymentGateway,
    shippingMethod,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ]);

  const displayOptions: DisplayShippingOption[] = useMemo(() => {
    const quoted = preview?.shipping_quote?.methods;
    if (quoted && quoted.length > 0) {
      return quoted.map((m) => ({
        code: m.code,
        label: m.label,
        rate: m.rate,
        eta:
          m.estimated_days_min != null && m.estimated_days_max != null
            ? `${m.estimated_days_min}–${m.estimated_days_max} days`
            : null,
      }));
    }
    return shippingOptionsFromSite.map((o) => ({
      code: o.code,
      label: o.label,
      rate: o.rate,
      eta: null,
    }));
  }, [preview?.shipping_quote?.methods, shippingOptionsFromSite]);

  useEffect(() => {
    if (!displayOptions.length) return;
    setShippingMethod((prev) => {
      if (prev && displayOptions.some((o) => o.code === prev)) return prev;
      return displayOptions[0].code;
    });
  }, [displayOptions]);

  const isEmpty = !cart?.items?.length;

  const handlePlaceOrder = () => {
    const payload: CreateOrderPayload = {
      shipping_address: address,
      gift_message: giftMessage || undefined,
      payment_gateway: paymentGateway,
      shipping_method: shippingMethod || undefined,
    };
    dispatch(placeOrderRequest(payload));
  };

  const valid =
    address.line1.trim() &&
    address.city.trim() &&
    address.postal_code.trim() &&
    address.country.trim();

  const freeMin = content.store?.shipping_free_min_subtotal ?? 0;
  const cartSubtotal = typeof cart?.subtotal === 'number' ? cart.subtotal : Number(cart?.subtotal ?? 0);

  const onShippingChange = (e: SelectChangeEvent<string>) => {
    setShippingMethod(e.target.value);
  };

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
            {previewError && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {previewError}
              </Alert>
            )}
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Shipping address
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Use a 2-letter ISO country code (e.g. PK, US, GB). Delivery charges are calculated from your country,
              state, and postal code using the zones configured in Admin → Shipping.
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
                  helperText="Used for zone rules when set in Admin → Shipping."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Postal code"
                  required
                  value={address.postal_code}
                  onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
                  helperText="Matched against postal prefixes in shipping zones."
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Country"
                  required
                  value={address.country}
                  onChange={(e) => setAddress((a) => ({ ...a, country: e.target.value }))}
                  helperText="Use ISO 3166-1 alpha-2 (e.g. PK, US) so automated zones match."
                />
              </Grid>
            </Grid>

            {preview?.shipping_quote?.zone?.name && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Matched shipping region: <strong>{preview.shipping_quote.zone.name}</strong>
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="checkout-shipping-label">Delivery method</InputLabel>
              <Select
                labelId="checkout-shipping-label"
                label="Delivery method"
                value={shippingMethod}
                onChange={onShippingChange}
                disabled={displayOptions.length === 0 || previewLoading}
              >
                {displayOptions.map((opt) => (
                  <MenuItem key={opt.code} value={opt.code}>
                    {opt.label}
                    {opt.rate > 0
                      ? ` — ${formatCurrency(opt.rate, currencySymbol)}`
                      : ` — ${formatCurrency(0, currencySymbol)}`}
                    {opt.eta ? ` · ${opt.eta}` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {freeMin > 0 && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                Subtotals of {formatCurrency(freeMin, currencySymbol)} or more ship free (shipping line shows{' '}
                {formatCurrency(0, currencySymbol)} when the threshold is met).
              </Typography>
            )}

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
              {stripeEnabled && (
                <Button
                  variant={paymentGateway === 'stripe' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentGateway('stripe')}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  Pay online (Stripe)
                </Button>
              )}
              {bankDepositEnabled && (
                <Button
                  variant={paymentGateway === 'bank_deposit' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentGateway('bank_deposit')}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  Bank deposit
                </Button>
              )}
              {codEnabled && (
                <Button
                  variant={paymentGateway === 'cod' ? 'contained' : 'outlined'}
                  onClick={() => setPaymentGateway('cod')}
                  sx={{ textTransform: 'none', flex: 1 }}
                >
                  Cash on delivery (COD)
                </Button>
              )}
            </Box>
            {paymentGateway === 'bank_deposit' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                After placing your order, you&apos;ll receive bank account details. Please upload your deposit slip on
                the order detail page so our team can verify and approve your payment.
              </Alert>
            )}
            {paymentGateway === 'cod' && (
              <Alert severity="info" sx={{ mb: 3 }}>
                You&apos;ll pay the courier when your order arrives. Any COD handling fee is included in the order total
                below.
              </Alert>
            )}

            <Box
              sx={{
                mb: 3,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Order summary
              </Typography>
              {previewLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary">
                    Updating totals…
                  </Typography>
                </Box>
              )}
              {!previewLoading && preview && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal: {formatCurrency(preview.subtotal, currencySymbol)}
                  </Typography>
                  {preview.discount_amount > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Discount: −{formatCurrency(preview.discount_amount, currencySymbol)}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary">
                    Shipping: {formatCurrency(preview.shipping_amount, currencySymbol)}
                  </Typography>
                  {preview.cod_fee > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      COD fee: {formatCurrency(preview.cod_fee, currencySymbol)}
                    </Typography>
                  )}
                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Total: {formatCurrency(preview.total, currencySymbol)}
                  </Typography>
                </>
              )}
              {!previewLoading && !preview && !previewError && (
                <Typography variant="body2" color="text.secondary">
                  Cart subtotal: {formatCurrency(cartSubtotal, currencySymbol)}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button component={Link} href="/cart" variant="outlined" disabled={placing}>
                  Back to cart
                </Button>
                <Button
                  variant="contained"
                  onClick={handlePlaceOrder}
                  disabled={placing || !valid || !!previewError || !preview}
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
