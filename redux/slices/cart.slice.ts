import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Cart, AddCartItemPayload } from '@/types/cart';

export interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    fetchCartRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchCartSuccess(state, action: PayloadAction<Cart>) {
      state.cart = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchCartFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addItemRequest(state, _action: PayloadAction<AddCartItemPayload>) {
      state.error = null;
    },
    addItemSuccess(state, action: PayloadAction<Cart>) {
      state.cart = action.payload;
      state.error = null;
    },
    addItemFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    updateItemRequest(state, _action: PayloadAction<{ itemId: string | number; quantity: number }>) {},
    updateItemSuccess(state, action: PayloadAction<Cart>) {
      state.cart = action.payload;
      state.error = null;
    },
    removeItemRequest(state, _action: PayloadAction<string | number>) {},
    removeItemSuccess(state, action: PayloadAction<Cart>) {
      state.cart = action.payload;
      state.error = null;
    },
    applyDiscountRequest(state, _action: PayloadAction<string>) {
      state.error = null;
    },
    applyDiscountSuccess(state, action: PayloadAction<Cart>) {
      state.cart = action.payload;
      state.error = null;
    },
    applyDiscountFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearCart(state) {
      state.cart = null;
      state.error = null;
    },
  },
});

export const {
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFailure,
  addItemRequest,
  addItemSuccess,
  addItemFailure,
  updateItemRequest,
  updateItemSuccess,
  removeItemRequest,
  removeItemSuccess,
  applyDiscountRequest,
  applyDiscountSuccess,
  applyDiscountFailure,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
