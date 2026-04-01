import { call, put, select, takeLatest } from 'redux-saga/effects';
import { fetchSiteContent } from '@/lib/api/site.service';
import { fetchSiteContentRequest, fetchSiteContentSuccess, fetchSiteContentFailure } from '../slices/site.slice';
import type { RootState } from '../store';
import type { SiteContent } from '@/lib/api/site.service';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

const SITE_CONTENT_TTL_MS = 300_000;

function* fetchSiteContentWorker(): Generator {
  try {
    const state: RootState = (yield select()) as RootState;
    const { content, lastFetchedAt } = state.site;
    const now = Date.now();
    const isFresh =
      content != null &&
      typeof lastFetchedAt === 'number' &&
      now - lastFetchedAt < SITE_CONTENT_TTL_MS;

    if (isFresh) {
      yield put(fetchSiteContentSuccess(content as SiteContent));
      return;
    }

    const data = yield call(fetchSiteContent);
    yield put(fetchSiteContentSuccess(data as SiteContent));
  } catch (err) {
    yield put(fetchSiteContentFailure(extractErrorMessage(err as object).message));
  }
}

export function* siteSaga() {
  yield takeLatest(fetchSiteContentRequest.type, fetchSiteContentWorker);
}
