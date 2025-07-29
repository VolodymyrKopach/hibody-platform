'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, Typography } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { RegisterForm } from '@/components/auth'
import { useAuth } from '@/providers/AuthProvider'
import { LoadingScreen, Logo } from '@/components/ui'

export default function RegisterPage() {
  const theme = useTheme()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // If user is already authenticated, redirect
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleSuccess = () => {
    router.push('/')
  }

  const handleSwitchToLogin = () => {
    router.push('/auth/login')
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    return null // Will be redirected in useEffect
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        position: 'relative',
      }}
    >
      {/* Logo positioned in top-left corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          zIndex: 10,
        }}
      >
        <Logo variant="header" size={48} />
      </Box>

      {/* Main content centered */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              pt: 4, // Add some top padding to avoid logo overlap on smaller screens
            }}
          >
            {/* Welcome Section */}
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Get Started
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                TeachSpark Platform
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Join the community of educational innovators
              </Typography>
            </Box>

            {/* Register Form */}
            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onSuccess={handleSuccess}
            />
          </Box>
        </Container>
      </Box>
    </Box>
  )
} 