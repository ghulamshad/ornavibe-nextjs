'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Verified as VerifiedIcon,
  TrendingUp as TrendingUpIcon,
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
} from '@mui/icons-material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface TrustedCompany {
  name: string;
  industry: string;
  location: string;
  employees: string;
  testimonial?: string;
}

const trustedCompanies: TrustedCompany[] = [
  {
    name: 'PackCorp Industries',
    industry: 'Corrugated Boxes',
    location: 'Lahore, Pakistan',
    employees: '500+',
  },
  {
    name: 'BoxMasters Ltd',
    industry: 'Custom Packaging',
    location: 'Karachi, Pakistan',
    employees: '300+',
  },
  {
    name: 'FlexPack Solutions',
    industry: 'Flexible Packaging',
    location: 'Islamabad, Pakistan',
    employees: '200+',
  },
  {
    name: 'ContainerPro',
    industry: 'Industrial Containers',
    location: 'Faisalabad, Pakistan',
    employees: '400+',
  },
  {
    name: 'WrapSolutions',
    industry: 'Protective Packaging',
    location: 'Multan, Pakistan',
    employees: '250+',
  },
  {
    name: 'CartonTech',
    industry: 'Folding Cartons',
    location: 'Rawalpindi, Pakistan',
    employees: '180+',
  },
  {
    name: 'PlasticPack Pro',
    industry: 'Plastic Packaging',
    location: 'Gujranwala, Pakistan',
    employees: '320+',
  },
  {
    name: 'MaterialFlow',
    industry: 'Packaging Materials',
    location: 'Sialkot, Pakistan',
    employees: '150+',
  },
];

const stats = [
  { label: 'Companies Trust Us', value: '500+', icon: BusinessIcon },
  { label: 'Active Users', value: '50K+', icon: TrendingUpIcon },
  { label: 'Verified Partners', value: '100%', icon: VerifiedIcon },
];

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
        boxShadow: 2,
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
        boxShadow: 2,
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

export default function TrustedBySection() {
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
    autoplaySpeed: 3000,
    pauseOnHover: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 900,
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
      id="trusted-by"
      sx={{
        py: { xs: 6, md: 10 },
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
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Chip
            label="Trusted by Industry Leaders"
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
            variant="h3"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.5rem' },
              fontWeight: 800,
              mb: 2,
              color: 'text.primary',
            }}
            data-aos="fade-up"
          >
            Trusted by Leading Packaging Manufacturers
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              color: 'text.secondary',
              maxWidth: 700,
              mx: 'auto',
              lineHeight: 1.7,
            }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Join hundreds of packaging companies that rely on ZeeERP to streamline operations, 
            reduce costs, and scale their business with confidence.
          </Typography>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: { xs: 4, md: 6 } }}>
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 3,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      borderColor: 'primary.main',
                    },
                  }}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <CardContent>
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
                      <IconComponent sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Companies Slider */}
        <Box
          sx={{
            position: 'relative',
            mb: { xs: 4, md: 6 },
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
              bottom: '-40px',
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
            {trustedCompanies.map((company, index) => (
              <Box key={company.name} sx={{ px: 1 }}>
                <Card
                  sx={{
                    height: '100%',
                    p: 3,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[6],
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: 'primary.light',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: '1.25rem',
                        }}
                      >
                        {company.name.charAt(0)}
                      </Box>
                      <Chip
                        label="Verified"
                        size="small"
                        icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                        sx={{
                          bgcolor: 'success.light',
                          color: 'success.main',
                          fontWeight: 600,
                        }}
                      />
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
                        {company.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mb: 0.5,
                        }}
                      >
                        {company.industry}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }} flexWrap="wrap">
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 14 }} />
                          {company.location}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                          }}
                        >
                          {company.employees} Employees
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>

        {/* Trust Badge */}
        <Box
          sx={{
            mt: { xs: 6, md: 8 },
            textAlign: 'center',
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
          }}
          data-aos="fade-up"
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems="center"
            justifyContent="center"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VerifiedIcon sx={{ fontSize: 32, color: 'success.main' }} />
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Enterprise-Grade Security
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  SOC 2 Compliant • ISO 27001 Certified
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                width: { xs: '100%', sm: 1 },
                height: { xs: 1, sm: 40 },
                bgcolor: 'divider',
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  99.9% Uptime SLA
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Guaranteed Reliability • 24/7 Monitoring
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
