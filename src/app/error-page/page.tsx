'use client';

import React, { Suspense } from 'react';
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
  Home, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const ErrorTestPageContent: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation('common');
  const isTest = searchParams.get('test') === 'true';

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

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
          {/* Error Icon */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)}, ${alpha(theme.palette.warning.main, 0.1)})`,
              border: `2px solid ${alpha(theme.palette.error.main, 0.2)}`,
              mb: 3,
            }}
          >
            <AlertTriangle 
              size={48} 
              color={theme.palette.error.main}
            />
          </Box>

          {/* Main Error Message */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
{isTest ? t('errors.page.testTitle') : t('errors.page.title')}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
{isTest ? t('errors.page.testSubtitle') : t('errors.page.subtitle')}
          </Typography>

          {isTest && (
            <Box
              sx={{
                p: 3,
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                textAlign: 'left',
                maxWidth: '600px',
                mx: 'auto',
                mb: 4,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: theme.palette.info.main,
                  fontWeight: 600,
                  mb: 1,
                }}
              >
{t('errors.page.testInfo')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.info.dark,
                  fontSize: '0.9rem',
                }}
              >
{t('errors.page.testDescription')}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action buttons */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ 
            justifyContent: 'center',
            mb: 4,
            maxWidth: '400px',
            mx: 'auto'
          }}
        >
          {isTest ? (
            <Button
              variant="contained"
              onClick={handleGoBack}
              startIcon={<Home size={18} />}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
{t('goBack')}
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                onClick={handleRetry}
                startIcon={<RefreshCw size={18} />}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
{t('tryAgain')}
              </Button>

              <Button
                variant="outlined"
                onClick={handleGoHome}
                startIcon={<Home size={18} />}
                sx={{
                  py: 1.5,
                  px: 3,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
{t('goHome')}
              </Button>
            </>
          )}
        </Stack>

        {/* Contact Information */}
        <Box
          sx={{
            p: 3,
            borderRadius: '12px',
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: '500px',
            mx: 'auto',
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
};

const ErrorTestPage: React.FC = () => {
  return (
    <Suspense fallback={
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Loading...</Typography>
      </Box>
    }>
      <ErrorTestPageContent />
    </Suspense>
  );
};

export default ErrorTestPage;
