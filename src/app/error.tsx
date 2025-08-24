'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Stack,
  Link,
  useTheme,
  alpha
} from '@mui/material';
import { 
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionButtons } from '@/components/ui';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const theme = useTheme();
  const { t } = useTranslation('common');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '15%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.1)})`,
          filter: 'blur(90px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '25%',
          left: '20%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.error.main, 0.1)})`,
          filter: 'blur(70px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ textAlign: 'center', zIndex: 1 }}>
        <Box sx={{ mb: 4 }}>
          {/* Error icon with animation */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.1)})`,
              border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
              mb: 3,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
              },
            }}
          >
            <AlertTriangle 
              size={48} 
              color={theme.palette.error.main}
            />
          </Box>

          {/* Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem' },
            }}
          >
            {t('errors.page.title')}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1rem', sm: '1.2rem' },
            }}
          >
            {t('errors.page.subtitle')}
          </Typography>

          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <Box
              sx={{
                mt: 3,
                p: 3,
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.error.main, 0.1),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                textAlign: 'left',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.error.main,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                {t('errors.page.errorDetails')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.error.dark,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  wordBreak: 'break-word',
                }}
              >
                {error.message}
              </Typography>
              {error.digest && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    display: 'block',
                    mt: 1,
                  }}
                >
                  {t('errors.page.errorId')}: {error.digest}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Action buttons */}
        <Box sx={{ mb: 4 }}>
          <ActionButtons
            onTryAgain={reset}
            showTryAgain={true}
            showGoHome={true}
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            size="large"
          />
        </Box>

        {/* Additional info */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: '16px',
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 1,
              fontWeight: 500,
            }}
          >
            {t('errors.page.problemPersists')}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            {t('errors.page.contactMessage')}{' '}
            <Link 
              href="mailto:teachsparkai@gmail.com" 
              sx={{ 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              teachsparkai@gmail.com
            </Link>
            {' '}{t('errors.page.orTelegram')}{' '}
            <Link 
              href="https://t.me/teachsparkai" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: theme.palette.primary.main,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              @teachsparkai
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 