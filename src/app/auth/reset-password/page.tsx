'use client'

import React, { useEffect, useState } from 'react'
import { Box, Container, Alert, Paper, Typography, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

const ResetPasswordPage: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams?.get('token')
    
    if (!tokenParam) {
      setError('Відсутній токен для скидання пароля')
      setLoading(false)
      return
    }

    // Можна додати валідацію токену тут якщо потрібно
    setToken(tokenParam)
    setLoading(false)
  }, [searchParams])

  const handleSuccess = () => {
    router.push('/auth/login?message=password-reset-success')
  }

  const handleBackToLogin = () => {
    router.push('/auth/login')
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error || !token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              width: '100%',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 4,
                maxWidth: 400,
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                textAlign: 'center',
              }}
            >
              <AlertTriangle size={48} color="#f44336" style={{ marginBottom: '16px' }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                Невалідне посилання
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                {error || 'Посилання для скидання пароля недійсне або застаріле.'}
              </Typography>
              
              <Button
                onClick={handleBackToLogin}
                variant="contained"
                startIcon={<ArrowLeft size={20} />}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(129, 140, 248) 100%)',
                }}
              >
                Повернутися до входу
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
            width: '100%',
          }}
        >
          <ResetPasswordForm token={token} onSuccess={handleSuccess} />
        </Box>
      </Container>
    </Box>
  )
}

export default ResetPasswordPage 