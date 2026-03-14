'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AccountBalance as AccountBalanceIcon,
  CloudQueue as CloudIcon,
  Chat as ChatIcon,
  Api as ApiIcon,
  IntegrationInstructions as IntegrationIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface Integration {
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  status: 'available' | 'coming-soon';
}

const integrations: Integration[] = [
  {
    name: 'Shopify',
    category: 'E-Commerce',
    description: 'Sync orders and inventory with your Shopify store',
    icon: ShoppingCartIcon,
    status: 'available',
  },
  {
    name: 'WooCommerce',
    category: 'E-Commerce',
    description: 'Connect with WooCommerce for seamless order management',
    icon: ShoppingCartIcon,
    status: 'available',
  },
  {
    name: 'QuickBooks',
    category: 'Accounting',
    description: 'Automate financial data sync with QuickBooks',
    icon: AccountBalanceIcon,
    status: 'available',
  },
  {
    name: 'Xero',
    category: 'Accounting',
    description: 'Real-time accounting integration with Xero',
    icon: AccountBalanceIcon,
    status: 'available',
  },
  {
    name: 'SAP',
    category: 'Enterprise',
    description: 'Enterprise-grade integration with SAP systems',
    icon: CloudIcon,
    status: 'coming-soon',
  },
  {
    name: 'Oracle',
    category: 'Enterprise',
    description: 'Connect with Oracle ERP for large-scale operations',
    icon: CloudIcon,
    status: 'coming-soon',
  },
  {
    name: 'Salesforce',
    category: 'CRM',
    description: 'Sync customer data and sales pipeline',
    icon: IntegrationIcon,
    status: 'available',
  },
  {
    name: 'HubSpot',
    category: 'CRM',
    description: 'Integrate marketing and sales automation',
    icon: IntegrationIcon,
    status: 'available',
  },
  {
    name: 'Slack',
    category: 'Communication',
    description: 'Get real-time notifications and alerts',
    icon: ChatIcon,
    status: 'available',
  },
  {
    name: 'Microsoft Teams',
    category: 'Communication',
    description: 'Team collaboration and workflow notifications',
    icon: ChatIcon,
    status: 'available',
  },
  {
    name: 'Zapier',
    category: 'Automation',
    description: 'Connect with 5000+ apps via Zapier',
    icon: IntegrationIcon,
    status: 'available',
  },
  {
    name: 'REST API',
    category: 'Developer',
    description: 'Comprehensive REST API for custom integrations',
    icon: ApiIcon,
    status: 'available',
  },
];

const categoryColors: Record<string, string> = {
  'E-Commerce': 'primary',
  'Accounting': 'success',
  'Enterprise': 'warning',
  'CRM': 'info',
  'Communication': 'secondary',
  'Automation': 'error',
  'Developer': 'default',
};

// Custom Arrow Components
const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        left: { xs: -10, md: -50 },
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        bgcolor: 'background.paper',
        boxShadow: 3,
        '&:hover': {
          bgcolor: 'primary.main',
          color: 'white',
        },
        width: 40,
        height: 40,
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: 'absolute',
        right: { xs: -10, md: -50 },
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        bgcolor: 'background.paper',
        boxShadow: 3,
        '&:hover': {
          bgcolor: 'primary.main',
          color: 'white',
        },
        width: 40,
        height: 40,
      }}
    >
      <ArrowForwardIcon />
    </IconButton>
  );
};

export default function IntegrationsSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: isMobile ? 1 : isTablet ? 2 : 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
        },
      },
    ],
  };

  return (
    <Box
      id="integrations"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: 'radial-gradient(circle at 20% 50%, primary.main 0%, transparent 50%), radial-gradient(circle at 80% 80%, primary.main 0%, transparent 50%)',
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Chip
            label="Seamless Integrations"
            sx={{
              mb: 2,
              px: 2,
              py: 0.5,
              bgcolor: 'primary.light',
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: 'text.primary',
            }}
            data-aos="fade-up"
          >
            Integrations & APIs
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.7,
              fontSize: { xs: '1rem', md: '1.125rem' },
            }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Connect ZeeERP with your existing tools and workflows. Comprehensive REST API for custom integrations and automation.
          </Typography>
        </Box>

        {/* Integrations Slider */}
        <Box
          sx={{
            position: 'relative',
            mb: 4,
            '& .slick-slider': {
              position: 'relative',
            },
            '& .slick-list': {
              padding: '0 20px',
            },
            '& .slick-slide': {
              padding: '0 12px',
            },
            '& .slick-dots': {
              bottom: '-50px',
              '& li button:before': {
                fontSize: '12px',
                color: theme.palette.primary.main,
                opacity: 0.3,
              },
              '& li.slick-active button:before': {
                opacity: 1,
                color: theme.palette.primary.main,
              },
            },
          }}
        >
          <Slider {...sliderSettings}>
            {integrations.map((integration, index) => {
              const IconComponent = integration.icon;
              return (
                <Box key={integration.name} sx={{ px: 1 }}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[12],
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'primary.main',
                          }}
                        >
                          <IconComponent sx={{ fontSize: 28 }} />
                        </Box>
                        {integration.status === 'available' ? (
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                            label="Available"
                            size="small"
                            sx={{
                              bgcolor: 'success.light',
                              color: 'success.main',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Chip
                            label="Coming Soon"
                            size="small"
                            sx={{
                              bgcolor: 'warning.light',
                              color: 'warning.main',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            mb: 1,
                            color: 'text.primary',
                          }}
                        >
                          {integration.name}
                        </Typography>
                        <Chip
                          label={integration.category}
                          size="small"
                          color={categoryColors[integration.category] as any}
                          variant="outlined"
                          sx={{ mb: 1.5 }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            lineHeight: 1.6,
                          }}
                        >
                          {integration.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Card>
                </Box>
              );
            })}
          </Slider>
        </Box>

        {/* API Highlight Section */}
        <Box
          sx={{
            mt: { xs: 8, md: 10 },
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            textAlign: 'center',
          }}
          data-aos="fade-up"
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              color: 'primary.main',
              mb: 2,
            }}
          >
            <ApiIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Comprehensive REST API
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              mb: 3,
              lineHeight: 1.7,
            }}
          >
            Build custom integrations with our fully-documented REST API. 
            Access all ZeeERP features programmatically with OAuth2 authentication.
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
          >
            <Chip label="OAuth2 Authentication" sx={{ px: 2, py: 1, fontWeight: 600 }} />
            <Chip label="Webhook Support" sx={{ px: 2, py: 1, fontWeight: 600 }} />
            <Chip label="Rate Limiting" sx={{ px: 2, py: 1, fontWeight: 600 }} />
            <Chip label="OpenAPI Documentation" sx={{ px: 2, py: 1, fontWeight: 600 }} />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
