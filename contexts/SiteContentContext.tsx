'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSiteContent, type SiteContent } from '@/lib/api/site.service';

const defaultContent: SiteContent = {
  store: {
    currency: 'PKR',
    currency_symbol: 'Rs.',
    payment_gateway_stripe_enabled: true,
    payment_gateway_bank_deposit_enabled: true,
    logo_url: '',
  },
  theme: {
    primary: '',
    secondary: '',
    background_default: '',
    paper: '',
  },
  topbar: {
    enabled: true,
    background: '#444444',
    text_color: '#ffffff',
    center_text: 'Gifts That Make Moments Unforgettable!',
    center_text_color: '#fff3e3',
    center_link: '',
    phone: '+92 300 1233953',
    phone_color: '#fff3e3',
    social_links: [
      { label: 'Facebook', href: 'https://www.facebook.com/beezleonline' },
      { label: 'Pinterest', href: 'https://www.pinterest.co.uk/beezlestore/' },
      { label: 'Instagram', href: 'https://www.instagram.com/beezle.store' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@beezle.store' },
      { label: 'YouTube', href: 'https://www.youtube.com/@BeezleStore65' },
    ],
  },
  hero: {
    title: 'Curated Gift Baskets for Every Occasion',
    subtitle:
      'Ornavibe by Rason Business. Handpicked gift baskets with personalized messages, secure checkout, and delivery.',
    cta_primary: 'Shop Gift Baskets',
    cta_secondary: 'Browse Categories',
  },
  hero_stats: [
    { label: 'Total sales', value: '50k+' },
    { label: 'Happy clients', value: '90k+' },
    { label: 'Average rating', value: '4.9★' },
  ],
  hero_banner: {
    eyebrow: 'Start $10.99',
    title: 'Special Gifts Box For Your Love',
    cta_text: 'Shop Now',
    cta_href: '/products',
    image_url: '',
  },
  about: {
    title: 'About Ornavibe',
    body: 'Ornavibe is the gift basket shop by Rason Business.',
    bullet_list: ['We Made Awesome Products', 'Competitive Price & Easy To Shop', 'Affordable Modern Design', 'Streamlined Shipping Experience'],
  },
  hero_slides: [
    {
      sub_title: 'Start From $15.99',
      title: 'Discover the latest trends and unique gifts for you',
      description: 'There are many variations of passages available but the majority have suffered alteration in some form.',
      cta_primary_text: 'About Us',
      cta_primary_href: '/about',
      cta_secondary_text: 'Shop Now',
      cta_secondary_href: '/products',
      image_url: '',
    },
  ],
  hero_slider_variant: 'overlay',
  small_banners: [
    { eyebrow: 'Gift Box', title: 'Awesome Gifts Box Collections', cta_text: 'Shop Now', cta_href: '/products', image_url: '' },
    { eyebrow: 'Occasion Gift', title: 'Best Occasion Gifts Collections', cta_text: 'Discover Now', cta_href: '/categories', image_url: '' },
    { eyebrow: 'Hot Sale', title: 'Combo Sets Gift Box Up To 50% Off', cta_text: 'Discover Now', cta_href: '/products', image_url: '' },
  ],
  deal_section: { title: 'Best Deals For This Week', countdown_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() },
  gallery: [],
  testimonials: [
    { name: 'Sylvia H Green', role: 'Customer', quote: 'There are many variations of long passages available but the content majority have suffered to the editor page when looking at its layout alteration in some injected.', avatar_url: '', rating: 5 },
  ],
  testimonials_section: {
    title: 'Testimonials',
    explore_more_href: '/testimonials',
    explore_more_label: 'Explore More',
  },
  newsletter: { title: 'Get 20% Off Discount Coupon', subtitle: 'By Subscribe Our Newsletter', button_text: 'Subscribe' },
  contact: { title: 'Contact', body: 'Reach out to us.', email: '', phone: '' },
  faqs: [],
  benefits: [
    { title: 'Free Delivery', subtitle: 'Orders over $120' },
    { title: 'Get Refund', subtitle: 'Within 30 days returns' },
    { title: 'Safe Payment', subtitle: '100% secure checkout' },
    { title: '24/7 Support', subtitle: 'We’re here to help' },
  ],
  cta: { title: 'Find the Perfect Gift Basket', subtitle: 'Browse our curated collection.' },
  footer: {
    brand: 'Ornavibe',
    company: 'Rason Business',
    tagline: 'Curated gift baskets for every occasion.',
    background: '#212121',
    text_color: '#f5f5f5',
  },
  featured: {
    title: 'Featured Gift Baskets',
    subtitle: 'Handpicked by Rason Business for every occasion.',
  },
  promo_banner: {
    eyebrow: 'Mega Collections',
    title: 'Huge Sale Up To 40% Off',
    subtitle: 'At our outlet stores – limited time only.',
    cta_label: 'Shop Now',
    cta_href: '/products',
  },
  trending: {
    eyebrow: 'Trending Items',
    title: 'Discover Our Best Gifts',
    view_more_label: 'View More',
  },
  blog: {
    title: 'Blog',
    subtitle: 'Stories, tips, and updates from our team.',
    meta_title: 'Blog',
    meta_description: 'Read our latest articles, gift ideas, and company updates.',
  },
  sticky_contact: {
    enabled: false,
    placement: 'middle_right',
    edge_offset: 16,
    vertical_offset: 0,
    custom_top: null,
    custom_right: null,
    custom_bottom: null,
    custom_left: null,
    items: [],
  },
};

const SiteContentContext = createContext<SiteContent>(defaultContent);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    fetchSiteContent()
      .then(setContent)
      .catch(() => {});
  }, []);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
