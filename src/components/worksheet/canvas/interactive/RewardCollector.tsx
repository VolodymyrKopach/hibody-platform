'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Sparkles, Star, Gift, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  emoji?: string;
}

interface RewardCollectorProps {
  tasks: Task[];
  rewardTitle?: string;
  rewardEmoji?: string;
  starsPerTask?: number;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const RewardCollector: React.FC<RewardCollectorProps> = ({
  tasks = [],
  rewardTitle = 'Great Job!',
  rewardEmoji = '🎁',
  starsPerTask = 1,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showReward, setShowReward] = useState(false);

  const totalStars = tasks.length * starsPerTask;
  const earnedStars = completedTasks.size * starsPerTask;
  const progress = (earnedStars / totalStars) * 100;
  const allCompleted = completedTasks.size === tasks.length;

  const handleTaskClick = (taskId: string) => {
    if (completedTasks.has(taskId) || allCompleted) return;

    const newCompleted = new Set(completedTasks);
    newCompleted.add(taskId);
    setCompletedTasks(newCompleted);

    // Play sound and haptic
    soundService.playCorrect();
    triggerHaptic('success');

    // Mini confetti for each star
    for (let i = 0; i < starsPerTask; i++) {
      setTimeout(() => {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500'],
          shapes: ['star'],
        });
      }, i * 200);
    }

    // Check if all tasks completed
    if (newCompleted.size === tasks.length) {
      setTimeout(() => {
        setShowReward(true);
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF69B4'],
        });
        soundService.playSuccess();
        triggerHaptic('success');
      }, 1000);
    }
  };

  const handleReset = () => {
    setCompletedTasks(new Set());
    setShowReward(false);
    triggerHaptic('light');
  };

  const renderStars = (count: number) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: i * 0.1,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          >
            <Star size={24} fill="#FFD700" color="#FFD700" />
          </motion.div>
        ))}
      </Box>
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
            {allCompleted ? '🏆 All Done!' : 'Collect Stars!'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Complete tasks to earn stars ⭐
          </Typography>
        </Box>

        {/* Reset button */}
        <IconButton onClick={handleReset} color="primary" size="large">
          <RotateCcw size={28} />
        </IconButton>
      </Box>

      {/* Progress bar */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '2px solid',
          borderColor: allCompleted ? 'success.main' : 'primary.light',
          backgroundColor: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1" fontWeight={600}>
            Progress
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary">
            {earnedStars} / {totalStars} ⭐
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 12,
            borderRadius: 2,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: allCompleted ? 'success.main' : 'primary.main',
              borderRadius: 2,
            },
          }}
        />
      </Paper>

      {/* Tasks list */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Your Tasks:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tasks.map((task) => {
            const isCompleted = completedTasks.has(task.id);
            
            return (
              <motion.div
                key={task.id}
                whileHover={!isCompleted && !allCompleted ? { scale: 1.02 } : {}}
                whileTap={!isCompleted && !allCompleted ? { scale: 0.98 } : {}}
                onClick={() => handleTaskClick(task.id)}
                style={{
                  cursor: !isCompleted && !allCompleted ? 'pointer' : 'default',
                }}
              >
                <Paper
                  elevation={isCompleted ? 2 : 4}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '3px solid',
                    borderColor: isCompleted ? 'success.main' : 'grey.300',
                    backgroundColor: isCompleted ? 'success.50' : 'white',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    position: 'relative',
                  }}
                >
                  {/* Emoji/Icon */}
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? 'success.main' : 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Typography sx={{ fontSize: '32px' }}>✓</Typography>
                      </motion.div>
                    ) : task.emoji ? (
                      <Typography sx={{ fontSize: '32px' }}>{task.emoji}</Typography>
                    ) : (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: '3px solid',
                          borderColor: 'grey.400',
                        }}
                      />
                    )}
                  </Box>

                  {/* Task text */}
                  <Typography
                    variant="body1"
                    fontWeight={600}
                    sx={{
                      flex: 1,
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      color: isCompleted ? 'success.dark' : 'text.primary',
                    }}
                  >
                    {task.text}
                  </Typography>

                  {/* Stars earned */}
                  {isCompleted && renderStars(starsPerTask)}
                </Paper>
              </motion.div>
            );
          })}
        </Box>
      </Box>

      {/* Collected stars display */}
      {earnedStars > 0 && !showReward && (
        <Paper
          elevation={4}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '3px solid #FFD700',
            backgroundColor: '#FFF9E6',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Stars Collected!
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {Array.from({ length: earnedStars }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, y: -50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{
                  delay: i * 0.05,
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                }}
              >
                <Star size={32} fill="#FFD700" color="#FFD700" />
              </motion.div>
            ))}
          </Box>
        </Paper>
      )}

      {/* Reward overlay */}
      <AnimatePresence>
        {showReward && (
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
                py: 5,
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
                border: '4px solid white',
                boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)',
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              >
                <Typography sx={{ fontSize: '96px', mb: 2 }}>
                  {rewardEmoji}
                </Typography>
              </motion.div>
              
              <Trophy size={64} />
              
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2, mb: 1 }}>
                {rewardTitle}
              </Typography>
              
              <Typography variant="h5" sx={{ mb: 2 }}>
                You earned all {totalStars} stars!
              </Typography>

              {/* Animated stars around reward */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      delay: i * 0.1,
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  >
                    <Star size={40} fill="white" color="white" />
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!allCompleted && completedTasks.size === 0 && (
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
            💡 Tap on tasks to mark them as complete and earn stars!
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default RewardCollector;

