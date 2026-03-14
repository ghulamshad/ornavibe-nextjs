'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Dashboard,
  Security,
  Analytics,
  CloudQueue,
  People,
  Scale,
  Speed,
  IntegrationInstructions,
} from '@mui/icons-material';

const features = [
  {
    icon: <Dashboard />,
    title: 'Real-Time Dashboard',
    description: 'Comprehensive analytics and KPIs at a glance. Monitor production, sales, and financials in real-time.',
  },
  {
    icon: <Security />,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant, end-to-end encryption, multi-factor authentication, and role-based access control.',
  },
  {
    icon: <Analytics />,
    title: 'Advanced Analytics',
    description: 'Powerful reporting tools with customizable dashboards, forecasting, and predictive analytics.',
  },
  {
    icon: <CloudQueue />,
    title: 'Multi-Tenant SaaS',
    description: 'True multi-tenancy with isolated data, scalable architecture, and automatic updates.',
  },
  {
    icon: <People />,
    title: 'Role-Based Access',
    description: 'Granular permissions for Super Admin, Tenant Admin, Production Manager, Finance, and Sales roles.',
  },
  {
    icon: <Scale />,
    title: 'Scalable Architecture',
    description: 'Built to handle growth from startups to enterprise. Auto-scaling infrastructure and high availability.',
  },
  {
    icon: <Speed />,
    title: 'High Performance',
    description: 'Optimized database queries, caching, and CDN delivery for sub-second response times.',
  },
  {
    icon: <IntegrationInstructions />,
    title: 'API-First Design',
    description: 'RESTful APIs with comprehensive documentation. Integrate with your existing tools seamlessly.',
  },
];

export default function FeaturesSection() {
  const theme = useTheme();

  return (
    <Box
      id="features"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
            data-aos="fade-up"
          >
            Everything You Need to Succeed
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
            }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Powerful features designed for packaging manufacturers. 
            Scale your operations with confidence.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{xs:12, sm:6, md:3}} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      fontSize: '2.5rem',
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
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
