import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  type AdminProductsParams,
} from '@/lib/api/admin.service';
import {
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
} from '../../slices/admin/adminProducts.slice';
import type { Product } from '@/types/catalog';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import type { AdminProductsMeta } from '../../slices/admin/adminProducts.slice';

function* fetchListWorker(
  action: {
    type: string;
    payload?: {
      page?: number;
      per_page?: number;
      search?: string;
      category_id?: string | null;
      is_active?: string;
      is_trending?: string;
      low_stock?: string;
      stock_threshold?: number;
    };
  }
): Generator<unknown> {
  try {
    const p = action.payload;
    const params: AdminProductsParams | undefined = p
      ? {
          page: p.page,
          per_page: p.per_page,
          search: p.search,
          category_id: p.category_id,
          is_active: p.is_active,
          is_trending: p.is_trending,
          low_stock:
            p.low_stock === '1' || p.low_stock === ''
              ? p.low_stock
              : undefined,
          stock_threshold: p.stock_threshold,
        }
      : undefined;
    const data = (yield call(fetchAdminProducts, params)) as {
      data?: Product[];
      meta?: AdminProductsMeta;
    };
    const list = data.data ?? [];
    const meta = data.meta;
    yield put(fetchListSuccess({ list, meta }));
  } catch (err) {
    yield put(fetchListFailure(extractErrorMessage(err as object).message));
  }
}

function* createWorker(
  action: { type: string; payload: Parameters<typeof createProduct>[0] }
): Generator<unknown> {
  try {
    const product = yield call(createProduct, action.payload);
    yield put(createSuccess(product as Product));
  } catch (err) {
    yield put(createFailure(extractErrorMessage(err as object).message));
  }
}

function* updateWorker(
  action: { type: string; payload: { id: string | number } & Partial<Parameters<typeof updateProduct>[1]> }
): Generator<unknown> {
  try {
    const { id, ...rest } = action.payload;
    const product = yield call(updateProduct, id, rest);
    yield put(updateSuccess(product as Product));
  } catch (err) {
    yield put(updateFailure(extractErrorMessage(err as object).message));
  }
}

function* deleteWorker(action: { type: string; payload: string | number }): Generator<unknown> {
  try {
    yield call(deleteProduct, action.payload);
    yield put(deleteSuccess(action.payload));
  } catch (err) {
    yield put(deleteFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminProductsSaga() {
  yield takeLatest(fetchListRequest.type, fetchListWorker);
  yield takeLatest(createRequest.type, createWorker);
  yield takeLatest(updateRequest.type, updateWorker);
  yield takeLatest(deleteRequest.type, deleteWorker);
}
