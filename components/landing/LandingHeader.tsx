'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Container,
  useTheme,
  useMediaQuery,
  IconButton,
  Popper,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  ShoppingCart as CartIcon,
  ExpandMore as ExpandMoreIcon,
  Facebook,
  Instagram,
  Twitter,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { logout } from '@/redux/slices/auth.slice';
import { useSiteContent } from '@/contexts/SiteContentContext';
import StoreMegaMenu from './StoreMegaMenu';

export default function LandingHeader() {
  const { footer, contact } = useSiteContent();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const shopButtonRef = useRef<HTMLButtonElement>(null);
  const shopZoneRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart.cart);
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const itemCount = cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;

  const handleShopZoneEnter = useCallback(() => setMegaMenuOpen(true), []);
  const handleShopZoneLeave = useCallback(() => setMegaMenuOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  return (
    <>
      {/* Top social / contact bar */}
      <Box
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.100',
          py: 0.5,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              fontSize: '0.8rem',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.8rem' }}>
              {contact?.email && (
                <Typography component="a" href={`mailto:${contact.email}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
                  {contact.email}
                </Typography>
              )}
              {contact?.phone && (
                <Typography component="a" href={`tel:${contact.phone}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
                  {contact.phone}
                </Typography>
              )}
              <Typography
                component={Link}
                href="/help"
                sx={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                Need Help?
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {(contact?.email || contact?.phone) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {contact.email && (
                    <Typography component="a" href={`mailto:${contact.email}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
                      {contact.email}
                    </Typography>
                  )}
                  {contact.phone && (
                    <Typography component="a" href={`tel:${contact.phone}`} sx={{ color: 'inherit', textDecoration: 'none' }}>
                      {contact.phone}
                    </Typography>
                  )}
                </Box>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ mr: 0.5 }}>
                  Follow us:
                </Typography>
                <Tooltip title="Facebook">
                  <IconButton size="small" color="inherit" sx={{ color: 'grey.100' }}>
                    <Facebook fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Instagram">
                  <IconButton size="small" color="inherit" sx={{ color: 'grey.100' }}>
                    <Instagram fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Twitter">
                  <IconButton size="small" color="inherit" sx={{ color: 'grey.100' }}>
                    <Twitter fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <AppBar
        position="fixed"
        elevation={scrolled ? 4 : 0}
        sx={{
          // Below top bar when at top of page; snap to very top on scroll
          top: { xs: 0, md: scrolled ? 0 : 32 },
          bgcolor: scrolled ? 'background.paper' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? theme.shadows[4] : 'none',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ py: 1 }}>
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.primary',
              mr: 4,
            }}
          >
            <Typography variant="h6" fontWeight="bold" component="span">
              {footer.brand}
            </Typography>
            <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8 }} component="span">
              {footer.company}
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                ref={shopZoneRef}
                onMouseEnter={handleShopZoneEnter}
                onMouseLeave={handleShopZoneLeave}
                sx={{ display: 'inline-flex' }}
              >
                <Button
                  ref={shopButtonRef}
                  endIcon={<ExpandMoreIcon sx={{ transform: megaMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  Shop
                </Button>
              </Box>
              <Button
                component={Link}
                href="/categories"
                sx={{
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                Categories
              </Button>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Button
              component={Link}
              href="/cart"
              startIcon={<CartIcon />}
              sx={{ textTransform: 'none', color: 'text.primary', fontWeight: 500 }}
            >
              Cart {itemCount > 0 ? `(${itemCount})` : ''}
            </Button>
            {!isAuthenticated || !user ? (
              <>
                <Button
                  component={Link}
                  href="/auth/login"
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href={user.role === 'customer' ? '/orders' : '/admin/dashboard'}
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    fontWeight: 500,
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {user.role === 'customer' ? 'My Orders' : 'Admin'}
                </Button>
                <Button
                  component={Link}
                  href="/auth/logout"
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    fontWeight: 500,
                  }}
                >
                  Logout
                </Button>
              </>
            )}

            {isMobile && (
              <IconButton onClick={() => setMobileMenuOpen(true)} sx={{ color: 'text.primary' }} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Desktop mega menu: Popper renders inside shop zone so one hover area */}
      {!isMobile && (
        <Popper
          open={megaMenuOpen}
          anchorEl={shopButtonRef.current}
          placement="bottom-start"
          disablePortal
          container={megaMenuOpen ? shopZoneRef.current : undefined}
          modifiers={[
            { name: 'offset', options: { offset: [0, 0] } },
            { name: 'flip', enabled: true },
            { name: 'preventOverflow', enabled: true },
          ]}
          sx={{ zIndex: theme.zIndex.appBar + 10 }}
          popperOptions={{
            strategy: 'fixed',
          }}
        >
          <Paper
            elevation={8}
            onMouseEnter={handleShopZoneEnter}
            onMouseLeave={handleShopZoneLeave}
            sx={{
              minWidth: 560,
              maxWidth: 720,
              maxHeight: '70vh',
              overflow: 'auto',
              borderRadius: 2,
              boxShadow: theme.shadows[8],
              mt: 0,
            }}
          >
            <StoreMegaMenu
              anchorEl={shopButtonRef.current}
              open={megaMenuOpen}
              onClose={() => setMegaMenuOpen(false)}
              variant="desktop"
              onNavClick={(href) => {
                handleNavClick(href);
                setMegaMenuOpen(false);
              }}
            />
          </Paper>
        </Popper>
      )}

      <Drawer anchor="right" open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <Box sx={{ width: 320, maxWidth: '85vw', pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Menu
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List disablePadding>
            <StoreMegaMenu
              anchorEl={null}
              open={false}
              onClose={() => setMobileMenuOpen(false)}
              variant="mobile"
              onNavClick={handleNavClick}
            />
            {navItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={() => handleNavClick(item.href)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/cart" onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary={`Cart ${itemCount > 0 ? `(${itemCount})` : ''}`} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary="Sign In" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                <ListItemText primary="Sign Up" primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      </AppBar>
    </>
  );
}
