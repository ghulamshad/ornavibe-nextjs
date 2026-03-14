'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

const faqs = [
  {
    question: 'Can I add a gift message to my order?',
    answer: 'Yes. At checkout you can add a personalized gift message. We include it with the gift basket delivery.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept major credit cards and other payment methods via our secure checkout (Stripe, PayPal, Razorpay).',
  },
  {
    question: 'How is my order delivered?',
    answer: 'We ship gift baskets with care. Delivery options and times depend on your location and the product. Details appear at checkout.',
  },
  {
    question: 'Can I send a gift basket to someone else?',
    answer: 'Yes. Enter the recipient’s shipping address at checkout and add your gift message. We do not include pricing in the package.',
  },
  {
    question: 'What is your return or refund policy?',
    answer: 'Please see our Terms of Service and contact us for refunds or returns. We aim to resolve any issues quickly.',
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection({ faqs: faqsProp = faqs }: { faqs?: FAQItem[] }) {
  const [expanded, setExpanded] = useState<string | false>(false);
  const list = Array.isArray(faqsProp) && faqsProp.length > 0 ? faqsProp : faqs;

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      id="faq"
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="md">
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
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
            }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Everything you need to know about Ornavibe gift baskets.
          </Typography>
        </Box>

        <Box data-aos="fade-up">
          {list.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              sx={{
                mb: 2,
                boxShadow: 2,
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
