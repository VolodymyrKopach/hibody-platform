'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Hash, Star } from 'lucide-react';

interface CountingTask {
  emoji: string;
  count: number;
  type: 'circle' | 'draw' | 'write';
  label?: string;
}

interface CountingWorksheetProps {
  tasks?: CountingTask[];
  title?: string;
  instruction?: string;
  maxNumber?: number;
  showNumberLine?: boolean;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  numberColor?: string;
  backgroundColor?: string;
}

const CountingWorksheet: React.FC<CountingWorksheetProps> = ({
  tasks = [
    { emoji: '🍎', count: 3, type: 'circle', label: 'Яблука' },
    { emoji: '🐶', count: 2, type: 'draw', label: 'Собачки' },
    { emoji: '⭐', count: 4, type: 'write', label: 'Зірки' },
  ],
  title = '🔢 Скільки ти бачиш?',
  instruction = 'Порахуй предмети і виконай завдання! 🧮',
  maxNumber = 5,
  showNumberLine = true,
  mascot = '🐻',
  borderColor = '#2196F3',
  numberColor = '#2196F3',
  backgroundColor = '#FFFEF8',
}) => {
  const numberOptions = Array.from({ length: maxNumber }, (_, i) => i + 1);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#E3F2FD',
        border: '4px solid #2196F3',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #BBDEFB 0%, #E3F2FD 100%)',
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
          border: '4px solid #2196F3',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🦁
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Hash size={48} strokeWidth={3} color="#2196F3" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#2196F3',
              textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
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

      {/* Number line helper */}
      {showNumberLine && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mb: 4,
            p: 3,
            bgcolor: '#FFF9E6',
            borderRadius: 3,
            border: '3px solid #FFB84D',
          }}
        >
          {numberOptions.map((num) => (
            <Box
              key={num}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                border: '3px solid #2196F3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#2196F3',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              {num}
            </Box>
          ))}
        </Box>
      )}

      {/* Counting tasks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tasks.map((task, index) => (
          <Box
            key={index}
            sx={{
              p: 4,
              bgcolor: '#FFFFFF',
              border: '4px solid #2196F3',
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {/* Task number badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                left: 20,
                bgcolor: '#FF6B9D',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: 50,
                height: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                border: '4px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {index + 1}
            </Box>

            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {/* Objects to count */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  bgcolor: '#E3F2FD',
                  borderRadius: 2,
                  border: '3px dashed #2196F3',
                  minHeight: 150,
                }}
              >
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem', mb: 2 }}>
                  {task.label || 'Порахуй:'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {Array.from({ length: task.count }).map((_, i) => (
                    <Typography key={i} sx={{ fontSize: '4rem' }}>
                      {task.emoji}
                    </Typography>
                  ))}
                </Box>
              </Box>

              {/* Arrow */}
              <Typography sx={{ fontSize: '3rem', color: '#2196F3' }}>→</Typography>

              {/* Task area */}
              <Box
                sx={{
                  flex: 1,
                  p: 3,
                  bgcolor: '#FFF9E6',
                  borderRadius: 2,
                  border: '3px solid #FFB84D',
                  minHeight: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {task.type === 'circle' && (
                  <>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem', mb: 2 }}>
                      Обведи правильну цифру:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {numberOptions.map((num) => (
                        <Box
                          key={`count-option-${num}`}
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: '50%',
                            border: '4px dashed #2196F3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: '#2196F3',
                            bgcolor: '#FFFFFF',
                          }}
                        >
                          {num}
                        </Box>
                      ))}
                    </Box>
                  </>
                )}

                {task.type === 'draw' && (
                  <>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem', mb: 2 }}>
                      Намалюй стільки ж:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: maxNumber }).map((_, i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 60,
                            height: 60,
                            border: '3px dashed #2196F3',
                            borderRadius: 1,
                            bgcolor: '#FFFFFF',
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}

                {task.type === 'write' && (
                  <>
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem', mb: 2 }}>
                      Напиши цифру:
                    </Typography>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        border: '4px dashed #2196F3',
                        borderRadius: 2,
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography sx={{ fontSize: '5rem', color: '#CCCCCC' }}>?</Typography>
                    </Box>
                  </>
                )}
              </Box>
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
          🎉 Супер лічба! Ти молодець! 🎉
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
          🖨️ Роздрукуй та порахуй! 🔢
        </Typography>
      </Box>
    </Paper>
  );
};

export default CountingWorksheet;

