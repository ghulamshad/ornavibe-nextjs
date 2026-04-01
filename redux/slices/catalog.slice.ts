import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product, Category, ProductListParams } from '@/types/catalog';
import type { HeaderNavCategoryRoot } from '@/lib/headerNavFromCategories';

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
  /** Hash of last successful `fetchProducts` params (for cache). */
  productsCacheKey: string;
  /** Header mega-menu: `GET /categories?header_nav=1` */
  headerNavRoots: HeaderNavCategoryRoot[];
  headerNavLoading: boolean;
  headerNavError: string | null;
  headerNavLastFetchedAt: number | null;
  /** Typeahead results (does not mutate `products`). */
  searchPreviewResults: Product[];
  searchPreviewLoading: boolean;
  /** Query that `searchPreviewResults` belong to. */
  searchPreviewQuery: string;
  /** Incremented on clear; stale search responses are ignored. */
  searchPreviewGeneration: number;
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
  productsCacheKey: '',
  headerNavRoots: [],
  headerNavLoading: false,
  headerNavError: null,
  headerNavLastFetchedAt: null,
  searchPreviewResults: [],
  searchPreviewLoading: false,
  searchPreviewQuery: '',
  searchPreviewGeneration: 0,
};

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    fetchProductsRequest(state, _action: PayloadAction<ProductListParams | undefined>) {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess(
      state,
      action: PayloadAction<{ products: Product[]; cacheKey: string }>
    ) {
      state.products = action.payload.products;
      state.productsCacheKey = action.payload.cacheKey;
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
    fetchHeaderNavRequest(state) {
      state.headerNavLoading = true;
      state.headerNavError = null;
    },
    fetchHeaderNavSuccess(state, action: PayloadAction<HeaderNavCategoryRoot[]>) {
      state.headerNavRoots = action.payload;
      state.headerNavLoading = false;
      state.headerNavError = null;
      state.headerNavLastFetchedAt = Date.now();
    },
    fetchHeaderNavFailure(state, action: PayloadAction<string>) {
      state.headerNavLoading = false;
      state.headerNavError = action.payload;
    },
    productSearchPreviewRequest(state, _action: PayloadAction<string>) {
      state.searchPreviewLoading = true;
    },
    productSearchPreviewSuccess(
      state,
      action: PayloadAction<{ query: string; results: Product[]; genAtStart: number }>
    ) {
      if (action.payload.genAtStart !== state.searchPreviewGeneration) {
        return;
      }
      state.searchPreviewQuery = action.payload.query;
      state.searchPreviewResults = action.payload.results;
      state.searchPreviewLoading = false;
    },
    clearProductSearchPreview(state) {
      state.searchPreviewResults = [];
      state.searchPreviewLoading = false;
      state.searchPreviewQuery = '';
      state.searchPreviewGeneration += 1;
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
  fetchHeaderNavRequest,
  fetchHeaderNavSuccess,
  fetchHeaderNavFailure,
  productSearchPreviewRequest,
  productSearchPreviewSuccess,
  clearProductSearchPreview,
  clearProductDetail,
} = catalogSlice.actions;
export default catalogSlice.reducer;
