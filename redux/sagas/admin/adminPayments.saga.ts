import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchAdminPayments,
  approveAdminPayment,
  rejectAdminPayment,
  type AdminPaymentsParams,
} from '@/lib/api/admin.service';
import {
  fetchListRequest,
  fetchListSuccess,
  fetchListFailure,
  approveRequest,
  approveSuccess,
  approveFailure,
  rejectRequest,
  rejectSuccess,
  rejectFailure,
} from '../../slices/admin/adminPayments.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AdminPaymentListItem } from '@/types/admin';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchListWorker(
  action: PayloadAction<{
    gateway?: string;
    status?: string;
    order_id?: string;
    date_from?: string;
    date_to?: string;
    external_id?: string;
    page?: number;
    per_page?: number;
  } | undefined>
): Generator<unknown> {
  try {
    const params: AdminPaymentsParams | undefined = action.payload
      ? {
          gateway: action.payload.gateway,
          status: action.payload.status,
          order_id: action.payload.order_id,
          date_from: action.payload.date_from,
          date_to: action.payload.date_to,
          external_id: action.payload.external_id,
          page: action.payload.page,
          per_page: action.payload.per_page,
        }
      : undefined;
    const result = yield call(fetchAdminPayments, params);
    const data = (result as { data?: AdminPaymentListItem[] }).data ?? [];
    const meta = (result as { meta?: { current_page: number; last_page: number; per_page: number; total: number } }).meta;
    yield put(fetchListSuccess({ data, meta }));
  } catch (err) {
    yield put(fetchListFailure(extractErrorMessage(err as object).message));
  }
}

function* approveWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const res = (yield call(approveAdminPayment, action.payload)) as unknown as { id: number; status: string };
    yield put(approveSuccess({ id: res.id, status: res.status }));
  } catch (err) {
    yield put(approveFailure(extractErrorMessage(err as object).message));
  }
}

function* rejectWorker(
  action: PayloadAction<{ paymentId: string | number; reason?: string }>
): Generator<unknown> {
  try {
    const { paymentId, reason } = action.payload;
    const res = (yield call(rejectAdminPayment, paymentId, reason)) as unknown as { id: number; status: string };
    yield put(rejectSuccess({ id: res.id, status: res.status }));
  } catch (err) {
    yield put(rejectFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminPaymentsSaga() {
  yield takeLatest(fetchListRequest.type, fetchListWorker);
  yield takeLatest(approveRequest.type, approveWorker);
  yield takeLatest(rejectRequest.type, rejectWorker);
}
