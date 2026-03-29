'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { fetchPublicMenu } from '@/lib/api/menusPublic.service';
import type { PublicMenuItem, PublicMenuResponse } from '@/types/menus';

/** Default header menu slug; override with `NEXT_PUBLIC_HEADER_MENU_SLUG`. */
export const DEFAULT_HEADER_MENU_SLUG = 'header-main';

export function useStorefrontMenu(slug: string = DEFAULT_HEADER_MENU_SLUG): PublicMenuResponse | null {
  const [data, setData] = useState<PublicMenuResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetchPublicMenu(slug);
        if (!cancelled) setData(res);
        return;
      } catch {
        // If a custom slug fails, try seeded default menu slug.
      }

      if (slug !== DEFAULT_HEADER_MENU_SLUG) {
        try {
          const fallback = await fetchPublicMenu(DEFAULT_HEADER_MENU_SLUG);
          if (!cancelled) setData(fallback);
          return;
        } catch {
          // ignore and fallback to null below
        }
      }

      if (!cancelled) setData(null);
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return data;
}

export function findMenuItemById(items: PublicMenuItem[], id: string): PublicMenuItem | null {
  for (const it of items) {
    if (it.id === id) return it;
    const nested = findMenuItemById(it.children ?? [], id);
    if (nested) return nested;
  }
  return null;
}

type MegaColumn = {
  heading?: string;
  links: { label: string; href: string; target?: string }[];
};

function megaColumnsFromNode(node: PublicMenuItem): MegaColumn[] {
  const children = node.children ?? [];
  return children.map((ch) => {
    const sub = ch.children ?? [];
    const links =
      sub.length > 0
        ? sub.map((s) => ({
            label: s.title_display,
            href: s.resolved_url,
            target: s.target,
          }))
        : [{ label: ch.title_display, href: ch.resolved_url, target: ch.target }];
    return { heading: ch.title_display, links };
  });
}

export function DynamicMenuMegaPanel({
  item,
  onNavigate,
}: {
  item: PublicMenuItem | null;
  onNavigate?: () => void;
}) {
  const theme = useTheme();
  if (!item?.children?.length) return null;

  const meta = item.meta && typeof item.meta === 'object' ? (item.meta as Record<string, unknown>) : {};
  const isMega = meta.mega === true;
  const cols = typeof meta.columns === 'number' && meta.columns > 0 ? meta.columns : 4;

  const columns: MegaColumn[] = isMega
    ? megaColumnsFromNode(item)
    : [
        {
          links: item.children.map((ch) => ({
            label: ch.title_display,
            href: ch.resolved_url,
            target: ch.target,
          })),
        },
      ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0,
        py: 2.5,
        px: { xs: 2, md: 3 },
        justifyContent: 'flex-start',
      }}
    >
      {columns.map((col, idx) => (
        <Box
          key={idx}
          sx={{
            flex: isMega
              ? { xs: '1 1 100%', sm: `1 1 ${100 / Math.min(cols, columns.length)}%`, md: '0 0 auto' }
              : { xs: '1 1 100%', md: '1 1 auto' },
            minWidth: { md: isMega ? 160 : 200 },
            maxWidth: { md: isMega ? 220 : 360 },
            px: { md: 1.5 },
            py: { xs: 1, md: 0 },
            borderRight: {
              md: isMega && idx < columns.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
            },
          }}
        >
          {col.heading && (
            <Typography
              variant="subtitle2"
              fontWeight={800}
              sx={{ mb: 1.25, letterSpacing: 0.4, textTransform: 'uppercase', color: 'text.primary' }}
            >
              {col.heading}
            </Typography>
          )}
          <List dense disablePadding>
            {col.links.map((link) => (
              <ListItem key={link.href + link.label} disablePadding sx={{ py: 0.15 }}>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  target={link.target === '_blank' ? '_blank' : undefined}
                  rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                  sx={{ py: 0.35, px: 0, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
                  onClick={onNavigate}
                >
                  <Typography variant="body2" color="text.primary">
                    {link.label}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}

export function DynamicMenuDesktopToolbar({
  items,
  activeMegaId,
  openMega,
  clearCloseTimer,
}: {
  items: PublicMenuItem[];
  activeMegaId: string | null;
  openMega: (id: string) => void;
  clearCloseTimer: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const hasKids = Boolean(item.children?.length);
        if (hasKids) {
          return (
            <Box key={item.id} sx={{ position: 'relative' }}>
              <Button
                component={Link}
                href={item.resolved_url}
                onMouseEnter={() => openMega(item.id)}
                endIcon={
                  <ExpandMoreIcon
                    sx={{
                      fontSize: 18,
                      transform: activeMegaId === item.id ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                }
                sx={{
                  color: 'text.primary',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {item.title_display}
              </Button>
            </Box>
          );
        }
        return (
          <Button
            key={item.id}
            component={Link}
            href={item.resolved_url}
            target={item.target === '_blank' ? '_blank' : undefined}
            rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
            onMouseEnter={clearCloseTimer}
            sx={{
              color: 'text.primary',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.88rem',
              px: 1,
              py: 0.75,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {item.title_display}
          </Button>
        );
      })}
    </>
  );
}

export function DynamicMenuMobileList({
  items,
  expandedId,
  setExpandedId,
  onNavigate,
  depth = 0,
}: {
  items: PublicMenuItem[];
  expandedId: string | null;
  setExpandedId: React.Dispatch<React.SetStateAction<string | null>>;
  onNavigate?: () => void;
  depth?: number;
}) {
  return (
    <List disablePadding sx={{ pl: depth * 1.5 }}>
      {items.map((item) => {
        const hasKids = Boolean(item.children?.length);
        if (hasKids) {
          return (
            <React.Fragment key={item.id}>
              <ListItemButton onClick={() => setExpandedId((id) => (id === item.id ? null : item.id))} sx={{ py: 1 }}>
                <ListItemText primary={item.title_display} primaryTypographyProps={{ fontWeight: 700 }} />
                {expandedId === item.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={expandedId === item.id} timeout="auto" unmountOnExit>
                <Box sx={{ px: 1, pb: 1 }}>
                  {(() => {
                    const meta = item.meta && typeof item.meta === 'object' ? (item.meta as Record<string, unknown>) : {};
                    const isMega = meta.mega === true;
                    if (isMega) {
                      return <DynamicMenuMegaPanel item={item} onNavigate={onNavigate} />;
                    }
                    return (
                      <DynamicMenuMobileList
                        items={item.children ?? []}
                        expandedId={expandedId}
                        setExpandedId={setExpandedId}
                        onNavigate={onNavigate}
                        depth={depth + 1}
                      />
                    );
                  })()}
                </Box>
              </Collapse>
            </React.Fragment>
          );
        }
        return (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              component={Link}
              href={item.resolved_url}
              target={item.target === '_blank' ? '_blank' : undefined}
              rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
              onClick={onNavigate}
              sx={{ py: 0.75 }}
            >
              <ListItemText primary={item.title_display} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}

/** Wrapper: fixed mega panel below toolbar (expects same mouse enter/leave behavior as parent). */
export function DynamicMenuDesktopMegaPaper({
  items,
  activeMegaId,
  clearCloseTimer,
  onNavigate,
}: {
  items: PublicMenuItem[];
  activeMegaId: string | null;
  clearCloseTimer: () => void;
  onNavigate?: () => void;
}) {
  const active = activeMegaId ? findMenuItemById(items, activeMegaId) : null;
  if (!active?.children?.length) return null;

  return (
    <Paper
      elevation={4}
      onMouseEnter={clearCloseTimer}
      sx={{
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        maxHeight: 'min(72vh, 640px)',
        overflow: 'auto',
      }}
    >
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 3 } }}>
        <DynamicMenuMegaPanel item={active} onNavigate={onNavigate} />
      </Container>
    </Paper>
  );
}
