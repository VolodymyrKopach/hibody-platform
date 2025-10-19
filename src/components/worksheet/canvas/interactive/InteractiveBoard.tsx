'use client';

import React, { useState, useRef } from 'react';
import { Box, Paper, Typography, Button, IconButton, Fab, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Sticker, Trash2, Download, RotateCcw, Plus, Image as ImageIcon } from 'lucide-react';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface BoardSticker {
  id: string;
  type: 'text' | 'emoji' | 'image';
  content: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color?: string;
}

interface InteractiveBoardProps {
  backgroundImage?: string;
  allowedStickerTypes?: Array<'text' | 'emoji' | 'image'>;
  maxStickers?: number;
  boardSize?: 'small' | 'medium' | 'large';
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const EMOJI_LIST = ['😀', '😍', '🎉', '⭐', '🌟', '❤️', '👍', '🎨', '🎵', '🏆', '🎯', '✨'];

const InteractiveBoard: React.FC<InteractiveBoardProps> = ({
  backgroundImage,
  allowedStickerTypes = ['text', 'emoji', 'image'],
  maxStickers = 50,
  boardSize = 'medium',
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [stickers, setStickers] = useState<BoardSticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const sizeMap = {
    small: { width: 600, height: 400 },
    medium: { width: 900, height: 600 },
    large: { width: 1200, height: 800 },
  };

  const dimensions = sizeMap[boardSize];

  const addSticker = (type: 'text' | 'emoji' | 'image', content: string) => {
    if (stickers.length >= maxStickers) {
      soundService.playError();
      return;
    }

    const newSticker: BoardSticker = {
      id: `sticker-${Date.now()}-${Math.random()}`,
      type,
      content,
      x: Math.random() * (dimensions.width - 100),
      y: Math.random() * (dimensions.height - 100),
      rotation: Math.random() * 20 - 10,
      scale: 1,
      color: type === 'text' ? '#000000' : undefined,
    };

    setStickers([...stickers, newSticker]);
    soundService.playCorrect();
    triggerHaptic('light');
  };

  const updateSticker = (id: string, updates: Partial<BoardSticker>) => {
    setStickers(stickers.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSticker = (id: string) => {
    setStickers(stickers.filter((s) => s.id !== id));
    setSelectedSticker(null);
    soundService.play('tap');
    triggerHaptic('light');
  };

  const handleReset = () => {
    setStickers([]);
    setSelectedSticker(null);
    triggerHaptic('light');
  };

  const handleDownload = () => {
    if (!boardRef.current) return;

    // Simple implementation - in production use html2canvas
    soundService.playSuccess();
    triggerHaptic('success');
    alert('Download functionality - use html2canvas in production');
  };

  const handleDrag = (id: string, e: React.MouseEvent | React.TouchEvent) => {
    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left - 50;
    const y = clientY - rect.top - 50;

    updateSticker(id, { x, y });
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 700,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            🎨 Interactive Board
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create and arrange stickers on the board
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {stickers.length}/{maxStickers} stickers
          </Typography>
          <IconButton onClick={handleDownload} color="success" size="large">
            <Download size={24} />
          </IconButton>
          <IconButton onClick={handleReset} color="primary" size="large">
            <RotateCcw size={24} />
          </IconButton>
        </Box>
      </Box>

      {/* Toolbar */}
      <Paper elevation={3} sx={{ mb: 3, p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {allowedStickerTypes.includes('emoji') && (
          <Button
            variant={showEmojiPicker ? 'contained' : 'outlined'}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            startIcon={<Sticker size={20} />}
          >
            Add Emoji
          </Button>
        )}

        {allowedStickerTypes.includes('text') && (
          <Button
            variant="outlined"
            onClick={() => {
              const text = prompt('Enter text:');
              if (text) addSticker('text', text);
            }}
            startIcon={<Plus size={20} />}
          >
            Add Text
          </Button>
        )}

        {allowedStickerTypes.includes('image') && (
          <Button
            variant="outlined"
            onClick={() => {
              const url = prompt('Enter image URL:');
              if (url) addSticker('image', url);
            }}
            startIcon={<ImageIcon size={20} />}
          >
            Add Image
          </Button>
        )}
      </Paper>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Paper elevation={4} sx={{ mb: 3, p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Choose an emoji:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {EMOJI_LIST.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => {
                      addSticker('emoji', emoji);
                      setShowEmojiPicker(false);
                    }}
                    sx={{
                      fontSize: '32px',
                      minWidth: 60,
                      height: 60,
                    }}
                  >
                    {emoji}
                  </Button>
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <Paper
        ref={boardRef}
        elevation={8}
        sx={{
          width: dimensions.width,
          height: dimensions.height,
          maxWidth: '100%',
          mx: 'auto',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: '4px solid',
          borderColor: 'primary.main',
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: backgroundImage ? 'transparent' : '#FFFEF0',
        }}
      >
        {stickers.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              opacity: 0.5,
            }}
          >
            <Sticker size={64} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Click buttons above to add stickers!
            </Typography>
          </Box>
        )}

        {/* Stickers */}
        <AnimatePresence>
          {stickers.map((sticker) => (
            <motion.div
              key={sticker.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{
                scale: sticker.scale,
                rotate: sticker.rotation,
              }}
              exit={{ scale: 0, opacity: 0 }}
              drag
              dragMomentum={false}
              onDrag={(e) => handleDrag(sticker.id, e as any)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSticker(sticker.id);
              }}
              style={{
                position: 'absolute',
                left: sticker.x,
                top: sticker.y,
                cursor: 'move',
                zIndex: selectedSticker === sticker.id ? 1000 : 1,
              }}
            >
              <Paper
                elevation={selectedSticker === sticker.id ? 12 : 4}
                sx={{
                  p: 2,
                  minWidth: 80,
                  minHeight: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor:
                    selectedSticker === sticker.id ? 'primary.main' : 'transparent',
                  backgroundColor: 'white',
                  position: 'relative',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 8,
                  },
                }}
              >
                {sticker.type === 'emoji' && (
                  <Typography sx={{ fontSize: '48px' }}>{sticker.content}</Typography>
                )}

                {sticker.type === 'text' && (
                  <Typography
                    sx={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: sticker.color || '#000000',
                    }}
                  >
                    {sticker.content}
                  </Typography>
                )}

                {sticker.type === 'image' && (
                  <Box
                    component="img"
                    src={sticker.content}
                    alt="Sticker"
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                )}

                {/* Delete button */}
                {selectedSticker === sticker.id && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSticker(sticker.id);
                    }}
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: 'error.main',
                      color: 'white',
                      width: 24,
                      height: 24,
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      },
                    }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                )}
              </Paper>
            </motion.div>
          ))}
        </AnimatePresence>
      </Paper>

      {/* Help text */}
      <Typography
        variant="body2"
        sx={{
          mt: 2,
          textAlign: 'center',
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        💡 Drag stickers to move them, click to select, use delete button to remove
      </Typography>
    </Box>
  );
};

export default InteractiveBoard;

