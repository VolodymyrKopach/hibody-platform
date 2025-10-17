'use client'

import React, { useState } from 'react'
import { Box, Button, CircularProgress, Alert } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/providers/AuthProvider'

type OAuthProvider = 'google' | 'github' | 'facebook'

interface OAuthButtonsProps {
  onSuccess?: () => void
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ onSuccess }) => {
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const { signInWithOAuth } = useAuth()
  const [loading, setLoading] = useState<OAuthProvider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthSignIn = async (provider: OAuthProvider) => {
    try {
      setLoading(provider)
      setError(null)
      
      const { error } = await signInWithOAuth(provider)
      
      if (error) {
        setError(t('auth:oauth.error', `Failed to sign in with ${provider}`))
      } else {
        onSuccess?.()
      }
    } catch (err) {
      console.error(`OAuth ${provider} error:`, err)
      setError(t('auth:oauth.error', `Failed to sign in with ${provider}`))
    } finally {
      setLoading(null)
    }
  }

  const providers: Array<{
    id: OAuthProvider
    name: string
    icon: React.ReactNode
    backgroundColor: string
    hoverBackground: string
  }> = [
    {
      id: 'google',
      name: t('auth:oauth.google', 'Google'),
      backgroundColor: '#ffffff',
      hoverBackground: '#f5f5f5',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M19.8055 10.2292C19.8055 9.55157 19.7501 8.86856 19.6324 8.19995H10.2002V12.0492H15.6014C15.3771 13.2911 14.6571 14.3898 13.6025 15.0879V17.5866H16.8252C18.7174 15.8449 19.8055 13.2728 19.8055 10.2292Z"
            fill="#4285F4"
          />
          <path
            d="M10.2002 20.0006C12.9518 20.0006 15.2722 19.1151 16.8294 17.5865L13.6067 15.0879C12.7073 15.6979 11.5517 16.0432 10.2044 16.0432C7.5468 16.0432 5.28935 14.2832 4.50027 11.9169H1.17285V14.4927C2.76823 17.8304 6.31294 20.0006 10.2002 20.0006Z"
            fill="#34A853"
          />
          <path
            d="M4.49609 11.917C4.07729 10.675 4.07729 9.32943 4.49609 8.08738V5.51172H1.17285C-0.397616 8.68976 -0.397616 12.3146 1.17285 15.4927L4.49609 11.917Z"
            fill="#FBBC04"
          />
          <path
            d="M10.2002 3.95773C11.6248 3.93548 13.0024 4.47312 14.036 5.45822L16.8919 2.60235C15.1858 0.990818 12.9352 0.0952737 10.2002 0.119519C6.31294 0.119519 2.76823 2.28971 1.17285 5.51174L4.49609 8.0874C5.28098 5.71691 7.5426 3.95773 10.2002 3.95773Z"
            fill="#EA4335"
          />
        </svg>
      ),
    },
  ]

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {providers.map((provider) => (
          <Button
            key={provider.id}
            fullWidth
            variant="outlined"
            onClick={() => handleOAuthSignIn(provider.id)}
            disabled={loading !== null}
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: '12px',
              borderColor: provider.id === 'google' ? 'divider' : 'transparent',
              backgroundColor: provider.backgroundColor,
              color: provider.id === 'google' ? 'text.primary' : 'white',
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: provider.hoverBackground,
                borderColor: provider.id === 'google' ? 'divider' : 'transparent',
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(provider.backgroundColor, 0.3)}`,
              },
              '&:disabled': {
                backgroundColor: alpha(provider.backgroundColor, 0.6),
                color: provider.id === 'google' ? 'text.disabled' : alpha('#ffffff', 0.6),
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                width: '100%',
              }}
            >
              {loading === provider.id ? (
                <CircularProgress
                  size={20}
                  sx={{
                    color: provider.id === 'google' ? 'primary.main' : 'white',
                  }}
                />
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                    }}
                  >
                    {provider.icon}
                  </Box>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    {t('auth:oauth.continueWith', { provider: provider.name })}
                  </Box>
                </>
              )}
            </Box>
          </Button>
        ))}
      </Box>
    </Box>
  )
}

export default OAuthButtons

