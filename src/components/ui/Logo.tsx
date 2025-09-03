import React from 'react';
import { Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

interface LogoProps {
  size?: number;
  variant?: 'header' | 'auth';
}

const Logo: React.FC<LogoProps> = ({ size, variant = 'header' }) => {
  const theme = useTheme();
  
  // Default sizes based on variant
  const logoSize = size || (variant === 'header' ? 40 : 80);
  
  // Border radius based on variant
  const borderRadius = variant === 'header' ? '12px' : '20px';
  
  return (
    <Box
      sx={{
        width: logoSize,
        height: logoSize,
        borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto', // Ensure the logo container is centered
        boxShadow: variant === 'header' 
          ? '0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
          : '0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
      }}
    >
      <img
        src="/images/ts-logo.png"
        alt="TeachSpark Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius,
          padding: '3px',
          display: 'block', // Ensure proper image display
        }}
      />
    </Box>
  );
};

export default Logo; 