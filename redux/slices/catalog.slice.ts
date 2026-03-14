import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product, Category } from '@/types/catalog';

export interface CatalogState {
  products: Product[];
  productDetail: Product | null;
  categories: Category[];
  loading: boolean;
  categoriesLoading: boolean;
  detailLoading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  categoriesLastFetchedAt: number | null;
}

const initialState: CatalogState = {
  products: [],
  productDetail: null,
  categories: [],
  loading: false,
  categoriesLoading: false,
  detailLoading: false,
  error: null,
  lastFetchedAt: null,
  categoriesLastFetchedAt: null,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    fetchProductsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetchedAt = Date.now();
    },
    fetchProductsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchProductDetailRequest(state, _action: PayloadAction<string | number>) {
      state.detailLoading = true;
      state.error = null;
    },
    fetchProductDetailSuccess(state, action: PayloadAction<Product>) {
      state.productDetail = action.payload;
      state.detailLoading = false;
      state.error = null;
    },
    fetchProductDetailFailure(state, action: PayloadAction<string>) {
      state.detailLoading = false;
      state.error = action.payload;
    },
    fetchCategoriesRequest(state) {
      state.categoriesLoading = true;
      state.error = null;
    },
    fetchCategoriesSuccess(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
      state.categoriesLoading = false;
      state.error = null;
      state.categoriesLastFetchedAt = Date.now();
    },
    fetchCategoriesFailure(state, action: PayloadAction<string>) {
      state.categoriesLoading = false;
      state.error = action.payload;
    },
    clearProductDetail(state) {
      state.productDetail = null;
    },
  },
});

export const {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  fetchProductDetailRequest,
  fetchProductDetailSuccess,
  fetchProductDetailFailure,
  fetchCategoriesRequest,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  clearProductDetail,
} = catalogSlice.actions;
export default catalogSlice.reducer;
