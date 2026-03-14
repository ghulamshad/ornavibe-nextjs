import { call, put, takeLatest } from 'redux-saga/effects';
import * as ordersApi from '@/lib/api/orders.service';
import {
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderDetailRequest,
  fetchOrderDetailSuccess,
  fetchOrderDetailFailure,
} from '../slices/orders.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/types/order';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchOrdersWorker(): Generator<unknown> {
  try {
    const data = yield call(ordersApi.fetchMyOrders);
    const list = Array.isArray(data) ? data : (data as { data?: Order[] }).data ?? [];
    yield put(fetchOrdersSuccess(list));
  } catch (err) {
    yield put(fetchOrdersFailure(extractErrorMessage(err as object).message));
  }
}

function* fetchOrderDetailWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const order = yield call(ordersApi.fetchOrderById, action.payload);
    yield put(fetchOrderDetailSuccess(order as Order));
  } catch (err) {
    yield put(fetchOrderDetailFailure(extractErrorMessage(err as object).message));
  }
}

export function* ordersSaga() {
  yield takeLatest(fetchOrdersRequest.type, fetchOrdersWorker);
  yield takeLatest(fetchOrderDetailRequest.type, fetchOrderDetailWorker);
}
