'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface SequenceStep {
  id: string;
  imageUrl: string;
  order: number;
  label?: string;
}

interface SequenceBuilderProps {
  steps: SequenceStep[];
  showNumbers?: boolean;
  difficulty?: 'easy' | 'medium';
  instruction?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const SequenceBuilder: React.FC<SequenceBuilderProps> = ({
  steps = [],
  showNumbers = true,
  difficulty = 'easy',
  instruction = 'Put the pictures in the right order!',
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Easy mode shows numbers as hints
  const showHints = difficulty === 'easy';

  // Sort steps by correct order
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  const correctSequence = sortedSteps.map(s => s.id);

  // Check if sequence is correct
  const checkSequence = () => {
    return JSON.stringify(userSequence) === JSON.stringify(correctSequence);
  };

  // Get available (not placed) steps
  const availableSteps = steps.filter(step => !userSequence.includes(step.id));

  // Handle step click (add to sequence)
  const handleStepClick = (stepId: string) => {
    if (userSequence.includes(stepId) || isCompleted) return;

    const newSequence = [...userSequence, stepId];
    setUserSequence(newSequence);
    triggerHaptic('light');
    soundService.playCorrect();

    // Check if completed
    if (newSequence.length === steps.length) {
      const isCorrect = JSON.stringify(newSequence) === JSON.stringify(correctSequence);
      
      if (isCorrect) {
        setTimeout(() => {
          setIsCompleted(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          soundService.playSuccess();
          triggerHaptic('success');
        }, 500);
      } else {
        setTimeout(() => {
          soundService.playError();
          triggerHaptic('error');
          // Auto-reset after wrong sequence
          setTimeout(() => {
            setUserSequence([]);
          }, 1500);
        }, 500);
      }
    }
  };

  // Remove last step from sequence
  const handleRemoveLastStep = () => {
    if (userSequence.length === 0 || isCompleted) return;
    
    const newSequence = userSequence.slice(0, -1);
    setUserSequence(newSequence);
    triggerHaptic('light');
  };

  // Reset
  const handleReset = () => {
    setUserSequence([]);
    setIsCompleted(false);
    triggerHaptic('light');
  };

  return (
    <Box
      onClick={onFocus}
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: 450,
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
            {isCompleted ? '🎉 Correct Order!' : instruction}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCompleted 
              ? 'You got the sequence right!' 
              : `Step ${userSequence.length + 1} of ${steps.length}`}
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* User sequence display */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          minHeight: 180,
          borderRadius: 2,
          backgroundColor: 'white',
          border: '3px dashed',
          borderColor: isCompleted ? 'success.main' : 'primary.light',
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
          Your Sequence:
        </Typography>
        
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            minHeight: 120,
          }}
        >
          <AnimatePresence>
            {userSequence.map((stepId, index) => {
              const step = steps.find(s => s.id === stepId);
              if (!step) return null;

              return (
                <React.Fragment key={stepId}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Box sx={{ position: 'relative', textAlign: 'center' }}>
                      {/* Number badge */}
                      {showNumbers && (
                        <Chip
                          label={index + 1}
                          size="small"
                          color={isCompleted ? 'success' : 'primary'}
                          sx={{
                            position: 'absolute',
                            top: -10,
                            left: -10,
                            zIndex: 2,
                            fontWeight: 700,
                            fontSize: '1rem',
                          }}
                        />
                      )}

                      <Paper
                        elevation={4}
                        onClick={() => index === userSequence.length - 1 && handleRemoveLastStep()}
                        sx={{
                          width: 140,
                          height: 140,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1.5,
                          borderRadius: 2,
                          border: '3px solid',
                          borderColor: isCompleted ? 'success.main' : 'primary.main',
                          backgroundColor: 'white',
                          cursor: index === userSequence.length - 1 ? 'pointer' : 'default',
                          '&:hover': index === userSequence.length - 1 ? {
                            backgroundColor: 'grey.50',
                          } : {},
                        }}
                      >
                        <Box
                          component="img"
                          src={step.imageUrl}
                          alt={step.label}
                          sx={{
                            width: '80%',
                            height: '80%',
                            objectFit: 'contain',
                          }}
                        />
                        {step.label && (
                          <Typography
                            variant="caption"
                            sx={{
                              mt: 1,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              textAlign: 'center',
                            }}
                          >
                            {step.label}
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  </motion.div>

                  {/* Arrow between steps */}
                  {index < userSequence.length - 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <ArrowRight size={32} color="#3B82F6" />
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </AnimatePresence>

          {/* Empty slots */}
          {userSequence.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Click a picture below to start...
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Available steps */}
      {availableSteps.length > 0 && !isCompleted && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
            Choose the next step:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {availableSteps.map((step) => (
              <motion.div
                key={step.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStepClick(step.id)}
                style={{
                  cursor: 'pointer',
                }}
              >
                <Box sx={{ position: 'relative', textAlign: 'center' }}>
                  {/* Hint number (easy mode) */}
                  {showHints && (
                    <Chip
                      label={step.order}
                      size="small"
                      color="warning"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        left: -10,
                        zIndex: 2,
                        fontWeight: 700,
                        fontSize: '1rem',
                        opacity: 0.7,
                      }}
                    />
                  )}

                  <Paper
                    elevation={4}
                    sx={{
                      width: 140,
                      height: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1.5,
                      borderRadius: 2,
                      border: '3px solid',
                      borderColor: 'grey.300',
                      backgroundColor: 'white',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'primary.50',
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={step.imageUrl}
                      alt={step.label}
                      sx={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'contain',
                      }}
                    />
                    {step.label && (
                      <Typography
                        variant="caption"
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          textAlign: 'center',
                        }}
                      >
                        {step.label}
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </motion.div>
            ))}
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
                Perfect!
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You got the order right! 🌟
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!isCompleted && userSequence.length === 0 && (
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
            💡 {showHints ? 'Numbers show the correct order!' : 'Think about what happens first, second, and third...'}
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default SequenceBuilder;

