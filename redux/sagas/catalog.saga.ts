import { call, put, takeLatest, select } from 'redux-saga/effects';
import * as catalogApi from '@/lib/api/catalog.service';
import {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductDetailRequest,
  fetchProductDetailSuccess,
  fetchProductDetailFailure,
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
} from '../slices/catalog.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product, Category } from '@/types/catalog';
import type { RootState } from '../store';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

const PRODUCTS_CACHE_TTL_MS = 60_000; // 1 minute
const CATEGORIES_CACHE_TTL_MS = 300_000; // 5 minutes

function* fetchProductsWorker(): Generator<unknown> {
  try {
    const state: RootState = (yield select()) as RootState;
    const { products, lastFetchedAt } = state.catalog;

    const now = Date.now();
    const isFresh =
      products.length > 0 &&
      typeof lastFetchedAt === 'number' &&
      now - lastFetchedAt < PRODUCTS_CACHE_TTL_MS;

    if (isFresh) {
      // Use cached products; no network call needed
      return;
    }

    const data = yield call(catalogApi.fetchProducts);
    const list = Array.isArray(data) ? data : (data as { data?: Product[] }).data ?? [];
    yield put(fetchProductsSuccess(list));
  } catch (err) {
    yield put(fetchProductsFailure(extractErrorMessage(err as object).message));
  }
}

function* fetchProductDetailWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const product = yield call(catalogApi.fetchProductByIdOrSlug, action.payload);
    yield put(fetchProductDetailSuccess(product as Product));
  } catch (err) {
    yield put(fetchProductDetailFailure(extractErrorMessage(err as object).message));
  }
}

function* fetchCategoriesWorker(): Generator<unknown> {
  try {
    const state: RootState = (yield select()) as RootState;
    const { categories, categoriesLastFetchedAt } = state.catalog;

    const now = Date.now();
    const isFresh =
      categories.length > 0 &&
      typeof categoriesLastFetchedAt === 'number' &&
      now - categoriesLastFetchedAt < CATEGORIES_CACHE_TTL_MS;

    if (isFresh) {
      yield put(fetchCategoriesSuccess(state.catalog.categories));
      return;
    }

    const fetched = yield call(catalogApi.fetchCategories);
    yield put(fetchCategoriesSuccess(fetched as Category[]));
  } catch (err) {
    yield put(fetchCategoriesFailure(extractErrorMessage(err as object).message));
  }
}

export function* catalogSaga() {
  yield takeLatest(fetchProductsRequest.type, fetchProductsWorker);
  yield takeLatest(fetchProductDetailRequest.type, fetchProductDetailWorker);
  yield takeLatest(fetchCategoriesRequest.type, fetchCategoriesWorker);
}
