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

const useCases = [
  {
    title: 'Flexible Packaging',
    description: 'Manage film, pouches, and flexible materials with real-time costing and production tracking.',
    industry: 'Food & Beverage Packaging',
  },
  {
    title: 'Rigid Containers',
    description: 'Streamline production of bottles, jars, and containers with automated workflows.',
    industry: 'Consumer Goods',
  },
  {
    title: 'Carton & Box Manufacturing',
    description: 'Optimize material usage and pricing for corrugated and paperboard packaging.',
    industry: 'E-commerce & Shipping',
  },
  {
    title: 'Custom Packaging',
    description: 'Handle complex orders with variable specifications and rapid production cycles.',
    industry: 'Retail & Luxury',
  },
];

export default function UseCasesSection() {
  const theme = useTheme();

  return (
    <Box
      id="use-cases"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
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
            Built for Your Industry
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
            ZeeERP adapts to your packaging business model, 
            whether you're producing millions or custom pieces.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {useCases.map((useCase, index) => (
            <Grid size={{xs:12, sm:6, md:3}} key={useCase.title}>
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
                  <Typography variant="overline" color="primary" fontWeight={600}>
                    {useCase.industry}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 1 }}>
                    {useCase.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {useCase.description}
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
