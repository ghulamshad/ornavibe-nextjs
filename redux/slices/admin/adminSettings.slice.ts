import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminSettings } from '@/types/admin';

export interface AdminSettingsState {
  settings: AdminSettings | null;
  loading: boolean;
  updateLoading: boolean;
  error: string | null;
}

const initialState: AdminSettingsState = {
  settings: null,
  loading: false,
  updateLoading: false,
  error: null,
};

const adminSettingsSlice = createSlice({
  name: 'adminSettings',
  initialState,
  reducers: {
    fetchRequest() {},
    fetchSuccess(state, action: PayloadAction<AdminSettings>) {
      state.settings = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateRequest(state, _action: PayloadAction<Partial<AdminSettings>>) {
      state.updateLoading = true;
      state.error = null;
    },
    updateSuccess(state, action: PayloadAction<AdminSettings>) {
      state.settings = action.payload;
      state.updateLoading = false;
      state.error = null;
    },
    updateFailure(state, action: PayloadAction<string>) {
      state.updateLoading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchRequest, fetchSuccess, fetchFailure, updateRequest, updateSuccess, updateFailure } =
  adminSettingsSlice.actions;
export default adminSettingsSlice.reducer;
