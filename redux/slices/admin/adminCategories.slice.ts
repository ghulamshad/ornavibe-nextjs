import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Category } from '@/types/catalog';

export interface AdminCategoriesState {
  list: Category[];
  loading: boolean;
  error: string | null;
  saveLoading: boolean;
  deleteLoading: boolean;
}

const initialState: AdminCategoriesState = {
  list: [],
  loading: false,
  error: null,
  saveLoading: false,
  deleteLoading: false,
};

const adminCategoriesSlice = createSlice({
  name: 'adminCategories',
  initialState,
  reducers: {
    fetchListRequest(
      state,
      _: PayloadAction<{ search?: string; parent_filter?: string; parent_id?: string | null } | undefined>
    ) {
      state.loading = true;
      state.error = null;
    },
    fetchListSuccess(state, action: PayloadAction<Category[]>) {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createRequest(state, _: PayloadAction<{ name: string; slug?: string; description?: string; image_url?: string; parent_id?: string | null }>) {
      state.saveLoading = true;
      state.error = null;
    },
    createSuccess(state, action: PayloadAction<Category>) {
      state.list = [action.payload, ...state.list];
      state.saveLoading = false;
      state.error = null;
    },
    createFailure(state, action: PayloadAction<string>) {
      state.saveLoading = false;
      state.error = action.payload;
    },
    updateRequest(state, _: PayloadAction<{ id: string; name?: string; slug?: string; description?: string; image_url?: string; parent_id?: string | null }>) {
      state.saveLoading = true;
      state.error = null;
    },
    updateSuccess(state, action: PayloadAction<Category>) {
      const idx = state.list.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
      state.saveLoading = false;
      state.error = null;
    },
    updateFailure(state, action: PayloadAction<string>) {
      state.saveLoading = false;
      state.error = action.payload;
    },
    deleteRequest(state, _: PayloadAction<string>) {
      state.deleteLoading = true;
      state.error = null;
    },
    deleteSuccess(state, action: PayloadAction<string>) {
      state.list = state.list.filter((c) => c.id !== action.payload);
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
} = adminCategoriesSlice.actions;
export default adminCategoriesSlice.reducer;
