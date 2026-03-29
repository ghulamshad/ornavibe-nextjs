'use client';

import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export interface FeatureCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
}

export default function FeatureCard({ icon, title, subtitle }: FeatureCardProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: { xs: 0, md: 2 },
        py: 2,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

