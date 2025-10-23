'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { AgeGroup, BaseComponentData } from '@/types/age-group-data';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

export interface BaseDragDropProps {
  data: BaseComponentData;
  ageGroup: AgeGroup;
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

/**
 * Base component for all age-specific drag and drop components
 * Provides common functionality like drag handling, analytics, and accessibility
 */
export const BaseDragDrop: React.FC<BaseDragDropProps & { children: React.ReactNode }> = ({
  data,
  ageGroup,
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
    totalCount: data.items.length,
    mistakes: 0,
    timeSpent: 0,
  });

  // Age-specific settings
  const getAgeSettings = () => {
    switch (ageGroup) {
      case '3-5':
        return {
          snapDistance: 150,
          animationDuration: 600,
          enableSounds: true,
          enableHaptics: true,
          autoComplete: true,
          showHints: true,
        };
      case '6-7':
        return {
          snapDistance: 120,
          animationDuration: 500,
          enableSounds: true,
          enableHaptics: true,
          autoComplete: false,
          showHints: true,
        };
      case '8-9':
        return {
          snapDistance: 100,
          animationDuration: 400,
          enableSounds: true,
          enableHaptics: false,
          autoComplete: false,
          showHints: true,
        };
      case '10-13':
        return {
          snapDistance: 80,
          animationDuration: 300,
          enableSounds: false,
          enableHaptics: false,
          autoComplete: false,
          showHints: false,
        };
      case '14-18':
        return {
          snapDistance: 60,
          animationDuration: 200,
          enableSounds: false,
          enableHaptics: false,
          autoComplete: false,
          showHints: false,
        };
      default:
        return {
          snapDistance: 100,
          animationDuration: 400,
          enableSounds: true,
          enableHaptics: false,
          autoComplete: false,
          showHints: true,
        };
    }
  };

  const ageSettings = getAgeSettings();

  // Handle drag start
  const handleDragStart = (itemId: string) => {
    setDragState(prev => ({
      ...prev,
      draggedItemId: itemId,
      isDragging: true,
    }));

    if (ageSettings.enableHaptics) {
      triggerHaptic('light');
    }

    // Analytics: track drag start
    console.log('📊 [Analytics] Drag started:', { itemId, ageGroup, timestamp: Date.now() });
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

      if (ageSettings.enableSounds) {
        soundService.playCorrect();
      }
      if (ageSettings.enableHaptics) {
        triggerHaptic('success');
      }
    } else {
      setCompletionState(prev => ({
        ...prev,
        mistakes: prev.mistakes + 1,
      }));

      if (ageSettings.enableSounds) {
        soundService.playError();
      }
      if (ageSettings.enableHaptics) {
        triggerHaptic('error');
      }
    }

    // Analytics: track drag end
    console.log('📊 [Analytics] Drag ended:', { 
      itemId, 
      targetId, 
      wasSuccessful, 
      ageGroup, 
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
    const isComplete = completionState.correctCount >= completionState.totalCount;
    
    if (isComplete && !completionState.isComplete) {
      setCompletionState(prev => ({
        ...prev,
        isComplete: true,
        timeSpent: Math.floor((Date.now() - startTimeRef.current) / 1000),
      }));

      // Celebration based on age
      if (ageGroup === '3-5' || ageGroup === '6-7') {
        // Confetti and sounds for younger kids
        import('canvas-confetti').then(confetti => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        });
      }

      if (ageSettings.enableSounds) {
        soundService.playSuccess();
      }

      if (onComplete) {
        onComplete(completionState);
      }

      // Analytics: track completion
      console.log('📊 [Analytics] Component completed:', { 
        ageGroup, 
        timeSpent: completionState.timeSpent,
        mistakes: completionState.mistakes,
        accuracy: (completionState.correctCount / (completionState.correctCount + completionState.mistakes)) * 100
      });
    }
  }, [completionState.correctCount, completionState.totalCount, ageGroup, ageSettings.enableSounds, onComplete, completionState]);

  // Accessibility: keyboard navigation for older kids
  useEffect(() => {
    if (ageGroup === '10-13' || ageGroup === '14-18') {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Add keyboard shortcuts for older age groups
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'z':
              event.preventDefault();
              // Undo functionality
              break;
            case 'r':
              event.preventDefault();
              // Reset functionality
              break;
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [ageGroup]);

  return (
    <Box
      ref={containerRef}
      onClick={onFocus}
      className={className}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 400,
        p: ageGroup === '3-5' ? 4 : ageGroup === '6-7' ? 3 : 2,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: ageGroup === '3-5' ? 4 : ageGroup === '6-7' ? 3 : 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
        // Age-specific styling
        ...(ageGroup === '3-5' && {
          background: 'linear-gradient(135deg, #FFF9E6 0%, #FFE5F1 50%, #E8F5FF 100%)',
        }),
        ...(ageGroup === '6-7' && {
          background: 'linear-gradient(135deg, #F3E7FF 0%, #E0F2FE 50%, #FEF3C7 100%)',
        }),
        ...(ageGroup === '8-9' && {
          background: 'linear-gradient(135deg, #EFF6FF 0%, #F3F4F6 100%)',
        }),
        ...(ageGroup === '10-13' && {
          background: '#FFFFFF',
        }),
        ...(ageGroup === '14-18' && {
          background: '#FFFFFF',
          borderColor: isSelected ? 'primary.main' : 'grey.300',
        }),
      }}
    >
      {/* Age-specific decorative elements */}
      {(ageGroup === '3-5' || ageGroup === '6-7') && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontSize: '2rem',
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        >
          {ageGroup === '3-5' ? '🌟✨🎈' : '🎨🌈⭐'}
        </Box>
      )}

      {/* Progress indicator for older kids */}
      {(ageGroup === '8-9' || ageGroup === '10-13' || ageGroup === '14-18') && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.875rem',
            color: 'text.secondary',
          }}
        >
          Progress: {completionState.correctCount}/{completionState.totalCount}
        </Box>
      )}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: ageSettings.animationDuration / 1000 }}
      >
        {React.cloneElement(children as React.ReactElement, {
          dragState,
          completionState,
          ageSettings,
          onDragStart: handleDragStart,
          onDragEnd: handleDragEnd,
          onTargetHover: handleTargetHover,
        })}
      </motion.div>
    </Box>
  );
};

export default BaseDragDrop;
