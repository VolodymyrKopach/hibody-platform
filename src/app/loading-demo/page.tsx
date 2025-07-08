'use client'

import React, { useState } from 'react'
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Stack, 
  Chip,
  Container,
  Paper,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material'
import { LoadingScreen, PageLoader } from '@/components/ui'

export default function LoadingDemoPage() {
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false)
  const [showPageLoader, setShowPageLoader] = useState(false)
  const [infiniteMode, setInfiniteMode] = useState(false)
  const [autoDemo, setAutoDemo] = useState(false)

  const handleToggleFullScreen = () => {
    if (infiniteMode) {
      setShowFullScreenLoader(!showFullScreenLoader)
    } else {
      setShowFullScreenLoader(true)
      setTimeout(() => {
        setShowFullScreenLoader(false)
      }, 4000)
    }
  }

  const handleTogglePageLoader = () => {
    if (infiniteMode) {
      setShowPageLoader(!showPageLoader)
    } else {
      setShowPageLoader(true)
      setTimeout(() => {
        setShowPageLoader(false)
      }, 3000)
    }
  }

  const handleAutoDemo = () => {
    if (autoDemo) {
      setAutoDemo(false)
      setShowFullScreenLoader(false)
      setShowPageLoader(false)
      return
    }

    setAutoDemo(true)
    setInfiniteMode(true)
    
    // Демонстрація по черзі
    setShowFullScreenLoader(true)
    setTimeout(() => {
      setShowFullScreenLoader(false)
      setShowPageLoader(true)
    }, 3000)
    
    setTimeout(() => {
      setShowPageLoader(false)
      setShowFullScreenLoader(true)
    }, 6000)
    
    setTimeout(() => {
      setShowFullScreenLoader(false)
      setAutoDemo(false)
    }, 9000)
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h3" gutterBottom align="center" sx={{ 
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          mb: 3
        }}>
          🌊 Loading Demo
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Демонстрація всіх loading компонентів з красивими анімаціями
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Глобальні налаштування */}
        <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              ⚙️ Налаштування
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch 
                    checked={infiniteMode} 
                    onChange={(e) => setInfiniteMode(e.target.checked)}
                    color="primary"
                  />
                }
                label="♾️ Вічний режим"
              />
              <FormControlLabel
                control={
                  <Switch 
                    checked={autoDemo} 
                    onChange={handleAutoDemo}
                    color="secondary"
                  />
                }
                label="🎬 Авто демо"
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={4}>
          {/* Full Screen Loading */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                  🌊 Full Screen Loading
                </Typography>
                {showFullScreenLoader && (
                  <Chip 
                    label="🔥 Активний" 
                    size="small" 
                    color="success" 
                    variant="filled"
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Повноекранний лоадер з хвилястою анімацією логотипу "Hi", 
                градієнтним фоном та круглим halo ефектом.
              </Typography>
              
              <Button 
                variant="contained" 
                size="large"
                onClick={handleToggleFullScreen}
                disabled={autoDemo}
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                }}
              >
                {showFullScreenLoader 
                  ? (infiniteMode ? '🛑 Вимкнути' : '⏳ Активний...') 
                  : '🚀 Показати Full Screen'
                }
              </Button>
            </CardContent>
          </Card>

          {/* Page Loader */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                  ✨ Page Loader
                </Typography>
                {showPageLoader && (
                  <Chip 
                    label="🔥 Активний" 
                    size="small" 
                    color="success" 
                    variant="filled"
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Вбудований лоадер з анімованими крапками що пульсують з затримкою 
                для створення хвилевого ефекту.
              </Typography>
              
              <Stack spacing={2}>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={handleTogglePageLoader}
                  disabled={autoDemo}
                  sx={{ borderRadius: 2 }}
                >
                  {showPageLoader 
                    ? (infiniteMode ? '🛑 Вимкнути' : '⏳ Активний...') 
                    : '🎯 Показати Page Loader'
                  }
                </Button>

                {showPageLoader && (
                  <Box sx={{ 
                    p: 3, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <PageLoader size="large" />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Демонстрація розмірів */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📏 Розміри Page Loader
              </Typography>
              
              <Stack direction="row" spacing={4} alignItems="center" justifyContent="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Small (6px)
                  </Typography>
                  <PageLoader size="small" />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Medium (8px)
                  </Typography>
                  <PageLoader size="medium" />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block" gutterBottom>
                    Large (12px)
                  </Typography>
                  <PageLoader size="large" />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Особливості */}
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                ✨ Особливості анімацій
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                • Хвиляста анімація з ротацією та масштабуванням<br />
                • Градієнтний фон що плавно змінює кольори<br />
                • Круглий halo ефект замість квадратного<br />
                • Крапки пульсують з затримкою для хвилевого ефекту<br />
                • Повністю прибрано текстові повідомлення<br />
                • Високопродуктивні CSS keyframes анімації<br />
                • ♾️ Вічний режим для детального тестування
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Paper>

      {/* Full Screen Loader Overlay */}
      {showFullScreenLoader && <LoadingScreen />}
    </Container>
  )
} 