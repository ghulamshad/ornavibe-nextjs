'use client';

import React, { ReactNode } from 'react';
import { Box, Container } from '@mui/material';

export interface SectionContainerProps {
  id?: string;
  children: ReactNode;
  maxWidth?: 'lg' | 'xl';
  /**
   * Background flavor for the section. Mapped to theme palette.
   */
  variant?: 'default' | 'soft' | 'contrast';
  /**
   * Optional extra sx passed down to the outer Box.
   */
  sx?: Record<string, any>;
}

export default function SectionContainer({
  id,
  children,
  maxWidth = 'xl',
  variant = 'default',
  sx,
}: SectionContainerProps) {
  const bgKey =
    variant === 'soft'
      ? 'background.sectionSoft'
      : variant === 'contrast'
      ? 'background.sectionContrast'
      : 'background.paper';

  return (
    <Box
      id={id}
      component="section"
      sx={{
        py: { xs: 6, md: 10 },
        bgcolor: (theme) =>
          // @ts-ignore custom keys may exist on background
          (theme.palette.background as any)[bgKey.split('.')[1]] ?? theme.palette.background.paper,
        ...sx,
      }}
    >
      <Container maxWidth={maxWidth}>{children}</Container>
    </Box>
  );
}

