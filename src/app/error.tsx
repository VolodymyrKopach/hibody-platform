'use client';

import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Home, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const theme = useTheme();

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
            Упс! Щось пішло не так
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
            Сталася несподівана помилка. Це може бути тимчасова проблема. 
            Спробуйте оновити сторінку або повернутися на головну.
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
                Детали помилки (тільки в режимі розробки):
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
                  Error ID: {error.digest}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Action buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Button
            onClick={reset}
            variant="contained"
            size="large"
            startIcon={<RefreshCw size={20} />}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
              },
              transition: 'all 0.3s ease',
            }}
          >
            Спробувати знову
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="outlined"
            size="large"
            startIcon={<Home size={20} />}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.dark,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            На головну
          </Button>
        </Stack>

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
            Проблема повторюється?
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            Якщо помилка повторюється, спробуйте очистити кеш браузера 
            або скористайтеся чатом з ШІ для отримання допомоги.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 