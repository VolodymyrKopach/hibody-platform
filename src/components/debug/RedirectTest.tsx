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
          Authorization Redirect Testing
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Current Status: {' '}
            <Chip 
              label={user ? `Authenticated (${user.email})` : 'Not Authenticated'} 
              color={user ? 'success' : 'default'}
              size="small"
            />
          </Typography>
        </Box>

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Test 1: Attempt to access a protected page without authentication
            </Typography>
            <Button 
              component={Link}
              href="/chat"
              variant="outlined"
              size="small"
            >
              Go to /chat
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Test 2: Attempt to access materials without authentication
            </Typography>
            <Button 
              component={Link}
              href="/materials"
              variant="outlined"
              size="small"
            >
              Go to /materials
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Test 3: Direct navigation to the login page
            </Typography>
            <Button 
              component={Link}
              href="/auth/login"
              variant="outlined"
              size="small"
            >
              Go to /auth/login
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Test 4: Login with redirect to /chat
            </Typography>
            <Button 
              component={Link}
              href="/auth/login?redirectTo=/chat"
              variant="outlined"
              size="small"
            >
              Login → /chat
            </Button>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Test 5: Registration with redirect to /materials
            </Typography>
            <Button 
              component={Link}
              href="/auth/register?redirectTo=/materials"
              variant="outlined"
              size="small"
            >
              Register → /materials
            </Button>
          </Box>

          {user && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Log out of the system
              </Typography>
              <Button 
                onClick={handleSignOut}
                variant="contained"
                color="secondary"
                size="small"
              >
                Logout
              </Button>
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary">
              💡 Expected behavior:
              <br />
              • Without authentication: redirect to /auth/login with redirectTo parameter
              <br />
              • With authentication: access to the requested page
              <br />
              • After login/registration: redirect to the saved page or home
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
} 