'use client'

import React from 'react'
import { Box, keyframes } from '@mui/material'
import { styled } from '@mui/material/styles'

// Хвиляста анімація з двома збалансованими хвилями
const waveAnimation = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
    box-shadow: 
      0 8px 32px rgba(33, 150, 243, 0.3),
      0 0 0 8px rgba(33, 150, 243, 0.1);
  }
  25% {
    transform: scale(1.1) rotate(2deg);
    box-shadow: 
      0 12px 40px rgba(33, 150, 243, 0.4),
      0 0 0 12px rgba(33, 150, 243, 0.05);
  }
  50% {
    transform: scale(1.05) rotate(0deg);
    box-shadow: 
      0 16px 48px rgba(33, 150, 243, 0.5),
      0 0 0 16px rgba(33, 150, 243, 0.03);
  }
  75% {
    transform: scale(1.1) rotate(-2deg);
    box-shadow: 
      0 12px 40px rgba(33, 150, 243, 0.4),
      0 0 0 12px rgba(33, 150, 243, 0.05);
  }
  100% {
    transform: scale(1) rotate(0deg);
    box-shadow: 
      0 8px 32px rgba(33, 150, 243, 0.3),
      0 0 0 8px rgba(33, 150, 243, 0.1);
  }
`

// Градієнтна анімація фону
const backgroundPulse = keyframes`
  0% {
    background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
  }
  50% {
    background: linear-gradient(45deg, #21CBF3 30%, #2196F3 90%);
  }
  100% {
    background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%);
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
      {/* Іконка з двома збалансованими хвилями */}
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
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