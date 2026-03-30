'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Collapse,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  FavoriteBorder as WishlistIcon,
  ShoppingCartOutlined as CartIcon,
  PersonOutline as PersonIcon,
  Close as CloseIcon,
  ExpandMore,
  ExpandLess,
  Facebook,
  Pinterest,
  Instagram,
  YouTube,
  MusicNote,
  KeyboardArrowDown,
  Twitter,
  Link as LinkIconMui,
} from '@mui/icons-material';
import { fetchHeaderNavCategories } from '@/lib/api/catalog.service';
import { categoriesToNavItems, HEADER_NAV_FALLBACK, type NavItem } from '@/lib/headerNavFromCategories';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveStoreLogoSrc } from '@/lib/utils/branding';

const TOPBAR_HEIGHT = 42;
const HEADER_HEIGHT = 76;

function topbarSocialIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes('facebook')) return <Facebook fontSize="small" />;
  if (l.includes('pinterest')) return <Pinterest fontSize="small" />;
  if (l.includes('instagram')) return <Instagram fontSize="small" />;
  if (l.includes('youtube')) return <YouTube fontSize="small" />;
  if (l.includes('tiktok')) return <MusicNote fontSize="small" />;
  if (l.includes('twitter') || l.includes('x.com')) return <Twitter fontSize="small" />;
  return <LinkIconMui fontSize="small" />;
}

function MegaPanel({ item }: { item: NavItem }) {
  const panelTheme = useTheme();
  const gridTemplate = item.blocks?.some((b) => (b.span ?? 0) > 0)
    ? 'repeat(12, minmax(0, 1fr))'
    : `repeat(${Math.max(1, Math.min(5, item.blocks?.length || 1))}, minmax(170px, 1fr))`;

  return (
    <Paper elevation={5} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="xl" sx={{ py: 2.25 }}>
        <Box
          sx={{
            width: item.megaWidth ? `${item.megaWidth}px` : '100%',
            maxWidth: '100%',
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            gap: 2,
          }}
        >
          {item.blocks?.map((block, idx) => (
            <Box key={`${item.label}-${idx}`} sx={{ gridColumn: block.span ? `span ${block.span}` : undefined }}>
              {block.type === 'links' ? (
                <>
                  {block.heading && (
                    <Typography sx={{ fontWeight: 800, mb: 1.2, fontSize: '0.95rem' }}>
                      {block.heading}
                    </Typography>
                  )}
                  <List dense disablePadding>
                    {block.items.map((row) => (
                      <ListItemButton
                        key={row.href + row.label}
                        component={Link}
                        href={row.href}
                        sx={{ px: 0, py: 0.2, borderRadius: 1 }}
                      >
                        <ListItemText
                          primary={row.label}
                          primaryTypographyProps={{ fontSize: '0.86rem', color: 'text.primary' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </>
              ) : (
                <Box sx={{ borderRadius: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  <Box
                    component={Link}
                    href={block.href}
                    sx={{ display: 'block' }}
                  >
                    <Box
                      component="img"
                      src={block.image}
                      alt={block.cta}
                      sx={{ width: '100%', height: 255, objectFit: 'cover', display: 'block' }}
                    />
                  </Box>
                  <Box sx={{ p: 1.1 }}>
                    <Button
                      component={Link}
                      href={block.href}
                      fullWidth
                      variant="outlined"
                      color="primary"
                      sx={{
                        textTransform: 'none',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: alpha(panelTheme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {block.cta}
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Container>
    </Paper>
  );
}

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { topbar, store, footer } = useSiteContent();
  const logoSrc = resolveStoreLogoSrc(store?.logo_url);
  const brandAlt = footer?.brand?.trim() || 'Store';
  const topbarEnabled = topbar?.enabled !== false;
  /** Promo strip: desktop/tablet only — hidden on mobile for a cleaner header + more vertical space. */
  const showTopbar = topbarEnabled && !isMobile;
  const socialLinks = Array.isArray(topbar?.social_links) ? topbar!.social_links! : [];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [nav, setNav] = useState<NavItem[]>(HEADER_NAV_FALLBACK);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchHeaderNavCategories()
      .then((roots) => {
        if (!cancelled && roots.length > 0) {
          setNav(categoriesToNavItems(roots));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const activeItem = useMemo(() => nav.find((n) => n.label === activeMenu), [nav, activeMenu]);
  const topCollections = useMemo(() => nav.map((n) => ({ label: n.label, href: n.href })), [nav]);

  return (
    <>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: theme.zIndex.appBar }} onMouseLeave={() => setActiveMenu(null)}>
        {showTopbar && (
          <Box
            sx={{
              minHeight: TOPBAR_HEIGHT,
              bgcolor: topbar?.background ?? '#444444',
              color: topbar?.text_color ?? '#fff',
              display: 'flex',
              alignItems: 'center',
              transform: scrolled ? 'translateY(-100%)' : 'translateY(0)',
              transition: 'transform 0.22s ease',
            }}
          >
            <Container maxWidth="xl" sx={{ py: { xs: 0.5, md: 0 }, width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: { xs: 0.75, md: 2 },
                  width: '100%',
                  minHeight: { xs: 'auto', md: TOPBAR_HEIGHT },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.6,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    order: { xs: 2, md: 1 },
                  }}
                >
                  {socialLinks.map((s) => (
                    <IconButton
                      key={`${s.label}-${s.href}`}
                      size="small"
                      component={Link}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: 'inherit' }}
                      aria-label={s.label}
                    >
                      {topbarSocialIcon(s.label)}
                    </IconButton>
                  ))}
                </Box>
                <Box
                  sx={{
                    textAlign: 'center',
                    order: { xs: 1, md: 2 },
                    width: { xs: '100%', md: 'auto' },
                    px: { xs: 1, md: 0 },
                  }}
                >
                  {topbar?.center_link?.trim() ? (
                    <Typography
                      component={Link}
                      href={topbar.center_link}
                      sx={{
                        fontWeight: 700,
                        color: topbar?.center_text_color ?? '#fff3e3',
                        fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.9rem' },
                        textDecoration: 'none',
                        display: 'inline-block',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {topbar?.center_text ?? ''}
                    </Typography>
                  ) : (
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: topbar?.center_text_color ?? '#fff3e3',
                        fontSize: { xs: '0.8rem', sm: '0.88rem', md: '0.9rem' },
                      }}
                    >
                      {topbar?.center_text ?? ''}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: { xs: 'center', md: 'right' }, order: { xs: 3, md: 3 }, width: { xs: '100%', md: 'auto' } }}>
                  {topbar?.phone?.trim() ? (
                    <Link
                      href={`tel:${topbar.phone.replace(/[^\d+]/g, '')}`}
                      style={{
                        color: topbar?.phone_color ?? '#fff3e3',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 'clamp(0.78rem, 2.8vw, 0.9rem)',
                      }}
                    >
                      {topbar.phone}
                    </Link>
                  ) : null}
                </Box>
              </Box>
            </Container>
          </Box>
        )}

        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            boxShadow: scrolled ? theme.shadows[3] : 'none',
            transform: !isMobile && scrolled && topbarEnabled ? `translateY(-${TOPBAR_HEIGHT}px)` : 'translateY(0)',
            transition: 'transform 0.22s ease, box-shadow 0.22s ease',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ minHeight: HEADER_HEIGHT, display: 'grid', gridTemplateColumns: { xs: 'auto 1fr auto', md: 'auto 1fr auto' }, gap: 1.5 }}>
              {isMobile && <IconButton onClick={() => setMobileOpen(true)} aria-label="menu"><MenuIcon /></IconButton>}

              <Box component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', justifySelf: isMobile ? 'center' : 'start' }}>
                <Box
                  component="img"
                  src={logoSrc}
                  alt={brandAlt}
                  sx={{ width: { xs: 130, md: 165 }, height: { xs: 44, md: 52 }, objectFit: 'contain', display: 'block' }}
                />
              </Box>

              {!isMobile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.2 }} onMouseEnter={() => setActiveMenu(activeMenu)}>
                  {nav.map((item) => {
                    const hasMega = Boolean(item.blocks?.length);
                    return (
                      <Button
                        key={item.label}
                        component={Link}
                        href={item.href}
                        onMouseEnter={() => setActiveMenu(hasMega ? item.label : null)}
                        endIcon={
                          hasMega ? (
                            <KeyboardArrowDown
                              sx={{
                                fontSize: 18,
                                ml: -0.25,
                                opacity: 0.75,
                                transition: 'transform 0.2s ease',
                                transform: activeMenu === item.label ? 'rotate(180deg)' : 'none',
                              }}
                            />
                          ) : undefined
                        }
                        sx={{
                          color: 'text.primary',
                          textTransform: 'none',
                          fontWeight: 700,
                          px: 1,
                          borderRadius: 1,
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
                          '& .MuiButton-endIcon': { ml: 0.25 },
                        }}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton aria-label="search" onClick={() => setSearchOpen(true)}><SearchIcon /></IconButton>
                <IconButton component={Link} href="/wishlist" aria-label="wishlist">
                  <Badge
                    badgeContent={0}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <WishlistIcon />
                  </Badge>
                </IconButton>
                <IconButton component={Link} href="/cart" aria-label="cart">
                  <Badge
                    badgeContent={0}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      },
                    }}
                  >
                    <CartIcon />
                  </Badge>
                </IconButton>
                {!isMobile && <IconButton component={Link} href="/auth/login" aria-label="account"><PersonIcon /></IconButton>}
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {!isMobile && activeItem?.blocks?.length ? <MegaPanel item={activeItem} /> : null}
      </Box>

      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Search
          <IconButton onClick={() => setSearchOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 1.2, fontWeight: 700 }}>Top collection:</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {topCollections.map((c) => (
              <Button key={c.label} component={Link} href={c.href} onClick={() => setSearchOpen(false)} size="small" sx={{ textTransform: 'none' }}>
                {c.label}
              </Button>
            ))}
          </Box>
        </DialogContent>
      </Dialog>

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 320, maxWidth: '90vw' }}>
          <Box sx={{ p: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontWeight={800}>Menu</Typography>
            <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <Divider />
          <List disablePadding>
            <ListItemButton component={Link} href="/" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} href="/categories" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Shop" />
            </ListItemButton>
            <ListItemButton
              component="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(true);
              }}
            >
              <ListItemText primary="Search" />
            </ListItemButton>
            <ListItemButton component={Link} href="/auth/login" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Account" />
            </ListItemButton>
            <ListItemButton component={Link} href="/wishlist" onClick={() => setMobileOpen(false)}>
              <ListItemText primary="Wishlist" />
            </ListItemButton>
            <Divider sx={{ my: 0.5 }} />
            {nav.map((item) => (
              <Box key={item.label}>
                <ListItemButton
                  component={item.blocks?.length ? 'button' : Link}
                  href={item.blocks?.length ? undefined : item.href}
                  onClick={() => {
                    if (item.blocks?.length) {
                      setMobileExpanded((prev) => (prev === item.label ? null : item.label));
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                >
                  <ListItemText primary={item.label} />
                  {item.blocks?.length ? (mobileExpanded === item.label ? <ExpandLess /> : <ExpandMore />) : null}
                </ListItemButton>
                {!!item.blocks?.length && (
                  <Collapse in={mobileExpanded === item.label} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 2, pb: 1.5 }}>
                      {item.blocks.map((block, idx) => (
                        <Box key={idx} sx={{ mb: 1.5 }}>
                          {block.type === 'links' ? (
                            <>
                              {block.heading && (
                                <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', mb: 0.6 }}>{block.heading}</Typography>
                              )}
                              {block.items.map((row) => (
                                <Box key={row.href} sx={{ py: 0.25 }}>
                                  <Link
                                    href={row.href}
                                    onClick={() => setMobileOpen(false)}
                                    style={{ textDecoration: 'none', color: theme.palette.text.primary, fontSize: '0.86rem' }}
                                  >
                                    {row.label}
                                  </Link>
                                </Box>
                              ))}
                            </>
                          ) : (
                            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.2, overflow: 'hidden' }}>
                              <Box component="img" src={block.image} alt={block.cta} sx={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                              <Button component={Link} href={block.href} onClick={() => setMobileOpen(false)} fullWidth sx={{ textTransform: 'none' }}>
                                {block.cta}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        sx={{
          height: {
            xs: HEADER_HEIGHT,
            md: HEADER_HEIGHT + (topbarEnabled ? TOPBAR_HEIGHT : 0),
          },
        }}
      />
    </>
  );
}
