'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Box, Paper, IconButton, Tooltip, Slider, Typography, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Paintbrush,
  Eraser,
  Download,
  RotateCcw,
  Palette,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

type Tool = 'brush' | 'eraser' | 'fill';

interface DrawingCanvasProps {
  backgroundImage?: string;
  canvasSize?: 'small' | 'medium' | 'large';
  tools?: Tool[];
  colorPalette?: string[];
  brushSizes?: number[];
  ageGroup?: string;
  ageStyle?: 'toddler' | 'preschool' | 'elementary';
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  backgroundImage,
  canvasSize = 'medium',
  tools = ['brush', 'eraser'],
  colorPalette: colorPaletteProp,
  brushSizes: brushSizesProp,
  ageGroup,
  ageStyle = 'preschool',
  isSelected,
  onEdit,
  onFocus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('brush');
  
  const isToddlerMode = ageStyle === 'toddler';
  
  // Toddler-friendly colors - bright and saturated
  const colorPalette = colorPaletteProp ?? (isToddlerMode 
    ? ['#FF6B9D', '#FFD93D', '#4DABF7', '#51CF66', '#FF8C42', '#B197FC']
    : ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF']);
  
  // Toddler-friendly brush sizes - larger
  const brushSizes = brushSizesProp ?? (isToddlerMode 
    ? [8, 12, 16, 20, 24]
    : [2, 5, 10, 15, 20]);
  
  const [currentColor, setCurrentColor] = useState(colorPalette[0]);
  const [brushSize, setBrushSize] = useState(brushSizes[1] || 5);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Size mapping
  const sizeMap = {
    small: { width: 400, height: 300 },
    medium: { width: 600, height: 450 },
    large: { width: 800, height: 600 },
  };
  
  const dimensions = sizeMap[canvasSize];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load background image if provided
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = backgroundImage;
    }
  }, [backgroundImage, dimensions.width, dimensions.height]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPoint(e, canvas);
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    
    triggerHaptic('light');
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPoint(e, canvas);

    if (currentTool === 'brush') {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalCompositeOperation = 'source-over';
      
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
  };

  const getCanvasPoint = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Reload background if exists
    if (backgroundImage) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = backgroundImage;
    }

    triggerHaptic('light');
    soundService.play('tap');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `drawing-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      soundService.playSuccess();
      triggerHaptic('success');
      
      setTimeout(() => setShowSuccess(false), 2000);
    });
  };

  const handleToolChange = (tool: Tool) => {
    setCurrentTool(tool);
    triggerHaptic('light');
    soundService.play('tap');
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 1000,
        mx: 'auto',
        minHeight: 600,
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
            Drawing Canvas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Use tools to create your masterpiece!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Clear Canvas">
            <IconButton onClick={handleClear} color="error" size="large">
              <RotateCcw size={24} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} color="success" size="large">
              <Download size={24} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Tools */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Tool selector */}
        <Paper elevation={2} sx={{ display: 'flex', p: 1, gap: 1 }}>
          {tools.includes('brush') && (
            <Tooltip title="Brush">
              <IconButton
                onClick={() => handleToolChange('brush')}
                color={currentTool === 'brush' ? 'primary' : 'default'}
                sx={{
                  backgroundColor: currentTool === 'brush' ? 'primary.light' : 'transparent',
                }}
              >
                <Paintbrush size={24} />
              </IconButton>
            </Tooltip>
          )}
          
          {tools.includes('eraser') && (
            <Tooltip title="Eraser">
              <IconButton
                onClick={() => handleToolChange('eraser')}
                color={currentTool === 'eraser' ? 'primary' : 'default'}
                sx={{
                  backgroundColor: currentTool === 'eraser' ? 'primary.light' : 'transparent',
                }}
              >
                <Eraser size={24} />
              </IconButton>
            </Tooltip>
          )}
        </Paper>

        {/* Color palette */}
        {currentTool === 'brush' && (
          <Paper elevation={2} sx={{ display: 'flex', p: 1, gap: 1, alignItems: 'center' }}>
            <Palette size={20} />
            {colorPalette.map((color) => (
              <Box
                key={color}
                onClick={() => {
                  setCurrentColor(color);
                  triggerHaptic('light');
                }}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: '3px solid',
                  borderColor: currentColor === color ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'scale(1.2)',
                  },
                }}
              />
            ))}
          </Paper>
        )}

        {/* Brush size */}
        <Paper elevation={2} sx={{ display: 'flex', p: 2, gap: 2, alignItems: 'center', minWidth: 200 }}>
          <Minus size={16} />
          <Slider
            value={brushSize}
            onChange={(_, value) => setBrushSize(value as number)}
            min={1}
            max={30}
            valueLabelDisplay="auto"
            sx={{ flex: 1 }}
          />
          <Plus size={16} />
        </Paper>
      </Box>

      {/* Canvas */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            border: '4px solid',
            borderColor: 'primary.main',
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              display: 'block',
              cursor: currentTool === 'brush' ? 'crosshair' : 'pointer',
              touchAction: 'none',
            }}
          />
        </Paper>
      </Box>

      {/* Success message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                px: 6,
                py: 4,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: 'spring' }}
                  >
                    <Sparkles size={32} fill="#FCD34D" color="#FCD34D" />
                  </motion.div>
                ))}
              </Box>
              <Typography variant="h5" fontWeight={800}>
                Saved! 🎨
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Your drawing has been downloaded!
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'center',
          color: 'text.secondary',
          fontStyle: 'italic',
        }}
      >
        💡 Use your mouse or touch to draw. Change colors and brush size with the tools above!
      </Typography>
    </Box>
  );
};

export default DrawingCanvas;

