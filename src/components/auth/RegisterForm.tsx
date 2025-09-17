'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  CircularProgress,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useTranslation } from 'react-i18next'

interface RegisterFormProps {
  onSwitchToLogin?: () => void
  onSuccess?: () => void
}

const RegisterFormContent: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { t } = useTranslation(['auth', 'common'])
  const theme = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp } = useAuth()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user starts typing
  }

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) {
      return t('auth:validation.firstNameRequired')
    }
    
    if (!formData.email.trim()) {
      return t('auth:validation.required')
    }
    
    if (!formData.password) {
      return t('auth:validation.required')
    }
    
    if (formData.password.length < 6) {
      return t('auth:validation.passwordTooShort')
    }
    
    if (formData.password !== formData.confirmPassword) {
      return t('auth:validation.passwordsDoNotMatch2')
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await signUp(formData.email, formData.password, formData.fullName)
      
      if (result.error) {
        setError(result.error.message)
      } else {
        // Successful registration - redirect to login with email verification flag
        const params = new URLSearchParams()
        params.set('emailVerification', 'true')
        params.set('email', formData.email)
        
        // Preserve existing redirectTo parameter if it exists
        const existingRedirectTo = searchParams?.get('redirectTo')
        if (existingRedirectTo) {
          params.set('redirectTo', existingRedirectTo)
        }
        
        // Use window.location.href to avoid router interference
        const finalUrl = `/auth/login?${params.toString()}`
        window.location.href = finalUrl
        onSuccess?.()
      }
    } catch (err) {
      setError(t('auth:register.errors.registrationError'))
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.email && formData.password && formData.confirmPassword && formData.fullName

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
          {t('auth:register.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t('auth:register.description')}
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
          name="fullName"
          label={t('auth:register.fullName')}
          value={formData.fullName}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          name="email"
          label={t('auth:register.email')}
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
          label={t('auth:register.password')}
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

        <TextField
          fullWidth
          name="confirmPassword"
          label={t('auth:register.confirmPassword')}
          type={showConfirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
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
            t('auth:register.submit')
          )}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('auth:register.or')}
          </Typography>
        </Divider>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('auth:register.hasAccount')}{' '}
            <Link
              component="button"
              type="button"
              onClick={onSwitchToLogin}
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {t('auth:register.login')}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

const RegisterForm: React.FC<RegisterFormProps> = (props) => {
  return (
    <Suspense fallback={
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <CircularProgress />
      </Paper>
    }>
      <RegisterFormContent {...props} />
    </Suspense>
  )
}

export default RegisterForm 