'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface MultipleChoiceOption {
  letter: string;
  text: string;
}

interface MultipleChoiceItem {
  number: number;
  question: string;
  options: MultipleChoiceOption[];
}

interface MultipleChoiceProps {
  items: MultipleChoiceItem[];
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ items }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack spacing={3}>
        {items.map((item) => (
          <Box key={item.number}>
            <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#EFF6FF',
                  border: '2px solid #2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>
                  {item.number}
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif',
                  flex: 1,
                }}
              >
                {item.question}
              </Typography>
            </Stack>

            <Stack spacing={0.75} sx={{ ml: 4 }}>
              {item.options.map((option) => (
                <Stack key={option.letter} direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '2px solid #6B7280',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: '#374151',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <Box component="span" sx={{ fontWeight: 600, mr: 0.5 }}>
                      {option.letter})
                    </Box>
                    {option.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default MultipleChoice;

