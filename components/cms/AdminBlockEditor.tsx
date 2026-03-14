'use client';

import React from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import type { CmsBlock } from '@/types/cms';
import { RichTextEditor } from './RichTextEditor';

const BLOCK_TYPES = [
  { value: 'hero', label: 'Hero' },
  { value: 'rich_text', label: 'Rich text' },
  { value: 'image_banner', label: 'Image banner' },
  { value: 'cta', label: 'Call-to-action' },
  { value: 'product_carousel', label: 'Product carousel' },
  { value: 'category_grid', label: 'Category grid' },
  { value: 'faq', label: 'FAQ' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'countdown', label: 'Countdown' },
  { value: 'custom_html', label: 'Custom HTML' },
];

interface AdminBlockEditorProps {
  value: CmsBlock[];
  onChange: (blocks: CmsBlock[]) => void;
}

export function AdminBlockEditor({ value, onChange }: AdminBlockEditorProps) {
  const blocks = value ?? [];

  const updateConfig = (index: number, patch: Record<string, unknown>) => {
    const next = [...blocks];
    next[index] = {
      ...next[index],
      config: { ...(next[index].config ?? {}), ...patch },
    };
    onChange(next);
  };

  const updateBlock = (index: number, patch: Partial<CmsBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...patch };
    onChange(reindex(next));
  };

  const addBlock = (type: string) => {
    const next: CmsBlock[] = [
      ...blocks,
      {
        type,
        position: blocks.length,
        config: {},
        is_active: true,
      },
    ];
    onChange(next);
  };

  const removeBlock = (index: number) => {
    const next = blocks.filter((_, i) => i !== index);
    onChange(reindex(next));
  };

  const moveBlock = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(reindex(next));
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
        <Typography variant="subtitle1" fontWeight={600}>
          Page blocks
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <TextField
          select
          size="small"
          label="Add block"
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) addBlock(v);
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Select type…</MenuItem>
          {BLOCK_TYPES.map((b) => (
            <MenuItem key={b.value} value={b.value}>
              {b.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {blocks.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No blocks yet. Use “Add block” to start building the page.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {blocks.map((block, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {index + 1}. {block.type.replace(/_/g, ' ')}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={block.is_active !== false}
                      onChange={(e) => updateBlock(index, { is_active: e.target.checked })}
                    />
                  }
                  label={<Typography variant="caption">Active</Typography>}
                />
                <IconButton size="small" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label="Move up">
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} aria-label="Move down">
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => removeBlock(index)} aria-label="Remove">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <BlockConfigEditor block={block} onChange={(configPatch) => updateConfig(index, configPatch)} />
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}

interface BlockConfigEditorProps {
  block: CmsBlock;
  onChange: (configPatch: Record<string, unknown>) => void;
}

function BlockConfigEditor({ block, onChange }: BlockConfigEditorProps) {
  const { type, config = {} } = block;

  switch (type) {
    case 'hero':
      return (
        <Stack spacing={2}>
          <TextField fullWidth label="Heading" value={config.heading ?? ''} onChange={(e) => onChange({ heading: e.target.value })} />
          <TextField fullWidth label="Subheading" value={config.subheading ?? ''} onChange={(e) => onChange({ subheading: e.target.value })} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField fullWidth label="CTA text" value={config.cta_text ?? ''} onChange={(e) => onChange({ cta_text: e.target.value })} />
            <TextField fullWidth label="CTA URL" value={config.cta_url ?? ''} onChange={(e) => onChange({ cta_url: e.target.value })} />
          </Stack>
          <TextField
            fullWidth
            label="Background image URL"
            value={config.background_image ?? ''}
            onChange={(e) => onChange({ background_image: e.target.value })}
          />
        </Stack>
      );
    case 'rich_text':
      return (
        <RichTextEditor
          value={(config.content as string) ?? ''}
          onChange={(val) => onChange({ content: val })}
          placeholder="Start typing content for this section…"
        />
      );
    case 'image_banner':
      return (
        <Stack spacing={2}>
          <TextField fullWidth label="Image URL" value={config.image_url ?? ''} onChange={(e) => onChange({ image_url: e.target.value })} />
          <TextField fullWidth label="Alt text" value={config.alt ?? ''} onChange={(e) => onChange({ alt: e.target.value })} />
          <TextField fullWidth label="Link URL" value={config.link_url ?? ''} onChange={(e) => onChange({ link_url: e.target.value })} />
        </Stack>
      );
    case 'cta':
      return (
        <Stack spacing={2}>
          <TextField fullWidth label="Title" value={config.title ?? ''} onChange={(e) => onChange({ title: e.target.value })} />
          <TextField fullWidth label="Subtitle" value={config.subtitle ?? ''} onChange={(e) => onChange({ subtitle: e.target.value })} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField fullWidth label="Button text" value={config.button_text ?? ''} onChange={(e) => onChange({ button_text: e.target.value })} />
            <TextField fullWidth label="Button URL" value={config.button_url ?? ''} onChange={(e) => onChange({ button_url: e.target.value })} />
          </Stack>
        </Stack>
      );
    case 'product_carousel':
      return (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Section title"
            value={config.title ?? ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Featured products"
          />
          <TextField
            fullWidth
            type="number"
            label="Max items"
            value={config.limit ?? 8}
            onChange={(e) => {
              const v = Math.max(1, parseInt(String(e.target.value), 10) || 1);
              onChange({ limit: v });
            }}
            inputProps={{ min: 1, max: 24 }}
            helperText="Number of products to show (1–24)."
          />
        </Stack>
      );
    case 'category_grid':
      return (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Section title"
            value={config.title ?? ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="e.g. Shop by category"
          />
          <TextField
            fullWidth
            type="number"
            label="Max categories"
            value={config.limit ?? 8}
            onChange={(e) => {
              const v = Math.max(1, parseInt(String(e.target.value), 10) || 1);
              onChange({ limit: v });
            }}
            inputProps={{ min: 1, max: 20 }}
            helperText="Number of categories to show (1–20)."
          />
        </Stack>
      );
    case 'faq': {
      const items = Array.isArray(config.items) ? config.items : [];
      return (
        <Stack spacing={2}>
          <Typography variant="caption" color="text.secondary">
            FAQ items (question / answer). Order is preserved.
          </Typography>
          {items.map((item: { question?: string; answer?: string }, i: number) => (
            <Paper key={i} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption">Item {i + 1}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    const next = items.filter((_, idx) => idx !== i);
                    onChange({ items: next });
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <TextField
                fullWidth
                size="small"
                label="Question"
                value={item?.question ?? ''}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], question: e.target.value };
                  onChange({ items: next });
                }}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Answer"
                value={item?.answer ?? ''}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], answer: e.target.value };
                  onChange({ items: next });
                }}
                multiline
                rows={2}
              />
            </Paper>
          ))}
          <Button size="small" startIcon={<AddIcon />} onClick={() => onChange({ items: [...items, { question: '', answer: '' }] })}>
            Add FAQ item
          </Button>
        </Stack>
      );
    }
    case 'testimonials': {
      const items = Array.isArray(config.items) ? config.items : [];
      return (
        <Stack spacing={2}>
          <Typography variant="caption" color="text.secondary">
            Testimonial items (quote, author, optional role).
          </Typography>
          {items.map((item: { quote?: string; author?: string; role?: string }, i: number) => (
            <Paper key={i} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption">Testimonial {i + 1}</Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    const next = items.filter((_, idx) => idx !== i);
                    onChange({ items: next });
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
              <TextField
                fullWidth
                size="small"
                label="Quote"
                value={item?.quote ?? ''}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...next[i], quote: e.target.value };
                  onChange({ items: next });
                }}
                multiline
                rows={2}
                sx={{ mb: 1 }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Author"
                  value={item?.author ?? ''}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], author: e.target.value };
                    onChange({ items: next });
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Role (optional)"
                  value={item?.role ?? ''}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...next[i], role: e.target.value };
                    onChange({ items: next });
                  }}
                />
              </Stack>
            </Paper>
          ))}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onChange({ items: [...items, { quote: '', author: '', role: '' }] })}
          >
            Add testimonial
          </Button>
        </Stack>
      );
    }
    case 'countdown':
      return (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Target date/time (ISO)"
            value={config.target_date ?? ''}
            onChange={(e) => onChange({ target_date: e.target.value })}
            placeholder="2026-12-31T23:59:59Z"
            helperText="When the countdown ends."
          />
          <TextField
            fullWidth
            label="Label"
            value={config.label ?? ''}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="e.g. Sale ends in"
          />
          <TextField
            fullWidth
            label="Heading"
            value={config.heading ?? ''}
            onChange={(e) => onChange({ heading: e.target.value })}
            placeholder="Optional heading above countdown"
          />
        </Stack>
      );
    case 'custom_html':
      return (
        <Stack spacing={2}>
          <Typography variant="caption" color="text.secondary">
            Raw HTML. Only available for super-admin in some setups. Sanitized on save.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            label="HTML"
            value={config.html ?? ''}
            onChange={(e) => onChange({ html: e.target.value })}
            placeholder="<div>...</div>"
            sx={{ fontFamily: 'monospace', '& textarea': { fontFamily: 'monospace' } }}
          />
        </Stack>
      );
    default:
      return (
        <Typography variant="body2" color="text.secondary">
          No editor defined for block type “{type}”. Config is stored as-is.
        </Typography>
      );
  }
}

function reindex(blocks: CmsBlock[]): CmsBlock[] {
  return blocks.map((b, i) => ({ ...b, position: i }));
}
