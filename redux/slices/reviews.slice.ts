import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Review {
  id: number | string;
  product_id: number | string;
  user_id?: number;
  rating: number;
  body?: string;
  created_at?: string;
  user?: { name?: string };
}

export interface ReviewsState {
  byProductId: Record<string, Review[]>;
  submitLoading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  byProductId: {},
  submitLoading: false,
  error: null,
};

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    fetchReviewsRequest(state, _action: PayloadAction<string | number>) {
      state.error = null;
    },
    fetchReviewsSuccess(state, action: PayloadAction<{ productId: string | number; reviews: Review[] }>) {
      const key = String(action.payload.productId);
      state.byProductId[key] = action.payload.reviews;
      state.error = null;
    },
    fetchReviewsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    submitReviewRequest(state, _action: PayloadAction<{ productId: string | number; rating: number; body?: string }>) {
      state.submitLoading = true;
      state.error = null;
    },
    submitReviewSuccess(state, action: PayloadAction<{ productId: string | number; review: Review }>) {
      const key = String(action.payload.productId);
      const list = state.byProductId[key] ?? [];
      state.byProductId[key] = [...list, action.payload.review];
      state.submitLoading = false;
      state.error = null;
    },
    submitReviewFailure(state, action: PayloadAction<string>) {
      state.submitLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchReviewsRequest,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  submitReviewRequest,
  submitReviewSuccess,
  submitReviewFailure,
} = reviewsSlice.actions;
export default reviewsSlice.reducer;
