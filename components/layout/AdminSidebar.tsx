'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
  Toolbar,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Inventory2 as ProductsIcon,
  WarningAmber as InventoryAlertIcon,
  Category as CategoryIcon,
  ShoppingBag as OrdersIcon,
  Payment as PaymentIcon,
  People as CustomersIcon,
  Description as PagesIcon,
  Settings as SettingsIcon,
  Store as StoreIcon,
} from '@mui/icons-material';

export const drawerWidth = 280;
export const drawerWidthCollapsed = 64;

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

const ORNAVIBE_NAV_ITEMS: NavItem[] = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { title: 'Products', path: '/admin/products', icon: <ProductsIcon /> },
  { title: 'Categories', path: '/admin/categories', icon: <CategoryIcon /> },
  { title: 'Orders', path: '/admin/orders', icon: <OrdersIcon /> },
  { title: 'Payments', path: '/admin/payments', icon: <PaymentIcon /> },
  { title: 'Inventory', path: '/admin/inventory', icon: <InventoryAlertIcon /> },
  { title: 'Customers', path: '/admin/customers', icon: <CustomersIcon /> },
  { title: 'Landing', path: '/admin/landing', icon: <StoreIcon /> },
  // Legacy static/legal pages (Terms, Privacy, Cookies)
  { title: 'Legal pages', path: '/admin/pages', icon: <PagesIcon /> },
  // New headless CMS modules
  { title: 'CMS: Pages', path: '/admin/cms/pages', icon: <PagesIcon /> },
  { title: 'CMS: Blog', path: '/admin/cms/blog', icon: <PagesIcon /> },
  { title: 'CMS: Campaigns', path: '/admin/cms/campaigns', icon: <PagesIcon /> },
  { title: 'CMS: Media', path: '/admin/cms/media', icon: <PagesIcon /> },
  { title: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
];

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  open?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
  open = true,
  onToggle,
}: AdminSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname?.startsWith(path);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          minHeight: '64px !important',
          display: 'flex',
          justifyContent: open ? 'space-between' : 'center',
          alignItems: 'center',
          px: open ? 2 : 1,
        }}
      >
        {open && (
          <>
            <Typography variant="h6" noWrap component="div" fontWeight="bold">
              Ornavibe
            </Typography>
            <Typography variant="caption" sx={{ ml: 1, opacity: 0.8 }}>
              Rason Business · Admin
            </Typography>
          </>
        )}
        {!isMobile && onToggle && (
          <IconButton
            onClick={onToggle}
            sx={{ color: theme.palette.primary.contrastText, ml: open ? 'auto' : 0 }}
            aria-label="Toggle sidebar"
          >
            {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ pt: 1, flexGrow: 1, overflowY: 'auto' }}>
        {ORNAVIBE_NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <ListItemButton
                selected={active}
                onClick={() => isMobile && onMobileClose()}
                sx={{
                  py: 1.5,
                  pl: open ? 2.5 : 1.5,
                  justifyContent: open ? 'flex-start' : 'center',
                  backgroundColor: active ? theme.palette.action.selected : 'transparent',
                  borderLeft: active
                    ? `3px solid ${theme.palette.primary.main}`
                    : '3px solid transparent',
                  '&:hover': { backgroundColor: theme.palette.action.hover },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    '&:hover': { backgroundColor: theme.palette.action.selected },
                  },
                }}
                title={!open ? item.title : ''}
              >
                <ListItemIcon
                  sx={{
                    minWidth: open ? 40 : 0,
                    justifyContent: 'center',
                    color: active ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.95rem',
                      color: active ? theme.palette.primary.main : 'inherit',
                    }}
                  />
                )}
              </ListItemButton>
            </Link>
          );
        })}
      </List>
      {open && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Link
            href="/"
            style={{ textDecoration: 'none', color: theme.palette.text.secondary, fontSize: '0.875rem' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <StoreIcon fontSize="small" />
              View store
            </Box>
          </Link>
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: open ? drawerWidth : drawerWidthCollapsed }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <IconButton onClick={onMobileClose} size="small" aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Box>
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: open ? drawerWidth : drawerWidthCollapsed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: open ? drawerWidth : drawerWidthCollapsed,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
