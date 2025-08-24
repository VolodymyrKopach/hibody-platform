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
  alpha,
  Paper
} from '@mui/material';
import { 
  Home, 
  RefreshCw,
  AlertTriangle,
  TestTube
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TestErrorPage() {
  const theme = useTheme();
  const { t } = useTranslation('common');

  const simulateError = () => {
    throw new Error('This is a test error to demonstrate error handling');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center', zIndex: 1 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            borderRadius: 4,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ mb: 4 }}>
            {/* Test icon */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                border: `2px solid ${alpha(theme.palette.info.main, 0.2)}`,
                mb: 3,
              }}
            >
              <TestTube 
                size={40} 
                color={theme.palette.info.main}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                mb: 2,
                fontSize: { xs: '1.8rem', sm: '2.5rem' },
              }}
            >
              {t('errors.page.testTitle')}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              {t('errors.page.testSubtitle')}
            </Typography>

            {/* Test info */}
            <Box
              sx={{
                mt: 3,
                p: 3,
                borderRadius: '12px',
                backgroundColor: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                textAlign: 'left',
                maxWidth: '600px',
                mx: 'auto',
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
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                {t('errors.page.testDescription')}
              </Typography>
            </Box>
          </Box>

          {/* Action buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              onClick={simulateError}
              variant="contained"
              size="large"
              startIcon={<AlertTriangle size={20} />}
              color="error"
              sx={{
                borderRadius: '12px',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              Simulate Error
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
              }}
            >
              {t('buttons.goHome')}
            </Button>
          </Stack>

          {/* Contact info preview */}
          <Box
            sx={{
              mt: 4,
              p: 3,
              borderRadius: '16px',
              backgroundColor: alpha(theme.palette.background.default, 0.5),
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
        </Paper>
      </Container>
    </Box>
  );
}
