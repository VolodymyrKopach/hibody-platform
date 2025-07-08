'use client'

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  useTheme,
  alpha,
  Link,
} from '@mui/material'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const theme = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Введіть коректну електронну адресу')
      setLoading(false)
      return
    }

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
        setError(data.error?.message || 'Помилка при відправці листа')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Помилка підключення до сервера')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = email.trim() !== ''

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
            Лист відправлено
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            Ми відправили посилання для скидання пароля на адресу:
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {email}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
          Перевірте свою поштову скриньку та перейдіть за посиланням для скидання пароля.
        </Alert>

        <Button
          onClick={onBackToLogin}
          variant="outlined"
          startIcon={<ArrowLeft size={20} />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            px: 3,
          }}
        >
          Повернутися до входу
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
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Забули пароль?
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Введіть свою електронну адресу і ми відправимо вам посилання для скидання пароля
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
          label="Електронна пошта"
          type="email"
          value={email}
          onChange={handleChange}
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
          disabled={!isFormValid || loading}
          sx={{
            py: 1.5,
            mb: 3,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgb(99, 102, 241) 0%, rgb(129, 140, 248) 100%)',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              background: 'linear-gradient(135deg, rgb(79, 82, 221) 0%, rgb(109, 120, 228) 100%)',
              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Відправити посилання'
          )}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component="button"
            type="button"
            onClick={onBackToLogin}
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mx: 'auto',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
          >
            <ArrowLeft size={16} />
            Повернутися до входу
          </Link>
        </Box>
      </Box>
    </Paper>
  )
}

export default ForgotPasswordForm 