'use client';

import { useEffect } from 'react';
import { getCsrfCookie } from '@/lib/api/axios';

/** Fetches Laravel Sanctum CSRF cookie on app load so login, add-to-cart, etc. do not get 419. */
export default function CsrfPrefetch() {
  useEffect(() => {
    getCsrfCookie().catch(() => {
      // Ignore (e.g. API down); 419 handler will retry on first mutation
    });
  }, []);
  return null;
}
