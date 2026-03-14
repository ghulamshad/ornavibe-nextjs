import { call, put, takeLatest } from "redux-saga/effects";
import {
  loginAPI,
  registerAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
  getMeAPI,
} from "@/lib/api/auth.service";
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  registerRequest,
  registerSuccess,
  registerFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  logout,
  fetchMeRequest,
  setUser,
  fetchMeFailure,
} from "../slices/auth.slice";
import { PayloadAction } from "@reduxjs/toolkit";
import type { LoginPayload, RegisterPayload, ForgotPayload, ResetPayload, User } from '@/types/auth';
import { extractErrorMessage } from "@/lib/utils/errorHandler";

/** ---------------- LOGIN ---------------- */
function* loginWorker(action: PayloadAction<LoginPayload>): Generator<any> {
  try {
    // loginAPI returns response.data (body: { access, refresh, user })
    const data: any = yield call(loginAPI, action.payload);
    if (data?.access) {
      const userData: User = data.user ?? {
        id: 0,
        email: action.payload.email,
        role: 'customer',
      };
      yield put(loginSuccess(userData));
    } else {
      yield put(loginFailure("Invalid response from server"));
    }
  } catch (err: any) {
    const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || "Login failed";
    yield put(loginFailure(errorMessage));
  }
}

/** ---------------- REGISTER ---------------- */
function* registerWorker(action: PayloadAction<RegisterPayload>): Generator<any> {
  try {
    // registerAPI returns response.data (the API body: { access, refresh, user, message })
    const data: any = yield call(registerAPI, action.payload);

    // Do not persist tokens or auto-login on register; require explicit login.
    if (data?.user) {
      yield put(registerSuccess(data.user));
    } else {
      yield put(registerSuccess('Registration successful. Please sign in.'));
    }
  } catch (err: any) {
    // Use enterprise-grade error extraction
    const extracted = extractErrorMessage(err);
    
    // Build comprehensive error message
    let errorMessage = extracted.message;
    
    // If we have field-specific errors, include them in the message for better UX
    if (extracted.fieldErrors && Object.keys(extracted.fieldErrors).length > 0) {
      // For registration, prioritize email errors
      if (extracted.fieldErrors.email) {
        errorMessage = extracted.fieldErrors.email;
      } else {
        // Combine field errors into readable message
        const fieldMessages = Object.entries(extracted.fieldErrors)
          .map(([field, msg]) => {
            // Format field name (e.g., 'first_name' -> 'First Name')
            const formattedField = field.split('_').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' ');
            return `${formattedField}: ${msg}`;
          })
          .join('; ');
        errorMessage = `${errorMessage}. ${fieldMessages}`;
      }
    }
    
    yield put(registerFailure(errorMessage));
  }
}

/** ---------------- FORGOT PASSWORD ---------------- */
function* forgotPasswordWorker(action: PayloadAction<ForgotPayload>): Generator<unknown> {
  try {
    const response: unknown = yield call(forgotPasswordAPI, action.payload);
    const msg = (response as { message?: string })?.message ?? 'Password reset email sent';
    yield put(forgotPasswordSuccess(msg));
  } catch (err: unknown) {
    const extracted = extractErrorMessage(err as Parameters<typeof extractErrorMessage>[0]);
    yield put(forgotPasswordFailure(extracted.message));
  }
}

/** ---------------- RESET PASSWORD ---------------- */
function* resetPasswordWorker(action: PayloadAction<ResetPayload>): Generator<unknown> {
  try {
    yield call(resetPasswordAPI, action.payload);
    yield put(resetPasswordSuccess('Password reset successfully'));
  } catch (err: unknown) {
    const extracted = extractErrorMessage(err as Parameters<typeof extractErrorMessage>[0]);
    yield put(resetPasswordFailure(extracted.message));
  }
}

/** ---------------- LOGOUT ---------------- */
function* logoutWorker(): Generator<any> {
  // Only side effects here; reducer already ran when logout was dispatched. Do not put(logout()) or we get an infinite loop.
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('guest_cart_token');
  }
}

/** ---------------- FETCH ME (user + permissions for RBAC) ---------------- */
function* fetchMeWorker(): Generator<any> {
  try {
    const me: User = yield call(getMeAPI);
    yield put(setUser(me));
  } catch (err: any) {
    yield put(fetchMeFailure());
  }
}

/** ---------------- WATCHERS ---------------- */
export function* authSaga() {
  yield takeLatest(loginRequest.type, loginWorker);
  yield takeLatest(registerRequest.type, registerWorker);
  yield takeLatest(forgotPasswordRequest.type, forgotPasswordWorker);
  yield takeLatest(resetPasswordRequest.type, resetPasswordWorker);
  yield takeLatest(logout.type, logoutWorker);
  yield takeLatest(fetchMeRequest.type, fetchMeWorker);
}
