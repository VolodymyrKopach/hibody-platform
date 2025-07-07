'use client'

import React from 'react'
import { Box, Button, Card, CardContent, Typography, Stack, Chip } from '@mui/material'
import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'

export const RedirectTest: React.FC = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Тестування редиректів авторизації
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Поточний стан: {' '}
            <Chip 
              label={user ? `Авторизований (${user.email})` : 'Не авторизований'} 
              color={user ? 'success' : 'default'}
              size="small"
            />
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Тест 1: Спроба доступу до захищеної сторінки без авторизації
            </Typography>
            <Button 
              component={Link}
              href="/chat"
              variant="outlined"
              size="small"
            >
              Перейти на /chat
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Тест 2: Спроба доступу до матеріалів без авторизації
            </Typography>
            <Button 
              component={Link}
              href="/materials"
              variant="outlined"
              size="small"
            >
              Перейти на /materials
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Тест 3: Прямий перехід на сторінку логіну
            </Typography>
            <Button 
              component={Link}
              href="/auth/login"
              variant="outlined"
              size="small"
            >
              Перейти на /auth/login
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Тест 4: Логін з редиректом на /chat
            </Typography>
            <Button 
              component={Link}
              href="/auth/login?redirectTo=/chat"
              variant="outlined"
              size="small"
            >
              Логін → /chat
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Тест 5: Реєстрація з редиректом на /materials
            </Typography>
            <Button 
              component={Link}
              href="/auth/register?redirectTo=/materials"
              variant="outlined"
              size="small"
            >
              Реєстрація → /materials
            </Button>
          </Box>

          {user && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Вийти з системи
              </Typography>
              <Button 
                onClick={handleSignOut}
                variant="contained"
                color="secondary"
                size="small"
              >
                Вийти
              </Button>
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary">
              💡 Очікувана поведінка:
              <br />
              • Без авторизації: редирект на /auth/login з параметром redirectTo
              <br />
              • З авторизацією: доступ до запитаної сторінки
              <br />
              • Після входу/реєстрації: редирект на збережену сторінку або на головну
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
} 