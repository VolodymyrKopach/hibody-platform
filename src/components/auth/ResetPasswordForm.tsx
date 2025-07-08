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
  IconButton,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material'
import { Lock, Eye, EyeOff, CheckCircle, Key } from 'lucide-react'

interface ResetPasswordFormProps {
  token: string
  onSuccess: () => void
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess }) => {
  const theme = useTheme()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError(null)
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/(?=.*[a-z])/.test(password)) strength++
    if (/(?=.*[A-Z])/.test(password)) strength++
    if (/(?=.*\d)/.test(password)) strength++
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++

    return {
      score: strength,
      label: ['Дуже слабкий', 'Слабкий', 'Середній', 'Хороший', 'Відмінний'][strength] || 'Дуже слабкий',
      color: ['#f44336', '#ff9800', '#2196f3', '#4caf50', '#8bc34a'][strength] || '#f44336',
      progress: (strength / 5) * 100,
    }
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Пароль повинен містити щонайменше 6 символів'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Пароль повинен містити щонайменше одну малу літеру'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Пароль повинен містити щонайменше одну велику літеру'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Пароль повинен містити щонайменше одну цифру'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { password, confirmPassword } = formData

    // Валідація
    if (!password || !confirmPassword) {
      setError('Заповніть всі поля')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Паролі не співпадають')
      setLoading(false)
      return
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
        }, 2000)
      } else {
        setError(data.error?.message || 'Помилка при скиданні пароля')
      }
    } catch (err) {
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
            Пароль змінено
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
          Новий пароль
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
          label="Новий пароль"
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
                Надійність пароля
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
          label="Підтвердіть новий пароль"
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
              ? 'Паролі не співпадають'
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
            'Змінити пароль'
          )}
        </Button>
      </Box>
    </Paper>
  )
}

export default ResetPasswordForm 