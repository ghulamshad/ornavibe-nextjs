'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import NewLandingHeader from '@/components/landing/NewLandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import StickyWhatsapp from '@/components/landing/StickyWhatsapp';
import StoreThemeProvider from '@/components/store/StoreThemeProvider';
import { SiteContentProvider } from '@/contexts/SiteContentContext';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <SiteContentProvider>
      <StoreThemeProvider>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          <NewLandingHeader />
          <Box
            component="main"
            sx={{
              flex: 1,
              // NewLandingHeader includes its own spacer (header + mobile bottom bar).
              pb: { xs: 1, md: 0 },
            }}
          >
            {children}
          </Box>
          <StickyWhatsapp />
          <LandingFooter />
        </Box>
      </StoreThemeProvider>
    </SiteContentProvider>
  );
}
