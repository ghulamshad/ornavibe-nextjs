'use client';

import React, { useRef } from 'react';
import { Box, Paper, IconButton, Tooltip, Typography } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 160 }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const applyCommand = (command: string, value?: string) => {
    if (ref.current) {
      ref.current.focus();
      // execCommand is deprecated but still widely supported and fine for an internal admin tool
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand(command, false, value);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange((e.currentTarget as HTMLDivElement).innerHTML);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5, gap: 0.5 }}>
        <Tooltip title="Bold">
          <IconButton size="small" onClick={() => applyCommand('bold')}>
            <FormatBoldIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Italic">
          <IconButton size="small" onClick={() => applyCommand('italic')}>
            <FormatItalicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Underline">
          <IconButton size="small" onClick={() => applyCommand('underline')}>
            <FormatUnderlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Quote">
          <IconButton size="small" onClick={() => applyCommand('formatBlock', 'blockquote')}>
            <FormatQuoteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          p: 1.5,
          minHeight,
          cursor: 'text',
        }}
      >
        {value ? null : (
          <Typography variant="body2" color="text.secondary" sx={{ position: 'absolute', opacity: 0.6 }}>
            {placeholder}
          </Typography>
        )}
        <Box
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          dangerouslySetInnerHTML={{ __html: value || '' }}
          sx={{
            outline: 'none',
            '& p': { mb: 1 },
          }}
        />
      </Paper>
    </Box>
  );
}

