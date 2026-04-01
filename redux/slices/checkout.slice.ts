import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ShippingAddress } from '@/types/order';
import type { CheckoutPreview } from '@/lib/api/orders.service';

export interface CheckoutPreviewPayload {
  payment_gateway?: string;
  shipping_method?: string;
  shipping_address?: Partial<ShippingAddress>;
}

export interface CheckoutState {
  shippingAddress: ShippingAddress | null;
  placing: boolean;
  orderId: string | number | null;
  error: string | null;
  preview: CheckoutPreview | null;
  previewLoading: boolean;
  previewError: string | null;
}

const initialState: CheckoutState = {
  shippingAddress: null,
  placing: false,
  orderId: null,
  error: null,
  preview: null,
  previewLoading: false,
  previewError: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setShippingAddress(state, action: PayloadAction<ShippingAddress | null>) {
      state.shippingAddress = action.payload;
    },
    previewCheckoutRequest(state, _action: PayloadAction<CheckoutPreviewPayload>) {
      state.previewLoading = true;
      state.previewError = null;
    },
    previewCheckoutSuccess(state, action: PayloadAction<CheckoutPreview>) {
      state.preview = action.payload;
      state.previewLoading = false;
      state.previewError = null;
    },
    previewCheckoutFailure(state, action: PayloadAction<string>) {
      state.previewLoading = false;
      state.previewError = action.payload;
      state.preview = null;
    },
    resetCheckoutPreview(state) {
      state.preview = null;
      state.previewLoading = false;
      state.previewError = null;
    },
    placeOrderRequest(state, _action: PayloadAction<import('@/types/order').CreateOrderPayload>) {
      state.placing = true;
      state.error = null;
    },
    placeOrderSuccess(state, action: PayloadAction<string | number>) {
      state.orderId = action.payload;
      state.placing = false;
      state.error = null;
      state.preview = null;
      state.previewLoading = false;
      state.previewError = null;
    },
    placeOrderFailure(state, action: PayloadAction<string>) {
      state.placing = false;
      state.error = action.payload;
    },
    clearCheckout(state) {
      state.shippingAddress = null;
      state.orderId = null;
      state.error = null;
      state.preview = null;
      state.previewLoading = false;
      state.previewError = null;
    },
  },
});

export const {
  setShippingAddress,
  previewCheckoutRequest,
  previewCheckoutSuccess,
  previewCheckoutFailure,
  resetCheckoutPreview,
  placeOrderRequest,
  placeOrderSuccess,
  placeOrderFailure,
  clearCheckout,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
