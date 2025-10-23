'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Stack, alpha } from '@mui/material';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

interface StoryScene {
  id: string;
  imageUrl: string;
  caption?: string;
  title?: string;
}

interface ImageStoryProps {
  // Сцени історії (3-5 кадрів)
  scenes?: StoryScene[];
  
  // Заголовок історії
  title?: string;
  
  // Налаштування
  showNavigation?: boolean;
  showCaptions?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  
  // PDF/Interactive режим
  mode?: 'pdf' | 'interactive';
  
  // Callbacks
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const DEFAULT_SCENES: StoryScene[] = [
  {
    id: 'scene1',
    imageUrl: 'https://images.pexels.com/photos/7821688/pexels-photo-7821688.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Scene 1',
    caption: 'Once upon a time...',
  },
  {
    id: 'scene2',
    imageUrl: 'https://images.pexels.com/photos/7821695/pexels-photo-7821695.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Scene 2',
    caption: 'Something amazing happened...',
  },
  {
    id: 'scene3',
    imageUrl: 'https://images.pexels.com/photos/7821706/pexels-photo-7821706.jpeg?auto=compress&cs=tinysrgb&w=400',
    title: 'Scene 3',
    caption: 'And they lived happily ever after!',
  },
];

const ImageStory: React.FC<ImageStoryProps> = ({
  scenes = DEFAULT_SCENES,
  title = 'Picture Story',
  showNavigation = true,
  showCaptions = true,
  layout = 'vertical',
  mode = 'interactive',
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentScene, setCurrentScene] = useState(0);

  const handleNext = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(currentScene + 1);
    }
  };

  const handlePrevious = () => {
    if (currentScene > 0) {
      setCurrentScene(currentScene - 1);
    }
  };

  const handleSceneClick = (index: number) => {
    setCurrentScene(index);
  };

  // PDF режим - всі сцени одразу
  if (mode === 'pdf') {
    return (
      <Box
        onClick={onFocus}
        sx={{
          position: 'relative',
          width: '100%',
          p: 3,
          border: isSelected ? '2px solid' : '2px solid transparent',
          borderColor: 'primary.main',
          borderRadius: 2,
          backgroundColor: 'white',
          cursor: onFocus ? 'pointer' : 'default',
        }}
      >
        {/* Заголовок */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookOpen size={24} color="#3B82F6" />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E40AF' }}>
            {title}
          </Typography>
        </Box>

        {/* Layout */}
        {layout === 'vertical' && (
          <Stack spacing={3}>
            {scenes.map((scene, index) => (
              <Paper
                key={scene.id}
                elevation={0}
                sx={{
                  border: '2px solid #E5E7EB',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                {/* Номер сцени */}
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: '#3B82F6',
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {scene.title || `Scene ${index + 1}`}
                  </Typography>
                </Box>

                {/* Зображення */}
                <Box
                  component="img"
                  src={scene.imageUrl}
                  alt={scene.title || `Scene ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                  }}
                />

                {/* Підпис */}
                {showCaptions && scene.caption && (
                  <Box sx={{ p: 2, backgroundColor: '#F3F4F6' }}>
                    <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.6 }}>
                      {scene.caption}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        )}

        {layout === 'horizontal' && (
          <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', pb: 2 }}>
            {scenes.map((scene, index) => (
              <Paper
                key={scene.id}
                elevation={0}
                sx={{
                  minWidth: 300,
                  border: '2px solid #E5E7EB',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: '#3B82F6',
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {scene.title || `${index + 1}`}
                  </Typography>
                </Box>
                <Box
                  component="img"
                  src={scene.imageUrl}
                  alt={scene.title || `Scene ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                {showCaptions && scene.caption && (
                  <Box sx={{ p: 1.5, backgroundColor: '#F3F4F6' }}>
                    <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.875rem' }}>
                      {scene.caption}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Stack>
        )}

        {layout === 'grid' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {scenes.map((scene, index) => (
              <Paper
                key={scene.id}
                elevation={0}
                sx={{
                  border: '2px solid #E5E7EB',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    backgroundColor: '#3B82F6',
                    color: 'white',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {index + 1}
                  </Typography>
                </Box>
                <Box
                  component="img"
                  src={scene.imageUrl}
                  alt={scene.title || `Scene ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                  }}
                />
                {showCaptions && scene.caption && (
                  <Box sx={{ p: 1.5, backgroundColor: '#F3F4F6' }}>
                    <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.875rem' }}>
                      {scene.caption}
                    </Typography>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    );
  }

  // Interactive режим - слайдшоу
  const scene = scenes[currentScene];

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'white',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Заголовок */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookOpen size={24} color="#3B82F6" />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E40AF' }}>
            {title}
          </Typography>
        </Box>
        
        {/* Індикатор прогресу */}
        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600 }}>
          {currentScene + 1} / {scenes.length}
        </Typography>
      </Box>

      {/* Основна сцена */}
      <Paper
        elevation={3}
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          border: '3px solid #3B82F6',
        }}
      >
        {/* Зображення */}
        <Box
          component="img"
          src={scene.imageUrl}
          alt={scene.title || `Scene ${currentScene + 1}`}
          sx={{
            width: '100%',
            height: 400,
            objectFit: 'cover',
          }}
        />

        {/* Навігація */}
        {showNavigation && scenes.length > 1 && (
          <>
            {/* Попередня */}
            {currentScene > 0 && (
              <IconButton
                onClick={handlePrevious}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: alpha('#FFFFFF', 0.9),
                  '&:hover': {
                    backgroundColor: '#FFFFFF',
                  },
                  width: 48,
                  height: 48,
                }}
              >
                <ChevronLeft size={28} color="#3B82F6" />
              </IconButton>
            )}

            {/* Наступна */}
            {currentScene < scenes.length - 1 && (
              <IconButton
                onClick={handleNext}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: alpha('#FFFFFF', 0.9),
                  '&:hover': {
                    backgroundColor: '#FFFFFF',
                  },
                  width: 48,
                  height: 48,
                }}
              >
                <ChevronRight size={28} color="#3B82F6" />
              </IconButton>
            )}
          </>
        )}

        {/* Підпис */}
        {showCaptions && scene.caption && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              p: 3,
              backgroundColor: alpha('#000000', 0.7),
              color: 'white',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {scene.title || `Scene ${currentScene + 1}`}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {scene.caption}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Мініатюри */}
      {scenes.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'center' }}>
          {scenes.map((s, index) => (
            <Box
              key={s.id}
              onClick={() => handleSceneClick(index)}
              sx={{
                width: 60,
                height: 60,
                borderRadius: 1,
                overflow: 'hidden',
                cursor: 'pointer',
                border: index === currentScene ? '3px solid #3B82F6' : '2px solid #E5E7EB',
                opacity: index === currentScene ? 1 : 0.6,
                transition: 'all 0.2s',
                '&:hover': {
                  opacity: 1,
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Box
                component="img"
                src={s.imageUrl}
                alt={`Scene ${index + 1}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ImageStory;

