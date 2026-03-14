import { call, put, takeLatest } from 'redux-saga/effects';
import { createOrder } from '@/lib/api/orders.service';
import { placeOrderRequest, placeOrderSuccess, placeOrderFailure } from '../slices/checkout.slice';
import { clearCart } from '../slices/cart.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CreateOrderPayload } from '@/types/order';
import type { Order } from '@/types/order';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

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
  yield takeLatest(placeOrderRequest.type, placeOrderWorker);
}
