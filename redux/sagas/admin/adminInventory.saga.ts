import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchAdminInventory, type AdminInventoryParams } from '@/lib/api/admin.service';
import {
  fetchListRequest,
  fetchListSuccess,
  fetchListFailure,
} from '../../slices/admin/adminInventory.slice';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchListWorker(
  action: {
    type: string;
    payload?: {
      page?: number;
      per_page?: number;
      search?: string;
      category_id?: string | null;
      stock_filter?: string;
    };
  }
): Generator<unknown> {
  try {
    const p = action.payload;
    const params: AdminInventoryParams | undefined = p
      ? {
          page: p.page,
          per_page: p.per_page,
          search: p.search,
          category_id: p.category_id,
          stock_filter: p.stock_filter as AdminInventoryParams['stock_filter'],
        }
      : undefined;
    const result = yield call(fetchAdminInventory, params);
    yield put(
      fetchListSuccess({
        data: (result as Awaited<ReturnType<typeof fetchAdminInventory>>).data,
        meta: (result as Awaited<ReturnType<typeof fetchAdminInventory>>).meta,
        threshold: (result as Awaited<ReturnType<typeof fetchAdminInventory>>).threshold,
      })
    );
  } catch (err) {
    yield put(fetchListFailure(extractErrorMessage(err as object).message));
  }
}

export function* adminInventorySaga() {
  yield takeLatest(fetchListRequest.type, fetchListWorker);
}
