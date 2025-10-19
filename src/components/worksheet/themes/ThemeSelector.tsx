'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  alpha,
  useTheme as useMuiTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Check, Palette } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { ThemeName } from '@/types/themes';
import { getAllThemes } from '@/constants/visual-themes';

interface ThemeSelectorProps {
  ageGroup?: string;
  onThemeChange?: (theme: ThemeName) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  ageGroup,
  onThemeChange,
}) => {
  const { currentTheme, themeName, setTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const allThemes = getAllThemes();

  // Filter themes by age if specified
  const availableThemes = ageGroup
    ? allThemes.filter((theme) => theme.suitableForAges.includes(ageGroup as any))
    : allThemes;

  const handleThemeSelect = (newTheme: ThemeName) => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Palette size={28} color={muiTheme.palette.primary.main} />
        <Typography variant="h5" fontWeight={700}>
          Choose a Theme
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a visual style that matches your learning preference
      </Typography>

      <Grid container spacing={3}>
        {availableThemes.map((theme) => {
          const isSelected = theme.id === themeName;

          return (
            <Grid item xs={12} sm={6} md={4} key={theme.id}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Paper
                  elevation={isSelected ? 8 : 2}
                  onClick={() => handleThemeSelect(theme.id)}
                  sx={{
                    p: 3,
                    cursor: 'pointer',
                    position: 'relative',
                    border: '2px solid',
                    borderColor: isSelected ? theme.colors.primary : 'transparent',
                    transition: 'all 0.3s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: isSelected
                        ? theme.colors.primary
                        : alpha(theme.colors.primary, 0.3),
                      boxShadow: 4,
                    },
                  }}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: theme.colors.primary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        <Check size={20} />
                      </Box>
                    </motion.div>
                  )}

                  {/* Theme preview colors */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      mb: 2,
                      height: 60,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                    <Box
                      sx={{
                        flex: 1,
                        backgroundColor: theme.colors.secondary,
                      }}
                    />
                    <Box
                      sx={{
                        flex: 1,
                        backgroundColor: theme.colors.accent,
                      }}
                    />
                  </Box>

                  {/* Theme name */}
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {theme.name}
                  </Typography>

                  {/* Theme description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {theme.description}
                  </Typography>

                  {/* Category chip */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={theme.category}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.colors.primary, 0.1),
                        color: theme.colors.primary,
                        fontWeight: 600,
                      }}
                    />
                    {theme.ux.useEmojis && (
                      <Chip label="Emojis" size="small" variant="outlined" />
                    )}
                    {theme.ux.useSounds && (
                      <Chip label="Sounds" size="small" variant="outlined" />
                    )}
                  </Box>

                  {/* Animation complexity indicator */}
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Animations: <strong>{theme.animations.complexity}</strong>
                    </Typography>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Current theme info */}
      <Paper
        elevation={3}
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: currentTheme.colors.background,
          border: '2px solid',
          borderColor: currentTheme.colors.primary,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Current Theme: {currentTheme.name}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Font Size:</strong> {currentTheme.typography.fontSize.medium}px
          </Typography>
          <Typography variant="body2">
            <strong>Spacing:</strong> {currentTheme.spacing.md}px
          </Typography>
          <Typography variant="body2">
            <strong>Border Radius:</strong> {currentTheme.borderRadius.md}px
          </Typography>
          <Typography variant="body2">
            <strong>Animation Speed:</strong> {currentTheme.animations.speed}
          </Typography>
          <Typography variant="body2">
            <strong>Suitable for ages:</strong>{' '}
            {currentTheme.suitableForAges.join(', ')}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ThemeSelector;

