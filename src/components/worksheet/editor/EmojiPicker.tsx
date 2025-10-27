'use client';

import React, { useState } from 'react';
import { Box, TextField, Popover, Typography } from '@mui/material';

interface EmojiPickerProps {
  label: string;
  value: string;
  onChange: (emoji: string) => void;
  suggestions?: string[];
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  label,
  value,
  onChange,
  suggestions = ['😊', '🎨', '🐻', '🦁', '🐼', '🦊', '🐨', '🎯', '🎪', '🗺️', '🔍', '⚖️', '🎉', '✏️', '✂️', '🌟', '🎈', '🚀'],
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <Box
          onClick={handleClick}
          sx={{
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            border: '2px solid #E0E0E0',
            borderRadius: 2,
            cursor: 'pointer',
            bgcolor: '#FFFFFF',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#2196F3',
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',
            },
          }}
        >
          {value || '?'}
        </Box>
        <TextField
          size="small"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Emoji"
          sx={{ width: 100 }}
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: 1,
            maxWidth: 300,
          }}
        >
          {suggestions.map((emoji, index) => (
            <Box
              key={`emoji-${index}-${emoji}`}
              onClick={() => handleEmojiSelect(emoji)}
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                cursor: 'pointer',
                borderRadius: 1,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: '#F5F5F5',
                  transform: 'scale(1.2)',
                },
              }}
            >
              {emoji}
            </Box>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default EmojiPicker;

