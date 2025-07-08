'use client'

import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material'
import { useAuth } from '@/providers/AuthProvider'

export const AuthTest: React.FC = () => {
  const { user, profile, loading, signIn, signOut, refreshSession } = useAuth()
  const [testResult, setTestResult] = useState<string>('')

  const handleTestLogin = async () => {
    try {
      setTestResult('Спроба входу...')
      const result = await signIn('test@example.com', 'password123')
      
      if (result.error) {
        setTestResult(`Помилка входу: ${result.error.message}`)
      } else {
        setTestResult('Вхід успішний!')
      }
    } catch (error) {
      setTestResult(`Помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
    }
  }

  const handleTestRefresh = async () => {
    try {
      setTestResult('Оновлення сесії...')
      const success = await refreshSession()
      setTestResult(success ? 'Сесія оновлена успішно!' : 'Не вдалося оновити сесію')
    } catch (error) {
      setTestResult(`Помилка оновлення: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
    }
  }

  const handleLogout = async () => {
    try {
      setTestResult('Вихід...')
      await signOut()
      setTestResult('Вихід успішний!')
    } catch (error) {
      setTestResult(`Помилка виходу: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={32} />
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Тест авторизації
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Статус: {user ? 'Авторизований' : 'Не авторизований'}
          </Typography>
          {user && (
            <Typography variant="body2" color="text.secondary">
              Email: {user.email}
            </Typography>
          )}
          {profile && (
            <Typography variant="body2" color="text.secondary">
              Ім'я: {profile.full_name || 'Не вказано'}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {!user ? (
            <Button variant="contained" onClick={handleTestLogin}>
              Тестовий вхід
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={handleTestRefresh}>
                Оновити сесію
              </Button>
              <Button variant="contained" color="error" onClick={handleLogout}>
                Вийти
              </Button>
            </>
          )}
        </Box>

        {testResult && (
          <Alert severity={testResult.includes('Помилка') ? 'error' : 'success'}>
            {testResult}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Інструкції для тестування:
          <br />
          1. Увійдіть в систему
          <br />
          2. Оновіть сторінку (F5)
          <br />
          3. Перевірте, чи залишилися ви авторизованими
          <br />
          4. Спробуйте функцію "Оновити сесію"
        </Typography>
      </CardContent>
    </Card>
  )
} 