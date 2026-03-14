import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { persistStore, persistReducer } from "redux-persist";
import storage from "./storage";
 // localStorage
// import { reducers } from "./slices";
import rootSaga from "./sagas";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";

// Saga middleware
const sagaMiddleware = createSagaMiddleware();

// Persist config for auth slice
import authReducer from "./slices/auth.slice";
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "isAuthenticated"],
};
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Combine reducers
import { reducers } from "./slices";

const { auth, ...otherReducers } = reducers;
const rootReducer = {
  auth: persistedAuthReducer,
  ...otherReducers,
};

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefault) =>
    getDefault({
      thunk: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['_persist'],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Run root saga
sagaMiddleware.run(rootSaga);

// Persistor (must export!)
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
