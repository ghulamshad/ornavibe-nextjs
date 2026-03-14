'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import { Security, Speed, CloudQueue, Storage } from '@mui/icons-material';

const architectureFeatures = [
  {
    icon: <Security />,
    title: 'SOC 2 Compliant',
    description: 'Enterprise-grade security with regular audits and compliance certifications.',
  },
  {
    icon: <Speed />,
    title: '99.9% Uptime SLA',
    description: 'High availability infrastructure with redundant systems and automatic failover.',
  },
  {
    icon: <CloudQueue />,
    title: 'Scalable Cloud Architecture',
    description: 'Auto-scaling infrastructure that grows with your business needs.',
  },
  {
    icon: <Storage />,
    title: 'Data Isolation',
    description: 'True multi-tenancy with complete data separation and tenant isolation.',
  },
];

export default function ArchitectureSection() {
  const theme = useTheme();

  return (
    <Box
      id="architecture"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
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
              Enterprise-Grade Architecture
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
              Built on modern cloud infrastructure with enterprise security standards. 
              Your data is protected, your systems are reliable, and your business is secure.
            </Typography>
          </Grid>
          <Grid size={{xs:12, md:6}}>
            <Grid container spacing={3}>
              {architectureFeatures.map((feature, index) => (
                <Grid size={{xs:12, md:6}} key={feature.title}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      height: '100%',
                    }}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <Box
                      sx={{
                        color: 'primary.main',
                        mb: 1,
                        fontSize: '2rem',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
