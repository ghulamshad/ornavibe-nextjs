'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Collapse,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { fetchCategories } from '@/lib/api/catalog.service';
import type { Category } from '@/types/catalog';

export interface MegaMenuColumn {
  title: string;
  links: { label: string; href: string }[];
}

const DEFAULT_COLUMNS: MegaMenuColumn[] = [
  {
    title: 'Shop by category',
    links: [
      { label: 'All gift baskets', href: '/products' },
      { label: 'All categories', href: '/categories' },
    ],
  },
  {
    title: 'Occasions',
    links: [
      { label: 'Corporate gifts', href: '/categories/corporate-gifts' },
      { label: 'Holiday & seasonal', href: '/categories/holiday-seasonal' },
      { label: 'Luxury & premium', href: '/categories/luxury-premium' },
      { label: 'Gift baskets', href: '/categories/gift-baskets' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact us', href: '/contact' },
      { label: 'FAQ', href: '/#faq' },
      { label: 'Shipping & returns', href: '/legal/terms' },
    ],
  },
];

interface StoreMegaMenuProps {
  /** Anchor for desktop dropdown */
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  /** For mobile drawer: show as expandable section (no anchor) */
  variant: 'desktop' | 'mobile';
  onNavClick?: (href: string) => void;
}

export default function StoreMegaMenu({
  anchorEl,
  open,
  onClose,
  variant,
  onNavClick,
}: StoreMegaMenuProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const shopLinks =
    categories.length > 0
      ? [
          ...categories.slice(0, 6).map((c) => ({ label: c.name, href: `/categories/${c.slug}` })),
          { label: 'View all categories', href: '/categories' },
          { label: 'All gift baskets', href: '/products' },
        ]
      : [
          { label: 'All gift baskets', href: '/products' },
          { label: 'All categories', href: '/categories' },
        ];

  const columns: MegaMenuColumn[] = [
    { title: 'Shop by category', links: shopLinks },
    ...DEFAULT_COLUMNS.slice(1),
  ];

  const handleLink = (href: string) => {
    if (onNavClick) onNavClick(href);
    onClose();
  };

  const gridContent = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: variant === 'desktop' ? 'repeat(3, 1fr)' : '1fr',
        gap: 4,
        py: 2,
        px: 3,
      }}
    >
      {columns.map((col) => (
        <Box key={col.title}>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="primary"
            sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            {col.title}
          </Typography>
          <List dense disablePadding>
            {col.links.map((link) => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  onClick={() => handleLink(link.href)}
                  sx={{ py: 0.75, px: 0, '&:hover': { bgcolor: 'action.hover' } }}
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

  if (variant === 'mobile') {
    return (
      <Box>
        <ListItemButton onClick={() => setMobileExpanded(!mobileExpanded)} sx={{ py: 1.5 }}>
          <Typography variant="body1" fontWeight={500}>
            Shop
          </Typography>
          <IconButton size="small" sx={{ ml: 'auto' }}>
            {mobileExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </ListItemButton>
        <Collapse in={mobileExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2, pr: 2, pb: 2 }}>{gridContent}</Box>
        </Collapse>
      </Box>
    );
  }

  if (!open) return null;

  return <>{gridContent}</>;
}
