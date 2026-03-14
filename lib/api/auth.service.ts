/**
 * Ornavibe auth API — Laravel JWT.
 * Endpoints: login, register, refresh, forgot-password, reset-password, me.
 */
import api from './axios';
import type { LoginPayload, RegisterPayload, ForgotPayload, ResetPayload, User } from '@/types/auth';

const AUTH_PREFIX = '/api/v1/auth';

export const loginAPI = async (payload: LoginPayload) => {
  const response = await api.post(`${AUTH_PREFIX}/login`, {
    email: payload.email,
    password: payload.password,
  });
  const data = response.data;
  if (data.access && typeof window !== 'undefined') {
    localStorage.setItem('access_token', data.access);
    if (data.refresh) {
      localStorage.setItem('refresh_token', data.refresh);
    }
  }
  return data;
};

export const registerAPI = async (payload: RegisterPayload) => {
  const response = await api.post(`${AUTH_PREFIX}/register`, {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.password_confirmation ?? payload.password,
  });
  const data = response.data;
  return data;
};

export const forgotPasswordAPI = async (payload: ForgotPayload) => {
  const response = await api.post(`${AUTH_PREFIX}/forgot-password`, { email: payload.email });
  return response.data;
};

export const resetPasswordAPI = async (payload: ResetPayload) => {
  const response = await api.post(`${AUTH_PREFIX}/reset-password`, {
    token: payload.token,
    email: payload.email,
    password: payload.password,
    password_confirmation: payload.confirmPassword,
  });
  return response.data;
};

/** Current user profile. Laravel: GET /api/v1/me */
export const getMeAPI = async (): Promise<User> => {
  const response = await api.get('/api/v1/me');
  return response.data;
};
