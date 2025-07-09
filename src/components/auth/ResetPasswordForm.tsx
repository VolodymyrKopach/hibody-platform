'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  InputAdornment,
  IconButton,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { Lock, Eye, EyeOff, Key, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from 'react-i18next'

interface ResetPasswordFormProps {
  token: string
  onSuccess: () => void
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess }) => {
  const { t } = useTranslation(['auth', 'common'])
  const theme = useTheme()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('') // Clear error when user starts typing
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    
    if (password.length >= 8) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    const labels = [
      t('auth:passwordStrength.veryWeak'),
      t('auth:passwordStrength.weak'),
      t('auth:passwordStrength.medium'),
      t('auth:passwordStrength.good'),
      t('auth:passwordStrength.excellent')
    ]
    
    return {
      score: strength,
      label: labels[strength] || t('auth:passwordStrength.veryWeak'),
      color: ['#f44336', '#ff9800', '#ffeb3b', '#4caf50', '#2e7d32'][strength] || '#f44336',
      progress: (strength / 5) * 100
    }
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return t('auth:validation.passwordTooShort')
    }
    
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Пароль повинен містити великі та малі літери, цифри'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валідація
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth:validation.passwordsDoNotMatch'))
      return
    }

    setLoading(true)
    setError('')

    try {
      // Оновлюємо пароль користувача
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      
      // Перенаправляємо користувача через 2 секунди
      setTimeout(() => {
        router.push('/auth/login')
        onSuccess()
      }, 2000)

    } catch (err: any) {
      console.error('Reset password error:', err)
      setError('Помилка підключення до сервера')
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  const passwordStrength = getPasswordStrength(formData.password)

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
            {t('auth:resetPassword.success')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Ваш пароль успішно оновлено. Зараз ви будете перенаправлені до сторінки входу.
          </Typography>
        </Box>
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
        <Key size={48} color={theme.palette.primary.main} style={{ marginBottom: '16px' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('auth:resetPassword.title')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Введіть новий пароль для свого облікового запису
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
          name="password"
          label={t('auth:resetPassword.newPassword')}
          type={showPassword.password ? 'text' : 'password'}
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
                  onClick={() => togglePasswordVisibility('password')}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword.password ? <EyeOff size={20} /> : <Eye size={20} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Індикатор надійності пароля */}
        {formData.password && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {t('auth:passwordStrength.strengthLabel')}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ color: passwordStrength.color, fontWeight: 600 }}
              >
                {passwordStrength.label}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={passwordStrength.progress}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(passwordStrength.color, 0.2),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: passwordStrength.color,
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        )}

        <TextField
          fullWidth
          name="confirmPassword"
          label={t('auth:resetPassword.confirmPassword')}
          type={showPassword.confirmPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          disabled={loading}
          sx={{ mb: 3 }}
          error={
            formData.confirmPassword.length > 0 && 
            formData.password !== formData.confirmPassword
          }
          helperText={
            formData.confirmPassword.length > 0 && 
            formData.password !== formData.confirmPassword
              ? t('auth:validation.passwordsDoNotMatch2')
              : ''
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={20} color={theme.palette.text.secondary} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword.confirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
            t('auth:resetPassword.submit')
          )}
        </Button>
      </Box>
    </Paper>
  )
}

export default ResetPasswordForm 