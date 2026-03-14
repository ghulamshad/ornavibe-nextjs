'use client';

import React, { ReactNode, Suspense, useEffect, useState } from "react";
import { Box, CssBaseline, CircularProgress, useTheme, useMediaQuery } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import AdminSidebar, { drawerWidth, drawerWidthCollapsed } from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import Loading from "@/components/common/Loading";
import ReduxProvider from "@/redux/provider";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { checkAuth, fetchMeRequest } from "@/redux/slices/auth.slice";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const themeObj = useTheme();
  const isMobile = useMediaQuery(themeObj.breakpoints.down('md'));
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Fetch current user with permissions for RBAC-aware sidebar (e.g. after refresh when persisted user may lack permissions)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token && isAuthenticated && (!user?.permissions || user.permissions.length === 0)) {
      dispatch(fetchMeRequest());
    }
  }, [isAuthenticated, user?.permissions, dispatch]);

  // Only admin and super_admin can access admin panel; customer redirect to storefront
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === 'customer') {
      router.replace('/');
      return;
    }
  }, [user, loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        router.push('/auth/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarWidth = sidebarOpen ? drawerWidth : drawerWidthCollapsed;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <CssBaseline />
      <AdminHeader onMenuClick={handleDrawerToggle} sidebarWidth={sidebarWidth} />
      <AdminSidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={() => setMobileOpen(false)}
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          ml: { xs: 0, md: `${sidebarWidth}px` },
          mt: '64px',
          p: { xs: 2, sm: 3, md: 4 },
          backgroundColor: themeObj.palette.background.default,
          transition: themeObj.transitions.create(['width', 'margin'], {
            easing: themeObj.transitions.easing.sharp,
            duration: themeObj.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Suspense fallback={<Loading />}>
          {children}
        </Suspense>
      </Box>
    </Box>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ReduxProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <AdminLayoutContent>{children}</AdminLayoutContent>
        </ErrorBoundary>
      </ThemeProvider>
    </ReduxProvider>
  );
}
