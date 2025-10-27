'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Sparkles, Star } from 'lucide-react';

interface MiniTask {
  type: 'count' | 'match' | 'color' | 'trace' | 'pattern' | 'shape';
  instruction: string;
  content: React.ReactNode;
}

interface CombinedWorksheetProps {
  tasks?: MiniTask[];
  title?: string;
  instruction?: string;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  taskBadgeColor?: string;
  backgroundColor?: string;
}

const CombinedWorksheet: React.FC<CombinedWorksheetProps> = ({
  tasks = [
    {
      type: 'count',
      instruction: 'Порахуй яблука:',
      content: (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography sx={{ fontSize: '3rem' }}>🍎</Typography>
          <Typography sx={{ fontSize: '3rem' }}>🍎</Typography>
          <Typography sx={{ fontSize: '3rem' }}>🍎</Typography>
          <Box sx={{ width: 70, height: 70, border: '3px dashed #2196F3', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF', fontSize: '2rem', color: '#CCCCCC', ml: 2 }}>?</Box>
        </Box>
      ),
    },
    {
      type: 'match',
      instruction: "З'єднай лініями:",
      content: (
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#E3F2FD', borderRadius: 1, border: '2px solid #2196F3' }}>
              <Typography sx={{ fontSize: '2.5rem' }}>🐕</Typography>
              <Typography sx={{ fontSize: '1.5rem' }}>●</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#E3F2FD', borderRadius: 1, border: '2px solid #2196F3' }}>
              <Typography sx={{ fontSize: '2.5rem' }}>🐱</Typography>
              <Typography sx={{ fontSize: '1.5rem' }}>●</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: '2rem' }}>✏️</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#FFF9E6', borderRadius: 1, border: '2px solid #FFB84D' }}>
              <Typography sx={{ fontSize: '1.5rem' }}>●</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Гав!</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: '#FFF9E6', borderRadius: 1, border: '2px solid #FFB84D' }}>
              <Typography sx={{ fontSize: '1.5rem' }}>●</Typography>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Мяу!</Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      type: 'color',
      instruction: 'Розфарбуй сонечко жовтим:',
      content: (
        <Box sx={{ textAlign: 'center' }}>
          <svg width="100" height="100" style={{ display: 'inline-block' }}>
            <circle cx="50" cy="50" r="25" stroke="#000000" strokeWidth="3" fill="transparent" />
            {[...Array(8)].map((_, i) => {
              const angle = (i * Math.PI * 2) / 8;
              const x1 = 50 + Math.cos(angle) * 30;
              const y1 = 50 + Math.sin(angle) * 30;
              const x2 = 50 + Math.cos(angle) * 45;
              const y2 = 50 + Math.sin(angle) * 45;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000000" strokeWidth="3" />;
            })}
          </svg>
          <Box sx={{ mt: 1 }}><Typography sx={{ fontSize: '2rem' }}>🟡</Typography></Box>
        </Box>
      ),
    },
    {
      type: 'shape',
      instruction: 'Обведи всі кола:',
      content: (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {['⭕', '🔺', '⭕', '⬜', '⭕'].map((shape, i) => (
            <Box key={i} sx={{ width: 60, height: 60, border: '3px dashed #FF9800', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#FFFFFF', fontSize: '2.5rem' }}>
              {shape}
            </Box>
          ))}
        </Box>
      ),
    },
    {
      type: 'pattern',
      instruction: 'Що йде далі?',
      content: (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
          {['🔴', '🔵', '🔴', '🔵', '🔴'].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <Typography sx={{ fontSize: '1.5rem' }}>→</Typography>}
              <Typography sx={{ fontSize: '3rem' }}>{item}</Typography>
            </React.Fragment>
          ))}
          <Typography sx={{ fontSize: '3rem' }}>❓</Typography>
        </Box>
      ),
    },
  ],
  title = '🎪 Великий день завдань',
  instruction = 'Виконай усі завдання - ти зможеш! 💪',
  mascot = '🎪',
  borderColor = '#FF6B9D',
  taskBadgeColor = '#FF6B9D',
  backgroundColor = '#FFFEF8',
}) => {
  const getTaskIcon = (type: string) => {
    const icons: Record<string, string> = {
      count: '🔢',
      match: '🔗',
      color: '🎨',
      trace: '✏️',
      pattern: '🎯',
      shape: '⭐',
    };
    return icons[type] || '📝';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#FFF8E1',
        border: '4px solid #FF9800',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #FFECB3 0%, #FFF8E1 100%)',
        position: 'relative',
      }}
    >
      {/* Friendly mascot helper */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 20,
          bgcolor: '#FFE066',
          borderRadius: '50%',
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          border: '4px solid #FF9800',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🎉
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Sparkles size={48} strokeWidth={3} color="#FF9800" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              background: 'linear-gradient(90deg, #FF6B6B, #4ECDC4, #45B7D1, #FFA07A)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontSize: '1.5rem',
            color: '#555',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Star size={24} fill="#FFD700" color="#FFD700" />
          {instruction}
          <Star size={24} fill="#FFD700" color="#FFD700" />
        </Typography>
      </Box>

      {/* Progress indicator */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mb: 4,
          p: 2,
          bgcolor: '#FFF9E6',
          borderRadius: 2,
          border: '3px solid #FFB84D',
        }}
      >
        {tasks.map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: '#FFFFFF',
              border: '3px solid #FF9800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#FF9800',
            }}
          >
            {i + 1}
          </Box>
        ))}
      </Box>

      {/* Tasks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {tasks.map((task, index) => (
          <Box
            key={index}
            sx={{
              p: 3,
              bgcolor: '#FFFFFF',
              border: '4px solid #FF9800',
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {/* Task badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box
                sx={{
                  bgcolor: '#FF6B9D',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: 45,
                  height: 45,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  border: '4px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                {index + 1}
              </Box>
              <Box
                sx={{
                  bgcolor: '#FFE066',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                {getTaskIcon(task.type)}
              </Box>
            </Box>

            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem', mb: 2, mt: 1 }}>
              {task.instruction}
            </Typography>

            <Box
              sx={{
                p: 3,
                bgcolor: '#FAFAFA',
                borderRadius: 2,
                border: '3px dashed #FFB84D',
              }}
            >
              {task.content}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Encouragement message */}
      <Box
        sx={{
          mt: 4,
          p: 3,
          bgcolor: '#E8F5E9',
          borderRadius: 3,
          textAlign: 'center',
          border: '3px solid #4CAF50',
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ fontSize: '1.8rem', color: '#2E7D32' }}
        >
          🏅 Усі завдання виконані! Ти чемпіон! 🏅
        </Typography>
      </Box>

      {/* Print instruction */}
      <Box
        sx={{
          mt: 3,
          p: 3,
          bgcolor: '#FFF9E6',
          borderRadius: 2,
          textAlign: 'center',
          border: '3px solid #FFB84D',
        }}
      >
        <Typography variant="h6" sx={{ fontSize: '1.3rem', color: '#666', fontWeight: 'bold' }}>
          🖨️ Роздрукуй та виконай усі завдання! 🎪
        </Typography>
      </Box>
    </Paper>
  );
};

export default CombinedWorksheet;

