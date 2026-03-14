'use client';

import React from 'react';
import { Box, Typography, Link, Grid, Divider, IconButton } from '@mui/material';
import { GitHub, LinkedIn, Twitter } from '@mui/icons-material';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Customers", href: "/admin/customers" },
    { label: "Vendors", href: "/admin/vendors" },
    { label: "Orders", href: "/admin/orders" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Settings", href: "/admin/settings" },
  ];

  const socialLinks = [
    { icon: <GitHub />, href: "https://github.com/ZeeShad" },
    { icon: <LinkedIn />, href: "https://linkedin.com/in/ZeeShad" },
    { icon: <Twitter />, href: "https://twitter.com/ZeeShad" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
        py: 4,
        px: { xs: 2, sm: 6, md: 12 },
        mt: "auto",
      }}
    >
      <Grid container spacing={4}>
        {/* Company Info */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="h6" gutterBottom>
            ZeeERP
          </Typography>
          <Typography variant="body2">
            By ZeeShad Private Limited
          </Typography>
          <Typography variant="body2">
            &copy; {currentYear} ZeeERP. All rights reserved.
          </Typography>
        </Grid>

        {/* Quick Links */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Links
          </Typography>
          {quickLinks.map(link => (
            <Typography key={link.label} variant="body2">
              <Link href={link.href} color="inherit" underline="hover">
                {link.label}
              </Link>
            </Typography>
          ))}
        </Grid>

        {/* Social Media */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="h6" gutterBottom>
            Connect With Us
          </Typography>
          <Box>
            {socialLinks.map((link, idx) => (
              <IconButton
                key={idx}
                href={link.href}
                color="inherit"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.icon}
              </IconButton>
            ))}
          </Box>
          <Typography variant="body2" mt={2}>
            Version 1.0.0
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: "primary.contrastText" }} />

      <Typography variant="body2" align="center">
        Made with ❤️ by ZeeShad Private Limited
      </Typography>
    </Box>
  );
}
