'use client'

import React from 'react'
import { Box, keyframes } from '@mui/material'
import { styled } from '@mui/material/styles'
import Image from 'next/image'

// Floating animation for the TypeScript logo (faster)
const floatingAnimation = keyframes`
  0% {
    transform: translateY(0px) scale(1);
    filter: drop-shadow(0 8px 16px rgba(0, 122, 204, 0.3));
  }
  50% {
    transform: translateY(-8px) scale(1.02);
    filter: drop-shadow(0 12px 24px rgba(0, 122, 204, 0.4));
  }
  100% {
    transform: translateY(0px) scale(1);
    filter: drop-shadow(0 8px 16px rgba(0, 122, 204, 0.3));
  }
`

// Pulse animation for the glow effect using TypeScript colors (faster)
const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 20px rgba(0, 122, 204, 0.2);
  }
  50% {
    box-shadow: 0 0 40px rgba(0, 122, 204, 0.4);
  }
  100% {
    box-shadow: 0 0 20px rgba(0, 122, 204, 0.2);
  }
`

const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  zIndex: 9999,
}))

export const LoadingScreen: React.FC = () => {
  return (
    <LoadingContainer>
      {/* TypeScript logo container */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '30px', // Move icon down a few pixels
        }}
      >
        {/* Subtle glow effect behind the logo */}
        <Box
          sx={{
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: '20px',
            background: 'radial-gradient(circle, rgba(0, 122, 204, 0.08) 0%, transparent 70%)',
            animation: `${pulseGlow} 2.5s ease-in-out infinite`,
          }}
        />
        
        {/* TypeScript logo */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            animation: `${floatingAnimation} 2.5s ease-in-out infinite`,
            padding: 1,
          }}
        >
          <Image
            src="/images/ts-logo.png"
            alt="Loading..."
            width={80}
            height={80}
            priority
            style={{
              objectFit: 'contain',
            }}
          />
        </Box>
      </Box>
    </LoadingContainer>
  )
} 