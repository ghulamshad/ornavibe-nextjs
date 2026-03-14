/**
 * Auth selectors — Ornavibe (customer | admin | super_admin).
 */
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';

const selectAuthState = (state: RootState) => state.auth;
const selectUser = (state: RootState) => state.auth.user;
const selectUserPermissions = (state: RootState) => state.auth.user?.permissions ?? [];
const selectUserRole = (state: RootState) => state.auth.user?.role;

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === 'admin' || role === 'super_admin'
);

export const selectHasPermission = createSelector(
  [selectUserPermissions, (_state: RootState, permission: string) => permission],
  (permissions, permission) => permissions.includes(permission)
);

export const makeSelectHasPermission = () =>
  createSelector(
    [selectUserPermissions, (_state: RootState, permission: string) => permission],
    (permissions, permission) => permissions.includes(permission)
  );

export { selectAuthState, selectUser, selectUserPermissions, selectUserRole };
