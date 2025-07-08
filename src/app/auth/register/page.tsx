'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container, Typography, CircularProgress } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { RegisterForm } from '@/components/auth'
import { useAuth } from '@/providers/AuthProvider'

export default function RegisterPage() {
  const theme = useTheme()
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    // Якщо користувач вже авторизований, перенаправляємо
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
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (user) {
    return null // Буде перенаправлено в useEffect
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
              Приєднуйтесь до спільноти освітніх інноваторів
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
  )
} 