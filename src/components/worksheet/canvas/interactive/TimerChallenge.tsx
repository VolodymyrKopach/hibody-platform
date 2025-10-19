'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, LinearProgress, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Trophy, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface TimerChallengeItem {
  id: string;
  question: string;
  answer: string;
  imageUrl?: string;
}

interface TimerChallengeProps {
  duration: number; // seconds
  challengeType?: 'find-items' | 'answer-questions' | 'complete-task';
  items: TimerChallengeItem[];
  showProgress?: boolean;
  bonusTime?: number;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const TimerChallenge: React.FC<TimerChallengeProps> = ({
  duration = 60,
  challengeType = 'answer-questions',
  items = [],
  showProgress = true,
  bonusTime = 5,
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [userAnswer, setUserAnswer] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [finalTime, setFinalTime] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    setIsRunning(true);
    triggerHaptic('light');
    soundService.play('tap');
  };

  const handlePause = () => {
    setIsRunning(false);
    triggerHaptic('light');
    soundService.play('tap');
  };

  const handleReset = () => {
    setTimeLeft(duration);
    setIsRunning(false);
    setCurrentIndex(0);
    setCorrectAnswers(new Set());
    setUserAnswer('');
    setIsComplete(false);
    setFinalTime(0);
    triggerHaptic('light');
  };

  const handleTimeUp = () => {
    setFinalTime(duration - timeLeft);
    setIsComplete(true);
    soundService.playError();
    triggerHaptic('error');
  };

  const handleAnswerSubmit = () => {
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    const isCorrect =
      userAnswer.trim().toLowerCase() === currentItem.answer.toLowerCase();

    if (isCorrect) {
      setCorrectAnswers(new Set([...correctAnswers, currentItem.id]));
      soundService.playCorrect();
      triggerHaptic('success');

      // Add bonus time
      if (bonusTime > 0) {
        setTimeLeft((prev) => prev + bonusTime);
      }

      // Move to next item
      if (currentIndex + 1 < items.length) {
        setCurrentIndex(currentIndex + 1);
        setUserAnswer('');
      } else {
        // All items completed
        setFinalTime(duration - timeLeft);
        setIsComplete(true);
        setIsRunning(false);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
      }
    } else {
      soundService.playError();
      triggerHaptic('error');
      // Deduct time penalty
      setTimeLeft((prev) => Math.max(0, prev - 3));
    }
  };

  const currentItem = items[currentIndex];
  const progress = (correctAnswers.size / items.length) * 100;
  const timeProgress = (timeLeft / duration) * 100;

  if (items.length === 0) {
    return (
      <Box
        onClick={onFocus}
        sx={{
          p: 4,
          textAlign: 'center',
          border: isSelected ? '2px solid' : '2px dashed',
          borderColor: isSelected ? 'primary.main' : 'grey.400',
          borderRadius: 2,
          backgroundColor: 'grey.50',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Add challenge items to get started!
        </Typography>
      </Box>
    );
  }

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
            ⏱️ Timer Challenge
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Complete as many as you can before time runs out!
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isRunning && timeLeft > 0 && !isComplete && (
            <Button
              variant="contained"
              onClick={handleStart}
              startIcon={<Play size={20} />}
              color="success"
            >
              Start
            </Button>
          )}
          {isRunning && (
            <Button
              variant="contained"
              onClick={handlePause}
              startIcon={<Pause size={20} />}
              color="warning"
            >
              Pause
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleReset}
            startIcon={<RotateCcw size={20} />}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {/* Timer display */}
      <Paper
        elevation={6}
        sx={{
          mb: 3,
          p: 3,
          background: timeLeft < 10
            ? 'linear-gradient(135deg, #FF6B6B 0%, #C92A2A 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
          transition: 'background 0.5s',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Clock size={32} />
            <Typography variant="h3" fontWeight={800}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" fontWeight={700}>
              {correctAnswers.size} / {items.length}
            </Typography>
            <Typography variant="caption">Completed</Typography>
          </Box>
        </Box>

        {showProgress && (
          <LinearProgress
            variant="determinate"
            value={timeProgress}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: alpha('#ffffff', 0.2),
              '& .MuiLinearProgress-bar': {
                backgroundColor: 'white',
                borderRadius: 5,
              },
            }}
          />
        )}
      </Paper>

      {!isComplete ? (
        /* Challenge content */
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
              {currentItem.imageUrl && (
                <Box
                  component="img"
                  src={currentItem.imageUrl}
                  alt="Challenge item"
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 'auto',
                    borderRadius: 2,
                    mb: 3,
                    mx: 'auto',
                    display: 'block',
                  }}
                />
              )}

              <Typography variant="h5" fontWeight={700} sx={{ mb: 3, textAlign: 'center' }}>
                {currentItem.question}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && isRunning) {
                      handleAnswerSubmit();
                    }
                  }}
                  placeholder="Type your answer..."
                  disabled={!isRunning}
                  style={{
                    flex: 1,
                    padding: '16px',
                    fontSize: '18px',
                    borderRadius: '8px',
                    border: '2px solid #E0E0E0',
                    outline: 'none',
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAnswerSubmit}
                  disabled={!isRunning || !userAnswer.trim()}
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  Submit
                </Button>
              </Box>

              {bonusTime > 0 && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Zap size={16} color="#FCD34D" />
                  <Typography variant="caption" color="text.secondary">
                    Correct answer = +{bonusTime}s bonus time!
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </AnimatePresence>
      ) : (
        /* Completion screen */
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Paper
            elevation={12}
            sx={{
              p: 6,
              textAlign: 'center',
              background:
                correctAnswers.size === items.length
                  ? 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)'
                  : 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Trophy size={80} />
            <Typography variant="h3" fontWeight={800} sx={{ my: 3 }}>
              {correctAnswers.size === items.length ? 'Perfect!' : 'Time Up!'}
            </Typography>

            <Typography variant="h5" sx={{ mb: 2 }}>
              Score: {correctAnswers.size} / {items.length}
            </Typography>

            <Typography variant="h6" sx={{ mb: 4 }}>
              Time: {Math.floor(finalTime / 60)}:{(finalTime % 60).toString().padStart(2, '0')}
            </Typography>

            <Button
              variant="contained"
              size="large"
              onClick={handleReset}
              sx={{
                backgroundColor: 'white',
                color: correctAnswers.size === items.length ? 'success.main' : 'warning.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              Try Again
            </Button>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default TimerChallenge;

