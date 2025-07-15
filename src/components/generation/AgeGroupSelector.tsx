/**
 * === SOLID: SRP - Single Responsibility ===
 * Компонент відповідальний лише за вибір вікової групи
 */

import React from 'react';
import { Box, Button, Typography, useTheme, alpha } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AgeGroup, AgeGroupSelectorProps } from '../../types/generation';
import { getAgeGroupConfig } from './configs';

// === SOLID: SRP - Styled Components ===
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
    boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
  },
}));

// === SOLID: SRP - Головний компонент ===
const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({
  selectedAge,
  onAgeSelect
}) => {
  const theme = useTheme();
  
  // === SOLID: OCP - Легко розширюється новими віковими групами ===
  const ageGroups: AgeGroup[] = ['2-3', '4-6', '7-8', '9-10'];
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 2,
        mb: 3
      }}>
        {ageGroups.map((age) => {
          const config = getAgeGroupConfig(age);
          const Icon = config.icon;
          const isSelected = selectedAge === age;
          
          return (
            <AgeButton
              key={age}
              variant={isSelected ? 'contained' : 'outlined'}
              className={isSelected ? 'selected' : ''}
              onClick={() => onAgeSelect(age)}
              sx={{
                borderColor: config.color,
                color: isSelected ? theme.palette.primary.contrastText : config.color,
                backgroundColor: isSelected ? config.color : 'transparent',
                '&:hover': {
                  borderColor: config.color,
                  backgroundColor: isSelected ? config.color : alpha(config.color, 0.1),
                  color: isSelected ? theme.palette.primary.contrastText : config.color,
                },
                '&.selected': {
                  backgroundColor: config.color,
                  borderColor: config.color,
                  boxShadow: `0 8px 25px ${alpha(config.color, 0.4)}`,
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

export default AgeGroupSelector; 