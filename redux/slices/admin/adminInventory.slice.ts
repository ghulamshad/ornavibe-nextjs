import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminInventoryItem } from '@/lib/api/admin.service';

export interface AdminInventoryMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminInventoryState {
  list: AdminInventoryItem[];
  meta: AdminInventoryMeta | null;
  threshold: number;
  loading: boolean;
  error: string | null;
}

const initialState: AdminInventoryState = {
  list: [],
  meta: null,
  threshold: 10,
  loading: false,
  error: null,
};

const adminInventorySlice = createSlice({
  name: 'adminInventory',
  initialState,
  reducers: {
    fetchListRequest(
      state,
      _: PayloadAction<{
        page?: number;
        per_page?: number;
        search?: string;
        category_id?: string | null;
        stock_filter?: string;
      } | undefined>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchListSuccess(
      state,
      action: PayloadAction<{
        data: AdminInventoryItem[];
        meta: AdminInventoryMeta;
        threshold: number;
      }>
    ) {
      state.list = action.payload.data;
      state.meta = action.payload.meta;
      state.threshold = action.payload.threshold;
      state.loading = false;
      state.error = null;
    },
    fetchListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchListRequest, fetchListSuccess, fetchListFailure } = adminInventorySlice.actions;
export default adminInventorySlice.reducer;
