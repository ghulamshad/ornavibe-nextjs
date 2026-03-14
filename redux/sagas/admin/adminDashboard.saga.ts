import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchDashboardStats } from '@/lib/api/admin.service';
import { fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure } from '../../slices/admin/adminDashboard.slice';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchStatsWorker(): Generator<unknown> {
  try {
    const stats = yield call(fetchDashboardStats);
    yield put(fetchStatsSuccess(stats as Awaited<ReturnType<typeof fetchDashboardStats>>));
  } catch (err) {
    yield put(fetchStatsFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminDashboardSaga() {
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
