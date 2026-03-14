'use client';

import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import Slider from 'react-slick';
import { Star } from '@mui/icons-material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  avatar_url?: string;
  rating?: number;
}

export default function TestimonialsSection({ items }: { items: TestimonialItem[] }) {
  const list =
    Array.isArray(items) && items.length > 0
      ? items
      : ([
          {
            name: 'Sylvia H Green',
            role: 'Customer',
            quote:
              'There are many variations of long passages available but the content majority have suffered to the editor page when looking at its layout alteration in some injected.',
            avatar_url: '',
            rating: 5,
          },
        ] as TestimonialItem[]);

  const settings = {
    dots: true,
    infinite: list.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
  };

  return (
    <SectionContainer variant="soft">
      <SectionHeader
        eyebrow="Testimonials"
        title="What Our Clients Say About Us"
      />

      <Box sx={{ maxWidth: 720, mx: 'auto', '& .slick-dots': { bottom: -40 } }}>
        <Slider {...settings}>
          {list.map((t, index) => (
            <Box key={index} sx={{ px: { xs: 0, sm: 4 }, textAlign: 'center' }}>
              <Avatar
                src={t.avatar_url}
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                }}
              >
                {(t.name || 'U').charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t.role}
              </Typography>
              <Typography sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2 }}>
                &ldquo;{t.quote}&rdquo;
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                {Array.from({ length: t.rating ?? 5 }).map((_, i) => (
                  <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                ))}
              </Box>
            </Box>
          ))}
        </Slider>
      </Box>
    </SectionContainer>
  );
}
