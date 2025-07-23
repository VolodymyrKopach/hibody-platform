'use client'

import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material'
import { useAuth } from '@/providers/AuthProvider'

export const AuthTest: React.FC = () => {
  const { user, profile, loading, signIn, signOut, refreshSession } = useAuth()
  const [testResult, setTestResult] = useState<string>('')

  const handleTestLogin = async () => {
    try {
      setTestResult('Attempting to log in...')
      const result = await signIn('test@example.com', 'password123')
      
      if (result.error) {
        setTestResult(`Login error: ${result.error.message}`)
      } else {
        setTestResult('Login successful!')
      }
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleTestRefresh = async () => {
    try {
      setTestResult('Refreshing session...')
      const success = await refreshSession()
      setTestResult(success ? 'Session refreshed successfully!' : 'Failed to refresh session')
    } catch (error) {
      setTestResult(`Refresh error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleLogout = async () => {
    try {
      setTestResult('Logging out...')
      await signOut()
      setTestResult('Logout successful!')
    } catch (error) {
      setTestResult(`Logout error: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
          Authorization Test
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            Status: {user ? 'Authenticated' : 'Not authenticated'}
          </Typography>
          {user && (
            <Typography variant="body2" color="text.secondary">
              Email: {user.email}
            </Typography>
          )}
          {profile && (
            <Typography variant="body2" color="text.secondary">
              Name: {profile.full_name || 'Not specified'}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {!user ? (
            <Button variant="contained" onClick={handleTestLogin}>
              Test Login
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={handleTestRefresh}>
                Refresh Session
              </Button>
              <Button variant="contained" color="error" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>

        {testResult && (
          <Alert severity={testResult.includes('Error') ? 'error' : 'success'}>
            {testResult}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Testing Instructions:
          <br />
          1. Log in to the system
          <br />
          2. Refresh the page (F5)
          <br />
          3. Check if you remained authenticated
          <br />
          4. Try the "Refresh Session" function
        </Typography>
      </CardContent>
    </Card>
  )
} 