import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SiteContent } from '@/lib/api/site.service';

export interface SiteState {
  content: SiteContent | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
}

const initialState: SiteState = {
  content: null,
  loading: false,
  error: null,
  lastFetchedAt: null,
};

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    fetchSiteContentRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchSiteContentSuccess(state, action: PayloadAction<SiteContent>) {
      state.content = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetchedAt = Date.now();
    },
    fetchSiteContentFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchSiteContentRequest, fetchSiteContentSuccess, fetchSiteContentFailure } = siteSlice.actions;
export default siteSlice.reducer;
