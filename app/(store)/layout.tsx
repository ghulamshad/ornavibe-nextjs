'use client';

import { ReactNode } from 'react';
import { Box } from '@mui/material';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingFooter from '@/components/landing/LandingFooter';
import { SiteContentProvider } from '@/contexts/SiteContentContext';

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <SiteContentProvider>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <LandingHeader />
        <Box
          component="main"
          sx={{
            flex: 1,
            // Offset for fixed header (top bar + nav) so hero/first section
            // is fully visible and not hidden behind the AppBar.
            mt: { xs: 8, md: 11 },
          }}
        >
          {children}
        </Box>
        <LandingFooter />
      </Box>
    </SiteContentProvider>
  );
}
