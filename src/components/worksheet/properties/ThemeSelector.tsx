'use client';

import React from 'react';
import {
  Box,
  FormLabel,
  Stack,
  Paper,
  Typography,
  Chip,
  Tooltip,
  alpha,
  useTheme as useMuiTheme,
} from '@mui/material';
import { 
  Palette, 
  Check,
} from 'lucide-react';
import { ThemeName } from '@/types/themes';
import { getAllThemes, getThemesByAge, getTheme } from '@/constants/visual-themes';

interface ThemeSelectorProps {
  currentTheme?: ThemeName;
  ageGroup?: string;
  onChange: (theme: ThemeName) => void;
  showAllThemes?: boolean;
  /**
   * Suitable ages for the component (e.g., ['2-3', '4-6', '7-8'] for TapImage)
   * If provided, themes will be filtered to only show those suitable for these ages
   */
  componentSuitableAges?: string[];
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  ageGroup,
  onChange,
  showAllThemes = false,
  componentSuitableAges,
}) => {
  const muiTheme = useMuiTheme();

  // Get themes filtered by age group or all themes
  let availableThemes = showAllThemes 
    ? getAllThemes() 
    : ageGroup 
      ? getThemesByAge(ageGroup) 
      : getAllThemes();

  // If componentSuitableAges is provided, filter themes to only those suitable for the component
  if (componentSuitableAges && componentSuitableAges.length > 0) {
    availableThemes = availableThemes.filter(theme => 
      theme.suitableForAges.some(age => componentSuitableAges.includes(age))
    );
  }

  // Get current theme object
  const currentThemeObj = currentTheme ? getTheme(currentTheme) : null;

  const handleThemeSelect = (themeName: ThemeName) => {
    onChange(themeName);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'playful':
        return muiTheme.palette.success.main;
      case 'educational':
        return muiTheme.palette.info.main;
      case 'professional':
        return muiTheme.palette.warning.main;
      default:
        return muiTheme.palette.grey[500];
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'playful':
        return 'Playful';
      case 'educational':
        return 'Educational';
      case 'professional':
        return 'Professional';
      default:
        return category;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <FormLabel sx={{ fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0 }}>
          <Palette size={14} />
          Theme
        </FormLabel>
        {ageGroup && (
          <Chip 
            label={ageGroup} 
            size="small" 
            sx={{ 
              height: 16, 
              fontSize: '0.6rem',
              fontWeight: 600,
            }} 
          />
        )}
      </Stack>

      {/* Current Theme Name (small badge if selected) */}
      {currentThemeObj && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            fontSize: '0.65rem', 
            fontWeight: 600,
            color: currentThemeObj.colors.primary,
            mb: 1,
          }}
        >
          ✓ {currentThemeObj.name}
        </Typography>
      )}

      {/* Horizontal Scrollable Theme Carousel */}
      {availableThemes.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            overflowY: 'hidden',
            pb: 1,
            px: 0.5,
            mx: -0.5,
            // Hide scrollbar but keep functionality
            '&::-webkit-scrollbar': {
              height: '4px',
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
            // Scroll snap for better UX
            scrollSnapType: 'x mandatory',
            scrollPaddingLeft: '8px',
          }}
        >
          {availableThemes.map((theme) => {
            const isSelected = currentTheme === theme.id;

            return (
              <Tooltip
                key={theme.id}
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                      {theme.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                      {theme.description}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Chip
                        label={getCategoryLabel(theme.category)}
                        size="small"
                        sx={{
                          height: 14,
                          fontSize: '0.55rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          '& .MuiChip-label': {
                            px: 0.5,
                          },
                        }}
                      />
                      {theme.suitableForAges.map((age) => (
                        <Chip
                          key={age}
                          label={age}
                          size="small"
                          sx={{
                            height: 14,
                            fontSize: '0.55rem',
                            fontWeight: 600,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            '& .MuiChip-label': {
                              px: 0.5,
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                }
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: alpha('#1F2937', 0.95),
                      backdropFilter: 'blur(8px)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      maxWidth: 220,
                    },
                  },
                  arrow: {
                    sx: {
                      color: alpha('#1F2937', 0.95),
                    },
                  },
                }}
              >
                <Box
                  onClick={() => handleThemeSelect(theme.id)}
                  sx={{
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`,
                    border: isSelected
                      ? `3px solid ${theme.colors.primary}`
                      : `2px solid ${alpha(theme.colors.primary, 0.3)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    scrollSnapAlign: 'start',
                    '&:hover': {
                      transform: 'translateY(-4px) scale(1.05)',
                      boxShadow: `0 4px 12px ${alpha(theme.colors.primary, 0.4)}`,
                      border: `3px solid ${theme.colors.primary}`,
                    },
                    '&:active': {
                      transform: 'translateY(-2px) scale(1.02)',
                    },
                  }}
                >
                  {/* Check mark for selected */}
                  {isSelected && (
                    <Check 
                      size={24} 
                      color="#ffffff" 
                      strokeWidth={3}
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                      }}
                    />
                  )}
                  
                  {/* Small name label on hover - optional */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: -18,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      backgroundColor: alpha(theme.colors.primary, 0.9),
                      color: 'white',
                      px: 0.75,
                      py: 0.25,
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      '.MuiBox-root:hover > &': {
                        opacity: 1,
                      },
                    }}
                  >
                    {theme.name}
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            textAlign: 'center',
            backgroundColor: alpha(muiTheme.palette.warning.main, 0.05),
            border: `1px solid ${alpha(muiTheme.palette.warning.main, 0.2)}`,
            borderRadius: '8px',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            No themes for <strong>{ageGroup}</strong>
          </Typography>
        </Paper>
      )}

      {/* Helper hint */}
      {availableThemes.length > 3 && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mt: 1, 
            display: 'block',
            fontSize: '0.65rem',
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          ← Scroll to see more →
        </Typography>
      )}
    </Box>
  );
};

