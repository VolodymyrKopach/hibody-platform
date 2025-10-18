'use client';

import React from 'react';
import { Box } from '@mui/material';
import { getAgeTheme, AgeGroup } from '@/utils/interactive/ageTheme';

interface AgeThemedWrapperProps {
  ageGroup: string;
  children: React.ReactNode;
  applyBackground?: boolean;
}

/**
 * Wrapper component that applies age-appropriate theming
 * to interactive components
 */
const AgeThemedWrapper: React.FC<AgeThemedWrapperProps> = ({
  ageGroup,
  children,
  applyBackground = true,
}) => {
  const theme = getAgeTheme(ageGroup);

  return (
    <Box
      sx={{
        width: '100%',
        position: 'relative',
        ...(applyBackground && {
          background: theme.backgrounds.gradient,
          backgroundSize: 'cover',
          p: theme.spacing.md / 8, // Convert to MUI spacing units
          borderRadius: `${theme.componentSizes.card.borderRadius}px`,
        }),
        // CSS Variables for components to use
        '--age-primary': theme.colors.primary,
        '--age-secondary': theme.colors.secondary,
        '--age-accent': theme.colors.accent,
        '--age-success': theme.colors.success,
        '--age-error': theme.colors.error,
        '--age-bg': theme.colors.background,
        '--age-card-bg': theme.colors.cardBackground,
        '--age-text-primary': theme.colors.textPrimary,
        '--age-text-secondary': theme.colors.textSecondary,
        
        '--age-title-size': theme.typography.title.fontSize,
        '--age-body-size': theme.typography.body.fontSize,
        '--age-caption-size': theme.typography.caption.fontSize,
        
        '--age-spacing-xs': `${theme.spacing.xs}px`,
        '--age-spacing-sm': `${theme.spacing.sm}px`,
        '--age-spacing-md': `${theme.spacing.md}px`,
        '--age-spacing-lg': `${theme.spacing.lg}px`,
        '--age-spacing-xl': `${theme.spacing.xl}px`,
        
        '--age-button-height': `${theme.componentSizes.button.height}px`,
        '--age-button-font-size': theme.componentSizes.button.fontSize,
        '--age-card-padding': `${theme.componentSizes.card.padding}px`,
        '--age-card-radius': `${theme.componentSizes.card.borderRadius}px`,
        
        '--age-icon-sm': `${theme.componentSizes.icon.small}px`,
        '--age-icon-md': `${theme.componentSizes.icon.medium}px`,
        '--age-icon-lg': `${theme.componentSizes.icon.large}px`,
        
        '--age-img-sm': `${theme.componentSizes.image.small}px`,
        '--age-img-md': `${theme.componentSizes.image.medium}px`,
        '--age-img-lg': `${theme.componentSizes.image.large}px`,
        
        '--age-anim-fast': `${theme.animations.duration.fast}ms`,
        '--age-anim-normal': `${theme.animations.duration.normal}ms`,
        '--age-anim-slow': `${theme.animations.duration.slow}ms`,
      }}
    >
      {children}
    </Box>
  );
};

export default AgeThemedWrapper;

