// Component is only responsible for age group selection

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { AgeGroup, AgeGroupConfig } from '../../../types/generation';

// === SOLID: SRP - Styled Component ===
const AgeButton = styled(Button)(({ theme }) => ({
  borderRadius: typeof theme.shape.borderRadius === 'number' ? theme.shape.borderRadius * 1.5 : 12,
  padding: theme.spacing(2, 3),
  minHeight: 80,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  
  '&.selected': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
  },
}));

interface AgeGroupSelectorProps {
  selectedAge: AgeGroup | null;
  onSelect: (ageGroup: AgeGroup) => void;
  configs: AgeGroupConfig[];
}

export const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({
  selectedAge,
  onSelect,
  configs
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 2,
        mb: 3
      }}>
        {configs.map((config) => {
          const Icon = config.icon;
          const isSelected = selectedAge === config.id;
          
          return (
            <AgeButton
              key={config.id}
              variant={isSelected ? 'contained' : 'outlined'}
              className={isSelected ? 'selected' : ''}
              onClick={() => onSelect(config.id)}
              sx={{
                borderColor: config.color,
                backgroundColor: isSelected ? config.color : 'transparent',
                color: isSelected ? 'white' : config.color,
                '&:hover': {
                  borderColor: config.color,
                  backgroundColor: isSelected ? config.color : alpha(config.color, 0.1),
                }
              }}
            >
              <Icon size={24} />
              <Typography variant="caption" fontWeight="bold">
                {config.label}
              </Typography>
            </AgeButton>
          );
        })}
      </Box>
    </Box>
  );
}; 