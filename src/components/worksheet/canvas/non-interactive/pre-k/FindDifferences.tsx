'use client';

import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Search, Star } from 'lucide-react';

interface SceneItem {
  emoji: string;
  position: { row: number; col: number };
}

interface ThemeScene {
  left: SceneItem[];
  right: SceneItem[];
  differenceIndices: number[];
  hintText: string;
}

interface FindDifferencesProps {
  totalDifferences?: number;
  title?: string;
  instruction?: string;
  showHints?: boolean;
  theme?: 'nature' | 'animals' | 'house';
  customScene?: ThemeScene;
  // TIER 1
  mascot?: string;
  borderColor?: string;
  hintColor?: string;
  backgroundColor?: string;
}

const FindDifferences: React.FC<FindDifferencesProps> = ({
  totalDifferences = 5,
  title = '🔍 Знайди відмінності',
  instruction,
  showHints = true,
  theme = 'nature',
  customScene,
  mascot = '🔍',
  borderColor = '#FF6B9D',
  hintColor = '#FF6B9D',
  backgroundColor = '#FFFEF8',
}) => {
  // Theme-based scenes with 5 real differences
  const themeScenes: Record<string, ThemeScene> = {
    nature: {
      left: [
        { emoji: '🏠', position: { row: 0, col: 0 } },
        { emoji: '🌳', position: { row: 0, col: 1 } },
        { emoji: '☀️', position: { row: 0, col: 2 } },
        { emoji: '🐕', position: { row: 1, col: 0 } },
        { emoji: '🌸', position: { row: 1, col: 1 } },
        { emoji: '🦋', position: { row: 1, col: 2 } },
        { emoji: '🌻', position: { row: 2, col: 0 } },
        { emoji: '🐦', position: { row: 2, col: 1 } },
      ],
      right: [
        { emoji: '🏡', position: { row: 0, col: 0 } }, // Diff 1: house changed
        { emoji: '🌳', position: { row: 0, col: 1 } },
        { emoji: '🌤️', position: { row: 0, col: 2 } }, // Diff 2: sun changed
        { emoji: '🐕', position: { row: 1, col: 0 } },
        { emoji: '🌼', position: { row: 1, col: 1 } }, // Diff 3: flower changed
        { emoji: '🐛', position: { row: 1, col: 2 } }, // Diff 4: butterfly → caterpillar
        { emoji: '🌻', position: { row: 2, col: 0 } },
        { emoji: '🐤', position: { row: 2, col: 1 } }, // Diff 5: bird changed
      ],
      differenceIndices: [0, 2, 4, 5, 7],
      hintText: '💡 Подивись на будинок, сонечко, квіти та тварин!',
    },
    animals: {
      left: [
        { emoji: '🐘', position: { row: 0, col: 0 } },
        { emoji: '🦁', position: { row: 0, col: 1 } },
        { emoji: '🐯', position: { row: 0, col: 2 } },
        { emoji: '🦒', position: { row: 1, col: 0 } },
        { emoji: '🦓', position: { row: 1, col: 1 } },
        { emoji: '🦏', position: { row: 1, col: 2 } },
        { emoji: '🐊', position: { row: 2, col: 0 } },
        { emoji: '🦛', position: { row: 2, col: 1 } },
      ],
      right: [
        { emoji: '🐘', position: { row: 0, col: 0 } },
        { emoji: '🐯', position: { row: 0, col: 1 } }, // Diff 1: lion → tiger
        { emoji: '🐆', position: { row: 0, col: 2 } }, // Diff 2: tiger → leopard
        { emoji: '🦒', position: { row: 1, col: 0 } },
        { emoji: '🦓', position: { row: 1, col: 1 } },
        { emoji: '🦘', position: { row: 1, col: 2 } }, // Diff 3: rhino → kangaroo
        { emoji: '🐍', position: { row: 2, col: 0 } }, // Diff 4: crocodile → snake
        { emoji: '🦙', position: { row: 2, col: 1 } }, // Diff 5: hippo → llama
      ],
      differenceIndices: [1, 2, 5, 6, 7],
      hintText: '💡 Деякі тварини змінилися! Шукай уважно!',
    },
    house: {
      left: [
        { emoji: '🪑', position: { row: 0, col: 0 } },
        { emoji: '🛋️', position: { row: 0, col: 1 } },
        { emoji: '🪟', position: { row: 0, col: 2 } },
        { emoji: '🚪', position: { row: 1, col: 0 } },
        { emoji: '💡', position: { row: 1, col: 1 } },
        { emoji: '🖼️', position: { row: 1, col: 2 } },
        { emoji: '🧸', position: { row: 2, col: 0 } },
        { emoji: '📚', position: { row: 2, col: 1 } },
      ],
      right: [
        { emoji: '🪑', position: { row: 0, col: 0 } },
        { emoji: '🛏️', position: { row: 0, col: 1 } }, // Diff 1: sofa → bed
        { emoji: '🪟', position: { row: 0, col: 2 } },
        { emoji: '🚪', position: { row: 1, col: 0 } },
        { emoji: '🕯️', position: { row: 1, col: 1 } }, // Diff 2: lamp → candle
        { emoji: '🖼️', position: { row: 1, col: 2 } },
        { emoji: '🎁', position: { row: 2, col: 0 } }, // Diff 3: teddy → gift
        { emoji: '📖', position: { row: 2, col: 1 } }, // Diff 4: books → book
      ],
      differenceIndices: [1, 4, 6, 7],
      hintText: '💡 Шукай меблі та речі, що змінилися!',
    },
  };

  const sceneData = customScene || themeScenes[theme];
  const defaultInstruction = `Знайди та обведи ${totalDifferences} відмінностей між картинками! 🖍️`;
  const finalInstruction = instruction || defaultInstruction;

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 1050,
        p: 5,
        bgcolor: '#FFEBEE',
        border: '4px solid #F44336',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #FFCDD2 0%, #FFEBEE 100%)',
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
          border: '4px solid #F44336',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        🦉
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Search size={48} strokeWidth={3} color="#F44336" />
          <Typography
            variant="h3"
            fontWeight="900"
            sx={{
              fontSize: '2.5rem',
              color: '#F44336',
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
          {finalInstruction}
          <Star size={24} fill="#FFD700" color="#FFD700" />
        </Typography>
      </Box>

      {/* Counter */}
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
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.4rem' }}>
          Обведи кружечком, де бачиш різницю:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Array.from({ length: Math.min(totalDifferences, 10) }).map((_, i) => (
            <Box
              key={`diff-counter-${i}`}
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                border: '4px dashed #F44336',
                bgcolor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#F44336',
              }}
            >
              {i + 1}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Two pictures side by side */}
      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 4 }}>
        {/* Left picture */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 450,
            p: 4,
            bgcolor: '#FFFFFF',
            border: '5px solid #F44336',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: '#F44336',
              color: '#FFFFFF',
              px: 3,
              py: 1,
              borderRadius: 2,
              border: '4px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Картинка 1
            </Typography>
          </Box>

          {/* Scene - Grid layout */}
          <Box
            sx={{
              minHeight: 350,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              bgcolor: '#E3F2FD',
              borderRadius: 2,
              p: 3,
              mt: 5,
            }}
          >
            {sceneData.left.map((item, index) => (
              <Box
                key={`left-${index}-${item.emoji}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4.5rem',
                }}
              >
                {item.emoji}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Right picture */}
        <Box
          sx={{
            flex: 1,
            maxWidth: 450,
            p: 4,
            bgcolor: '#FFFFFF',
            border: '5px solid #F44336',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: '#F44336',
              color: '#FFFFFF',
              px: 3,
              py: 1,
              borderRadius: 2,
              border: '4px solid #FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Картинка 2
            </Typography>
          </Box>

          {/* Scene with differences - Grid layout */}
          <Box
            sx={{
              minHeight: 350,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
              bgcolor: '#E3F2FD',
              borderRadius: 2,
              p: 3,
              mt: 5,
            }}
          >
            {sceneData.right.map((item, index) => {
              const isDifferent = sceneData.differenceIndices.includes(index);
              
              return (
                <Box
                  key={`right-${index}-${item.emoji}`}
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4.5rem',
                  }}
                >
                  {item.emoji}
                  {/* Hint indicator */}
                  {showHints && isDifferent && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -5,
                        right: -5,
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        bgcolor: '#FFD700',
                        color: '#000',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        border: '2px solid #FFA000',
                      }}
                    >
                      !
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Hint */}
      {showHints && (
        <Box
          sx={{
            p: 3,
            bgcolor: '#FFF9E6',
            borderRadius: 2,
            border: '3px solid #FFB84D',
            textAlign: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.3rem' }}>
            {sceneData.hintText}
          </Typography>
        </Box>
      )}

      {/* Encouragement message */}
      <Box
        sx={{
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
          🌟 Знайшов усі! Супер уважний! 🌟
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
          🖨️ Роздрукуй та шукай відмінності! 🔍
        </Typography>
      </Box>
    </Paper>
  );
};

export default FindDifferences;

