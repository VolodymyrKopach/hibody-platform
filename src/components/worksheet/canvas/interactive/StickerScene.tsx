'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Stack, alpha, Tooltip, Grid } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, 
  RotateCcw, 
  Download, 
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sparkles,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface Sticker {
  id: string;
  url: string;
  name: string;
  category?: string;
}

interface PlacedSticker {
  id: string;
  stickerId: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface StickerSceneProps {
  // Фонове зображення
  backgroundUrl?: string;
  backgroundColor?: string;
  
  // Набір стікерів
  stickers?: Sticker[];
  
  // Налаштування
  maxStickers?: number;
  allowRotation?: boolean;
  allowScale?: boolean;
  
  // Вікова група
  ageGroup?: string;
  
  // Callbacks
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onComplete?: (sceneData: any) => void;
}

const DEFAULT_STICKERS: Sticker[] = [
  { id: 'sun', url: '☀️', name: 'Sun', category: 'nature' },
  { id: 'cloud', url: '☁️', name: 'Cloud', category: 'nature' },
  { id: 'tree', url: '🌳', name: 'Tree', category: 'nature' },
  { id: 'flower', url: '🌸', name: 'Flower', category: 'nature' },
  { id: 'butterfly', url: '🦋', name: 'Butterfly', category: 'animals' },
  { id: 'cat', url: '🐱', name: 'Cat', category: 'animals' },
  { id: 'dog', url: '🐶', name: 'Dog', category: 'animals' },
  { id: 'bird', url: '🐦', name: 'Bird', category: 'animals' },
  { id: 'house', url: '🏠', name: 'House', category: 'objects' },
  { id: 'car', url: '🚗', name: 'Car', category: 'objects' },
  { id: 'ball', url: '⚽', name: 'Ball', category: 'toys' },
  { id: 'star', url: '⭐', name: 'Star', category: 'shapes' },
  { id: 'heart', url: '❤️', name: 'Heart', category: 'shapes' },
  { id: 'rainbow', url: '🌈', name: 'Rainbow', category: 'nature' },
  { id: 'apple', url: '🍎', name: 'Apple', category: 'food' },
  { id: 'ice-cream', url: '🍦', name: 'Ice Cream', category: 'food' },
];

const StickerScene: React.FC<StickerSceneProps> = ({
  backgroundUrl,
  backgroundColor = '#E3F2FD',
  stickers = DEFAULT_STICKERS,
  maxStickers = 50,
  allowRotation = true,
  allowScale = true,
  ageGroup = '3-5',
  isSelected,
  onEdit,
  onFocus,
  onComplete,
}) => {
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [selectedStickerOnCanvas, setSelectedStickerOnCanvas] = useState<string | null>(null);
  const [draggedSticker, setDraggedSticker] = useState<Sticker | null>(null);
  const [nextZIndex, setNextZIndex] = useState(1);
  
  const sceneRef = useRef<HTMLDivElement>(null);

  // Додати стікер на сцену
  const handleStickerClick = (sticker: Sticker) => {
    if (placedStickers.length >= maxStickers) {
      soundService.play('error');
      return;
    }

    // Додати стікер в центр або випадкову позицію
    const newPlacedSticker: PlacedSticker = {
      id: `placed-${Date.now()}-${Math.random()}`,
      stickerId: sticker.id,
      url: sticker.url,
      x: 50, // Відсоток від ширини
      y: 50, // Відсоток від висоти
      scale: 1,
      rotation: 0,
      zIndex: nextZIndex,
    };

    setPlacedStickers([...placedStickers, newPlacedSticker]);
    setNextZIndex(nextZIndex + 1);
    setSelectedStickerOnCanvas(newPlacedSticker.id);

    soundService.play('pop');
    triggerHaptic('light');
  };

  // Drag & Drop для стікерів на сцені
  const handleStickerDragStart = (e: React.DragEvent, placedId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('placedStickerId', placedId);
    setSelectedStickerOnCanvas(placedId);
  };

  const handleSceneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const placedStickerId = e.dataTransfer.getData('placedStickerId');
    
    if (!placedStickerId || !sceneRef.current) return;

    const rect = sceneRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPlacedStickers(placedStickers.map(sticker => 
      sticker.id === placedStickerId 
        ? { ...sticker, x, y, zIndex: nextZIndex }
        : sticker
    ));
    
    setNextZIndex(nextZIndex + 1);
    soundService.play('pop');
    triggerHaptic('light');
  };

  const handleSceneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Видалити стікер
  const handleDeleteSticker = (id: string) => {
    setPlacedStickers(placedStickers.filter(s => s.id !== id));
    setSelectedStickerOnCanvas(null);
    soundService.play('swoosh');
    triggerHaptic('medium');
  };

  // Масштабувати стікер
  const handleScaleSticker = (id: string, delta: number) => {
    setPlacedStickers(placedStickers.map(sticker => 
      sticker.id === id 
        ? { ...sticker, scale: Math.max(0.5, Math.min(3, sticker.scale + delta)) }
        : sticker
    ));
    soundService.play('tap');
  };

  // Повернути стікер
  const handleRotateSticker = (id: string) => {
    setPlacedStickers(placedStickers.map(sticker => 
      sticker.id === id 
        ? { ...sticker, rotation: (sticker.rotation + 45) % 360 }
        : sticker
    ));
    soundService.play('tap');
  };

  // Очистити сцену
  const handleClear = () => {
    setPlacedStickers([]);
    setSelectedStickerOnCanvas(null);
    setNextZIndex(1);
    soundService.play('swoosh');
    triggerHaptic('heavy');
  };

  // Святкування при багатьох стікерах
  const celebrate = () => {
    soundService.play('success');
    triggerHaptic('heavy');
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (onComplete) {
      onComplete({ placedStickers, backgroundUrl, backgroundColor });
    }
  };

  // Перевірка досягнення
  React.useEffect(() => {
    if (placedStickers.length === 10) {
      celebrate();
    }
  }, [placedStickers.length]);

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 3,
        backgroundColor: '#F8F9FA',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Заголовок */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Layers size={24} color="#8B5CF6" />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
            Create Your Story! 🎭
          </Typography>
        </Box>
        
        {/* Лічильник */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
            {placedStickers.length} / {maxStickers} stickers
          </Typography>
          {placedStickers.length >= 10 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles size={20} color="#FFD700" />
            </motion.div>
          )}
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* Бібліотека стікерів */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: 200 },
            p: 2,
            borderRadius: 2,
            border: '1px solid #E2E8F0',
            maxHeight: 600,
            overflowY: 'auto',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#718096', mb: 2, display: 'block' }}>
            Stickers
          </Typography>
          
          <Grid container spacing={1}>
            {stickers.map((sticker) => (
              <Grid item xs={4} key={sticker.id}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => handleStickerClick(sticker)}
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      borderRadius: 2,
                      backgroundColor: alpha('#8B5CF6', 0.05),
                      border: '2px solid transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha('#8B5CF6', 0.1),
                        borderColor: '#8B5CF6',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    title={sticker.name}
                  >
                    {sticker.url}
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Сцена */}
        <Box sx={{ flex: 1 }}>
          <Paper
            ref={sceneRef}
            elevation={0}
            onDrop={handleSceneDrop}
            onDragOver={handleSceneDragOver}
            sx={{
              position: 'relative',
              width: '100%',
              height: 500,
              borderRadius: 2,
              border: '2px dashed #CBD5E0',
              backgroundColor: backgroundColor,
              backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Placeholder текст */}
            {placedStickers.length === 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="h6" sx={{ color: '#A0AEC0', fontWeight: 600 }}>
                  Click on stickers to add them here! 👆
                </Typography>
              </Box>
            )}

            {/* Розміщені стікери */}
            <AnimatePresence>
              {placedStickers.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  drag
                  dragMomentum={false}
                  style={{
                    position: 'absolute',
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
                    zIndex: sticker.zIndex,
                    cursor: 'move',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStickerOnCanvas(sticker.id);
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '4rem',
                      filter: selectedStickerOnCanvas === sticker.id ? 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))' : 'none',
                      transition: 'filter 0.2s',
                      userSelect: 'none',
                    }}
                  >
                    {sticker.url}
                  </Box>

                  {/* Контроли для вибраного стікера */}
                  {selectedStickerOnCanvas === sticker.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        bottom: -50,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 4,
                        backgroundColor: 'white',
                        padding: '4px 8px',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                      }}
                    >
                      {allowScale && (
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScaleSticker(sticker.id, -0.2);
                            }}
                          >
                            <ZoomOut size={16} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScaleSticker(sticker.id, 0.2);
                            }}
                          >
                            <ZoomIn size={16} />
                          </IconButton>
                        </>
                      )}
                      {allowRotation && (
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotateSticker(sticker.id);
                          }}
                        >
                          <RotateCw size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSticker(sticker.id);
                        }}
                        sx={{ color: '#F56565' }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </Paper>

          {/* Кнопки керування */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Tooltip title="Clear All">
              <IconButton
                onClick={handleClear}
                disabled={placedStickers.length === 0}
                sx={{
                  backgroundColor: placedStickers.length > 0 ? alpha('#F56565', 0.1) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha('#F56565', 0.2),
                  },
                }}
              >
                <RotateCcw size={20} color={placedStickers.length > 0 ? '#F56565' : '#CBD5E0'} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>

      {/* Підказка */}
      {placedStickers.length === 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha('#8B5CF6', 0.1),
            border: '1px solid #8B5CF6',
          }}
        >
          <Typography variant="body2" sx={{ color: '#5B21B6', fontWeight: 500 }}>
            💡 Create your own story by adding stickers! Click on them, drag around, and have fun!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StickerScene;

