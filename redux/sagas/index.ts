/**
 * Ornavibe root saga — single entry for all domain sagas.
 */
import { all, fork } from 'redux-saga/effects';
import { authSaga } from './auth.saga';
import { catalogSaga } from './catalog.saga';
import { cartSaga } from './cart.saga';
import { checkoutSaga } from './checkout.saga';
import { ordersSaga } from './orders.saga';
import { reviewsSaga } from './reviews.saga';
import { wishlistSaga } from './wishlist.saga';
import { siteSaga } from './site.saga';
import { adminDashboardSaga } from './admin/adminDashboard.saga';
import { adminCategoriesSaga } from './admin/adminCategories.saga';
import { adminProductsSaga } from './admin/adminProducts.saga';
import { adminOrdersSaga } from './admin/adminOrders.saga';
import { adminPaymentsSaga } from './admin/adminPayments.saga';
import { adminCustomersSaga } from './admin/adminCustomers.saga';
import { adminInventorySaga } from './admin/adminInventory.saga';
import { adminSettingsSaga } from './admin/adminSettings.saga';
import { adminPagesSaga } from './admin/adminPages.saga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(catalogSaga),
    fork(cartSaga),
    fork(checkoutSaga),
    fork(ordersSaga),
    fork(reviewsSaga),
    fork(wishlistSaga),
    fork(siteSaga),
    fork(adminDashboardSaga),
    fork(adminCategoriesSaga),
    fork(adminProductsSaga),
    fork(adminOrdersSaga),
    fork(adminPaymentsSaga),
    fork(adminCustomersSaga),
    fork(adminInventorySaga),
    fork(adminSettingsSaga),
    fork(adminPagesSaga),
  ]);
}
