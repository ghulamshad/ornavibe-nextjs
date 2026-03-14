import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchAdminCustomers, type AdminCustomersParams } from '@/lib/api/admin.service';
import { fetchListRequest, fetchListSuccess, fetchListFailure } from '../../slices/admin/adminCustomers.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AdminCustomer } from '@/types/admin';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchListWorker(
  action: PayloadAction<{
    page?: number;
    per_page?: number;
    email?: string;
    name?: string;
    date_from?: string;
    date_to?: string;
  } | undefined>
): Generator<unknown> {
  try {
    const params: AdminCustomersParams | undefined = action.payload
      ? {
          page: action.payload.page,
          per_page: action.payload.per_page,
          email: action.payload.email,
          name: action.payload.name,
          date_from: action.payload.date_from,
          date_to: action.payload.date_to,
        }
      : undefined;
    const result = yield call(fetchAdminCustomers, params);
    const data = (result as { data?: AdminCustomer[] }).data ?? [];
    const meta = (result as { meta?: { current_page: number; last_page: number; per_page: number; total: number } }).meta;
    yield put(fetchListSuccess({ data, meta }));
  } catch (err) {
    yield put(fetchListFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminCustomersSaga() {
  yield takeLatest(fetchListRequest.type, fetchListWorker);
}
