'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface PatternItem {
  id: string;
  imageUrl?: string;
  emoji?: string;
  color?: string;
  shape?: 'circle' | 'square' | 'triangle' | 'star';
}

interface PatternBuilderProps {
  pattern: PatternItem[]; // The repeating pattern (e.g., [red, blue, red, blue])
  patternType?: 'color' | 'shape' | 'image' | 'emoji';
  difficulty?: 'easy' | 'medium'; // easy: 2-element pattern, medium: 3-element pattern
  repetitions?: number; // How many times to show the pattern before asking
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const PatternBuilder: React.FC<PatternBuilderProps> = ({
  pattern = [],
  patternType = 'color',
  difficulty = 'easy',
  repetitions = 2,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate the full pattern sequence with one missing element
  const totalItems = pattern.length * repetitions + 1; // +1 for the question
  const questionPosition = totalItems - 1; // Last position is the question
  const correctAnswer = pattern[questionPosition % pattern.length];

  // Build the full sequence
  const fullSequence = Array.from({ length: totalItems }, (_, index) => {
    if (index === questionPosition) {
      return null; // This is the question mark position
    }
    return pattern[index % pattern.length];
  });

  // Generate options (correct answer + distractors)
  const getOptions = (): PatternItem[] => {
    const options: PatternItem[] = [correctAnswer];
    
    // Add distractors (other items from pattern or similar items)
    pattern.forEach(item => {
      if (item.id !== correctAnswer.id && options.length < 3) {
        options.push(item);
      }
    });

    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  const [options] = useState(getOptions());

  const handleOptionClick = (optionId: string) => {
    if (selectedOption || isCompleted) return;

    setSelectedOption(optionId);
    triggerHaptic('light');

    const isCorrect = optionId === correctAnswer.id;

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      soundService.playCorrect();
      triggerHaptic('success');

      // Confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Complete the activity
      setTimeout(() => {
        setIsCompleted(true);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
      }, 1500);
    } else {
      soundService.playError();
      triggerHaptic('error');

      // Reset after delay
      setTimeout(() => {
        setSelectedOption(null);
      }, 1500);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setIsCompleted(false);
    triggerHaptic('light');
  };

  const renderPatternItem = (item: PatternItem | null, index: number, isOption = false) => {
    if (item === null) {
      // Question mark
      return (
        <Paper
          key={`question-${index}`}
          elevation={3}
          sx={{
            width: isOption ? 100 : 80,
            height: isOption ? 100 : 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: isOption ? 3 : 2,
            border: '3px dashed',
            borderColor: 'primary.main',
            backgroundColor: 'primary.50',
          }}
        >
          <HelpCircle size={isOption ? 48 : 40} color="#3B82F6" />
        </Paper>
      );
    }

    const isSelectedOption = selectedOption === item.id;
    const isCorrectOption = isSelectedOption && item.id === correctAnswer.id;
    const isWrongOption = isSelectedOption && item.id !== correctAnswer.id;

    return (
      <motion.div
        key={item.id}
        whileHover={isOption && !selectedOption ? { scale: 1.1 } : {}}
        whileTap={isOption && !selectedOption ? { scale: 0.95 } : {}}
        onClick={isOption ? () => handleOptionClick(item.id) : undefined}
        style={{
          cursor: isOption && !selectedOption ? 'pointer' : 'default',
        }}
      >
        <Paper
          elevation={isOption ? 4 : 2}
          sx={{
            width: isOption ? 100 : 80,
            height: isOption ? 100 : 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: isOption ? 3 : 2,
            border: '3px solid',
            borderColor: isCorrectOption
              ? 'success.main'
              : isWrongOption
              ? 'error.main'
              : isOption
              ? 'grey.300'
              : 'transparent',
            backgroundColor: isCorrectOption
              ? 'success.50'
              : isWrongOption
              ? 'error.50'
              : item.color || 'white',
            position: 'relative',
            transition: 'all 0.3s',
          }}
        >
          {/* Content based on type */}
          {patternType === 'emoji' && item.emoji && (
            <Typography sx={{ fontSize: isOption ? '56px' : '48px' }}>
              {item.emoji}
            </Typography>
          )}
          
          {patternType === 'image' && item.imageUrl && (
            <Box
              component="img"
              src={item.imageUrl}
              alt="Pattern item"
              sx={{
                width: '80%',
                height: '80%',
                objectFit: 'contain',
              }}
            />
          )}
          
          {patternType === 'shape' && item.shape && (
            <Box
              sx={{
                width: '60%',
                height: '60%',
                backgroundColor: item.color || '#3B82F6',
                borderRadius: item.shape === 'circle' ? '50%' : 0,
                clipPath: item.shape === 'triangle'
                  ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                  : item.shape === 'star'
                  ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                  : 'none',
              }}
            />
          )}

          {patternType === 'color' && !item.emoji && !item.imageUrl && !item.shape && (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: item.color || '#3B82F6',
              }}
            />
          )}

          {/* Success/Error indicators */}
          {isCorrectOption && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '24px' }}>✓</Typography>
              </Box>
            </motion.div>
          )}

          {isWrongOption && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '24px' }}>✗</Typography>
              </Box>
            </motion.div>
          )}
        </Paper>
      </motion.div>
    );
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 500,
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
            {isCompleted ? '🎨 Pattern Complete!' : 'Complete the Pattern'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted ? 'Great job!' : 'What comes next?'}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Pattern sequence */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
          Look at the pattern:
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 3,
            maxWidth: 700,
            mx: 'auto',
            borderRadius: 3,
            border: '3px solid',
            borderColor: 'primary.main',
            backgroundColor: 'white',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {fullSequence.map((item, index) => (
              <React.Fragment key={index}>
                {renderPatternItem(item, index)}
                {index < fullSequence.length - 1 && (
                  <Typography variant="h6" sx={{ color: 'grey.400' }}>
                    →
                  </Typography>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Options */}
      {!isCompleted && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Choose what comes next:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {options.map((option) => renderPatternItem(option, 0, true))}
          </Box>
        </Box>
      )}

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
                Perfect! 🎨
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You found the pattern!
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && !selectedOption && (
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
            💡 Look carefully - what pattern repeats?
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default PatternBuilder;

