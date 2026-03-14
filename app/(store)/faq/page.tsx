'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import Link from 'next/link';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Home, NavigateNext } from '@mui/icons-material';
import { fetchFaq, type FaqPageResponse } from '@/lib/api/site.service';

export default function FaqPage() {
  const [data, setData] = useState<FaqPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFaq()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load FAQ. Please try again later.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!data) return;
    if (data.meta_title) document.title = data.meta_title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && data.meta_description) metaDesc.setAttribute('content', data.meta_description);
  }, [data]);

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error">{error}</Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <MuiLink component={Link} href="/">
              Return to home
            </MuiLink>
          </Typography>
        </Container>
      </Box>
    );
  }

  const title = data?.title ?? 'Frequently Asked Questions';
  const items = data?.items ?? [];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <MuiLink component={Link} href="/" color="inherit" underline="hover">
            Home
          </MuiLink>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>

        <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Find answers to common questions about our gift baskets, orders, shipping, and returns.
          </Typography>

          {items.length === 0 ? (
            <Typography color="text.secondary">
              No FAQ entries at the moment. Please contact us if you have any questions.
            </Typography>
          ) : (
            <Box>
              {items.map((item) => (
                <Accordion
                  key={item.id}
                  disableGutters
                  sx={{
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-of-type': { borderBottom: 'none' },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`faq-${item.id}-content`}
                    id={`faq-${item.id}-header`}
                    sx={{ px: 0, '& .MuiAccordionSummary-content': { my: 2 } }}
                  >
                    <Typography fontWeight={600} component="h2" variant="subtitle1">
                      {item.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}
                      component="div"
                    >
                      {item.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
