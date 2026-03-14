import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, RegisterPayload, LoginPayload } from '@/types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error?: string;

  // Registration state
  registerLoading: boolean;
  registerError?: string;
  registerSuccess?: string;

  // Forgot / Reset password states
  forgotLoading: boolean;
  forgotError?: string;
  forgotSuccess?: string;

  resetLoading: boolean;
  resetError?: string;
  resetSuccess?: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,

  registerLoading: false,
  forgotLoading: false,
  resetLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ---------------- LOGIN ---------------- 
    loginRequest(state, action: PayloadAction<LoginPayload>) {
      state.loading = true;
      state.error = undefined;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // ---------------- LOGOUT ---------------- 
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = undefined;
    },

    // ---------------- REGISTRATION ---------------- 
    registerRequest(state, action: PayloadAction<RegisterPayload>) {
      state.registerLoading = true;
      state.registerError = undefined;
      state.registerSuccess = undefined;
    },
    registerSuccess(state, action: PayloadAction<User | string>) {
      state.registerLoading = false;
      // Do NOT auto-authenticate on register; user must log in explicitly.
      if (typeof action.payload === "string") {
        state.registerSuccess = action.payload;
      } else {
        state.registerSuccess = "Registration successful. Please sign in.";
      }
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.registerLoading = false;
      state.registerError = action.payload;
    },

    // ---------------- FORGOT PASSWORD ---------------- 
    forgotPasswordRequest(state) {
      state.forgotLoading = true;
      state.forgotError = undefined;
      state.forgotSuccess = undefined;
    },
    forgotPasswordSuccess(state, action: PayloadAction<string>) {
      state.forgotLoading = false;
      state.forgotSuccess = action.payload;
    },
    forgotPasswordFailure(state, action: PayloadAction<string>) {
      state.forgotLoading = false;
      state.forgotError = action.payload;
    },

    // ---------------- RESET PASSWORD ---------------- 
    resetPasswordRequest(state) {
      state.resetLoading = true;
      state.resetError = undefined;
      state.resetSuccess = undefined;
    },
    resetPasswordSuccess(state, action: PayloadAction<string>) {
      state.resetLoading = false;
      state.resetSuccess = action.payload;
    },
    resetPasswordFailure(state, action: PayloadAction<string>) {
      state.resetLoading = false;
      state.resetError = action.payload;
    },

    // ---------------- CHECK AUTH ---------------- 
    checkAuth(state) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
          state.isAuthenticated = true;
        }
      }
    },
    // ---------------- FETCH ME (RBAC permissions) ---------------- 
    fetchMeRequest(state) {
      state.loading = true;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.loading = false;
    },
    fetchMeFailure(state) {
      state.loading = false;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  logout,
  registerRequest,
  registerSuccess,
  registerFailure,
  forgotPasswordRequest,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordRequest,
  resetPasswordSuccess,
  resetPasswordFailure,
  checkAuth,
  fetchMeRequest,
  setUser,
  fetchMeFailure,
} = authSlice.actions;

export default authSlice.reducer;
