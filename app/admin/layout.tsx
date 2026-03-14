'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import { ToastProvider } from '@/components/common/Toast';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminLayout>{children}</AdminLayout>
    </ToastProvider>
  );
}
