import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/catalog';

export interface AdminProductsMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminProductsState {
  list: Product[];
  meta: AdminProductsMeta | null;
  loading: boolean;
  error: string | null;
  saveLoading: boolean;
  deleteLoading: boolean;
}

const initialState: AdminProductsState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
  saveLoading: false,
  deleteLoading: false,
};

interface CreatePayload {
  name: string;
  slug?: string;
  description?: string;
  price: number | string;
  category_id?: string | null;
  stock_quantity?: number;
  is_active?: boolean;
  image_url?: string;
   is_trending?: boolean;
   badge_type?: 'new' | 'hot' | 'discount' | 'oos';
   badge_discount_percent?: number | null;
}

interface UpdatePayload extends Partial<CreatePayload> {
  id: string | number;
}

const adminProductsSlice = createSlice({
  name: 'adminProducts',
  initialState,
  reducers: {
    fetchListRequest(
      state,
      _: PayloadAction<{
        page?: number;
        per_page?: number;
        search?: string;
        category_id?: string | null;
        is_active?: string;
        is_trending?: string;
        low_stock?: string;
        stock_threshold?: number;
      } | undefined>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchListSuccess(
      state,
      action: PayloadAction<{ list: Product[]; meta?: AdminProductsMeta }>
    ) {
      state.list = action.payload.list;
      state.meta = action.payload.meta ?? null;
      state.loading = false;
      state.error = null;
    },
    fetchListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createRequest(state, _: PayloadAction<CreatePayload>) {
      state.saveLoading = true;
      state.error = null;
    },
    createSuccess(state, action: PayloadAction<Product>) {
      state.list = [action.payload, ...state.list];
      state.saveLoading = false;
      state.error = null;
    },
    createFailure(state, action: PayloadAction<string>) {
      state.saveLoading = false;
      state.error = action.payload;
    },
    updateRequest(state, _: PayloadAction<UpdatePayload>) {
      state.saveLoading = true;
      state.error = null;
    },
    updateSuccess(state, action: PayloadAction<Product>) {
      const idx = state.list.findIndex((p) => String(p.id) === String(action.payload.id));
      if (idx !== -1) state.list[idx] = action.payload;
      state.saveLoading = false;
      state.error = null;
    },
    updateFailure(state, action: PayloadAction<string>) {
      state.saveLoading = false;
      state.error = action.payload;
    },
    deleteRequest(state, _: PayloadAction<string | number>) {
      state.deleteLoading = true;
      state.error = null;
    },
    deleteSuccess(state, action: PayloadAction<string | number>) {
      state.list = state.list.filter((p) => String(p.id) !== String(action.payload));
      state.deleteLoading = false;
      state.error = null;
    },
    deleteFailure(state, action: PayloadAction<string>) {
      state.deleteLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchListRequest,
  fetchListSuccess,
  fetchListFailure,
  createRequest,
  createSuccess,
  createFailure,
  updateRequest,
  updateSuccess,
  updateFailure,
  deleteRequest,
  deleteSuccess,
  deleteFailure,
} = adminProductsSlice.actions;
export default adminProductsSlice.reducer;
