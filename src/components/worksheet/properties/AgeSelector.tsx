'use client';

import React from 'react';
import {
  Box,
  FormLabel,
  Stack,
  Chip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { Users } from 'lucide-react';

interface AgeSelectorProps {
  currentAge?: string;
  suitableAges: string[]; // Ages suitable for this component
  onChange: (age: string) => void;
}

const AGE_LABELS: Record<string, string> = {
  '2-3': '2-3 yrs',
  '3-5': '3-5 yrs',
  '4-6': '4-6 yrs',
  '6-7': '6-7 yrs',
  '7-8': '7-8 yrs',
  '8-9': '8-9 yrs',
  '9-10': '9-10 yrs',
  '10-11': '10-11 yrs',
  '10-12': '10-12 yrs',
  '11-13': '11-13 yrs',
  '12-13': '12-13 yrs',
  '14-15': '14-15 yrs',
  '16-18': '16-18 yrs',
};

export const AgeSelector: React.FC<AgeSelectorProps> = ({
  currentAge,
  suitableAges,
  onChange,
}) => {
  const muiTheme = useTheme();

  return (
    <Box>
      {/* Header */}
      <FormLabel 
        sx={{ 
          fontWeight: 600, 
          fontSize: '0.75rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 0.5, 
          mb: 1,
        }}
      >
        <Users size={14} />
        Age Group
      </FormLabel>

      {/* Age chips - horizontally scrollable */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.75,
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 0.5,
          px: 0.25,
          mx: -0.25,
          // Custom scrollbar
          '&::-webkit-scrollbar': {
            height: '3px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(muiTheme.palette.divider, 0.1),
            borderRadius: '2px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(muiTheme.palette.primary.main, 0.3),
            borderRadius: '2px',
            '&:hover': {
              background: alpha(muiTheme.palette.primary.main, 0.5),
            },
          },
        }}
      >
        {suitableAges.map((age) => {
          const isSelected = currentAge === age;
          
          return (
            <Chip
              key={age}
              label={AGE_LABELS[age] || age}
              onClick={() => onChange(age)}
              size="small"
              sx={{
                flexShrink: 0,
                height: 28,
                fontSize: '0.7rem',
                fontWeight: isSelected ? 700 : 500,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: isSelected 
                  ? muiTheme.palette.primary.main 
                  : alpha(muiTheme.palette.divider, 0.3),
                backgroundColor: isSelected 
                  ? alpha(muiTheme.palette.primary.main, 0.12)
                  : 'transparent',
                color: isSelected 
                  ? muiTheme.palette.primary.main 
                  : muiTheme.palette.text.secondary,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: muiTheme.palette.primary.main,
                  backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
                  transform: 'translateY(-2px)',
                },
                '& .MuiChip-label': {
                  px: 1.5,
                },
              }}
            />
          );
        })}
      </Box>

      {/* Helper text */}
      {!currentAge && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            mt: 0.75,
            display: 'block',
            fontSize: '0.65rem',
            fontStyle: 'italic',
          }}
        >
          Select age to adjust component style
        </Typography>
      )}
      
      {currentAge && (
        <Typography
          variant="caption"
          sx={{
            mt: 0.75,
            display: 'block',
            fontSize: '0.65rem',
            color: muiTheme.palette.primary.main,
            fontWeight: 600,
          }}
        >
          ✓ Style optimized for {AGE_LABELS[currentAge]}
        </Typography>
      )}
    </Box>
  );
};

