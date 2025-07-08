'use client'

import React from 'react'
import { Box, keyframes } from '@mui/material'
import { styled } from '@mui/material/styles'

// Хвиляста анімація з двома збалансованими хвилями - індиго палітра
const waveAnimation = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
    box-shadow: 
      0 8px 32px rgba(99, 102, 241, 0.3),
      0 0 0 8px rgba(99, 102, 241, 0.1);
  }
  25% {
    transform: scale(1.1) rotate(2deg);
    box-shadow: 
      0 12px 40px rgba(99, 102, 241, 0.4),
      0 0 0 12px rgba(99, 102, 241, 0.05);
  }
  50% {
    transform: scale(1.05) rotate(0deg);
    box-shadow: 
      0 16px 48px rgba(99, 102, 241, 0.5),
      0 0 0 16px rgba(99, 102, 241, 0.03);
  }
  75% {
    transform: scale(1.1) rotate(-2deg);
    box-shadow: 
      0 12px 40px rgba(99, 102, 241, 0.4),
      0 0 0 12px rgba(99, 102, 241, 0.05);
  }
  100% {
    transform: scale(1) rotate(0deg);
    box-shadow: 
      0 8px 32px rgba(99, 102, 241, 0.3),
      0 0 0 8px rgba(99, 102, 241, 0.1);
  }
`

// Градієнтна анімація фону - індиго палітра
const backgroundPulse = keyframes`
  0% {
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(129, 140, 248) 100%);
  }
  50% {
    background: linear-gradient(135deg, rgb(129, 140, 248) 0%, rgb(99, 102, 241) 100%);
  }
  100% {
    background: linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(129, 140, 248) 100%);
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
      {/* Іконка з двома збалансованими хвилями - індиго палітра */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(129, 140, 248) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2rem',
          fontWeight: 'bold',
          animation: `
            ${waveAnimation} 2.5s ease-in-out infinite,
            ${backgroundPulse} 3s ease-in-out infinite
          `,
          border: 'none',
          outline: 'none',
        }}
      >
        Hi
      </Box>
    </LoadingContainer>
  )
} 