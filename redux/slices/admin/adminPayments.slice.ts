import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminPaymentListItem } from '@/types/admin';

export interface AdminPaymentsFilter {
  gateway?: string;
  status?: string;
  order_id?: string;
  date_from?: string;
  date_to?: string;
  external_id?: string;
}

export interface AdminPaymentsState {
  list: AdminPaymentListItem[];
  loading: boolean;
  error: string | null;
  meta: { current_page: number; last_page: number; per_page: number; total: number } | null;
  actionLoading: boolean;
}

const initialState: AdminPaymentsState = {
  list: [],
  loading: false,
  error: null,
  meta: null,
  actionLoading: false,
};

const adminPaymentsSlice = createSlice({
  name: 'adminPayments',
  initialState,
  reducers: {
    fetchListRequest(
      state,
      _action: PayloadAction<{
        gateway?: string;
        status?: string;
        order_id?: string;
        date_from?: string;
        date_to?: string;
        external_id?: string;
        page?: number;
        per_page?: number;
      } | undefined>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchListSuccess(
      state,
      action: PayloadAction<{
        data: AdminPaymentListItem[];
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
    approveRequest(state, _action: PayloadAction<string | number>) {
      state.actionLoading = true;
      state.error = null;
    },
    approveSuccess(state, action: PayloadAction<{ id: number | string; status: string }>) {
      state.actionLoading = false;
      const idx = state.list.findIndex((p) => String(p.id) === String(action.payload.id));
      if (idx !== -1) state.list[idx].status = action.payload.status;
    },
    approveFailure(state, action: PayloadAction<string>) {
      state.actionLoading = false;
      state.error = action.payload;
    },
    rejectRequest(state, _action: PayloadAction<{ paymentId: string | number; reason?: string }>) {
      state.actionLoading = true;
      state.error = null;
    },
    rejectSuccess(state, action: PayloadAction<{ id: number | string; status: string }>) {
      state.actionLoading = false;
      const idx = state.list.findIndex((p) => String(p.id) === String(action.payload.id));
      if (idx !== -1) state.list[idx].status = action.payload.status;
    },
    rejectFailure(state, action: PayloadAction<string>) {
      state.actionLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchListRequest,
  fetchListSuccess,
  fetchListFailure,
  approveRequest,
  approveSuccess,
  approveFailure,
  rejectRequest,
  rejectSuccess,
  rejectFailure,
} = adminPaymentsSlice.actions;
export default adminPaymentsSlice.reducer;
