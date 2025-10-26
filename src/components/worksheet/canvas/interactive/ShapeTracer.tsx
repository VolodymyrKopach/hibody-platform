'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Eraser } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface Point {
  x: number;
  y: number;
}

interface ShapeTracerProps {
  shapePath: string; // SVG path string
  shapeName?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  strokeWidth?: number;
  guideColor?: string;
  traceColor?: string;
  ageGroup?: string;
  ageStyle?: 'toddler' | 'preschool' | 'elementary';
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const ShapeTracer: React.FC<ShapeTracerProps> = ({
  shapePath = 'M 50,50 L 150,50 L 150,150 L 50,150 Z', // Default: square
  shapeName = 'Shape',
  difficulty = 'easy',
  strokeWidth: strokeWidthProp,
  guideColor: guideColorProp,
  traceColor: traceColorProp,
  ageStyle = 'preschool',
  isSelected,
  onEdit,
  onFocus,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGuide, setShowGuide] = useState(difficulty === 'easy');
  const [points, setPoints] = useState<Point[]>([]);

  const isToddlerMode = ageStyle === 'toddler';
  const canvasSize = 400;
  const completionThreshold = difficulty === 'easy' ? 70 : difficulty === 'medium' ? 80 : 90;
  
  // Age-appropriate stroke width and colors
  const strokeWidth = strokeWidthProp ?? (isToddlerMode ? 16 : 8);
  const guideColor = guideColorProp ?? (isToddlerMode ? '#FF6B9D' : '#3B82F6');
  const traceColor = traceColorProp ?? (isToddlerMode ? '#FFD93D' : '#10B981');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw guide shape (if enabled)
    if (showGuide) {
      const path = new Path2D(shapePath);
      ctx.strokeStyle = `${guideColor}40`;
      ctx.lineWidth = strokeWidth + 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke(path);

      // Draw dashed guide
      ctx.strokeStyle = guideColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([10, 10]);
      ctx.stroke(path);
      ctx.setLineDash([]);
    }

    // Draw user trace
    if (points.length > 1) {
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, [points, showGuide, shapePath, guideColor, traceColor, strokeWidth]);

  // Calculate progress based on path coverage
  useEffect(() => {
    if (points.length === 0) {
      setProgress(0);
      return;
    }

    // Simple progress calculation based on points drawn
    const estimatedTotalPoints = 200; // Rough estimate
    const currentProgress = Math.min((points.length / estimatedTotalPoints) * 100, 100);
    setProgress(currentProgress);

    // Check for completion
    if (currentProgress >= completionThreshold && !isCompleted) {
      setIsCompleted(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
      soundService.playSuccess();
      triggerHaptic('success');
    }
  }, [points.length, completionThreshold, isCompleted]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    setIsDrawing(true);
    const pos = getMousePos(e);
    setPoints([pos]);
    triggerHaptic('light');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isCompleted) return;
    const pos = getMousePos(e);
    setPoints((prev) => [...prev, pos]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isCompleted) return;
    e.preventDefault();
    setIsDrawing(true);
    const pos = getTouchPos(e);
    setPoints([pos]);
    triggerHaptic('light');
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isCompleted) return;
    e.preventDefault();
    const pos = getTouchPos(e);
    setPoints((prev) => [...prev, pos]);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
  };

  const handleReset = () => {
    setPoints([]);
    setProgress(0);
    setIsCompleted(false);
    setShowGuide(difficulty === 'easy');
    triggerHaptic('light');
  };

  const handleClear = () => {
    setPoints([]);
    setProgress(0);
    triggerHaptic('light');
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 1000,
        mx: 'auto',
        minHeight: 550,
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
            {isCompleted ? `🎉 Great Tracing!` : `Trace the ${shapeName}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? 'Perfect work!' 
              : difficulty === 'easy' 
              ? 'Follow the dotted line' 
              : 'Trace the shape'}
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isCompleted && points.length > 0 && (
            <IconButton onClick={handleClear} color="warning" size="small">
              <Eraser size={24} />
            </IconButton>
          )}
          <IconButton onClick={handleReset} color="primary" size="large">
            <RotateCcw size={28} />
          </IconButton>
        </Box>
      </Box>

      {/* Progress bar */}
      {!isCompleted && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="primary">
              Progress: {Math.round(progress)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Target: {completionThreshold}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 10, 
              borderRadius: 2,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                background: 'linear-gradient(90deg, #3B82F6, #10B981)',
              }
            }} 
          />
        </Box>
      )}

      {/* Canvas */}
      <Paper
        elevation={3}
        sx={{
          width: canvasSize,
          height: canvasSize,
          mx: 'auto',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          border: '3px solid',
          borderColor: isCompleted ? 'success.main' : 'primary.light',
          backgroundColor: 'white',
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: isCompleted ? 'default' : 'crosshair',
            touchAction: 'none',
          }}
        />

        {/* Animated hand hint (easy mode, before starting) */}
        {difficulty === 'easy' && points.length === 0 && !isCompleted && (
          <motion.div
            animate={{
              x: [20, 40, 20],
              y: [20, 40, 20],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              fontSize: '48px',
              pointerEvents: 'none',
            }}
          >
            ☝️
          </motion.div>
        )}
      </Paper>

      {/* Success overlay */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 200,
            }}
          >
            <Paper
              elevation={12}
              sx={{
                px: 6,
                py: 4,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Sparkles size={64} />
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                Excellent!
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You traced the {shapeName} perfectly! ✨
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && points.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <Typography
            variant="body2"
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
            }}
          >
            💡 {difficulty === 'easy' 
              ? 'Trace along the dotted line with your finger or mouse' 
              : 'Draw the shape from start to finish'}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default ShapeTracer;

