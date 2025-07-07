'use client';

import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Stack, TextField, Alert } from '@mui/material'
import { useAuth } from '@/providers/AuthProvider'

export default function TestPage() {
  const { user, signIn, signOut, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Test page: Attempting login...')
      const { error } = await signIn(email, password)
      
      if (error) {
        console.error('Test page: Login error:', error)
        setError(error.message)
      } else {
        console.log('Test page: Login successful')
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      console.error('Test page: Login exception:', err)
      setError('Помилка при вході')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('❌ TestPage.handleLogout: Logout error:', err)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Завантаження...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Тест авторизації
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Поточний стан
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Користувач: {user ? `${user.email} (${user.id})` : 'Не авторизований'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Loading: {loading ? 'Так' : 'Ні'}
          </Typography>
        </CardContent>
      </Card>

      {!user ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Вхід
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <TextField
                  label="Пароль"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Входжу...' : 'Увійти'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Авторизований
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ви успішно авторизовані як {user.email}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleLogout}
              fullWidth
            >
              Вийти
            </Button>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Тестові дії
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/'}
              fullWidth
            >
              Перейти на головну (/)
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/chat'}
              fullWidth
            >
              Перейти на чат (/chat)
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/materials'}
              fullWidth
            >
              Перейти на матеріали (/materials)
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.href = '/auth/login'}
              fullWidth
            >
              Перейти на логін (/auth/login)
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
} 