'use client'

import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Stack, Chip } from '@mui/material'
import { LoadingScreen, PageLoader } from '@/components/ui'

export const LoadingTest: React.FC = () => {
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false)
  const [showPageLoader, setShowPageLoader] = useState(false)
  const [infiniteFullScreen, setInfiniteFullScreen] = useState(false)
  const [infinitePageLoader, setInfinitePageLoader] = useState(false)

  const handleShowFullScreenLoader = () => {
    if (infiniteFullScreen) {
      // Якщо включений вічний режим, просто перемикаємо
      setShowFullScreenLoader(!showFullScreenLoader)
    } else {
      // Звичайний режим з таймером
      setShowFullScreenLoader(true)
      setTimeout(() => {
        setShowFullScreenLoader(false)
      }, 4000)
    }
  }

  const handleShowPageLoader = () => {
    if (infinitePageLoader) {
      // Якщо включений вічний режим, просто перемикаємо
      setShowPageLoader(!showPageLoader)
    } else {
      // Звичайний режим з таймером
      setShowPageLoader(true)
      setTimeout(() => {
        setShowPageLoader(false)
      }, 3000)
    }
  }

  const toggleInfiniteFullScreen = () => {
    setInfiniteFullScreen(!infiniteFullScreen)
    if (showFullScreenLoader && !infiniteFullScreen) {
      // Якщо лоадер активний і ми переходимо в вічний режим, залишаємо його
      return
    }
    if (showFullScreenLoader && infiniteFullScreen) {
      // Якщо виходимо з вічного режиму, вимикаємо лоадер
      setShowFullScreenLoader(false)
    }
  }

  const toggleInfinitePageLoader = () => {
    setInfinitePageLoader(!infinitePageLoader)
    if (showPageLoader && !infinitePageLoader) {
      // Якщо лоадер активний і ми переходимо в вічний режим, залишаємо його
      return
    }
    if (showPageLoader && infinitePageLoader) {
      // Якщо виходимо з вічного режиму, вимикаємо лоадер
      setShowPageLoader(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Тестування Loading компонентів з анімаціями
        </Typography>
        
        <Stack spacing={3}>
          {/* Full Screen Loader */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                🌊 Хвиляста анімація повноекранного логотипу (Hi)
              </Typography>
              {infiniteFullScreen && (
                <Chip 
                  label="♾️ Вічний режим" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button 
                variant="contained" 
                onClick={handleShowFullScreenLoader}
                disabled={showFullScreenLoader && !infiniteFullScreen}
              >
                {showFullScreenLoader 
                  ? (infiniteFullScreen ? 'Сховати Loading Screen' : 'Loading Screen активний') 
                  : (infiniteFullScreen ? 'Показати Loading Screen' : 'Показати Loading Screen (4 сек)')
                }
              </Button>
              
              <Button 
                variant={infiniteFullScreen ? "contained" : "outlined"}
                color={infiniteFullScreen ? "secondary" : "primary"}
                onClick={toggleInfiniteFullScreen}
              >
                {infiniteFullScreen ? '⏹️ Вимкнути вічний' : '♾️ Вічний режим'}
              </Button>
            </Stack>
          </Box>

          {/* Page Loader */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ✨ Анімовані крапки для вбудованого завантаження
              </Typography>
              {infinitePageLoader && (
                <Chip 
                  label="♾️ Вічний режим" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Button 
                variant="outlined" 
                onClick={handleShowPageLoader}
                disabled={showPageLoader && !infinitePageLoader}
              >
                {showPageLoader 
                  ? (infinitePageLoader ? 'Сховати Page Loader' : 'Page Loader активний') 
                  : (infinitePageLoader ? 'Показати Page Loader' : 'Показати Page Loader (3 сек)')
                }
              </Button>
              
              <Button 
                variant={infinitePageLoader ? "contained" : "outlined"}
                color={infinitePageLoader ? "secondary" : "primary"}
                onClick={toggleInfinitePageLoader}
                size="small"
              >
                {infinitePageLoader ? '⏹️ Вимкнути вічний' : '♾️ Вічний режим'}
              </Button>
            </Stack>

            {showPageLoader && (
              <Box sx={{ py: 2 }}>
                <PageLoader size="medium" />
              </Box>
            )}
          </Box>

          {/* Size Examples */}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              📏 Різні розміри анімованих крапок:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Малий
                </Typography>
                <PageLoader size="small" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Середній
                </Typography>
                <PageLoader size="medium" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Великий
                </Typography>
                <PageLoader size="large" />
              </Box>
            </Stack>
          </Box>

          {/* Features Info */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              💡 Особливості нових анімацій:
              <br />
              • Логотип "Hi" має хвилясту анімацію з ротацією та масштабуванням
              <br />
              • Градієнтний фон змінює кольори плавно
              <br />
              • Круглий "halo" ефект навколо логотипу замість квадратного
              <br />
              • Крапки в PageLoader пульсують з затримкою для створення хвилі
              <br />
              • Прибрано всі текстові повідомлення для чистого дизайну
              <br />
              • ♾️ <strong>Вічний режим</strong> - для детального тестування анімацій
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      {showFullScreenLoader && (
        <LoadingScreen />
      )}
    </Card>
  )
} 