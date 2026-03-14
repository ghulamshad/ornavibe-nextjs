import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminCustomer } from '@/types/admin';

export interface AdminCustomersState {
  list: AdminCustomer[];
  loading: boolean;
  error: string | null;
  meta: { current_page: number; last_page: number; per_page: number; total: number } | null;
}

const initialState: AdminCustomersState = {
  list: [],
  loading: false,
  error: null,
  meta: null,
};

const adminCustomersSlice = createSlice({
  name: 'adminCustomers',
  initialState,
  reducers: {
    fetchListRequest(
      state,
      _action: PayloadAction<{
        page?: number;
        per_page?: number;
        email?: string;
        name?: string;
        date_from?: string;
        date_to?: string;
      } | undefined>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchListSuccess(
      state,
      action: PayloadAction<{
        data: AdminCustomer[];
        meta?: { current_page: number; last_page: number; per_page: number; total: number };
      }>
    ) {
      state.list = action.payload.data ?? [];
      state.meta = action.payload.meta ?? null;
      state.loading = false;
      state.error = null;
    },
    fetchListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchListRequest, fetchListSuccess, fetchListFailure } = adminCustomersSlice.actions;
export default adminCustomersSlice.reducer;
