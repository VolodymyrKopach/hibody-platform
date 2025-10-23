/**
 * Example usage of TapImage component for testing
 * This file demonstrates all game modes with different configurations
 */

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import TapImage from './index';

const TapImageExample: React.FC = () => {
  return (
    <Stack spacing={6} sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        TapImage Component Examples
      </Typography>

      {/* Simple Mode */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          1. Simple Tap Mode 🎯
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Tap the image and collect 5 stars!
        </Typography>
        <TapImage
          mode="simple"
          images={[
            {
              id: 'dog-1',
              url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
              label: 'Собака',
            },
          ]}
          targetCount={5}
          prompt="Тапай на собачку і збери 5 зірок!"
          showProgress
          showStars
          showMascot
          showHints
          enableVoice
          voiceLanguage="uk-UA"
          speakPrompt
          speakFeedback
          size="large"
          ageStyle="toddler"
          onComplete={() => console.log('Simple mode completed!')}
          onProgress={(progress) => console.log('Progress:', progress)}
        />
      </Box>

      {/* Find Mode */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          2. Find & Tap Mode 🔍
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Find the dog among the animals!
        </Typography>
        <TapImage
          mode="find"
          images={[
            {
              id: 'dog-2',
              url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
              label: 'Собака',
            },
            {
              id: 'cat-1',
              url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
              label: 'Кіт',
            },
            {
              id: 'bird-1',
              url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400',
              label: 'Птах',
            },
            {
              id: 'rabbit-1',
              url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400',
              label: 'Кролик',
            },
          ]}
          correctAnswer="dog-2"
          prompt="Знайди собачку! 🐕"
          showHints
          showMascot
          enableVoice
          voiceLanguage="uk-UA"
          speakPrompt
          speakFeedback
          size="large"
          ageStyle="toddler"
          onCorrectTap={(id) => console.log('Correct tap:', id)}
          onWrongTap={(id) => console.log('Wrong tap:', id)}
          onComplete={() => console.log('Find mode completed!')}
        />
      </Box>

      {/* Sequence Mode */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          3. Sequence Mode 🔢
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Tap the numbers in order: 1 → 2 → 3
        </Typography>
        <TapImage
          mode="sequence"
          images={[
            {
              id: 'num-1',
              url: 'https://via.placeholder.com/300/FF6B9D/FFFFFF?text=1',
              label: 'Один',
            },
            {
              id: 'num-2',
              url: 'https://via.placeholder.com/300/667eea/FFFFFF?text=2',
              label: 'Два',
            },
            {
              id: 'num-3',
              url: 'https://via.placeholder.com/300/68D391/FFFFFF?text=3',
              label: 'Три',
            },
          ]}
          sequence={['num-1', 'num-2', 'num-3']}
          prompt="Тапай по порядку! 1️⃣ 2️⃣ 3️⃣"
          showProgress
          showMascot
          showHints
          size="large"
          ageStyle="toddler"
          onCorrectTap={(id) => console.log('Sequence tap:', id)}
          onWrongTap={(id) => console.log('Wrong sequence!')}
          onComplete={() => console.log('Sequence completed!')}
        />
      </Box>

      {/* Memory Mode */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          4. Memory Mode 🧠
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Remember the image and find it after it disappears!
        </Typography>
        <TapImage
          mode="memory"
          images={[
            {
              id: 'apple-1',
              url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
              label: 'Яблуко',
            },
            {
              id: 'banana-1',
              url: 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400',
              label: 'Банан',
            },
          ]}
          memoryTime={3000}
          prompt="Запам'ятай картинку! 👀"
          showMascot
          size="large"
          ageStyle="toddler"
          onCorrectTap={(id) => console.log('Correct memory:', id)}
          onWrongTap={(id) => console.log('Wrong memory:', id)}
          onComplete={() => console.log('Memory completed!')}
        />
      </Box>

      {/* Different sizes comparison */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          5. Size Comparison
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              Small
            </Typography>
            <TapImage
              mode="simple"
              images={[
                {
                  id: 'star-1',
                  url: 'https://via.placeholder.com/200/FEC84E/FFFFFF?text=★',
                  label: 'Small',
                },
              ]}
              size="small"
              targetCount={3}
              showStars={false}
              showMascot={false}
              ageStyle="toddler"
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              Medium
            </Typography>
            <TapImage
              mode="simple"
              images={[
                {
                  id: 'star-2',
                  url: 'https://via.placeholder.com/200/667eea/FFFFFF?text=★',
                  label: 'Medium',
                },
              ]}
              size="medium"
              targetCount={3}
              showStars={false}
              showMascot={false}
              ageStyle="toddler"
            />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              Large (Recommended)
            </Typography>
            <TapImage
              mode="simple"
              images={[
                {
                  id: 'star-3',
                  url: 'https://via.placeholder.com/200/68D391/FFFFFF?text=★',
                  label: 'Large',
                },
              ]}
              size="large"
              targetCount={3}
              showStars={false}
              showMascot={false}
              ageStyle="toddler"
            />
          </Box>
        </Stack>
      </Box>

      {/* Test with all features disabled */}
      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          6. Minimal Mode (No helpers)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          For older kids - no mascot, no hints
        </Typography>
        <TapImage
          mode="find"
          images={[
            {
              id: 'shape-1',
              url: 'https://via.placeholder.com/200/FF6B9D/FFFFFF?text=●',
              label: 'Circle',
            },
            {
              id: 'shape-2',
              url: 'https://via.placeholder.com/200/667eea/FFFFFF?text=■',
              label: 'Square',
            },
          ]}
          correctAnswer="shape-1"
          prompt="Find the circle"
          showMascot={false}
          showHints={false}
          showProgress={false}
          size="medium"
          ageStyle="elementary"
          onComplete={() => console.log('Minimal mode completed!')}
        />
      </Box>
    </Stack>
  );
};

export default TapImageExample;

