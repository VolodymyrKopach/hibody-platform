'use client'

import React, { useState } from 'react'
import {
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  InputAdornment,
  CircularProgress,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { Mail, Send, CheckCircle } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from 'react-i18next'

interface ForgotPasswordFormProps {
  onBack?: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const { t } = useTranslation(['auth', 'common'])
  const theme = useTheme()
  const { signIn } = useAuth()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError(t('auth:validation.required'))
      return
    }

    if (!validateEmail(email)) {
      setError(t('auth:validation.invalidEmail'))
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
      } else {
        setError(data.error?.message || 'Error sending email')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Server connection error')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
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
        <Box sx={{ mb: 3 }}>
          <CheckCircle 
            size={64} 
            color={theme.palette.success.main}
            style={{ marginBottom: '16px' }}
          />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t('auth:forgotPassword.success')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Check your email {email} for further instructions.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
          }}
        >
          {t('auth:forgotPassword.backToLogin')}
        </Button>
      </Paper>
    )
  }

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
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Send size={48} color={theme.palette.primary.main} style={{ marginBottom: '16px' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('auth:forgotPassword.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth:forgotPassword.description')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <TextField
          fullWidth
          name="email"
          label={t('auth:forgotPassword.email')}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          required
          disabled={loading}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={!email.trim() || loading}
          sx={{
            py: 1.5,
            mb: 2,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t('auth:forgotPassword.submit')
          )}
        </Button>

        <Button
          variant="text"
          onClick={onBack}
          fullWidth
          sx={{
            textTransform: 'none',
            borderRadius: '12px',
          }}
        >
          {t('auth:forgotPassword.backToLogin')}
        </Button>
      </Box>
    </Paper>
  )
}

export default ForgotPasswordForm 