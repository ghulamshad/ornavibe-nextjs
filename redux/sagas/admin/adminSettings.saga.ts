import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchSettings, updateSettings } from '@/lib/api/admin.service';
import { fetchRequest, fetchSuccess, fetchFailure, updateRequest, updateSuccess, updateFailure } from '../../slices/admin/adminSettings.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AdminSettings } from '@/types/admin';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchWorker(): Generator<unknown> {
  try {
    const settings = yield call(fetchSettings);
    yield put(fetchSuccess(settings as AdminSettings));
  } catch (err) {
    yield put(fetchFailure(extractErrorMessage(err as object).message));
  }
}

function* updateWorker(action: PayloadAction<Partial<AdminSettings>>): Generator<unknown> {
  try {
    const settings = yield call(updateSettings, action.payload);
    yield put(updateSuccess(settings as AdminSettings));
  } catch (err) {
    yield put(updateFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminSettingsSaga() {
  yield takeLatest(fetchRequest.type, fetchWorker);
  yield takeLatest(updateRequest.type, updateWorker);
}
