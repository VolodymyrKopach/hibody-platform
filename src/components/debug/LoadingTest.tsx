'use client'

import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Stack } from '@mui/material'
import { LoadingScreen, PageLoader } from '@/components/ui'

export const LoadingTest: React.FC = () => {
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false)
  const [showPageLoader, setShowPageLoader] = useState(false)

  const handleShowFullScreenLoader = () => {
    setShowFullScreenLoader(true)
    setTimeout(() => {
      setShowFullScreenLoader(false)
    }, 3000)
  }

  const handleShowPageLoader = () => {
    setShowPageLoader(true)
    setTimeout(() => {
      setShowPageLoader(false)
    }, 2000)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Тестування Loading компонентів
        </Typography>
        
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Тест повноекранного loading екрану (як при авторизації)
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleShowFullScreenLoader}
              disabled={showFullScreenLoader}
            >
              Показати Loading Screen (3 сек)
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Тест вбудованого loader'а
            </Typography>
            <Button 
              variant="outlined" 
              onClick={handleShowPageLoader}
              disabled={showPageLoader}
            >
              Показати Page Loader (2 сек)
            </Button>
          </Box>

          {showPageLoader && (
            <Box sx={{ py: 2 }}>
              <PageLoader message="Завантаження даних..." size="medium" />
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Приклади різних розмірів:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <PageLoader message="Малий" size="small" />
              <PageLoader message="Середній" size="medium" />
              <PageLoader message="Великий" size="large" />
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              💡 Для тестування повноекранного loading екрану авторизації:
              <br />
              1. Увійдіть в систему
              <br />
              2. Оновіть сторінку (F5)
              <br />
              3. Побачите loading екран поки йде перевірка авторизації
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      {showFullScreenLoader && (
        <LoadingScreen message="Демонстрація Loading Screen..." />
      )}
    </Card>
  )
} 