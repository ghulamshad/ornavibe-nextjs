import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/catalog';

export interface WishlistState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    fetchWishlistRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchWishlistSuccess(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchWishlistFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addWishlistRequest(state, _action: PayloadAction<string | number>) {},
    addWishlistSuccess(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
      state.error = null;
    },
    addWishlistFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    removeWishlistRequest(state, _action: PayloadAction<string | number>) {},
    removeWishlistSuccess(state, action: PayloadAction<Product[]>) {
      state.items = action.payload;
      state.error = null;
    },
    removeWishlistFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    clearWishlist(state) {
      state.items = [];
      state.error = null;
    },
  },
});

export const {
  fetchWishlistRequest,
  fetchWishlistSuccess,
  fetchWishlistFailure,
  addWishlistRequest,
  addWishlistSuccess,
  addWishlistFailure,
  removeWishlistRequest,
  removeWishlistSuccess,
  removeWishlistFailure,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

