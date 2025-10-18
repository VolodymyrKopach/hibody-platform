'use client';

import React from 'react';
import { Box, Typography, Stack, Card, alpha, useTheme, Tooltip } from '@mui/material';
import { FileText, Zap, Lock } from 'lucide-react';

interface ModeSelectionCardsProps {
  selectedMode?: 'pdf' | 'interactive';
  onModeSelect: (mode: 'pdf' | 'interactive') => void;
  ageGroup: string;
}

const ModeSelectionCards: React.FC<ModeSelectionCardsProps> = ({
  selectedMode,
  onModeSelect,
  ageGroup,
}) => {
  const theme = useTheme();

  // Interactive mode only available for 2-3 years for now
  const isInteractiveAvailable = ageGroup === '2-3';

  const modes = [
    {
      id: 'pdf' as const,
      icon: FileText,
      title: 'PDF Worksheet',
      subtitle: 'For printing',
      description: 'Create printable worksheets with exercises, coloring activities, and more. Perfect for offline learning.',
      features: ['Print-ready', 'Coloring pages', 'Exercises', 'Works offline'],
      color: theme.palette.primary.main,
      available: true,
    },
    {
      id: 'interactive' as const,
      icon: Zap,
      title: 'Interactive Worksheet',
      subtitle: 'With animations & sounds',
      description: 'Engaging activities with animations, sounds, and instant feedback. Perfect for tablets and online learning.',
      features: ['Animations', 'Sound effects', 'Instant feedback', 'Progress tracking'],
      color: theme.palette.secondary.main,
      available: isInteractiveAvailable,
    },
  ];

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          textAlign: 'center',
          color: theme.palette.text.primary,
        }}
      >
        Choose worksheet type
      </Typography>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{
          '& > *': {
            flex: 1,
          },
        }}
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          const isDisabled = !mode.available;

          const card = (
            <Card
              onClick={() => !isDisabled && onModeSelect(mode.id)}
              sx={{
                position: 'relative',
                p: 3,
                borderRadius: '20px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                border: `2px solid ${
                  isSelected
                    ? mode.color
                    : alpha(theme.palette.divider, 0.1)
                }`,
                background: isSelected
                  ? `linear-gradient(135deg, ${alpha(mode.color, 0.1)} 0%, ${alpha(mode.color, 0.05)} 100%)`
                  : theme.palette.background.paper,
                opacity: isDisabled ? 0.6 : 1,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': isDisabled
                  ? {}
                  : {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 12px 32px ${alpha(mode.color, 0.25)}`,
                      border: `2px solid ${mode.color}`,
                    },
              }}
            >
              {/* Lock icon for disabled */}
              {isDisabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: alpha(theme.palette.grey[500], 0.1),
                    borderRadius: '50%',
                    p: 1,
                  }}
                >
                  <Lock size={20} color={theme.palette.grey[500]} />
                </Box>
              )}

              {/* Icon */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  background: `linear-gradient(135deg, ${alpha(mode.color, 0.2)} 0%, ${alpha(mode.color, 0.1)} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <Icon size={40} color={mode.color} />
              </Box>

              {/* Title */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                }}
              >
                {mode.title}
              </Typography>

              {/* Subtitle */}
              <Typography
                variant="caption"
                sx={{
                  color: mode.color,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 2,
                  display: 'block',
                }}
              >
                {mode.subtitle}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                {mode.description}
              </Typography>

              {/* Features */}
              <Stack spacing={1}>
                {mode.features.map((feature, index) => (
                  <Stack
                    key={index}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: mode.color,
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                      }}
                    >
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* Selected indicator */}
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 32,
                    height: 32,
                    borderRadius: '0 18px 0 12px',
                    background: mode.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: 'white', fontSize: '1.2rem' }}>
                    ✓
                  </Typography>
                </Box>
              )}
            </Card>
          );

          // Wrap in Tooltip if disabled
          if (isDisabled) {
            return (
              <Tooltip
                key={mode.id}
                title="Coming soon for this age group"
                arrow
                placement="top"
              >
                <Box>{card}</Box>
              </Tooltip>
            );
          }

          return <Box key={mode.id}>{card}</Box>;
        })}
      </Stack>
    </Box>
  );
};

export default ModeSelectionCards;

