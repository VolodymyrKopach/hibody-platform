'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { Box, Container, Alert, Paper, Typography, Button } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme, alpha } from '@mui/material/styles'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { Logo } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

function ResetPasswordPageContent() {
  const theme = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      // Get parameters from URL
      const accessToken = searchParams?.get('access_token')
      const refreshToken = searchParams?.get('refresh_token')
      const tokenType = searchParams?.get('token_type')
      const type = searchParams?.get('type')
      
      console.log('Reset password URL params:', {
        accessToken: accessToken ? accessToken.substring(0, 10) + '...' : 'null',
        refreshToken: refreshToken ? refreshToken.substring(0, 10) + '...' : 'null',
        tokenType,
        type,
        allParams: Object.fromEntries(searchParams?.entries() || [])
      })

      // If access_token and refresh_token are present in URL (Supabase redirect)
      if (accessToken && refreshToken && type === 'recovery') {
        try {
          // Set session with tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Error setting session:', error)
            setError('Error setting session: ' + error.message)
            setLoading(false)
            return
          }
          
          if (data.user) {
            console.log('Session set successfully for user:', data.user.email)
            // Set token for future use
            setToken(accessToken)
            setLoading(false)
            return
          }
        } catch (err) {
          console.error('Session setup error:', err)
          setError('Error setting up session')
          setLoading(false)
          return
        }
      }

      // Check if user is already authenticated
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (user && !userError) {
          console.log('User already authenticated:', user.email)
          // If user is authenticated, set any token
          setToken(accessToken || 'authenticated-user-token')
          setLoading(false)
          return
        }
      } catch (err) {
        console.error('User check error:', err)
      }

      // If no tokens or session
      if (!accessToken && !refreshToken) {
        setError('Missing password reset tokens. Please try the link from email again.')
        setLoading(false)
        return
      }

      setError('Failed to set session for password reset')
      setLoading(false)
    }

    handleAuthCallback()
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

  const renderContent = () => {
    if (error || !token) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            maxWidth: 400,
            width: '100%',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: '20px',
            textAlign: 'center',
          }}
        >
          <AlertTriangle size={48} color="#f44336" style={{ marginBottom: '16px' }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Invalid link
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            {error || 'Password reset link is invalid or outdated.'}
          </Typography>
          
          <Button
            onClick={handleBackToLogin}
            variant="contained"
            startIcon={<ArrowLeft size={20} />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            Back to login
          </Button>
        </Paper>
      )
    }

    return <ResetPasswordForm token={token} onSuccess={handleSuccess} />
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
            <Box sx={{ mx: 'auto', mb: 2 }}>
              <Logo variant="auth" />
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
                              TeachSpark Platform
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Platform for creating interactive educational materials
            </Typography>
          </Box>

          {/* Reset Password Form or Error */}
          {renderContent()}
        </Box>
      </Container>
    </Box>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResetPasswordPageContent />
    </Suspense>
  )
} 