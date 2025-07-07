'use client'

import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'

interface PageLoaderProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Завантаження...',
  size = 'medium',
  fullScreen = false
}) => {
  const getSizeProps = () => {
    switch (size) {
      case 'small':
        return { size: 24, fontSize: '0.875rem' }
      case 'large':
        return { size: 48, fontSize: '1.25rem' }
      default:
        return { size: 32, fontSize: '1rem' }
    }
  }

  const { size: progressSize, fontSize } = getSizeProps()

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress 
        size={progressSize}
        thickness={4}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize }}
        >
          {message}
        </Typography>
      )}
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