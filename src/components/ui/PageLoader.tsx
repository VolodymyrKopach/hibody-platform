'use client'

import React from 'react'
import { Box, keyframes } from '@mui/material'

// Елегантна анімація крапок
const dotPulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

interface PageLoaderProps {
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  size = 'medium',
  fullScreen = false
}) => {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { dotSize: 6, gap: 1 }
      case 'large':
        return { dotSize: 12, gap: 2 }
      default:
        return { dotSize: 8, gap: 1.5 }
    }
  }

  const { dotSize, gap } = getSizeProps()

  const content = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: gap,
        p: 3,
      }}
    >
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(129, 140, 248) 100%)',
            animation: `${dotPulse} 1.4s ease-in-out infinite`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </Box>
  )

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          zIndex: 1000,
        }}
      >
        {content}
      </Box>
    )
  }

  return content
} 