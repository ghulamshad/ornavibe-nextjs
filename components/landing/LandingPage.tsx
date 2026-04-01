'use client';

import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import FeaturedCategories from './sections/FeaturedCategories';
import FeaturedProducts from './sections/FeaturedProducts';
import TestimonialsSection from './sections/TestimonialsSection';
import { useSiteContent } from '@/contexts/SiteContentContext';
import HeroBanner from './sections/HeroBanner';

export default function LandingPage() {
  const site = useSiteContent();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('aos').then((AOS) => {
        AOS.default.init({
          duration: 800,
          easing: 'ease-in-out',
          once: true,
          offset: 100,
        });
      });
    }
  }, []);

  const heroSlides = site.hero_slides && site.hero_slides.length > 0 ? site.hero_slides : undefined;
  const deal = site.deal_section;
  const heroVariant = site.hero_slider_variant === 'full_bleed' ? 'full_bleed' : 'overlay';

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.default' }}>
      <HeroBanner slides={heroSlides ?? []} />
      
      <FeaturedCategories />
      {/* <CategorySliderSection /> */}
      <FeaturedProducts />
      <TestimonialsSection
        items={site.testimonials ?? []}
        title={site.testimonials_section?.title}
        exploreMoreLabel={site.testimonials_section?.explore_more_label}
        exploreMoreHref={
          site.testimonials_section?.explore_more_href === null
            ? ''
            : (site.testimonials_section?.explore_more_href ?? '/testimonials')
        }
      />
      
    </Box>
  );
}
