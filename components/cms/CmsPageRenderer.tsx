'use client';

import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import type { CmsBlock, CmsPage } from '@/types/cms';

interface Props {
  page: CmsPage;
}

export function CmsPageRenderer({ page }: Props) {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight={700} gutterBottom>
          {page.title}
        </Typography>
        {page.seo?.meta_description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {page.seo.meta_description}
          </Typography>
        )}
        {page.blocks?.map((block) => (
          <Box key={block.id ?? `${block.type}-${block.position}`} sx={{ mb: 4 }}>
            <CmsBlockRenderer block={block} />
          </Box>
        ))}
      </Container>
    </Box>
  );
}

interface BlockProps {
  block: CmsBlock;
}

function CmsBlockRenderer({ block }: BlockProps) {
  const { type, config } = block;
  switch (type) {
    case 'hero':
      return (
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 2,
            backgroundImage: config.background_image ? `url(${config.background_image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: config.background_image ? 'common.white' : 'text.primary',
          }}
        >
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {config.heading}
          </Typography>
          {config.subheading && (
            <Typography variant="h6" sx={{ mb: 3 }}>
              {config.subheading}
            </Typography>
          )}
          {config.cta_text && config.cta_url && (
            <Button variant="contained" color="primary" href={config.cta_url}>
              {config.cta_text}
            </Button>
          )}
        </Paper>
      );
    case 'rich_text':
      return (
        <Box
          sx={{
            '& h2': { fontSize: '1.5rem', fontWeight: 600, mt: 3, mb: 1 },
            '& p': { mb: 2, lineHeight: 1.8 },
            '& ul, & ol': { pl: 3, mb: 2 },
          }}
          dangerouslySetInnerHTML={{ __html: config.content ?? '' }}
        />
      );
    case 'image_banner':
      return (
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
          {config.image_url && (
            <Box
              component="img"
              src={config.image_url}
              alt={config.alt ?? ''}
              sx={{ width: '100%', display: 'block', borderRadius: 2 }}
            />
          )}
        </Box>
      );
    case 'cta':
      return (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {config.title}
          </Typography>
          {config.subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {config.subtitle}
            </Typography>
          )}
          {config.button_text && config.button_url && (
            <Button variant="contained" color="primary" href={config.button_url}>
              {config.button_text}
            </Button>
          )}
        </Paper>
      );
    case 'faq':
      return (
        <Box>
          {Array.isArray(config.items) &&
            config.items.map((item: any, idx: number) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {item.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.answer}
                </Typography>
              </Box>
            ))}
        </Box>
      );
    case 'testimonials':
      return (
        <Grid container spacing={2}>
          {Array.isArray(config.items) &&
            config.items.map((item: any, idx: number) => (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    “{item.quote}”
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {item.name}
                  </Typography>
                  {item.role && (
                    <Typography variant="caption" color="text.secondary">
                      {item.role}
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
        </Grid>
      );
    default:
      return null;
  }
}

