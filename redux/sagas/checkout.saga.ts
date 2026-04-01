import { call, put, takeLatest } from 'redux-saga/effects';
import { createOrder, previewCheckout } from '@/lib/api/orders.service';
import {
  placeOrderSuccess,
  placeOrderFailure,
  previewCheckoutSuccess,
  previewCheckoutFailure,
} from '../slices/checkout.slice';
import type { CheckoutPreviewPayload } from '../slices/checkout.slice';
import { clearCart } from '../slices/cart.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CreateOrderPayload } from '@/types/order';
import type { Order } from '@/types/order';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

/** Must match `createSlice({ name: 'checkout' })` + reducer names (avoids init-order issues with `.type` during store bootstrap). */
const CHECKOUT_PREVIEW_REQUEST = 'checkout/previewCheckoutRequest';
const CHECKOUT_PLACE_ORDER_REQUEST = 'checkout/placeOrderRequest';

function* previewCheckoutWorker(action: PayloadAction<CheckoutPreviewPayload>): Generator<unknown> {
  try {
    const p = yield call(previewCheckout, action.payload);
    yield put(previewCheckoutSuccess(p as Awaited<ReturnType<typeof previewCheckout>>));
  } catch (err) {
    yield put(previewCheckoutFailure(extractErrorMessage(err as object).message));
  }
}

function* placeOrderWorker(action: PayloadAction<CreateOrderPayload>): Generator<unknown> {
  try {
    const order = yield call(createOrder, action.payload);
    const id = (order as Order).id;
    yield put(placeOrderSuccess(id));
    yield put(clearCart());
  } catch (err) {
    yield put(placeOrderFailure(extractErrorMessage(err as object).message));
  }
}

export function* checkoutSaga() {
  yield takeLatest(CHECKOUT_PREVIEW_REQUEST, previewCheckoutWorker);
  yield takeLatest(CHECKOUT_PLACE_ORDER_REQUEST, placeOrderWorker);
}
