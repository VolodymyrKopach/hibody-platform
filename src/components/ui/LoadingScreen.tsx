'use client'

import React from 'react'
import { Box, CircularProgress, Typography, keyframes } from '@mui/material'
import { styled } from '@mui/material/styles'

// Анімація для логотипу
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`

const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  zIndex: 9999,
  gap: theme.spacing(3),
}))

const LogoContainer = styled(Box)(({ theme }) => ({
  animation: `${pulse} 2s ease-in-out infinite`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}))

const LoadingText = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1.1rem',
  fontWeight: 400,
}))

interface LoadingScreenProps {
  message?: string
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Завантаження...' 
}) => {
  return (
    <LoadingContainer>
      <LogoContainer>
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
            boxShadow: '0 8px 32px rgba(33, 150, 243, 0.3)',
          }}
        >
          Hi
        </Box>
      </LogoContainer>
      
      <CircularProgress 
        size={40} 
        thickness={4}
        sx={{
          color: 'primary.main',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      
      <LoadingText variant="body1">
        {message}
      </LoadingText>
    </LoadingContainer>
  )
} 