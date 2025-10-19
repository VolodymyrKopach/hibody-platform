'use client';

import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Stack,
  Paper,
  Typography,
  Chip,
  Tooltip,
  alpha,
  useTheme as useMuiTheme,
  Button,
  Collapse,
} from '@mui/material';
import { 
  Palette, 
  ChevronDown, 
  ChevronUp, 
  Check,
  Sparkles,
} from 'lucide-react';
import { VisualTheme, ThemeName } from '@/types/themes';
import { getAllThemes, getThemesByAge, getTheme } from '@/constants/visual-themes';

interface ThemeSelectorProps {
  currentTheme?: ThemeName;
  ageGroup?: string;
  onChange: (theme: ThemeName) => void;
  showAllThemes?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  ageGroup,
  onChange,
  showAllThemes = false,
}) => {
  const muiTheme = useMuiTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Get themes filtered by age group or all themes
  const availableThemes = showAllThemes 
    ? getAllThemes() 
    : ageGroup 
      ? getThemesByAge(ageGroup) 
      : getAllThemes();

  // Get current theme object
  const currentThemeObj = currentTheme ? getTheme(currentTheme) : null;

  const handleThemeSelect = (themeName: ThemeName) => {
    onChange(themeName);
    setIsExpanded(false);
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
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Palette size={16} />
        Visual Theme
        {ageGroup && (
          <Chip 
            label={`Age ${ageGroup}`} 
            size="small" 
            sx={{ 
              height: 18, 
              fontSize: '0.65rem',
              fontWeight: 600,
            }} 
          />
        )}
      </FormLabel>

      {/* Current Theme Display */}
      {currentThemeObj && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 1.5,
            background: alpha(currentThemeObj.colors.primary, 0.05),
            border: `2px solid ${alpha(currentThemeObj.colors.primary, 0.3)}`,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: currentThemeObj.colors.primary,
              background: alpha(currentThemeObj.colors.primary, 0.08),
            },
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${currentThemeObj.colors.primary} 0%, ${currentThemeObj.colors.secondary} 100%)`,
                    border: `2px solid ${currentThemeObj.colors.accent}`,
                  }}
                />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  {currentThemeObj.name}
                </Typography>
                <Chip
                  label={getCategoryLabel(currentThemeObj.category)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    backgroundColor: alpha(getCategoryColor(currentThemeObj.category), 0.1),
                    color: getCategoryColor(currentThemeObj.category),
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {currentThemeObj.description}
              </Typography>
            </Box>
            {isExpanded ? (
              <ChevronUp size={20} color={muiTheme.palette.text.secondary} />
            ) : (
              <ChevronDown size={20} color={muiTheme.palette.text.secondary} />
            )}
          </Stack>
        </Paper>
      )}

      {/* No Theme Selected */}
      {!currentThemeObj && (
        <Button
          variant="outlined"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            mb: 1.5,
            justifyContent: 'space-between',
            textTransform: 'none',
            borderRadius: 2,
            py: 1.5,
          }}
          endIcon={isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Sparkles size={16} />
            <Typography variant="body2">Select a theme</Typography>
          </Stack>
        </Button>
      )}

      {/* Theme Options */}
      <Collapse in={isExpanded}>
        <Stack spacing={1.5}>
          {availableThemes.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                textAlign: 'center',
                backgroundColor: alpha(muiTheme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(muiTheme.palette.warning.main, 0.2)}`,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No themes available for age group <strong>{ageGroup}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try selecting a different age group
              </Typography>
            </Paper>
          )}

          {availableThemes.map((theme) => {
            const isSelected = currentTheme === theme.id;

            return (
              <Paper
                key={theme.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  background: isSelected
                    ? alpha(theme.colors.primary, 0.1)
                    : alpha(muiTheme.palette.background.paper, 0.5),
                  border: isSelected
                    ? `2px solid ${theme.colors.primary}`
                    : `1px solid ${alpha(muiTheme.palette.divider, 0.3)}`,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.colors.primary,
                    background: alpha(theme.colors.primary, 0.05),
                    transform: 'translateX(4px)',
                  },
                }}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  {/* Theme Color Preview */}
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 50%, ${theme.colors.accent} 100%)`,
                      border: `2px solid ${alpha(theme.colors.primary, 0.3)}`,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Check 
                        size={24} 
                        color="#ffffff" 
                        strokeWidth={3}
                      />
                    )}
                  </Box>

                  {/* Theme Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          fontWeight: 700, 
                          fontSize: '0.85rem',
                          color: isSelected ? theme.colors.primary : 'text.primary',
                        }}
                      >
                        {theme.name}
                      </Typography>
                      <Chip
                        label={getCategoryLabel(theme.category)}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.6rem',
                          fontWeight: 600,
                          backgroundColor: alpha(getCategoryColor(theme.category), 0.1),
                          color: getCategoryColor(theme.category),
                        }}
                      />
                    </Stack>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        fontSize: '0.7rem',
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {theme.description}
                    </Typography>
                    
                    {/* Age Groups */}
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      {theme.suitableForAges.map((age) => (
                        <Chip
                          key={age}
                          label={age}
                          size="small"
                          sx={{
                            height: 16,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            backgroundColor: alpha(muiTheme.palette.primary.main, 0.05),
                            color: muiTheme.palette.primary.main,
                            '& .MuiChip-label': {
                              px: 0.75,
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Collapse>

      {/* Helper Text */}
      {!showAllThemes && ageGroup && (
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ 
            mt: 1.5, 
            display: 'block',
            fontSize: '0.7rem',
          }}
        >
          Showing themes suitable for age group <strong>{ageGroup}</strong>. 
          <br />
          Theme affects colors, typography, spacing, and animations.
        </Typography>
      )}
    </FormControl>
  );
};

