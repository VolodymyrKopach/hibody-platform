'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

interface FillInBlankItem {
  number: number;
  text: string;
  hint?: string;
}

interface FillInBlankProps {
  items: FillInBlankItem[];
  wordBank?: string[];
}

const FillInBlank: React.FC<FillInBlankProps> = ({ items, wordBank }) => {
  return (
    <Box>
      {wordBank && wordBank.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '8px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
          }}
        >
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#059669',
              mb: 1,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            📚 Word Bank
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {wordBank.map((word, idx) => (
              <Box
                key={idx}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: '16px',
                  background: 'white',
                  border: '1px solid #A7F3D0',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {word}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Stack spacing={2}>
        {items.map((item) => (
          <Stack key={item.number} direction="row" spacing={1} alignItems="flex-start">
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
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#374151',
                  fontFamily: 'Inter, sans-serif',
                  mb: 0.5,
                }}
              >
                {item.text.split('______').map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          width: '100px',
                          borderBottom: '2px solid #374151',
                          mx: 0.5,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
                {item.hint && (
                  <Typography
                    component="span"
                    sx={{ fontSize: '12px', color: '#6B7280', ml: 0.5 }}
                  >
                    ({item.hint})
                  </Typography>
                )}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default FillInBlank;

