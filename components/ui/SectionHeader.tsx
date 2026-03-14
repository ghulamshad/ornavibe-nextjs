'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
}: SectionHeaderProps) {
  return (
    <Box
      sx={{
        textAlign: align,
        mb: { xs: 4, md: 6 },
      }}
    >
      {eyebrow && (
        <Typography
          variant="overline"
          sx={{
            letterSpacing: '0.16em',
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          mt: eyebrow ? 1 : 0,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mt: 1.5,
            maxWidth: 640,
            mx: align === 'center' ? 'auto' : 0,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

