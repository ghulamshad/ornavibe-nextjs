/**
 * Ornavibe Redux slices — single source for root reducer.
 */
import authReducer from './auth.slice';
import catalogReducer from './catalog.slice';
import cartReducer from './cart.slice';
import checkoutReducer from './checkout.slice';
import ordersReducer from './orders.slice';
import reviewsReducer from './reviews.slice';
import wishlistReducer from './wishlist.slice';
import adminDashboardReducer from './admin/adminDashboard.slice';
import adminCategoriesReducer from './admin/adminCategories.slice';
import adminProductsReducer from './admin/adminProducts.slice';
import adminOrdersReducer from './admin/adminOrders.slice';
import adminPaymentsReducer from './admin/adminPayments.slice';
import adminCustomersReducer from './admin/adminCustomers.slice';
import adminInventoryReducer from './admin/adminInventory.slice';
import adminSettingsReducer from './admin/adminSettings.slice';
import adminPagesReducer from './admin/adminPages.slice';

export const reducers = {
  auth: authReducer,
  catalog: catalogReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
  orders: ordersReducer,
  reviews: reviewsReducer,
  wishlist: wishlistReducer,
  adminDashboard: adminDashboardReducer,
  adminCategories: adminCategoriesReducer,
  adminProducts: adminProductsReducer,
  adminOrders: adminOrdersReducer,
  adminPayments: adminPaymentsReducer,
  adminCustomers: adminCustomersReducer,
  adminInventory: adminInventoryReducer,
  adminSettings: adminSettingsReducer,
  adminPages: adminPagesReducer,
};
