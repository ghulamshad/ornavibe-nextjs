import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ShippingAddress } from '@/types/order';

export interface CheckoutState {
  shippingAddress: ShippingAddress | null;
  placing: boolean;
  orderId: string | number | null;
  error: string | null;
}

const initialState: CheckoutState = {
  shippingAddress: null,
  placing: false,
  orderId: null,
  error: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setShippingAddress(state, action: PayloadAction<ShippingAddress | null>) {
      state.shippingAddress = action.payload;
    },
    placeOrderRequest(state, _action: PayloadAction<import('@/types/order').CreateOrderPayload>) {
      state.placing = true;
      state.error = null;
    },
    placeOrderSuccess(state, action: PayloadAction<string | number>) {
      state.orderId = action.payload;
      state.placing = false;
      state.error = null;
    },
    placeOrderFailure(state, action: PayloadAction<string>) {
      state.placing = false;
      state.error = action.payload;
    },
    clearCheckout(state) {
      state.shippingAddress = null;
      state.orderId = null;
      state.error = null;
    },
  },
});

export const {
  setShippingAddress,
  placeOrderRequest,
  placeOrderSuccess,
  placeOrderFailure,
  clearCheckout,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
