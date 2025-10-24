'use client';

import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { BaseComponentData } from '@/types/age-group-data';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

export interface ToddlerDragDropProps {
  data: BaseComponentData;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
  onComplete?: (results: any) => void;
  className?: string;
}

export interface DragState {
  draggedItemId: string | null;
  hoveredTargetId: string | null;
  isDragging: boolean;
}

export interface CompletionState {
  isComplete: boolean;
  correctCount: number;
  totalCount: number;
  mistakes: number;
  timeSpent: number;
}

// Hardcoded settings for toddlers (3-5 years)
export interface ToddlerSettings {
  snapDistance: number;
  animationDuration: number;
  enableSounds: boolean;
  enableHaptics: boolean;
  autoComplete: boolean;
  showHints: boolean;
}

export interface ToddlerDragDropContextValue {
  dragState: DragState;
  completionState: CompletionState;
  toddlerSettings: ToddlerSettings;
  onDragStart: (itemId: string) => void;
  onDragEnd: (itemId: string, targetId: string | null) => void;
  onTargetHover: (targetId: string | null) => void;
}

const ToddlerDragDropContext = createContext<ToddlerDragDropContextValue | null>(null);

export const useToddlerDragDropContext = () => {
  const context = useContext(ToddlerDragDropContext);
  if (!context) {
    throw new Error('useToddlerDragDropContext must be used within ToddlerDragDrop');
  }
  return context;
};

/**
 * Drag and drop wrapper specifically designed for toddlers (3-5 years)
 * - Large touch targets
 * - Maximum haptic and sound feedback
 * - Colorful, playful design
 * - Auto-complete and hints enabled
 */
export const ToddlerDragDrop: React.FC<ToddlerDragDropProps & { children: React.ReactNode }> = ({
  data,
  isSelected,
  onEdit,
  onFocus,
  onComplete,
  className,
  children,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  
  const [dragState, setDragState] = useState<DragState>({
    draggedItemId: null,
    hoveredTargetId: null,
    isDragging: false,
  });

  const [completionState, setCompletionState] = useState<CompletionState>({
    isComplete: false,
    correctCount: 0,
    totalCount: data.items?.length || 0,
    mistakes: 0,
    timeSpent: 0,
  });

  // Toddler-specific settings (3-5 years) - HARDCODED
  const toddlerSettings: ToddlerSettings = {
    snapDistance: 150,        // Large snap distance for easy use
    animationDuration: 600,   // Slower animations for toddlers to follow
    enableSounds: true,       // Always enable sounds for engagement
    enableHaptics: true,      // Always enable haptics for feedback
    autoComplete: true,       // Help toddlers complete tasks
    showHints: true,          // Always show hints
  };

  // Handle drag start
  const handleDragStart = (itemId: string) => {
    setDragState(prev => ({
      ...prev,
      draggedItemId: itemId,
      isDragging: true,
    }));

    triggerHaptic('light');

    // Analytics: track drag start
    console.log('📊 [Toddler Analytics] Drag started:', { itemId, ageGroup: '3-5', timestamp: Date.now() });
  };

  // Handle drag end
  const handleDragEnd = (itemId: string, targetId: string | null) => {
    const wasSuccessful = targetId !== null;
    
    setDragState(prev => ({
      ...prev,
      draggedItemId: null,
      isDragging: false,
      hoveredTargetId: null,
    }));

    if (wasSuccessful) {
      setCompletionState(prev => ({
        ...prev,
        correctCount: prev.correctCount + 1,
        timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));

      soundService.playCorrect();
      triggerHaptic('success');
    } else {
      setCompletionState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
      }));

      soundService.playError();
      triggerHaptic('error');
    }

    // Analytics: track drag end
    console.log('📊 [Toddler Analytics] Drag ended:', { 
      itemId, 
      targetId, 
      wasSuccessful, 
      ageGroup: '3-5',
      timestamp: Date.now() 
    });
  };

  // Handle target hover
  const handleTargetHover = (targetId: string | null) => {
    setDragState(prev => ({
      ...prev,
      hoveredTargetId: targetId,
    }));
  };

  // Check completion
  useEffect(() => {
    const isComplete = completionState.correctCount >= completionState.totalCount && completionState.totalCount > 0;
    
    if (isComplete && !completionState.isComplete) {
      setCompletionState(prev => ({
        ...prev,
        isComplete: true,
        timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));

      // Toddler celebration - ALWAYS show confetti and sounds
      import('canvas-confetti').then(confetti => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      });

      soundService.playSuccess();

      if (onComplete) {
        onComplete(completionState);
      }

      // Analytics: track completion
      console.log('📊 [Toddler Analytics] Component completed:', { 
        ageGroup: '3-5',
        timeSpent: completionState.timeSpent,
        mistakes: completionState.mistakes,
        accuracy: completionState.correctCount > 0 
          ? (completionState.correctCount / (completionState.correctCount + completionState.mistakes)) * 100 
          : 0
      });
    }
  }, [completionState.correctCount, completionState.totalCount, onComplete, completionState]);

  const contextValue: ToddlerDragDropContextValue = {
    dragState,
    completionState,
    toddlerSettings,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
    onTargetHover: handleTargetHover,
  };

  return (
    <ToddlerDragDropContext.Provider value={contextValue}>
      <Box
        ref={containerRef}
        onClick={onFocus}
        className={className}
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: 400,
          p: 4, // Large padding for toddlers
          border: isSelected ? '2px solid' : '2px solid transparent',
          borderColor: 'primary.main',
          borderRadius: 4, // Rounded corners for friendly look
          cursor: onFocus ? 'pointer' : 'default',
          // Toddler-specific gradient background
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE5F1 50%, #E8F5FF 100%)',
          transition: 'all 0.3s ease',
          '&:hover': onFocus ? {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          } : {},
        }}
      >
        {children}
      </Box>
    </ToddlerDragDropContext.Provider>
  );
};

