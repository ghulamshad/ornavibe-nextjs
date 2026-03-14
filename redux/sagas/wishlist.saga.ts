import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/catalog';
import * as wishlistApi from '@/lib/api/wishlist.service';
import {
  fetchWishlistRequest,
  fetchWishlistSuccess,
  fetchWishlistFailure,
  addWishlistRequest,
  addWishlistSuccess,
  addWishlistFailure,
  removeWishlistRequest,
  removeWishlistSuccess,
  removeWishlistFailure,
} from '../slices/wishlist.slice';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchWishlistWorker(): Generator<unknown> {
  try {
    const items = (yield call(wishlistApi.fetchWishlist)) as Product[];
    yield put(fetchWishlistSuccess(items));
  } catch (err) {
    yield put(fetchWishlistFailure(extractErrorMessage(err as object).message));
  }
}

function* addWishlistWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const items = (yield call(wishlistApi.addToWishlist, action.payload)) as Product[];
    yield put(addWishlistSuccess(items));
  } catch (err) {
    yield put(addWishlistFailure(extractErrorMessage(err as object).message));
  }
}

function* removeWishlistWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const items = (yield call(wishlistApi.removeFromWishlist, action.payload)) as Product[];
    yield put(removeWishlistSuccess(items));
  } catch (err) {
    yield put(removeWishlistFailure(extractErrorMessage(err as object).message));
  }
}

export function* wishlistSaga() {
  yield takeLatest(fetchWishlistRequest.type, fetchWishlistWorker);
  yield takeLatest(addWishlistRequest.type, addWishlistWorker);
  yield takeLatest(removeWishlistRequest.type, removeWishlistWorker);
}

