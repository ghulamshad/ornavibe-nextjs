'use client';
import React, { useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/redux/store';
import { logout } from '@/redux/slices/auth.slice';

export default function LogoutPage() {
  const dispatch = useDispatch<AppDispatch>();
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current || typeof window === 'undefined') return;
    didRun.current = true;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('guest_cart_token');
    dispatch(logout());
    window.location.replace('/auth/login');
  }, [dispatch]);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );
}
