'use client'

import React, { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, Typography } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { useAuth } from '@/providers/AuthProvider'
import { LoadingScreen } from '@/components/ui'

function ForgotPasswordPageContent() {
  const theme = useTheme()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // If user is already authenticated, redirect to home page
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleBackToLogin = () => {
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                mx: 'auto',
                mb: 2,
              }}
            >
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                H
              </Typography>
            </Box>
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
              HiBody Platform
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Platform for creating interactive educational materials
            </Typography>
          </Box>

          {/* Forgot Password Form */}
          <ForgotPasswordForm onBack={handleBackToLogin} />
        </Box>
      </Container>
    </Box>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ForgotPasswordPageContent />
    </Suspense>
  )
} 