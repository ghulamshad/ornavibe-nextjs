import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchAdminPages,
  createPage,
  updatePage,
  deletePage,
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
} from '../../slices/admin/adminPages.slice';
import type { Page } from '@/types/admin';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchListWorker(action: { type: string; payload?: { type?: string } }): Generator<unknown> {
  try {
    const list = yield call(fetchAdminPages, action.payload);
    yield put(fetchListSuccess(list as Page[]));
  } catch (err) {
    yield put(fetchListFailure(extractErrorMessage(err as object).message));
  }
}

function* createWorker(action: {
  type: string;
  payload: { slug: string; title: string; content: string; meta_title?: string | null; meta_description?: string | null; type?: string | null; is_published?: boolean; sort_order?: number };
}): Generator<unknown> {
  try {
    const page = yield call(createPage, action.payload);
    yield put(createSuccess(page as Page));
  } catch (err) {
    yield put(createFailure(extractErrorMessage(err as object).message));
  }
}

function* updateWorker(action: {
  type: string;
  payload: { id: number | string; slug?: string; title?: string; content?: string; meta_title?: string | null; meta_description?: string | null; type?: string | null; is_published?: boolean; sort_order?: number };
}): Generator<unknown> {
  try {
    const { id, ...rest } = action.payload;
    const page = yield call(updatePage, id, rest);
    yield put(updateSuccess(page as Page));
  } catch (err) {
    yield put(updateFailure(extractErrorMessage(err as object).message));
  }
}

function* deleteWorker(action: { type: string; payload: number | string }): Generator<unknown> {
  try {
    yield call(deletePage, action.payload);
    yield put(deleteSuccess(action.payload));
  } catch (err) {
    yield put(deleteFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminPagesSaga() {
  yield takeLatest(fetchListRequest.type, fetchListWorker);
  yield takeLatest(createRequest.type, createWorker);
  yield takeLatest(updateRequest.type, updateWorker);
  yield takeLatest(deleteRequest.type, deleteWorker);
}
