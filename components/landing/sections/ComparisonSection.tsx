'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { surfaceSoft } from '@/lib/theme/storefrontSurfaces';

const comparisonData = [
  {
    feature: 'Multi-Tenant SaaS',
    zeeerp: true,
    competitor1: false,
    competitor2: false,
  },
  {
    feature: 'Real-Time Costing',
    zeeerp: true,
    competitor1: true,
    competitor2: false,
  },
  {
    feature: 'API Access',
    zeeerp: true,
    competitor1: false,
    competitor2: true,
  },
  {
    feature: 'Role-Based Access',
    zeeerp: true,
    competitor1: true,
    competitor2: true,
  },
  {
    feature: '99.9% Uptime SLA',
    zeeerp: true,
    competitor1: false,
    competitor2: false,
  },
  {
    feature: 'Custom Integrations',
    zeeerp: true,
    competitor1: false,
    competitor2: true,
  },
];

export default function ComparisonSection() {
  const theme = useTheme();

  return (
    <Box
      id="comparison"
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
            Compare with Competitors
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
            See how ZeeERP stacks up against other ERP solutions.
          </Typography>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 3 }} data-aos="fade-up">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: surfaceSoft(theme) }}>
                <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  <Chip label="ZeeERP" color="primary" />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Competitor A</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Competitor B</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonData.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {row.feature}
                  </TableCell>
                  <TableCell align="center">
                    <CheckIcon color="primary" />
                  </TableCell>
                  <TableCell align="center">
                    {row.competitor1 ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.competitor2 ? (
                      <CheckIcon color="success" />
                    ) : (
                      <CloseIcon color="error" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
}
