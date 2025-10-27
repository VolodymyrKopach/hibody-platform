'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Scale, Star } from 'lucide-react';

interface ComparisonTask {
  type: 'size' | 'quantity' | 'length' | 'height';
  items: Array<{
    emoji?: string;
    value: number;
    label?: string;
  }>;
  question: string;
}

interface ComparisonSheetProps {
  tasks?: ComparisonTask[];
  title?: string;
  instruction?: string;
  includeOrdering?: boolean;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  circleColor?: string;
  backgroundColor?: string;
}

const ComparisonSheet: React.FC<ComparisonSheetProps> = ({
  tasks = [
    {
      type: 'size',
      items: [
        { emoji: '🐘', value: 3, label: 'Слон' },
        { emoji: '🐁', value: 1, label: 'Мишка' },
      ],
      question: 'Обведи більший:',
    },
    {
      type: 'quantity',
      items: [
        { emoji: '🍎', value: 3, label: '3 яблука' },
        { emoji: '🍎', value: 1, label: '1 яблуко' },
      ],
      question: 'Де менше яблук?',
    },
    {
      type: 'length',
      items: [
        { value: 300, label: 'Довга' },
        { value: 150, label: 'Коротка' },
      ],
      question: 'Що довше?',
    },
  ],
  title = '⚖️ Більше чи менше?',
  instruction = 'Порівнюй та обирай правильну відповідь! 🧮',
  includeOrdering = true,
  mascot = '⚖️',
  borderColor = '#8D6E63',
  circleColor = '#8D6E63',
  backgroundColor = '#FFFEF8',
}) => {
  const renderQuantity = (emoji: string, count: number) => {
    // Validate count: min 1, max 10
    const validCount = Math.min(Math.max(Math.floor(count), 1), 10);
    return Array.from({ length: validCount }).map((_, i) => (
      <Typography key={`qty-${i}-${emoji}`} sx={{ fontSize: '2.5rem' }}>
        {emoji}
      </Typography>
    ));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#F3E5F5',
        border: '4px solid #8D6E63',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #EFEBE9 0%, #F3E5F5 100%)',
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
          border: '4px solid #8D6E63',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🐘
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Scale size={48} strokeWidth={3} color="#8D6E63" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#8D6E63',
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

      {/* Comparison tasks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tasks.map((task, taskIndex) => (
          <Box
            key={taskIndex}
            sx={{
              p: 4,
              bgcolor: '#FFFFFF',
              border: '4px solid #8D6E63',
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
              {taskIndex + 1}
            </Box>

            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.6rem', mb: 3, textAlign: 'center' }}>
              {task.question}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                gap: 4,
                p: 3,
                bgcolor: '#F5F5F5',
                borderRadius: 2,
              }}
            >
              {task.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  {itemIndex > 0 && (
                    <Typography sx={{ fontSize: '3rem', color: '#8D6E63', fontWeight: 'bold' }}>
                      vs
                    </Typography>
                  )}
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    {task.type === 'size' && item.emoji && (
                      <Box
                        sx={{
                          fontSize: `${Math.min(Math.max(item.value, 1), 5) * 2}rem`,
                          p: 2,
                          bgcolor: '#FFFFFF',
                          borderRadius: 2,
                          border: '3px solid #8D6E63',
                          minWidth: 150,
                          minHeight: 150,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography sx={{ fontSize: 'inherit' }}>{item.emoji}</Typography>
                      </Box>
                    )}

                    {task.type === 'quantity' && item.emoji && (
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          justifyContent: 'center',
                          p: 2,
                          bgcolor: '#FFFFFF',
                          borderRadius: 2,
                          border: '3px solid #8D6E63',
                          minWidth: 180,
                          minHeight: 150,
                        }}
                      >
                        {renderQuantity(item.emoji, item.value)}
                      </Box>
                    )}

                    {task.type === 'length' && (
                      <Box
                        sx={{
                          width: Math.min(Math.max(item.value, 50), 400),
                          height: 40,
                          bgcolor: '#8D6E63',
                          borderRadius: 1,
                          border: '3px solid #5D4037',
                        }}
                      />
                    )}

                    {task.type === 'height' && (
                      <Box
                        sx={{
                          width: 60,
                          height: Math.min(Math.max(item.value, 50), 300),
                          bgcolor: '#8D6E63',
                          borderRadius: 1,
                          border: '3px solid #5D4037',
                        }}
                      />
                    )}

                    {/* Circle to mark answer */}
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        border: '4px dashed #8D6E63',
                        bgcolor: '#FFFFFF',
                      }}
                    />

                    {item.label && (
                      <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.2rem' }}>
                        {item.label}
                      </Typography>
                    )}
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </Box>
        ))}

        {/* Ordering task */}
        {includeOrdering && (
          <Box
            sx={{
              p: 4,
              bgcolor: '#FFFFFF',
              border: '4px solid #8D6E63',
              borderRadius: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
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
              {tasks.length + 1}
            </Box>

            <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.6rem', mb: 3, textAlign: 'center' }}>
              Розстав від малого до великого:
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 3,
                p: 3,
                bgcolor: '#F5F5F5',
                borderRadius: 2,
              }}
            >
              {[
                { emoji: '🐘', size: '4rem' },
                { emoji: '🐁', size: '2rem' },
                { emoji: '🐕', size: '3rem' },
              ].map((animal, i) => (
                <Box
                  key={i}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 150,
                      height: 150,
                      bgcolor: '#FFFFFF',
                      border: '3px solid #8D6E63',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: animal.size,
                    }}
                  >
                    {animal.emoji}
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: 1,
                      border: '3px dashed #8D6E63',
                      bgcolor: '#FFF9E6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: '#8D6E63',
                    }}
                  >
                    [ ]
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}
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
          🎓 Ти знаєш усі розміри! Чудово! 🎓
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
          🖨️ Роздрукуй та порівнюй! ⚖️
        </Typography>
      </Box>
    </Paper>
  );
};

export default ComparisonSheet;

