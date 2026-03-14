import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/types/order';

export interface AdminOrdersState {
  list: Order[];
  detail: Order | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: AdminOrdersState = {
  list: [],
  detail: null,
  loading: false,
  detailLoading: false,
  error: null,
};

const adminOrdersSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {
    fetchListRequest(state, _action: PayloadAction<{ status?: string; user_id?: number | string; page?: number; per_page?: number } | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchListSuccess(state, action: PayloadAction<Order[]>) {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchDetailRequest(state, _action: PayloadAction<string | number>) {
      state.detailLoading = true;
      state.error = null;
    },
    fetchDetailSuccess(state, action: PayloadAction<Order>) {
      state.detail = action.payload;
      state.detailLoading = false;
      state.error = null;
    },
    fetchDetailFailure(state, action: PayloadAction<string>) {
      state.detailLoading = false;
      state.error = action.payload;
    },
    updateStatusRequest(state, _: PayloadAction<{ orderId: string | number; status: string }>) {
      state.detailLoading = true;
      state.error = null;
    },
    updateStatusSuccess(state, action: PayloadAction<Order>) {
      state.detail = action.payload;
      state.detailLoading = false;
      state.error = null;
      const idx = state.list.findIndex((o) => String(o.id) === String(action.payload.id));
      if (idx !== -1) state.list[idx] = action.payload;
    },
    updateStatusFailure(state, action: PayloadAction<string>) {
      state.detailLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchListRequest,
  fetchListSuccess,
  fetchListFailure,
  fetchDetailRequest,
  fetchDetailSuccess,
  fetchDetailFailure,
  updateStatusRequest,
  updateStatusSuccess,
  updateStatusFailure,
} = adminOrdersSlice.actions;
export default adminOrdersSlice.reducer;
