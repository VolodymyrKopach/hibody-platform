'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Stack, alpha, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paintbrush, 
  Eraser, 
  RotateCcw, 
  Download, 
  Palette,
  Undo,
  Sparkles,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface ColoringCanvasProps {
  // SVG path або готове SVG зображення
  svgContent?: string;
  svgPath?: string;
  
  // Палітра кольорів
  colors?: string[];
  
  // Розмір пензля
  brushSize?: number;
  
  // Вікова група для стилізації
  ageGroup?: string;
  
  // Callbacks
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onComplete?: (imageData: string) => void;
}

interface DrawAction {
  type: 'fill' | 'erase';
  elementId: string;
  color: string;
  timestamp: number;
}

const DEFAULT_COLORS = [
  '#FF6B9D', // Pink
  '#FFA07A', // Light Salmon
  '#FFD700', // Gold
  '#98FB98', // Pale Green
  '#87CEEB', // Sky Blue
  '#DDA0DD', // Plum
  '#F0E68C', // Khaki
  '#FFA500', // Orange
  '#FF69B4', // Hot Pink
  '#7B68EE', // Medium Slate Blue
  '#48D1CC', // Medium Turquoise
  '#F08080', // Light Coral
];

const DEFAULT_SVG = `
<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Simple flower for coloring -->
  <circle id="center" cx="200" cy="200" r="30" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal1" cx="200" cy="140" r="35" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal2" cx="260" cy="200" r="35" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal3" cx="200" cy="260" r="35" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal4" cx="140" cy="200" r="35" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal5" cx="235" cy="165" r="35" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal6" cx="235" cy="235" r="35" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal7" cx="165" cy="235" r="35" fill="white" stroke="black" stroke-width="2"/>
  <circle id="petal8" cx="165" cy="165" r="35" fill="white" stroke="black" stroke-width="2"/>
  <rect id="stem" x="190" y="230" width="20" height="100" fill="white" stroke="black" stroke-width="2"/>
  <ellipse id="leaf1" cx="170" cy="270" rx="25" ry="15" fill="white" stroke="black" stroke-width="2" transform="rotate(-30 170 270)"/>
  <ellipse id="leaf2" cx="230" cy="290" rx="25" ry="15" fill="white" stroke="black" stroke-width="2" transform="rotate(30 230 290)"/>
</svg>
`;

const ColoringCanvas: React.FC<ColoringCanvasProps> = ({
  svgContent = DEFAULT_SVG,
  svgPath,
  colors = DEFAULT_COLORS,
  brushSize = 2,
  ageGroup = '3-5',
  isSelected,
  onEdit,
  onFocus,
  onComplete,
}) => {
  const [selectedColor, setSelectedColor] = useState<string>(colors[0]);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [filledElements, setFilledElements] = useState<Map<string, string>>(new Map());
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const svgRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);

  // Завантаження SVG
  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.innerHTML = svgContent;
      setSvgLoaded(true);
      setupSVGInteraction();
    }
  }, [svgContent]);

  // Налаштування взаємодії з SVG елементами
  const setupSVGInteraction = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    // Знайти всі елементи, які можна розфарбувати
    const fillableElements = svgElement.querySelectorAll('[id]');
    
    fillableElements.forEach((element) => {
      const htmlElement = element as HTMLElement;
      
      // Додати стиль курсору
      htmlElement.style.cursor = 'pointer';
      
      // Додати обробники подій
      htmlElement.addEventListener('click', () => handleElementClick(element.id));
      htmlElement.addEventListener('mouseenter', () => {
        if (tool === 'brush') {
          htmlElement.style.filter = 'brightness(1.1)';
        }
      });
      htmlElement.addEventListener('mouseleave', () => {
        htmlElement.style.filter = 'none';
      });
    });
  };

  // Обробка кліку на елемент
  const handleElementClick = (elementId: string) => {
    if (!svgRef.current) return;

    const element = svgRef.current.querySelector(`#${elementId}`) as SVGElement;
    if (!element) return;

    // Звук та вібрація
    soundService.play('tap');
    triggerHaptic('light');

    if (tool === 'brush') {
      // Заповнити кольором
      element.setAttribute('fill', selectedColor);
      
      const newFilledElements = new Map(filledElements);
      newFilledElements.set(elementId, selectedColor);
      setFilledElements(newFilledElements);

      // Додати в історію
      const action: DrawAction = {
        type: 'fill',
        elementId,
        color: selectedColor,
        timestamp: Date.now(),
      };
      setHistory([...history, action]);

      // Перевірити прогрес
      checkCompletion(newFilledElements);
    } else {
      // Стерти (повернути до білого)
      element.setAttribute('fill', 'white');
      
      const newFilledElements = new Map(filledElements);
      newFilledElements.delete(elementId);
      setFilledElements(newFilledElements);

      // Додати в історію
      const action: DrawAction = {
        type: 'erase',
        elementId,
        color: 'white',
        timestamp: Date.now(),
      };
      setHistory([...history, action]);

      checkCompletion(newFilledElements);
    }
  };

  // Перевірка завершення
  const checkCompletion = (filled: Map<string, string>) => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    const totalElements = svgElement.querySelectorAll('[id]').length;
    const filledCount = filled.size;
    const percentage = Math.round((filledCount / totalElements) * 100);
    
    setCompletionPercentage(percentage);

    // Якщо розфарбовано більше 80% - святкування
    if (percentage >= 80 && !showCelebration) {
      celebrate();
    }
  };

  // Святкування
  const celebrate = () => {
    setShowCelebration(true);
    soundService.play('success');
    triggerHaptic('heavy');

    // Конфеті
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });

    // Сховати через 3 секунди
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);

    // Callback
    if (onComplete && svgRef.current) {
      const svgElement = svgRef.current.querySelector('svg');
      if (svgElement) {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        onComplete(svgString);
      }
    }
  };

  // Скасувати останню дію
  const handleUndo = () => {
    if (history.length === 0) return;

    const lastAction = history[history.length - 1];
    const element = svgRef.current?.querySelector(`#${lastAction.elementId}`) as SVGElement;
    
    if (element) {
      // Знайти попередній колір
      const previousActions = history.slice(0, -1);
      const previousAction = previousActions.reverse().find(a => a.elementId === lastAction.elementId);
      
      const colorToRestore = previousAction ? previousAction.color : 'white';
      element.setAttribute('fill', colorToRestore);

      // Оновити стан
      const newFilledElements = new Map(filledElements);
      if (colorToRestore === 'white') {
        newFilledElements.delete(lastAction.elementId);
      } else {
        newFilledElements.set(lastAction.elementId, colorToRestore);
      }
      setFilledElements(newFilledElements);
      setHistory(history.slice(0, -1));

      checkCompletion(newFilledElements);
    }

    soundService.play('pop');
    triggerHaptic('light');
  };

  // Очистити все
  const handleClear = () => {
    if (!svgRef.current) return;

    const fillableElements = svgRef.current.querySelectorAll('[id]');
    fillableElements.forEach((element) => {
      (element as SVGElement).setAttribute('fill', 'white');
    });

    setFilledElements(new Map());
    setHistory([]);
    setCompletionPercentage(0);
    setShowCelebration(false);

    soundService.play('swoosh');
    triggerHaptic('medium');
  };

  // Зберегти як зображення
  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `coloring-${Date.now()}.svg`;
    link.click();

    URL.revokeObjectURL(url);

    soundService.play('success');
    triggerHaptic('medium');
  };

  // Вибір кольору
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setTool('brush');
    soundService.play('tap');
    triggerHaptic('light');
  };

  // Переключення інструменту
  const handleToolChange = (newTool: 'brush' | 'eraser') => {
    setTool(newTool);
    soundService.play('tap');
    triggerHaptic('light');
  };

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
          <Palette size={24} color="#FF6B9D" />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2D3748' }}>
            Coloring Time! 🎨
          </Typography>
        </Box>
        
        {/* Прогрес */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600 }}>
            {completionPercentage}%
          </Typography>
          {completionPercentage >= 80 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              <Check size={20} color="#48BB78" />
            </motion.div>
          )}
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {/* Інструменти та кольори */}
        <Box sx={{ width: { xs: '100%', md: 120 } }}>
          {/* Інструменти */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#718096', mb: 1, display: 'block' }}>
              Tools
            </Typography>
            <Stack spacing={1}>
              <Tooltip title="Brush" placement="right">
                <IconButton
                  onClick={() => handleToolChange('brush')}
                  sx={{
                    backgroundColor: tool === 'brush' ? alpha('#FF6B9D', 0.1) : 'transparent',
                    border: tool === 'brush' ? '2px solid #FF6B9D' : '2px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha('#FF6B9D', 0.15),
                    },
                  }}
                >
                  <Paintbrush size={20} color={tool === 'brush' ? '#FF6B9D' : '#718096'} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Eraser" placement="right">
                <IconButton
                  onClick={() => handleToolChange('eraser')}
                  sx={{
                    backgroundColor: tool === 'eraser' ? alpha('#718096', 0.1) : 'transparent',
                    border: tool === 'eraser' ? '2px solid #718096' : '2px solid transparent',
                    '&:hover': {
                      backgroundColor: alpha('#718096', 0.15),
                    },
                  }}
                >
                  <Eraser size={20} color={tool === 'eraser' ? '#718096' : '#A0AEC0'} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Undo" placement="right">
                <IconButton
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha('#4299E1', 0.1),
                    },
                  }}
                >
                  <Undo size={20} color={history.length > 0 ? '#4299E1' : '#CBD5E0'} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Clear All" placement="right">
                <IconButton
                  onClick={handleClear}
                  disabled={filledElements.size === 0}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha('#F56565', 0.1),
                    },
                  }}
                >
                  <RotateCcw size={20} color={filledElements.size > 0 ? '#F56565' : '#CBD5E0'} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Download" placement="right">
                <IconButton
                  onClick={handleDownload}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha('#48BB78', 0.1),
                    },
                  }}
                >
                  <Download size={20} color="#48BB78" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Paper>

          {/* Палітра кольорів */}
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#718096', mb: 1, display: 'block' }}>
              Colors
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
              }}
            >
              {colors.map((color) => (
                <motion.div
                  key={color}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => handleColorSelect(color)}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '12px',
                      backgroundColor: color,
                      cursor: 'pointer',
                      border: selectedColor === color ? '3px solid #2D3748' : '2px solid white',
                      boxShadow: selectedColor === color 
                        ? `0 0 0 3px ${alpha(color, 0.3)}`
                        : '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    {selectedColor === color && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <Check size={24} color="white" strokeWidth={3} />
                      </Box>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Canvas для розфарбовування */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: 3,
            borderRadius: 2,
            border: '2px solid #E2E8F0',
            backgroundColor: 'white',
            minHeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Box
            ref={svgRef}
            sx={{
              width: '100%',
              maxWidth: 500,
              '& svg': {
                width: '100%',
                height: 'auto',
              },
            }}
          />

          {/* Святкування */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 4,
                    p: 4,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    textAlign: 'center',
                  }}
                >
                  <Sparkles size={48} color="#FFD700" />
                  <Typography variant="h4" sx={{ mt: 2, fontWeight: 700, color: '#FF6B9D' }}>
                    Amazing! 🎉
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, color: '#718096' }}>
                    You're a great artist!
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Stack>

      {/* Підказка */}
      {filledElements.size === 0 && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            backgroundColor: alpha('#4299E1', 0.1),
            border: '1px solid #4299E1',
          }}
        >
          <Typography variant="body2" sx={{ color: '#2C5282', fontWeight: 500 }}>
            💡 Click on any part of the picture to color it!
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ColoringCanvas;

