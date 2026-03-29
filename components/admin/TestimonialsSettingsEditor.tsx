'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export interface TestimonialFormRow {
  name: string;
  role: string;
  quote: string;
  avatar_url?: string;
  rating?: number;
}

function parseRows(raw: string | undefined): TestimonialFormRow[] {
  if (!raw?.trim()) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.map((item) => {
      const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        name: String(o.name ?? ''),
        role: String(o.role ?? ''),
        quote: String(o.quote ?? ''),
        avatar_url: o.avatar_url != null ? String(o.avatar_url) : '',
        rating: typeof o.rating === 'number' ? o.rating : Number(o.rating) || 5,
      };
    });
  } catch {
    return [];
  }
}

function serializeRows(rows: TestimonialFormRow[]): string {
  const normalized = rows.map((r) => ({
    name: r.name.trim(),
    role: r.role.trim(),
    quote: r.quote.trim(),
    avatar_url: r.avatar_url?.trim() ?? '',
    rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))),
  }));
  return JSON.stringify(normalized);
}

const emptyRow = (): TestimonialFormRow => ({
  name: '',
  role: 'Customer',
  quote: '',
  avatar_url: '',
  rating: 5,
});

export interface TestimonialsSettingsEditorProps {
  value: string;
  onChange: (json: string) => void;
}

export default function TestimonialsSettingsEditor({ value, onChange }: TestimonialsSettingsEditorProps) {
  const [rows, setRows] = useState<TestimonialFormRow[]>(() => parseRows(value));

  useEffect(() => {
    setRows(parseRows(value));
  }, [value]);

  const pushChange = useCallback(
    (next: TestimonialFormRow[]) => {
      setRows(next);
      onChange(serializeRows(next));
    },
    [onChange]
  );

  const updateRow = (index: number, patch: Partial<TestimonialFormRow>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    pushChange(next);
  };

  const removeRow = (index: number) => {
    pushChange(rows.filter((_, i) => i !== index));
  };

  const moveRow = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[index], next[j]] = [next[j], next[index]];
    pushChange(next);
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Shown on the homepage testimonials carousel. Each item: customer name, optional role, quote, optional avatar URL,
        and star rating (1–5).
      </Typography>
      {rows.map((row, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Testimonial {index + 1}
            </Typography>
            <Box>
              <IconButton size="small" aria-label="Move up" onClick={() => moveRow(index, -1)} disabled={index === 0}>
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Move down"
                onClick={() => moveRow(index, 1)}
                disabled={index === rows.length - 1}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label="Remove" color="error" onClick={() => removeRow(index)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              size="small"
              label="Name"
              value={row.name}
              onChange={(e) => updateRow(index, { name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              size="small"
              label="Role / location (optional)"
              value={row.role}
              onChange={(e) => updateRow(index, { role: e.target.value })}
              fullWidth
              placeholder="Customer"
            />
            <TextField
              size="small"
              label="Quote"
              value={row.quote}
              onChange={(e) => updateRow(index, { quote: e.target.value })}
              fullWidth
              required
              multiline
              minRows={3}
            />
            <TextField
              size="small"
              label="Avatar image URL (optional)"
              value={row.avatar_url ?? ''}
              onChange={(e) => updateRow(index, { avatar_url: e.target.value })}
              fullWidth
              placeholder="https://… or /storage/…"
            />
            <FormControl size="small" sx={{ maxWidth: 200 }}>
              <InputLabel>Rating</InputLabel>
              <Select
                label="Rating"
                value={row.rating ?? 5}
                onChange={(e) => updateRow(index, { rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n} stars
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>
      ))}
      <Button type="button" startIcon={<AddIcon />} variant="outlined" onClick={() => pushChange([...rows, emptyRow()])}>
        Add testimonial
      </Button>
    </Box>
  );
}
