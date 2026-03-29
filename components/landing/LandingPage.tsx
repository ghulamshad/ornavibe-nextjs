'use client';

import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import HeroWithBannerSection from './sections/HeroWithBannerSection';
import CategorySliderSection from './sections/CategorySliderSection';
import FeaturedCategories from './sections/FeaturedCategories';
import FeaturedProducts from './sections/FeaturedProducts';
import TrendingItemsSection from './sections/TrendingItemsSection';
import SmallBannersSection from './sections/SmallBannersSection';
import BenefitsStripSection from './sections/BenefitsStripSection';
import PopularItemsSection from './sections/PopularItemsSection';
import DealSection from './sections/DealSection';
import AboutSection from './sections/AboutSection';
import MegaSaleBannerSection from './sections/MegaSaleBannerSection';
import GallerySection from './sections/GallerySection';
import TestimonialsSection from './sections/TestimonialsSection';
import BlogSection from './sections/BlogSection';
import NewsletterSection from './sections/NewsletterSection';
import { useSiteContent } from '@/contexts/SiteContentContext';
import FeaturedBasketsSection from './sections/FeaturedBasketsSection';
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
      {/* <FeaturedBasketsSection featured={site.featured ?? { title: 'Featured Gift Baskets', subtitle: 'Handpicked for every occasion.' }} /> */}
      {/* <TrendingItemsSection copy={site.trending} /> */}
      {/* <SmallBannersSection items={site.small_banners ?? []} /> */}
      {/* <BenefitsStripSection items={site.benefits ?? []} /> */}
      {/* <PopularItemsSection /> */}
      {/* {deal && <DealSection title={deal.title} countdown_end={deal.countdown_end} />} */}
      {/* <AboutSection content={site.about} /> */}
      {/* {site.promo_banner && <MegaSaleBannerSection banner={site.promo_banner} />} */}
      {/* <GallerySection images={site.gallery ?? []} /> */}
      {/* <TestimonialsSection items={site.testimonials ?? []} /> */}
      {/* <BlogSection /> */}
      {/* <NewsletterSection copy={site.newsletter} /> */}
    </Box>
  );
}
