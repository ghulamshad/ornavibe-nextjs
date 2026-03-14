import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type AdminCategoriesParams,
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
} from '../../slices/admin/adminCategories.slice';
import type { Category } from '@/types/catalog';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchListWorker(
  action: {
    type: string;
    payload?: { search?: string; parent_filter?: string; parent_id?: string | null };
  }
): Generator<unknown> {
  try {
    const params: AdminCategoriesParams | undefined = action.payload
      ? {
          search: action.payload.search,
          parent_filter: action.payload.parent_filter as AdminCategoriesParams['parent_filter'],
          parent_id: action.payload.parent_id,
        }
      : undefined;
    const list = yield call(fetchAdminCategories, params);
    yield put(fetchListSuccess(list as Category[]));
  } catch (err) {
    yield put(fetchListFailure(extractErrorMessage(err as object).message));
  }
}

function* createWorker(
  action: {
    type: string;
    payload: { name: string; slug?: string; description?: string; image_url?: string; parent_id?: string | null };
  }
): Generator<unknown> {
  try {
    const category = yield call(createCategory, action.payload);
    yield put(createSuccess(category as Category));
  } catch (err) {
    yield put(createFailure(extractErrorMessage(err as object).message));
  }
}

function* updateWorker(
  action: {
    type: string;
    payload: { id: string; name?: string; slug?: string; description?: string; image_url?: string; parent_id?: string | null };
  }
): Generator<unknown> {
  try {
    const { id, ...rest } = action.payload;
    const category = yield call(updateCategory, id, rest);
    yield put(updateSuccess(category as Category));
  } catch (err) {
    yield put(updateFailure(extractErrorMessage(err as object).message));
  }
}

function* deleteWorker(action: { type: string; payload: string }): Generator<unknown> {
  try {
    yield call(deleteCategory, action.payload);
    yield put(deleteSuccess(action.payload));
  } catch (err) {
    yield put(deleteFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminCategoriesSaga() {
  yield takeLatest(fetchListRequest.type, fetchListWorker);
  yield takeLatest(createRequest.type, createWorker);
  yield takeLatest(updateRequest.type, updateWorker);
  yield takeLatest(deleteRequest.type, deleteWorker);
}
