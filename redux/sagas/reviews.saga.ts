import { call, put, takeLatest } from 'redux-saga/effects';
import * as reviewsApi from '@/lib/api/reviews.service';
import {
  fetchReviewsRequest,
  fetchReviewsSuccess,
  fetchReviewsFailure,
  submitReviewRequest,
  submitReviewSuccess,
  submitReviewFailure,
} from '../slices/reviews.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Review } from '../slices/reviews.slice';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchReviewsWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const reviews = yield call(reviewsApi.fetchProductReviews, action.payload);
    yield put(fetchReviewsSuccess({ productId: action.payload, reviews: reviews as reviewsApi.Review[] }));
  } catch (err) {
    yield put(fetchReviewsFailure(extractErrorMessage(err as object).message));
  }
}

function* submitReviewWorker(
  action: PayloadAction<{ productId: string | number; rating: number; body?: string }>
): Generator<unknown> {
  try {
    const review = yield call(reviewsApi.submitReview, action.payload.productId, {
      rating: action.payload.rating,
      body: action.payload.body,
    });
    yield put(
      submitReviewSuccess({
        productId: action.payload.productId,
        review: review as Review,
      })
    );
  } catch (err) {
    yield put(submitReviewFailure(extractErrorMessage(err as object).message));
  }
}

export function* reviewsSaga() {
  yield takeLatest(fetchReviewsRequest.type, fetchReviewsWorker);
  yield takeLatest(submitReviewRequest.type, submitReviewWorker);
}
