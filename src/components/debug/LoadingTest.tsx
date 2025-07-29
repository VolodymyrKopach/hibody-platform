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
      // If infinite mode is enabled, just toggle
      setShowFullScreenLoader(!showFullScreenLoader)
    } else {
      // Normal mode with timer
      setShowFullScreenLoader(true)
      setTimeout(() => {
        setShowFullScreenLoader(false)
      }, 4000)
    }
  }

  const handleShowPageLoader = () => {
    if (infinitePageLoader) {
      // If infinite mode is enabled, just toggle
      setShowPageLoader(!showPageLoader)
    } else {
      // Normal mode with timer
      setShowPageLoader(true)
      setTimeout(() => {
        setShowPageLoader(false)
      }, 3000)
    }
  }

  const toggleInfiniteFullScreen = () => {
    setInfiniteFullScreen(!infiniteFullScreen)
    if (showFullScreenLoader && !infiniteFullScreen) {
      // If the loader is active and we switch to infinite mode, keep it active
      return
    }
    if (showFullScreenLoader && infiniteFullScreen) {
      // If exiting infinite mode, turn off the loader
      setShowFullScreenLoader(false)
    }
  }

  const toggleInfinitePageLoader = () => {
    setInfinitePageLoader(!infinitePageLoader)
    if (showPageLoader && !infinitePageLoader) {
      // If the loader is active and we switch to infinite mode, keep it active
      return
    }
    if (showPageLoader && infinitePageLoader) {
      // If exiting infinite mode, turn off the loader
      setShowPageLoader(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Loading Components Testing with TypeScript Logo
        </Typography>
        
        <Stack spacing={3}>
          {/* Full Screen Loader */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ⚡ TypeScript logo with floating animation and blue glow
              </Typography>
              {infiniteFullScreen && (
                <Chip 
                  label="♾️ Infinite Mode" 
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
                  ? (infiniteFullScreen ? 'Hide Loading Screen' : 'Loading Screen Active') 
                  : (infiniteFullScreen ? 'Show Loading Screen' : 'Show Loading Screen (4 sec)')
                }
              </Button>
              
              <Button 
                variant={infiniteFullScreen ? "contained" : "outlined"}
                color={infiniteFullScreen ? "secondary" : "primary"}
                onClick={toggleInfiniteFullScreen}
              >
                {infiniteFullScreen ? '⏹️ Disable Infinite' : '♾️ Infinite Mode'}
              </Button>
            </Stack>
          </Box>

          {/* Page Loader */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ✨ Animated dots for embedded loading
              </Typography>
              {infinitePageLoader && (
                <Chip 
                  label="♾️ Infinite Mode" 
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
                  ? (infinitePageLoader ? 'Hide Page Loader' : 'Page Loader Active') 
                  : (infinitePageLoader ? 'Show Page Loader' : 'Show Page Loader (3 sec)')
                }
              </Button>
              
              <Button 
                variant={infinitePageLoader ? "contained" : "outlined"}
                color={infinitePageLoader ? "secondary" : "primary"}
                onClick={toggleInfinitePageLoader}
                size="small"
              >
                {infinitePageLoader ? '⏹️ Disable Infinite' : '♾️ Infinite Mode'}
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
              📏 Different sizes of animated dots:
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Small
                </Typography>
                <PageLoader size="small" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Medium
                </Typography>
                <PageLoader size="medium" />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" display="block" gutterBottom>
                  Large
                </Typography>
                <PageLoader size="large" />
              </Box>
            </Stack>
          </Box>

          {/* Features Info */}
          <Box>
            <Typography variant="body2" color="text.secondary">
              💡 Features of the TypeScript logo loading screen:
              <br />
              • Clean TypeScript logo with floating animation
              <br />
              • Subtle blue glow effect using TypeScript brand colors
              <br />
              • No distracting text or dots - pure logo focus
              <br />
              • Smooth 2.5s animation cycle for relaxed feel
              <br />
              • Professional, minimal design
              <br />
              • ♾️ <strong>Infinite Mode</strong> - for detailed animation testing
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