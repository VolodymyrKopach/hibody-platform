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

  // Interactive mode available for younger age groups (2-6 years)
  const isInteractiveAvailable = ['2-3', '3-5', '4-6'].includes(ageGroup);

  const modes = [
    {
      id: 'pdf' as const,
      icon: FileText,
      title: 'PDF Worksheet',
      subtitle: 'For printing',
      features: ['Print-ready', 'Exercises', 'Works offline'],
      color: theme.palette.primary.main,
      available: true,
    },
    {
      id: 'interactive' as const,
      icon: Zap,
      title: 'Interactive',
      subtitle: 'With animations',
      features: ['Animations', 'Sounds', 'Feedback'],
      color: theme.palette.secondary.main,
      available: isInteractiveAvailable,
    },
  ];

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
          Worksheet Type
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2}>
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          const isDisabled = !mode.available;

          const card = (
            <Card
              onClick={() => !isDisabled && onModeSelect(mode.id)}
              sx={{
                position: 'relative',
                flex: 1,
                p: 2,
                borderRadius: '12px',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                border: `2px solid ${
                  isSelected
                    ? mode.color
                    : alpha(theme.palette.divider, 0.1)
                }`,
                background: isSelected
                  ? `linear-gradient(135deg, ${alpha(mode.color, 0.08)} 0%, ${alpha(mode.color, 0.03)} 100%)`
                  : theme.palette.background.paper,
                opacity: isDisabled ? 0.5 : 1,
                transition: 'all 0.2s',
                '&:hover': isDisabled
                  ? {}
                  : {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(mode.color, 0.15)}`,
                      border: `2px solid ${mode.color}`,
                    },
              }}
            >
              {/* Lock icon for disabled */}
              {isDisabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                >
                  <Lock size={14} color={theme.palette.grey[400]} />
                </Box>
              )}

              {/* Icon and Title Row */}
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${alpha(mode.color, 0.15)} 0%, ${alpha(mode.color, 0.08)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={mode.color} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 0.25,
                    }}
                  >
                    {mode.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                      display: 'block',
                      fontSize: '0.7rem',
                    }}
                  >
                    {mode.subtitle}
                  </Typography>
                </Box>
              </Stack>

              {/* Features - compact list */}
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {mode.features.slice(0, 3).map((feature, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    sx={{
                      color: alpha(theme.palette.text.secondary, 0.7),
                      fontSize: '0.65rem',
                      '&:not(:last-child)::after': {
                        content: '"•"',
                        mx: 0.5,
                      },
                    }}
                  >
                    {feature}
                  </Typography>
                ))}
              </Stack>

              {/* Selected indicator */}
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -1,
                    right: -1,
                    width: 20,
                    height: 20,
                    borderRadius: '0 10px 0 8px',
                    background: mode.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: 'white', fontSize: '0.75rem', lineHeight: 1 }}>
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
              >
                <Box sx={{ flex: 1 }}>{card}</Box>
              </Tooltip>
            );
          }

          return <React.Fragment key={mode.id}>{card}</React.Fragment>;
        })}
      </Stack>
    </Box>
  );
};

export default ModeSelectionCards;

