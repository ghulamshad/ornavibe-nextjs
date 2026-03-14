import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Page } from '@/types/admin';

export interface AdminPagesState {
  list: Page[];
  loading: boolean;
  error: string | null;
  saveLoading: boolean;
  deleteLoading: boolean;
}

const initialState: AdminPagesState = {
  list: [],
  loading: false,
  error: null,
  saveLoading: false,
  deleteLoading: false,
};

const adminPagesSlice = createSlice({
  name: 'adminPages',
  initialState,
  reducers: {
    fetchListRequest(state, _action: PayloadAction<{ type?: string } | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchListSuccess(state, action: PayloadAction<Page[]>) {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createRequest(state, _action: PayloadAction<{
      slug: string; title: string; content: string;
      meta_title?: string | null; meta_description?: string | null;
      type?: string | null; is_published?: boolean; sort_order?: number;
    }>) {
      state.saveLoading = true;
      state.error = null;
    },
    createSuccess(state, action: PayloadAction<Page>) {
      state.list = [action.payload, ...state.list];
      state.saveLoading = false;
      state.error = null;
    },
    createFailure(state, action: PayloadAction<string>) {
      state.saveLoading = false;
      state.error = action.payload;
    },
    updateRequest(state, _action: PayloadAction<{
      id: number | string; slug?: string; title?: string; content?: string;
      meta_title?: string | null; meta_description?: string | null;
      type?: string | null; is_published?: boolean; sort_order?: number;
    }>) {
      state.saveLoading = true;
      state.error = null;
    },
    updateSuccess(state, action: PayloadAction<Page>) {
      const idx = state.list.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.list[idx] = action.payload;
      state.saveLoading = false;
      state.error = null;
    },
    updateFailure(state, action: PayloadAction<string>) {
      state.saveLoading = false;
      state.error = action.payload;
    },
    deleteRequest(state, _action: PayloadAction<number | string>) {
      state.deleteLoading = true;
      state.error = null;
    },
    deleteSuccess(state, action: PayloadAction<number | string>) {
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
} = adminPagesSlice.actions;
export default adminPagesSlice.reducer;
