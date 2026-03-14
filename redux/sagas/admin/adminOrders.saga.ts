import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchAdminOrders, fetchAdminOrderById, updateOrderStatus } from '@/lib/api/admin.service';
import {
  fetchListRequest,
  fetchListSuccess,
  fetchListFailure,
  fetchDetailRequest,
  fetchDetailSuccess,
  fetchDetailFailure,
  updateStatusRequest,
  updateStatusSuccess,
  updateStatusFailure,
} from '../../slices/admin/adminOrders.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/types/order';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchListWorker(
  action: { type: string; payload?: { status?: string; user_id?: number | string; page?: number; per_page?: number } }
): Generator<unknown> {
  try {
    const data = yield call(fetchAdminOrders, action.payload);
    const list = (data as { data?: Order[] }).data ?? [];
    yield put(fetchListSuccess(list));
  } catch (err) {
    yield put(fetchListFailure(extractErrorMessage(err as object).message));
  }
}

function* fetchDetailWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const order = yield call(fetchAdminOrderById, action.payload);
    yield put(fetchDetailSuccess(order as Order));
  } catch (err) {
    yield put(fetchDetailFailure(extractErrorMessage(err as object).message));
  }
}

function* updateStatusWorker(
  action: PayloadAction<{ orderId: string | number; status: string }>
): Generator<unknown> {
  try {
    const order = yield call(updateOrderStatus, action.payload.orderId, action.payload.status);
    yield put(updateStatusSuccess(order as Order));
  } catch (err) {
    yield put(updateStatusFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminOrdersSaga() {
  yield takeLatest(fetchListRequest.type, fetchListWorker);
  yield takeLatest(fetchDetailRequest.type, fetchDetailWorker);
  yield takeLatest(updateStatusRequest.type, updateStatusWorker);
}
