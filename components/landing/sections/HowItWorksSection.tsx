'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  useTheme,
} from '@mui/material';

const steps = [
  {
    label: 'Sign Up',
    description: 'Create your account and set up your organization in minutes.',
  },
  {
    label: 'Configure',
    description: 'Customize settings, add users, and set up your workflows.',
  },
  {
    label: 'Import Data',
    description: 'Import existing data or start fresh with our templates.',
  },
  {
    label: 'Go Live',
    description: 'Start managing your packaging operations with ZeeERP.',
  },
];

export default function HowItWorksSection() {
  const theme = useTheme();

  return (
    <Box
      id="how-it-works"
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
            Get Started in Minutes
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
            Simple onboarding process. No complex setup required.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }} data-aos="fade-up">
          <Stepper orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} active={true} completed={false}>
                <StepLabel>
                  <Typography variant="h6" fontWeight={600}>
                    {step.label}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Container>
    </Box>
  );
}
