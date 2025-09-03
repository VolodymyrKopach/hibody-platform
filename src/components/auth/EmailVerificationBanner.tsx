'use client'

import React, { useState } from 'react'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Typography,
  Snackbar,
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Mail, X, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface EmailVerificationBannerProps {
  email?: string
  onClose?: () => void
  onResendEmail?: (email: string) => Promise<void>
  show?: boolean
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  email,
  onClose,
  onResendEmail,
  show = true,
}) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const [isResending, setIsResending] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleResendEmail = async () => {
    if (!email || !onResendEmail) return

    setIsResending(true)
    setShowErrorMessage(false)
    try {
      await onResendEmail(email)
      setShowSuccessMessage(true)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resend verification email')
      setShowErrorMessage(true)
    } finally {
      setIsResending(false)
    }
  }

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false)
  }

  const handleCloseErrorMessage = () => {
    setShowErrorMessage(false)
  }

  return (
    <>
      <Collapse in={show}>
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            '& .MuiAlert-icon': {
              color: theme.palette.info.main,
            },
          }}
          icon={<Mail size={20} />}
          action={
            onClose && (
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={onClose}
                sx={{
                  color: theme.palette.info.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                  },
                }}
              >
                <X size={18} />
              </IconButton>
            )
          }
        >
          <AlertTitle sx={{ fontWeight: 600, color: theme.palette.info.main }}>
            {t('auth:login.emailVerificationBanner.title')}
          </AlertTitle>
          
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            {t('auth:login.emailVerificationBanner.description')}
          </Typography>

          {email && (
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2, 
                fontWeight: 500,
                color: theme.palette.info.main,
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'inline-block',
              }}
            >
              {email}
            </Typography>
          )}

          {onResendEmail && email && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleResendEmail}
                disabled={isResending}
                startIcon={
                  <RefreshCw 
                    size={16} 
                    style={{
                      animation: isResending ? 'spin 1s linear infinite' : 'none',
                    }}
                  />
                }
                sx={{
                  borderColor: theme.palette.info.main,
                  color: theme.palette.info.main,
                  '&:hover': {
                    borderColor: theme.palette.info.dark,
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                  },
                  '&:disabled': {
                    borderColor: alpha(theme.palette.info.main, 0.3),
                    color: alpha(theme.palette.info.main, 0.3),
                  },
                }}
              >
                {t('auth:login.emailVerificationBanner.resendButton')}
              </Button>
            </Box>
          )}
        </Alert>
      </Collapse>

      {/* Success message snackbar */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccessMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSuccessMessage} 
          severity="success" 
          sx={{ 
            width: '100%',
            borderRadius: '8px',
          }}
        >
          {t('auth:login.emailVerificationBanner.resendSuccess')}
        </Alert>
      </Snackbar>

      {/* Error message snackbar */}
      <Snackbar
        open={showErrorMessage}
        autoHideDuration={6000}
        onClose={handleCloseErrorMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseErrorMessage} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: '8px',
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* CSS for spin animation */}
      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  )
}

export default EmailVerificationBanner
