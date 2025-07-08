'use client'

import React from 'react'
import { Box, Container } from '@mui/material'
import { useRouter } from 'next/navigation'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter()

  const handleBackToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <ForgotPasswordForm onBackToLogin={handleBackToLogin} />
        </Box>
      </Container>
    </Box>
  )
}

export default ForgotPasswordPage 