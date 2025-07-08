'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Box, 
  Typography, 
  Button, 
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Home
} from 'lucide-react';

export default function NotFoundPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          filter: 'blur(100px)',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.1)})`,
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ textAlign: 'center', zIndex: 1 }}>
        <Box sx={{ mb: 4 }}>
          {/* 404 Number */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '6rem', sm: '8rem', md: '10rem' },
              fontWeight: 900,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
              lineHeight: 0.9,
              mb: 2,
            }}
          >
            404
          </Typography>

          {/* Robot emoji with animation */}
          <Box
            sx={{
              fontSize: '4rem',
              mb: 3,
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-10px)' },
              },
            }}
          >
            🤖
          </Box>

          {/* Title and description */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 2,
              fontSize: { xs: '1.8rem', sm: '2.5rem' },
            }}
          >
            Упс! Сторінку не знайдено
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
            Схоже, що сторінка, яку ви шукаете, не існує або була переміщена. 
            Не хвилюйтеся, ми допоможемо вам знайти те, що потрібно!
          </Typography>
        </Box>

        {/* Action button */}
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            size="large"
            startIcon={<Home size={20} />}
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
            На головну
          </Button>
        </Box>


      </Container>
    </Box>
  );
} 