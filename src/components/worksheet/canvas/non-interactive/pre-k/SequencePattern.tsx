'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TrendingUp, Star } from 'lucide-react';

interface PatternTask {
  type: 'continue' | 'find-missing' | 'order';
  sequence: Array<{
    item: string;
    visible: boolean;
  }>;
  options?: string[];
  instruction: string;
}

interface SequencePatternProps {
  tasks?: PatternTask[];
  title?: string;
  instruction?: string;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  taskBadgeColor?: string;
  optionBorderColor?: string;
  backgroundColor?: string;
}

const SequencePattern: React.FC<SequencePatternProps> = ({
  tasks = [
    {
      type: 'continue',
      sequence: [
        { item: '🔴', visible: true },
        { item: '🔵', visible: true },
        { item: '🔴', visible: true },
        { item: '🔵', visible: true },
        { item: '🔴', visible: true },
        { item: '?', visible: false },
      ],
      options: ['🔴', '🔵', '🟡'],
      instruction: 'Продовж паттерн:',
    },
    {
      type: 'find-missing',
      sequence: [
        { item: '🍎', visible: true },
        { item: '🍌', visible: true },
        { item: '?', visible: false },
        { item: '🍎', visible: true },
        { item: '🍌', visible: true },
        { item: '🍇', visible: true },
      ],
      options: ['🍎', '🍌', '🍇'],
      instruction: 'Що пропущено?',
    },
    {
      type: 'order',
      sequence: [
        { item: '🌻', visible: true }, // Shuffled: large first
        { item: '🌱', visible: true }, // small
        { item: '🌿', visible: true }, // medium
      ],
      instruction: 'Розстав за порядком (від малого до великого):',
    },
  ],
  title = '🎯 Що йде далі?',
  instruction = 'Знайди закономірність і продовж! 🧠',
  mascot = '🎯',
  borderColor = '#9C27B0',
  taskBadgeColor = '#FF6B9D',
  optionBorderColor = '#9C27B0',
  backgroundColor = '#FFFEF8',
}) => {
  // Validate and limit sequence length for each task
  const validatedTasks = tasks.map(task => ({
    ...task,
    sequence: task.sequence.slice(0, 10), // Max 10 items
  }));
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#F3E5F5',
        border: '4px solid #9C27B0',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #E1BEE7 0%, #F3E5F5 100%)',
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
          border: '4px solid #9C27B0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🐻
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <TrendingUp size={48} strokeWidth={3} color="#9C27B0" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#9C27B0',
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

      {/* Pattern tasks */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {validatedTasks.map((task, taskIndex) => (
          <Box
            key={taskIndex}
            sx={{
              p: 4,
              bgcolor: '#FFFFFF',
              border: '4px solid #9C27B0',
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
              {task.instruction}
            </Typography>

            {/* Sequence display */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
                p: 4,
                bgcolor: '#F3E5F5',
                borderRadius: 2,
                border: '3px solid #E1BEE7',
                mb: task.options ? 3 : 0,
              }}
            >
              {task.sequence.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  {itemIndex > 0 && (
                    <Typography sx={{ fontSize: '2rem', color: '#9C27B0', fontWeight: 'bold' }}>
                      →
                    </Typography>
                  )}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: item.visible ? '#FFFFFF' : '#FFF9E6',
                      border: item.visible ? '4px solid #9C27B0' : '4px dashed #FFB84D',
                      borderRadius: 2,
                      fontSize: '4rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      position: 'relative',
                    }}
                  >
                    {item.visible ? item.item : '❓'}
                    {task.type === 'order' && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -15,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 35,
                          height: 35,
                          borderRadius: '50%',
                          bgcolor: '#FFE066',
                          border: '3px solid #9C27B0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {itemIndex + 1}
                      </Box>
                    )}
                  </Box>
                </React.Fragment>
              ))}
            </Box>

            {/* Options */}
            {task.options && (
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem', mb: 2, textAlign: 'center' }}>
                  Обери правильну відповідь:
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 3,
                    p: 3,
                    bgcolor: '#FFF9E6',
                    borderRadius: 2,
                    border: '3px solid #FFB84D',
                  }}
                >
                  {task.options.map((option, optionIndex) => (
                    <Box
                      key={optionIndex}
                      sx={{
                        width: 100,
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#FFFFFF',
                        border: '4px dashed #9C27B0',
                        borderRadius: '50%',
                        fontSize: '4rem',
                      }}
                    >
                      {option}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
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
          🧠 Супер розумний! Ти знайшов усі паттерни! 🧠
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
          🖨️ Роздрукуй та знаходь закономірності! 🎯
        </Typography>
      </Box>
    </Paper>
  );
};

export default SequencePattern;

