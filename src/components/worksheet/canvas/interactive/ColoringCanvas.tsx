'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Stack, alpha, Tooltip, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paintbrush, 
  PaintBucket, 
  RotateCcw, 
  Palette,
  Undo,
  Redo,
  Sparkles,
  Check,
  Star,
  Heart,
  Smile
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
  type: 'fill' | 'erase' | 'bucket';
  elementId: string;
  color: string;
  timestamp: number;
}

interface FloatingReaction {
  id: number;
  x: number;
  y: number;
  icon: 'star' | 'heart' | 'smile';
  color: string;
}

// Більш яскраві та контрастні кольори для малюків
const DEFAULT_COLORS = [
  { hex: '#FF1744', name: 'Red' },      // Червоний
  { hex: '#FF9800', name: 'Orange' },   // Помаранчевий
  { hex: '#FFEB3B', name: 'Yellow' },   // Жовтий
  { hex: '#4CAF50', name: 'Green' },    // Зелений
  { hex: '#2196F3', name: 'Blue' },     // Синій
  { hex: '#9C27B0', name: 'Purple' },   // Фіолетовий
  { hex: '#E91E63', name: 'Pink' },     // Рожевий
  { hex: '#795548', name: 'Brown' },    // Коричневий
  { hex: '#FFFFFF', name: 'White' },    // Білий
  { hex: '#212121', name: 'Black' },    // Чорний
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
  colors,
  brushSize = 2,
  ageGroup = '3-5',
  isSelected,
  onEdit,
  onFocus,
  onComplete,
}) => {
  // Використовуємо colors з об'єктами або дефолтні
  const colorPalette = colors 
    ? colors.map((c, i) => ({ hex: c, name: DEFAULT_COLORS[i]?.name || `Color ${i + 1}` }))
    : DEFAULT_COLORS;

  const [selectedColor, setSelectedColor] = useState<typeof DEFAULT_COLORS[0]>(colorPalette[0]);
  const [tool, setTool] = useState<'brush' | 'bucket'>('brush');
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [filledElements, setFilledElements] = useState<Map<string, string>>(new Map());
  const [showCelebration, setShowCelebration] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [mascotMessage, setMascotMessage] = useState<string>('');
  const [rewardStars, setRewardStars] = useState<number>(0);
  
  const svgRef = useRef<HTMLDivElement>(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const reactionIdCounter = useRef(0);
  
  // Refs для уникнення closure проблем в event listeners
  const selectedColorRef = useRef(selectedColor);
  const toolRef = useRef(tool);
  const historyIndexRef = useRef(historyIndex);
  
  // Оновлюємо refs при зміні
  useEffect(() => {
    selectedColorRef.current = selectedColor;
  }, [selectedColor]);
  
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);
  
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Завантаження SVG
  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.innerHTML = svgContent;
      setSvgLoaded(true);
      setupSVGInteraction();
      
      // Початкове привітання
      if (mascotMessage === '') {
        setMascotMessage("Let's color together! 🎨");
      }
    }
  }, [svgContent, mascotMessage]);

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
      
      // Зберігаємо elementId в data-атрибуті для доступу
      htmlElement.dataset.elementId = element.id;
      
      // Очищаємо всі попередні listeners
      const newElement = htmlElement.cloneNode(true) as HTMLElement;
      htmlElement.parentNode?.replaceChild(newElement, htmlElement);
      
      // Додаємо нові listeners до чистого елемента
      newElement.addEventListener('click', (e) => {
        e.stopPropagation();
        const elementId = (e.currentTarget as HTMLElement).dataset.elementId;
        if (elementId) {
          handleElementClick(elementId);
        }
      });
      
      newElement.addEventListener('mouseenter', () => {
        newElement.style.filter = 'brightness(1.1)';
      });
      
      newElement.addEventListener('mouseleave', () => {
        newElement.style.filter = 'none';
      });
    });
  };

  // Додавання анімованої реакції
  const addFloatingReaction = (x: number, y: number) => {
    const icons: Array<'star' | 'heart' | 'smile'> = ['star', 'heart', 'smile'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const reactionColors = ['#FFD700', '#FF69B4', '#87CEEB'];
    const randomColor = reactionColors[Math.floor(Math.random() * reactionColors.length)];
    
    const newReaction: FloatingReaction = {
      id: reactionIdCounter.current++,
      x,
      y,
      icon: randomIcon,
      color: randomColor,
    };
    
    setFloatingReactions(prev => [...prev, newReaction]);
    
    // Видалити реакцію через 2 секунди
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  // Підбадьорення від маскота
  const showMascotEncouragement = (percentage: number) => {
    let message = '';
    
    if (percentage === 0) {
      message = "Let's color together! 🎨";
    } else if (percentage < 25) {
      message = "Great start! Keep going! 😊";
    } else if (percentage < 50) {
      message = "Wow! You're doing amazing! 🌟";
    } else if (percentage < 75) {
      message = "So colorful! Almost there! 🎉";
    } else if (percentage < 100) {
      message = "Just a little more! You can do it! 💪";
    } else {
      message = "Perfect! You're a superstar! ⭐⭐⭐";
    }
    
    setMascotMessage(message);
    
    // Промовити повідомлення
    soundService.speak(message, { rate: 0.9, pitch: 1.3 });
  };

  // Обробка кліку на елемент
  const handleElementClick = (elementId: string) => {
    if (!svgRef.current) return;

    const element = svgRef.current.querySelector(`#${elementId}`) as SVGElement;
    if (!element) return;

    // Отримуємо актуальні значення з refs
    const currentColor = selectedColorRef.current;
    const currentTool = toolRef.current;
    
    console.log('🎨 Coloring with:', currentColor.name, currentColor.hex);

    // Звук та вібрація
    soundService.play('tap');
    triggerHaptic('light');

    // Позиція для анімації
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    if (currentTool === 'brush' || currentTool === 'bucket') {
      // Заповнити кольором
      element.setAttribute('fill', currentColor.hex);
      
      setFilledElements((prevFilled) => {
        const newFilledElements = new Map(prevFilled);
        newFilledElements.set(elementId, currentColor.hex);

        // Додати анімовану реакцію
        addFloatingReaction(x, y);

        // Додати зірочку
        const newStars = Math.floor(newFilledElements.size / 3);
        if (newStars > rewardStars) {
          setRewardStars(newStars);
          soundService.play('success');
        }

        // Перевірити прогрес
        checkCompletion(newFilledElements);

        return newFilledElements;
      });

      // Додати в історю (обрізаємо redo гілку)
      setHistory((prevHistory) => {
        const currentHistoryIndex = historyIndexRef.current;
        const newHistory = prevHistory.slice(0, currentHistoryIndex + 1);
        const action: DrawAction = {
          type: currentTool === 'bucket' ? 'bucket' : 'fill',
          elementId,
          color: currentColor.hex,
          timestamp: Date.now(),
        };
        newHistory.push(action);
        
        // Оновлюємо індекс
        setHistoryIndex(newHistory.length - 1);
        
        return newHistory;
      });
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

    // Показати підбадьорення кожні 25%
    if (percentage % 25 === 0 && percentage > 0) {
      showMascotEncouragement(percentage);
    }

    // Якщо розфарбовано більше 80% - святкування
    if (percentage >= 80 && !showCelebration) {
      celebrate();
    }
  };

  // Святкування
  const celebrate = () => {
    setShowCelebration(true);
    soundService.play('celebration');
    soundService.speak('Amazing! You did it! You are a super artist!', { rate: 0.9, pitch: 1.4 });
    triggerHaptic('success');

    // Більше конфеті для малюків!
    const colorHexes = colorPalette.map(c => c.hex);
    
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: colorHexes,
    });

    // Додаткове конфеті через 500мс
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colorHexes,
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colorHexes,
      });
    }, 500);

    // Сховати через 4 секунди
    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);

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

  // Скасувати останню дію (Undo)
  const handleUndo = () => {
    if (historyIndex < 0) return;

    const action = history[historyIndex];
    const element = svgRef.current?.querySelector(`#${action.elementId}`) as SVGElement;
    
    if (element) {
      // Знайти попередній колір для цього елемента
      let colorToRestore = 'white';
      for (let i = historyIndex - 1; i >= 0; i--) {
        if (history[i].elementId === action.elementId) {
          colorToRestore = history[i].color;
          break;
        }
      }
      
      element.setAttribute('fill', colorToRestore);

      // Оновити стан
      const newFilledElements = new Map(filledElements);
      if (colorToRestore === 'white') {
        newFilledElements.delete(action.elementId);
      } else {
        newFilledElements.set(action.elementId, colorToRestore);
      }
      setFilledElements(newFilledElements);
      setHistoryIndex(historyIndex - 1);

      checkCompletion(newFilledElements);
    }

    soundService.play('tap');
    triggerHaptic('light');
  };

  // Повторити дію (Redo)
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;

    const nextIndex = historyIndex + 1;
    const action = history[nextIndex];
    const element = svgRef.current?.querySelector(`#${action.elementId}`) as SVGElement;
    
    if (element) {
      element.setAttribute('fill', action.color);

      // Оновити стан
      const newFilledElements = new Map(filledElements);
      if (action.color === 'white') {
        newFilledElements.delete(action.elementId);
      } else {
        newFilledElements.set(action.elementId, action.color);
      }
      setFilledElements(newFilledElements);
      setHistoryIndex(nextIndex);

      checkCompletion(newFilledElements);
    }

    soundService.play('tap');
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
    setHistoryIndex(-1);
    setCompletionPercentage(0);
    setShowCelebration(false);
    setRewardStars(0);
    setMascotMessage("Let's start fresh! 🎨");

    soundService.play('tap');
    soundService.speak("Let's color again!", { rate: 0.9, pitch: 1.3 });
    triggerHaptic('light');
  };

  // Вибір кольору з промовою назви
  const handleColorSelect = (color: typeof DEFAULT_COLORS[0]) => {
    console.log('✨ Selected color:', color.name, color.hex);
    setSelectedColor(color);
    setTool('brush');
    
    // Звук кольору - промовити назву
    soundService.play('tap');
    soundService.speak(color.name, { rate: 0.85, pitch: 1.3, volume: 0.8 });
    triggerHaptic('light');
  };

  // Переключення інструменту
  const handleToolChange = (newTool: 'brush' | 'bucket') => {
    setTool(newTool);
    
    // Промовити назву інструмента
    const toolName = newTool === 'brush' ? 'Paint brush' : 'Paint bucket';
    soundService.play('tap');
    soundService.speak(toolName, { rate: 0.9, pitch: 1.3 });
    triggerHaptic('light');
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        p: { xs: 2, md: 3 },
        border: isSelected ? '3px solid' : '3px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 4,
        backgroundColor: '#FFF9E6',
        cursor: onFocus ? 'pointer' : 'default',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Заголовок з маскотом */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Palette size={40} color="#FF6B9D" />
          </motion.div>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2D3748', fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
              Let's Color! 🎨
            </Typography>
            {mascotMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="body2" sx={{ color: '#4A5568', fontWeight: 500, mt: 0.5 }}>
                  {mascotMessage}
                </Typography>
              </motion.div>
            )}
          </Box>
        </Box>
        
        {/* Нагороди */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {[...Array(rewardStars)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: 'spring' }}
            >
              <Star size={28} fill="#FFD700" color="#FFD700" />
            </motion.div>
          ))}
        </Box>
      </Box>

      {/* Прогрес-бар з відсотками */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" sx={{ color: '#4A5568', fontWeight: 600, fontSize: '1.1rem' }}>
            Progress
          </Typography>
          <Typography variant="h6" sx={{ color: '#FF6B9D', fontWeight: 700, fontSize: '1.3rem' }}>
            {completionPercentage}%
          </Typography>
        </Box>
        <Box sx={{ position: 'relative' }}>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 16,
              borderRadius: 8,
              backgroundColor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 8,
                background: 'linear-gradient(90deg, #FF6B9D 0%, #FFD700 50%, #4CAF50 100%)',
              },
            }}
          />
          {completionPercentage >= 80 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ position: 'absolute', right: 8, top: -2 }}
            >
              <Check size={20} color="white" strokeWidth={3} />
            </motion.div>
          )}
        </Box>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Інструменти та кольори */}
        <Box sx={{ width: { xs: '100%', md: 160 } }}>
          {/* Інструменти - БІЛЬШІ кнопки для малюків */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              border: '2px solid #E2E8F0',
              backgroundColor: 'white',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#2D3748', mb: 2, fontSize: '1.1rem' }}>
              🛠️ Tools
            </Typography>
            <Stack spacing={1.5}>
              {/* Brush Tool */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={() => handleToolChange('brush')}
                  sx={{
                    width: '100%',
                    height: 56,
                    backgroundColor: tool === 'brush' ? '#FF6B9D' : '#F7FAFC',
                    border: `3px solid ${tool === 'brush' ? '#FF6B9D' : '#E2E8F0'}`,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: tool === 'brush' ? '#FF5A8C' : '#EDF2F7',
                    },
                  }}
                >
                  <Paintbrush size={28} color={tool === 'brush' ? 'white' : '#4A5568'} strokeWidth={2.5} />
                </IconButton>
              </motion.div>
              
              {/* Bucket Fill Tool */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={() => handleToolChange('bucket')}
                  sx={{
                    width: '100%',
                    height: 56,
                    backgroundColor: tool === 'bucket' ? '#4CAF50' : '#F7FAFC',
                    border: `3px solid ${tool === 'bucket' ? '#4CAF50' : '#E2E8F0'}`,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: tool === 'bucket' ? '#45A049' : '#EDF2F7',
                    },
                  }}
                >
                  <PaintBucket size={28} color={tool === 'bucket' ? 'white' : '#4A5568'} strokeWidth={2.5} />
                </IconButton>
              </motion.div>

              {/* Undo */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={handleUndo}
                  disabled={historyIndex < 0}
                  sx={{
                    width: '100%',
                    height: 48,
                    backgroundColor: '#F7FAFC',
                    border: '2px solid #E2E8F0',
                    borderRadius: 2,
                    opacity: historyIndex >= 0 ? 1 : 0.4,
                    '&:hover': {
                      backgroundColor: '#EDF2F7',
                    },
                  }}
                >
                  <Undo size={24} color="#4299E1" strokeWidth={2.5} />
                </IconButton>
              </motion.div>

              {/* Redo */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  sx={{
                    width: '100%',
                    height: 48,
                    backgroundColor: '#F7FAFC',
                    border: '2px solid #E2E8F0',
                    borderRadius: 2,
                    opacity: historyIndex < history.length - 1 ? 1 : 0.4,
                    '&:hover': {
                      backgroundColor: '#EDF2F7',
                    },
                  }}
                >
                  <Redo size={24} color="#4299E1" strokeWidth={2.5} />
                </IconButton>
              </motion.div>

              {/* Clear All */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={handleClear}
                  disabled={filledElements.size === 0}
                  sx={{
                    width: '100%',
                    height: 48,
                    backgroundColor: '#FFF5F5',
                    border: '2px solid #FED7D7',
                    borderRadius: 2,
                    opacity: filledElements.size > 0 ? 1 : 0.4,
                    '&:hover': {
                      backgroundColor: '#FEE',
                    },
                  }}
                >
                  <RotateCcw size={24} color="#F56565" strokeWidth={2.5} />
                </IconButton>
              </motion.div>
            </Stack>
          </Paper>

          {/* Палітра кольорів - БІЛЬШІ для малюків */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: '2px solid #E2E8F0',
              backgroundColor: 'white',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 700, color: '#2D3748', mb: 2, fontSize: '1.1rem' }}>
              🎨 Colors
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.5,
              }}
            >
              {colorPalette.map((color) => (
                <motion.div
                  key={color.hex}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Box
                    onClick={() => handleColorSelect(color)}
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      backgroundColor: color.hex,
                      cursor: 'pointer',
                      border: selectedColor.hex === color.hex ? '4px solid #2D3748' : '3px solid white',
                      boxShadow: selectedColor.hex === color.hex 
                        ? `0 0 0 4px ${alpha(color.hex, 0.4)}, 0 8px 16px rgba(0,0,0,0.2)`
                        : '0 4px 8px rgba(0,0,0,0.12)',
                      transition: 'all 0.2s',
                      position: 'relative',
                      '&:hover': {
                        boxShadow: '0 6px 12px rgba(0,0,0,0.18)',
                      },
                    }}
                  >
                    {selectedColor.hex === color.hex && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <Check 
                          size={32} 
                          color={color.hex === '#FFFFFF' ? '#2D3748' : 'white'} 
                          strokeWidth={4} 
                        />
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* Canvas для розфарбовування з анімаціями */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            borderRadius: 3,
            border: '3px solid #E2E8F0',
            backgroundColor: 'white',
            minHeight: { xs: 400, md: 500 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            ref={svgRef}
            sx={{
              width: '100%',
              maxWidth: { xs: 350, md: 500 },
              '& svg': {
                width: '100%',
                height: 'auto',
                cursor: 'pointer',
              },
            }}
          />

          {/* Анімовані реакції (стікери) */}
          <AnimatePresence>
            {floatingReactions.map((reaction) => {
              const IconComponent = reaction.icon === 'star' ? Star : reaction.icon === 'heart' ? Heart : Smile;
              return (
                <motion.div
                  key={reaction.id}
                  initial={{ opacity: 0, scale: 0, x: reaction.x, y: reaction.y }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    scale: [0, 1.2, 1, 0.8],
                    y: reaction.y - 100,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  style={{
                    position: 'fixed',
                    pointerEvents: 'none',
                    zIndex: 9999,
                  }}
                >
                  <IconComponent size={40} fill={reaction.color} color={reaction.color} strokeWidth={2} />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Святкування - БІЛЬШЕ та ЯСКРАВІШЕ */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'white',
                    borderRadius: 4,
                    p: { xs: 3, md: 5 },
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    textAlign: 'center',
                    border: '4px solid #FFD700',
                  }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={72} color="#FFD700" fill="#FFD700" />
                  </motion.div>
                  <Typography variant="h3" sx={{ mt: 2, fontWeight: 800, color: '#FF6B9D', fontSize: { xs: '2rem', md: '3rem' } }}>
                    WOW! Amazing! 🎉
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: '#4CAF50', fontWeight: 600 }}>
                    You're a superstar artist! ⭐⭐⭐
                  </Typography>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Stack>

      {/* Підказка для початку - БІЛЬША та ЯСКРАВІША */}
      {filledElements.size === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Box
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '3px solid #764ba2',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'white', 
                fontWeight: 700, 
                textAlign: 'center',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
              }}
            >
              👆 Tap any part to color it! Choose your favorite colors! 🎨
            </Typography>
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default ColoringCanvas;

