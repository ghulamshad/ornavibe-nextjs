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
  fetchHeaderNavRequest,
  fetchHeaderNavSuccess,
  fetchHeaderNavFailure,
  productSearchPreviewRequest,
  productSearchPreviewSuccess,
} from '../slices/catalog.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product, Category, ProductListParams } from '@/types/catalog';
import type { RootState } from '../store';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

const PRODUCTS_CACHE_TTL_MS = 60_000;
const CATEGORIES_CACHE_TTL_MS = 300_000;
const HEADER_NAV_CACHE_TTL_MS = 300_000;

/** Default list params for storefront sections sharing `catalog.products`. */
const DEFAULT_PRODUCT_LIST_PARAMS: ProductListParams = { per_page: 100, sort: 'newest' };

function mergeProductListParams(input: ProductListParams | undefined): ProductListParams {
  return { ...DEFAULT_PRODUCT_LIST_PARAMS, ...(input ?? {}) };
}

function serializeProductParams(p: ProductListParams): string {
  const keys = Object.keys(p).sort() as (keyof ProductListParams)[];
  const sorted: Record<string, unknown> = {};
  for (const k of keys) {
    const v = p[k];
    if (v !== undefined && v !== '') sorted[k] = v;
  }
  return JSON.stringify(sorted);
}

function normalizeProductList(data: unknown): Product[] {
  if (Array.isArray(data)) return data;
  return (data as { data?: Product[] }).data ?? [];
}

function* fetchProductsWorker(action: PayloadAction<ProductListParams | undefined>): Generator {
  try {
    const merged = mergeProductListParams(action.payload);
    const cacheKey = serializeProductParams(merged);
    const state: RootState = (yield select()) as RootState;
    const { products, lastFetchedAt, productsCacheKey } = state.catalog;

    const now = Date.now();
    const isFresh =
      products.length > 0 &&
      productsCacheKey === cacheKey &&
      typeof lastFetchedAt === 'number' &&
      now - lastFetchedAt < PRODUCTS_CACHE_TTL_MS;

    if (isFresh) {
      yield put(fetchProductsSuccess({ products, cacheKey }));
      return;
    }

    const data = yield call(catalogApi.fetchProducts, merged);
    const list = normalizeProductList(data);
    yield put(fetchProductsSuccess({ products: list, cacheKey }));
  } catch (err) {
    yield put(fetchProductsFailure(extractErrorMessage(err as object).message));
  }
}

function* fetchProductDetailWorker(action: PayloadAction<string | number>): Generator {
  try {
    const product = yield call(catalogApi.fetchProductByIdOrSlug, action.payload);
    yield put(fetchProductDetailSuccess(product as Product));
  } catch (err) {
    yield put(fetchProductDetailFailure(extractErrorMessage(err as object).message));
  }
}

function* fetchCategoriesWorker(): Generator {
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

function* fetchHeaderNavWorker(): Generator {
  try {
    const state: RootState = (yield select()) as RootState;
    const { headerNavRoots, headerNavLastFetchedAt } = state.catalog;
    const now = Date.now();
    const isFresh =
      headerNavRoots.length > 0 &&
      typeof headerNavLastFetchedAt === 'number' &&
      now - headerNavLastFetchedAt < HEADER_NAV_CACHE_TTL_MS;

    if (isFresh) {
      yield put(fetchHeaderNavSuccess(headerNavRoots));
      return;
    }

    const roots = yield call(catalogApi.fetchHeaderNavCategories);
    const list = Array.isArray(roots) ? roots : [];
    yield put(fetchHeaderNavSuccess(list));
  } catch (err) {
    yield put(fetchHeaderNavFailure(extractErrorMessage(err as object).message));
  }
}

function* searchPreviewWorker(action: PayloadAction<string>): Generator {
  const genAtStart = (yield select((s: RootState) => s.catalog.searchPreviewGeneration)) as number;
  const q = action.payload.trim();
  if (q.length < 2) {
    yield put(productSearchPreviewSuccess({ query: '', results: [], genAtStart }));
    return;
  }
  try {
    const data = yield call(catalogApi.fetchProducts, {
      search: q,
      per_page: 8,
      sort: 'newest',
    });
    const genNow = (yield select((s: RootState) => s.catalog.searchPreviewGeneration)) as number;
    if (genNow !== genAtStart) return;
    const list = normalizeProductList(data);
    yield put(productSearchPreviewSuccess({ query: q, results: list, genAtStart }));
  } catch {
    const genNow = (yield select((s: RootState) => s.catalog.searchPreviewGeneration)) as number;
    if (genNow !== genAtStart) return;
    yield put(productSearchPreviewSuccess({ query: q, results: [], genAtStart }));
  }
}

export function* catalogSaga() {
  yield takeLatest(fetchProductsRequest.type, fetchProductsWorker);
  yield takeLatest(fetchProductDetailRequest.type, fetchProductDetailWorker);
  yield takeLatest(fetchCategoriesRequest.type, fetchCategoriesWorker);
  yield takeLatest(fetchHeaderNavRequest.type, fetchHeaderNavWorker);
  yield takeLatest(productSearchPreviewRequest.type, searchPreviewWorker);
}
