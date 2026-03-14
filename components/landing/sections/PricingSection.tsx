'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  useTheme,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import Link from 'next/link';

interface PricingPlan {
  name: string;
  displayName: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  popular: boolean;
}

// Optional: SaaS subscriptions backend. In this project the multi-tenant
// subscriptions service is not wired, so we provide a safe stub that returns
// an empty plan list to keep the component compilable.
type Plan = {
  name: string;
  price: string;
  features?: string[];
};

const subscriptionsService = {
  async getPlans(): Promise<{ data: Plan[] }> {
    return { data: [] };
  },
};

// Map API plan names to display names and descriptions
const planConfig: Record<string, { displayName: string; description: string; popular: boolean }> = {
  starter: {
    displayName: 'Starter',
    description: 'Perfect for small packaging businesses',
    popular: false,
  },
  pro: {
    displayName: 'Professional',
    description: 'For growing manufacturing companies',
    popular: true,
  },
  enterprise: {
    displayName: 'Enterprise',
    description: 'For large-scale operations',
    popular: false,
  },
  trial: {
    displayName: 'Trial',
    description: 'Try all features free for 30 days',
    popular: false,
  },
};

export default function PricingSection() {
  const theme = useTheme();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await subscriptionsService.getPlans();
        const apiPlans: Plan[] = response.data;

        // Filter out trial plan and transform to pricing plans
        const pricingPlans: PricingPlan[] = apiPlans
          .filter((plan) => plan.name !== 'trial')
          .map((plan) => {
            const config = planConfig[plan.name] || {
              displayName: plan.name.charAt(0).toUpperCase() + plan.name.slice(1),
              description: 'Professional ERP solution',
              popular: false,
            };

            // Calculate monthly price (assuming annual price / 12, with 17% discount for yearly)
            const annualPrice = parseFloat(plan.price);
            const monthlyPrice = annualPrice / 12;
            const yearlyPrice = annualPrice * 0.83; // 17% discount

            return {
              name: plan.name,
              displayName: config.displayName,
              priceMonthly: Math.round(monthlyPrice),
              priceYearly: Math.round(yearlyPrice),
              description: config.description,
              features: plan.features || [],
              popular: config.popular,
            };
          })
          .sort((a, b) => a.priceMonthly - b.priceMonthly); // Sort by price

        setPlans(pricingPlans);
      } catch (err: any) {
        console.error('Failed to fetch plans:', err);
        setError('Failed to load pricing plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleBillingChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: 'monthly' | 'yearly' | null,
  ) => {
    if (newPeriod !== null) {
      setBillingPeriod(newPeriod);
    }
  };

  return (
    <Box
      id="pricing"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
            data-aos="fade-up"
          >
            Simple, Transparent Pricing
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              mb: 4,
            }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Choose the plan that fits your business. All plans include a 14-day free trial.
          </Typography>

          <ToggleButtonGroup
            value={billingPeriod}
            exclusive
            onChange={handleBillingChange}
            aria-label="billing period"
            sx={{ mb: 4 }}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <ToggleButton value="monthly" aria-label="monthly">
              Monthly
            </ToggleButton>
            <ToggleButton value="yearly" aria-label="yearly">
              Yearly
              <Chip label="Save 17%" size="small" color="primary" sx={{ ml: 1 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ mb: 4 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : plans.length === 0 ? (
          <Box sx={{ mb: 4 }}>
            <Alert severity="info">No pricing plans available at the moment.</Alert>
          </Box>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            {plans.map((plan, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={plan.name}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: plan.popular ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                    borderColor: plan.popular ? 'primary.main' : 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    },
                  }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {plan.displayName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {plan.description}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h3"
                        fontWeight={800}
                        sx={{ display: 'inline' }}
                      >
                        ${billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceYearly}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'inline', ml: 1 }}>
                        /{billingPeriod === 'monthly' ? 'month' : 'year'}
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href="/auth/register"
                      variant={plan.popular ? 'contained' : 'outlined'}
                      fullWidth
                      size="large"
                      sx={{
                        mb: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      Start Free Trial
                    </Button>
                    <List sx={{ py: 0 }}>
                      {plan.features.map((feature, featureIndex) => (
                        <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{
                              variant: 'body2',
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
