import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminDashboardStats } from '@/types/admin';

export interface AdminDashboardState {
  stats: AdminDashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  stats: null,
  loading: false,
  error: null,
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    fetchStatsRequest() {},
    fetchStatsSuccess(state, action: PayloadAction<AdminDashboardStats>) {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchStatsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
