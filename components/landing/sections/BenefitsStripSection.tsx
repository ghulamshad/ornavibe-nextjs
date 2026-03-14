'use client';

import React from 'react';
import { Grid } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import SectionContainer from '@/components/ui/SectionContainer';
import FeatureCard from '@/components/ui/FeatureCard';

interface BenefitItem {
  title: string;
  subtitle: string;
}

export default function BenefitsStripSection({ items }: { items: BenefitItem[] }) {
  const list =
    Array.isArray(items) && items.length > 0
      ? items
      : [
          { title: 'Free Delivery', subtitle: 'Orders over $120' },
          { title: 'Get Refund', subtitle: 'Within 30 days returns' },
          { title: 'Safe Payment', subtitle: '100% secure checkout' },
          { title: '24/7 Support', subtitle: 'We’re here to help' },
        ];

  const iconForIndex = (index: number) => {
    switch (index) {
      case 0:
        return <LocalShippingIcon fontSize="large" />;
      case 1:
        return <AutorenewIcon fontSize="large" />;
      case 2:
        return <AccountBalanceWalletIcon fontSize="large" />;
      case 3:
      default:
        return <HeadsetMicIcon fontSize="large" />;
    }
  };

  return (
    <SectionContainer variant="soft">
      <Grid container spacing={0}>
        {list.map((item, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 3 }}
            key={item.title}
            data-aos="fade-up"
            data-aos-delay={index * 80}
            sx={{
              borderRight:
                index < list.length - 1
                  ? (theme) => `1px solid ${theme.palette.divider}`
                  : 'none',
            }}
          >
            <FeatureCard icon={iconForIndex(index)} title={item.title} subtitle={item.subtitle} />
          </Grid>
        ))}
      </Grid>
    </SectionContainer>
  );
}

