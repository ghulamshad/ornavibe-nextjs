import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Order } from '@/types/order';

export interface OrdersState {
  list: Order[];
  detail: Order | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  list: [],
  detail: null,
  loading: false,
  detailLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    fetchOrdersRequest(state) {
      state.loading = true;
    },
    fetchOrdersSuccess(state, action: PayloadAction<Order[]>) {
      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchOrdersFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchOrderDetailRequest(state, _action: PayloadAction<string | number>) {
      state.detailLoading = true;
    },
    fetchOrderDetailSuccess(state, action: PayloadAction<Order>) {
      state.detail = action.payload;
      state.detailLoading = false;
      state.error = null;
    },
    fetchOrderDetailFailure(state, action: PayloadAction<string>) {
      state.detailLoading = false;
      state.error = action.payload;
    },
    clearOrderDetail(state) {
      state.detail = null;
    },
  },
});

export const {
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderDetailRequest,
  fetchOrderDetailSuccess,
  fetchOrderDetailFailure,
  clearOrderDetail,
} = ordersSlice.actions;
export default ordersSlice.reducer;
