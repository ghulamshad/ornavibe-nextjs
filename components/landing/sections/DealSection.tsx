'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Box, Container, Typography, Grid, Card, CardActionArea, CardMedia, CardContent, Chip, CircularProgress, useTheme } from '@mui/material';
import { surfaceSoft } from '@/lib/theme/storefrontSurfaces';
import Slider from 'react-slick';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import { fetchProductsRequest } from '@/redux/slices/catalog.slice';
import type { Product } from '@/types/catalog';
import { resolveMediaUrl } from '@/lib/utils/media';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const imageFor = (p: Product) => resolveMediaUrl(p.images?.[0] ? p.images[0] : p.image_url || '');

function Countdown({ endISO }: { endISO: string }) {
  const end = useMemo(() => new Date(endISO).getTime(), [endISO]);
  const [diff, setDiff] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      let ms = Math.max(0, end - now);
      const d = Math.floor(ms / 86400000);
      ms %= 86400000;
      const h = Math.floor(ms / 3600000);
      ms %= 3600000;
      const m = Math.floor(ms / 60000);
      ms %= 60000;
      const s = Math.floor(ms / 1000);
      setDiff({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
      {[
        { v: diff.d, l: 'Day' },
        { v: diff.h, l: 'Hours' },
        { v: diff.m, l: 'Minutes' },
        { v: diff.s, l: 'Seconds' },
      ].map(({ v, l }) => (
        <Box
          key={l}
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 2,
            px: 2,
            py: 1,
            textAlign: 'center',
            minWidth: 64,
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <Typography variant="h5" fontWeight={800}>
            {String(v).padStart(2, '0')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {l}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function DealSection({
  title,
  countdown_end,
}: {
  title: string;
  countdown_end: string;
}) {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector((state: RootState) => state.catalog);

  useEffect(() => {
    if (!products.length) dispatch(fetchProductsRequest());
  }, [dispatch, products.length]);

  const list = products.slice(0, 12);
  const settings = {
    dots: false,
    infinite: list.length > 4,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 2,
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 3 } },
      { breakpoint: 600, settings: { slidesToShow: 2 } },
    ],
  };

  return (
    <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: surfaceSoft(theme) }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { md: 'center' },
            justifyContent: 'space-between',
            gap: 3,
            mb: 4,
          }}
        >
          <Typography variant="h4" fontWeight={800}>
            {title || 'Best Deals For This Week'}
          </Typography>
          <Countdown endISO={countdown_end} />
        </Box>

        {loading && !list.length ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : list.length > 0 ? (
          <Box sx={{ '& .slick-slide': { px: 1 }, '& .slick-list': { mx: -1 } }}>
            <Slider {...settings}>
              {list.map((product) => {
                const img = imageFor(product);
                return (
                  <Box key={product.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'background.paper',
                        '&:hover': { boxShadow: 4 },
                      }}
                    >
                      <CardActionArea component={Link} href={`/products/${product.slug}`}>
                        <Box sx={{ position: 'relative', pt: '100%', bgcolor: surfaceSoft(theme) }}>
                          {img && (
                            <CardMedia
                              component="img"
                              image={img}
                              alt={product.name}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                p: 1,
                              }}
                            />
                          )}
                        </Box>
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" color="primary.main" fontWeight={700}>
                            ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Box>
                );
              })}
            </Slider>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
