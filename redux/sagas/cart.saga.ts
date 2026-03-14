import { call, put, takeLatest } from 'redux-saga/effects';
import * as cartApi from '@/lib/api/cart.service';
import {
  fetchCartRequest,
  fetchCartSuccess,
  fetchCartFailure,
  addItemRequest,
  addItemSuccess,
  addItemFailure,
  updateItemRequest,
  updateItemSuccess,
  removeItemRequest,
  removeItemSuccess,
  applyDiscountRequest,
  applyDiscountSuccess,
  applyDiscountFailure,
} from '../slices/cart.slice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AddCartItemPayload } from '@/types/cart';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

function* fetchCartWorker(): Generator<unknown> {
  try {
    const cart = yield call(cartApi.fetchCart);
    yield put(fetchCartSuccess(cart as Awaited<ReturnType<typeof cartApi.fetchCart>>));
  } catch (err) {
    yield put(fetchCartFailure(extractErrorMessage(err as object).message));
  }
}

function* addItemWorker(action: PayloadAction<AddCartItemPayload>): Generator<unknown> {
  try {
    const cart = yield call(cartApi.addCartItem, action.payload);
    yield put(addItemSuccess(cart as Awaited<ReturnType<typeof cartApi.addCartItem>>));
  } catch (err) {
    yield put(addItemFailure(extractErrorMessage(err as object).message));
  }
}

function* updateItemWorker(action: PayloadAction<{ itemId: string | number; quantity: number }>): Generator<unknown> {
  try {
    const cart = yield call(cartApi.updateCartItem, action.payload.itemId, { quantity: action.payload.quantity });
    yield put(updateItemSuccess(cart as Awaited<ReturnType<typeof cartApi.updateCartItem>>));
  } catch (err) {
    yield put(fetchCartFailure(extractErrorMessage(err as object).message));
  }
}

function* removeItemWorker(action: PayloadAction<string | number>): Generator<unknown> {
  try {
    const cart = yield call(cartApi.removeCartItem, action.payload);
    yield put(removeItemSuccess(cart as Awaited<ReturnType<typeof cartApi.removeCartItem>>));
  } catch (err) {
    yield put(fetchCartFailure(extractErrorMessage(err as object).message));
  }
}

function* applyDiscountWorker(action: PayloadAction<string>): Generator<unknown> {
  try {
    const cart = yield call(cartApi.applyDiscountCode, action.payload);
    yield put(applyDiscountSuccess(cart as Awaited<ReturnType<typeof cartApi.applyDiscountCode>>));
  } catch (err) {
    yield put(applyDiscountFailure(extractErrorMessage(err as object).message));
  }
}

export function* cartSaga() {
  yield takeLatest(fetchCartRequest.type, fetchCartWorker);
  yield takeLatest(addItemRequest.type, addItemWorker);
  yield takeLatest(updateItemRequest.type, updateItemWorker);
  yield takeLatest(removeItemRequest.type, removeItemWorker);
  yield takeLatest(applyDiscountRequest.type, applyDiscountWorker);
}
