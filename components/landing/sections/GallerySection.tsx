'use client';

import React, { useState } from 'react';
import { Box, Typography, Grid, Modal, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import SectionContainer from '@/components/ui/SectionContainer';
import SectionHeader from '@/components/ui/SectionHeader';

export interface GalleryImage {
  image_url: string;
  alt?: string;
}

export default function GallerySection({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  const list = Array.isArray(images) && images.length > 0 ? images : [];

  if (list.length === 0) return null;

  const handleOpen = (item: GalleryImage) => {
    setSelected(item);
    setOpen(true);
  };

  return (
    <SectionContainer>
      <SectionHeader
        eyebrow="Our Gallery"
        title="Let's Check Our Photo Gallery"
      />

      <Grid container spacing={2}>
        {list.map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
            <Box
              onClick={() => handleOpen(item)}
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                pt: '100%',
                bgcolor: 'grey.200',
                '&:hover .gallery-overlay': { opacity: 1 },
              }}
            >
              {item.image_url ? (
                <Box
                  component="img"
                  src={item.image_url}
                  alt={item.alt || ''}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'grey.300',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
                >
                  Image
                </Box>
              )}
              <Box
                className="gallery-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <Typography variant="h4" color="white">
                  +
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            outline: 'none',
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              top: -48,
              right: 0,
              color: 'white',
              bgcolor: 'rgba(0,0,0,0.5)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            }}
          >
            <Close />
          </IconButton>
          {selected?.image_url && (
            <Box
              component="img"
              src={selected.image_url}
              alt={selected.alt || ''}
              sx={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Modal>
    </SectionContainer>
  );
}

