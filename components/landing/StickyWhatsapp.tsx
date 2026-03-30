'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, IconButton, useTheme } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import ChatIcon from '@mui/icons-material/Chat';
import LinkIcon from '@mui/icons-material/Link';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { resolveMediaUrl } from '@/lib/utils/media';

function placementStyles(
  placement: string,
  edge: number,
  verticalNudge: number,
  custom: { top?: string | null; right?: string | null; bottom?: string | null; left?: string | null }
): React.CSSProperties {
  const e = `${edge}px`;

  switch (placement) {
    case 'middle_left':
      return {
        top: '50%',
        left: e,
        transform: `translateY(calc(-50% + ${verticalNudge}px))`,
      };
    case 'bottom_right':
      return { bottom: e, right: e };
    case 'bottom_left':
      return { bottom: e, left: e };
    case 'top_right':
      return { top: e, right: e };
    case 'top_left':
      return { top: e, left: e };
    case 'custom': {
      const s: React.CSSProperties = { transform: verticalNudge ? `translateY(${verticalNudge}px)` : undefined };
      if (custom.top) s.top = custom.top;
      if (custom.right) s.right = custom.right;
      if (custom.bottom) s.bottom = custom.bottom;
      if (custom.left) s.left = custom.left;
      return s;
    }
    case 'middle_right':
    default:
      return {
        top: '50%',
        right: e,
        transform: `translateY(calc(-50% + ${verticalNudge}px))`,
      };
  }
}

export default function StickyWhatsapp() {
  const theme = useTheme();
  const site = useSiteContent();
  const sc = site.sticky_contact;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!sc?.enabled || !sc.items?.length || !mounted) {
    return null;
  }

  const pos = placementStyles(
    sc.placement || 'middle_right',
    sc.edge_offset ?? 16,
    sc.vertical_offset ?? 0,
    {
      top: sc.custom_top,
      right: sc.custom_right,
      bottom: sc.custom_bottom,
      left: sc.custom_left,
    }
  );

  const stack = (
    <Box
      id="sticky_icons"
      sx={{
        position: 'fixed',
        zIndex: (theme.zIndex?.modal ?? 1300) + 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        ...pos,
      }}
    >
      {sc.items.map((item, idx) => {
        const src = item.image_url ? resolveMediaUrl(item.image_url) : '';
        const label = item.label || item.type;
        const newTab = Boolean(item.open_in_new_tab);

        const inner = src ? (
          <Box
            component="img"
            src={src}
            alt={label || ''}
            sx={{ width: 48, height: 48, objectFit: 'contain', display: 'block', borderRadius: 1 }}
          />
        ) : (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: item.type === 'whatsapp' ? '#25D366' : item.type === 'phone' ? theme.palette.primary.main : 'grey.700',
              color: '#fff',
            }}
          >
            {item.type === 'whatsapp' ? <ChatIcon /> : item.type === 'phone' ? <PhoneIcon /> : <LinkIcon />}
          </Box>
        );

        return (
          <IconButton
            key={`${item.href}-${idx}`}
            component="a"
            href={item.href}
            {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            aria-label={label || 'Contact'}
            sx={{
              p: 0,
              overflow: 'hidden',
              borderRadius: 2,
              boxShadow: 2,
              bgcolor: 'background.paper',
              '&:hover': { opacity: 0.92 },
            }}
          >
            {inner}
          </IconButton>
        );
      })}
    </Box>
  );

  return createPortal(stack, document.body);
}
