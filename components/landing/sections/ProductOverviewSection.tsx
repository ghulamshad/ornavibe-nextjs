'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import Image from 'next/image';
export default function ProductOverviewSection() {
  const theme = useTheme();

  return (
    <Box
      id="product"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6} alignItems="center">
          <Grid size={{xs:12, md:6}}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
              data-aos="fade-right"
            >
              Complete ERP Solution for Packaging
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                mb: 4,
                lineHeight: 1.8,
                fontSize: '1.125rem',
              }}
              data-aos="fade-right"
              data-aos-delay="100"
            >
              ZeeERP is a comprehensive enterprise resource planning system specifically 
              designed for packaging manufacturers. From raw material procurement to 
              finished product delivery, manage your entire operation from one platform.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-aos="fade-right" data-aos-delay="200">
              {[
                'Production Planning & Scheduling',
                'Inventory & Stock Management',
                'Costing & Pricing Optimization',
                'Sales Order Management',
                'Invoice & Billing Automation',
                'Financial Reporting & Analytics',
              ].map((item, index) => (
                <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                    }}
                  />
                  <Typography variant="body1" fontWeight={500}>
                    {item}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid size={{xs:12, md:6}}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: theme.shadows[8],
              width: '100%',
              height: { xs: 300, md: 500 },
            }}
            data-aos="fade-left"
          >
            <Image
              src="/assets/images/product-overview.png"
              alt="ZeeERP Complete Solution Overview"
              fill
              style={{
                objectFit: 'contain',
              }}
              priority
            />
          </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
