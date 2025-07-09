'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { LoginFormData } from '@/types/auth'

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Очищаємо помилку при зміні полів
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Attempting to sign in...')
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        console.error('Sign in error:', error)
        setError(error.message)
      } else {
        console.log('Sign in successful')
        // Успішний вхід - перенаправляємо користувача
        const redirectTo = searchParams?.get('redirectTo')
        console.log('Redirect to:', redirectTo)
        
        // Невелика затримка для того, щоб auth state встиг оновитися
        setTimeout(() => {
          if (redirectTo && redirectTo !== '/auth/login' && redirectTo !== '/auth/register') {
            router.push(redirectTo)
          } else {
            router.push('/')
          }
          onSuccess?.()
        }, 100)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(t('auth:login.errors.invalidCredentials', 'Login error'))
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.email && formData.password

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
          {t('login.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth:login.description', 'Enter your credentials to access your account')}
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
          label={t('login.email')}
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Mail size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          name="password"
          label={t('login.password')}
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Посилання "Забули пароль?" */}
        <Box sx={{ textAlign: 'right', mb: 3 }}>
          <Link
            component="button"
            type="button"
            onClick={() => router.push('/auth/forgot-password')}
            sx={{
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline',
              },
            }}
            disabled={loading}
          >
            {t('auth:login.forgotPassword', 'Forgot password?')}
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={!isFormValid || loading}
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
            t('auth:login.submit', 'Sign In')
          )}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('common:buttons.or', 'or')}
          </Typography>
        </Divider>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('auth:login.noAccount', "Don't have an account?")}{' '}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToRegister}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('auth:login.register', 'Sign Up')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default LoginForm 