'use client';

import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Skeleton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { logout } from "@/redux/slices/auth.slice";
import { usePublicSiteBranding } from "@/hooks/usePublicSiteBranding";

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarWidth?: number;
}

export default function AdminHeader({ onMenuClick, sidebarWidth = 280 }: AdminHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const branding = usePublicSiteBranding();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('guest_cart_token');
      window.location.href = '/auth/login';
    } else {
      router.replace('/auth/login');
    }
  };

  const handleSettings = () => {
    router.push('/admin/settings');
    handleClose();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          ml: { xs: 0, md: `${sidebarWidth}px` },
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, minWidth: 0 }}>
            {branding ? (
              <Box
                component="img"
                src={branding.logoSrc}
                alt={branding.brandName}
                sx={{ height: 36, width: 'auto', maxWidth: 140, objectFit: 'contain', display: { xs: 'none', sm: 'block' } }}
              />
            ) : (
              <Skeleton variant="rounded" width={120} height={36} sx={{ display: { xs: 'none', sm: 'block' } }} />
            )}
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              {branding?.brandName ?? 'Admin'}
              <Typography component="span" variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'inline' }, ml: 1 }}>
                · Dashboard
              </Typography>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user?.email || 'Admin'}
            </Typography>
            <IconButton
              size="large"
              aria-label="account menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleSettings}>
                <SettingsIcon sx={{ mr: 1, fontSize: 20 }} />
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
}
