/**
 * Ornavibe auth types — aligned with Laravel JWT API.
 * Single-tenant B2C: customer | admin (optional super_admin for installer).
 */

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
}

export interface ForgotPayload {
  email: string;
}

export interface ResetPayload {
  /** Password reset token from email link */
  token: string;
  /** Email associated with the reset request (Laravel expects email + token) */
  email?: string;
  /** New password */
  password: string;
  /** Confirmation of new password */
  confirmPassword: string;
  /** Optional uid for compatibility with existing reset links; backend ignores this */
  uid?: string;
}

export type UserRole = 'customer' | 'admin' | 'super_admin';

export interface User {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  permissions?: string[];
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export interface LoginRegisterResponse {
  access: string;
  refresh?: string;
  user: User;
}
