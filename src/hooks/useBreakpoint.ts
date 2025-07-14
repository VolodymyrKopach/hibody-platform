import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// === SOLID: SRP - Breakpoint configuration ===
export interface BreakpointConfig {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  currentBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// === SOLID: SRP - Breakpoint detection hook ===
export function useBreakpoint(): BreakpointConfig {
  const theme = useTheme();
  
  // === SOLID: SRP - Media queries ===
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));
  const isXl = useMediaQuery(theme.breakpoints.only('xl'));
  
  // === SOLID: SRP - Range queries ===
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // === SOLID: SRP - Current breakpoint determination ===
  const getCurrentBreakpoint = (): 'xs' | 'sm' | 'md' | 'lg' | 'xl' => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    return 'md'; // fallback
  };
  
  return {
    xs: isXs,
    sm: isSm,
    md: isMd,
    lg: isLg,
    xl: isXl,
    isMobile,
    isTablet,
    isDesktop,
    currentBreakpoint: getCurrentBreakpoint(),
  };
}

// === SOLID: SRP - Responsive values hook ===
export function useResponsiveValue<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}): T | undefined {
  const breakpoint = useBreakpoint();
  
  // === SOLID: SRP - Value selection based on current breakpoint ===
  if (breakpoint.xl && values.xl !== undefined) return values.xl;
  if (breakpoint.lg && values.lg !== undefined) return values.lg;
  if (breakpoint.md && values.md !== undefined) return values.md;
  if (breakpoint.sm && values.sm !== undefined) return values.sm;
  if (breakpoint.xs && values.xs !== undefined) return values.xs;
  
  // === SOLID: SRP - Fallback to largest available value ===
  return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.xs;
}

// === SOLID: SRP - Screen size utilities ===
export const useScreenSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return windowSize;
}; 