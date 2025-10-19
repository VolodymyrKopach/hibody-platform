'use client';

import React, { ReactNode } from 'react';
import { Box } from '@mui/material';
import { useTheme } from './ThemeProvider';

interface ThemeWrapperProps {
  children: ReactNode;
  applyBackground?: boolean;
  applyPadding?: boolean;
}

/**
 * ThemeWrapper applies current theme styles to its children
 */
export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  children,
  applyBackground = true,
  applyPadding = true,
}) => {
  const { currentTheme } = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: applyBackground ? currentTheme.colors.background : 'transparent',
        padding: applyPadding ? `${currentTheme.spacing.md}px` : 0,
        fontFamily: `var(--theme-font-family)`,
        fontSize: `var(--theme-font-size-md)`,
        lineHeight: currentTheme.typography.lineHeight,
        color: currentTheme.colors.text.primary,
        transition: `all ${currentTheme.animations.duration.normal}ms`,
        '& .theme-button': {
          borderRadius: `${currentTheme.borderRadius.md}px`,
          padding: `${currentTheme.spacing.sm}px ${currentTheme.spacing.md}px`,
          backgroundColor: currentTheme.colors.primary,
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: currentTheme.typography.fontSize.medium,
          fontWeight: currentTheme.typography.fontWeight.medium,
          transition: `all ${currentTheme.animations.duration.fast}ms`,
          '&:hover': currentTheme.animations.enableHover
            ? {
                transform: 'translateY(-2px)',
                boxShadow: currentTheme.shadows.md,
              }
            : {},
        },
        '& .theme-card': {
          backgroundColor: currentTheme.colors.surface,
          borderRadius: `${currentTheme.borderRadius.lg}px`,
          padding: `${currentTheme.spacing.lg}px`,
          boxShadow: currentTheme.shadows.md,
        },
        '& .theme-text-primary': {
          color: currentTheme.colors.text.primary,
        },
        '& .theme-text-secondary': {
          color: currentTheme.colors.text.secondary,
        },
        '& .theme-accent': {
          color: currentTheme.colors.accent,
        },
      }}
    >
      {children}
    </Box>
  );
};

/**
 * HOC to wrap components with theme styling
 */
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & { applyBackground?: boolean; applyPadding?: boolean }> {
  return function ThemedComponent(props) {
    const { applyBackground, applyPadding, ...rest } = props as any;
    
    return (
      <ThemeWrapper applyBackground={applyBackground} applyPadding={applyPadding}>
        <Component {...(rest as P)} />
      </ThemeWrapper>
    );
  };
}

export default ThemeWrapper;

