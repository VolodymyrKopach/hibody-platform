'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, IconButton, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl?: string;
  order: number;
}

interface TimelineBuilderProps {
  events: TimelineEvent[];
  timelineType?: 'linear' | 'circular';
  showDates?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const TimelineBuilder: React.FC<TimelineBuilderProps> = ({
  events = [],
  timelineType = 'linear',
  showDates = true,
  difficulty = 'easy',
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  // Shuffle events for the game
  const [shuffledEvents] = useState(() => {
    const sorted = [...events].sort(() => Math.random() - 0.5);
    return sorted;
  });

  const [placedEvents, setPlacedEvents] = useState<TimelineEvent[]>([]);
  const [availableEvents, setAvailableEvents] = useState<TimelineEvent[]>(shuffledEvents);
  const [isComplete, setIsComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleEventPlace = (event: TimelineEvent, position: number) => {
    const newPlaced = [...placedEvents];
    newPlaced[position] = event;
    setPlacedEvents(newPlaced);

    setAvailableEvents(availableEvents.filter((e) => e.id !== event.id));
    setAttempts((prev) => prev + 1);
    
    triggerHaptic('light');
    soundService.play('tap');

    // Check if all events placed
    if (newPlaced.filter(Boolean).length === events.length) {
      checkIfCorrect(newPlaced);
    }
  };

  const handleEventRemove = (event: TimelineEvent, position: number) => {
    const newPlaced = [...placedEvents];
    newPlaced[position] = null as any;
    setPlacedEvents(newPlaced.filter(Boolean));

    setAvailableEvents([...availableEvents, event]);
    triggerHaptic('light');
    soundService.play('tap');
  };

  const checkIfCorrect = (placed: TimelineEvent[]) => {
    const correctOrder = [...events].sort((a, b) => a.order - b.order);
    const isCorrect = placed.every((event, index) => event.id === correctOrder[index].id);

    if (isCorrect) {
      setIsComplete(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
      });
      soundService.playSuccess();
      triggerHaptic('success');
    } else {
      soundService.playError();
      triggerHaptic('error');
    }
  };

  const handleReset = () => {
    const sorted = [...events].sort(() => Math.random() - 0.5);
    setAvailableEvents(sorted);
    setPlacedEvents([]);
    setIsComplete(false);
    setAttempts(0);
    triggerHaptic('light');
  };

  if (events.length === 0) {
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
          Add timeline events to get started!
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
            📅 Timeline Builder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Arrange events in the correct order
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`Placed: ${placedEvents.length}/${events.length}`}
            color="primary"
          />
          <IconButton onClick={handleReset} color="primary" size="large">
            <RotateCcw size={24} />
          </IconButton>
        </Box>
      </Box>

      {!isComplete ? (
        <>
          {/* Timeline */}
          <Paper elevation={4} sx={{ mb: 4, p: 4, borderRadius: 3 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: timelineType === 'linear' ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                gap: 2,
                overflow: 'auto',
                minHeight: 200,
              }}
            >
              {events.map((_, index) => {
                const placedEvent = placedEvents[index];

                return (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 150,
                    }}
                  >
                    {/* Slot number */}
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        mb: 1,
                        color: 'primary.main',
                      }}
                    >
                      #{index + 1}
                    </Typography>

                    {/* Drop zone */}
                    <Paper
                      elevation={placedEvent ? 6 : 2}
                      sx={{
                        width: 140,
                        height: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 3,
                        border: '2px dashed',
                        borderColor: placedEvent ? 'primary.main' : 'grey.400',
                        backgroundColor: placedEvent ? alpha('#667eea', 0.1) : 'white',
                        cursor: placedEvent ? 'pointer' : 'default',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: placedEvent ? 'scale(1.05)' : 'none',
                        },
                      }}
                      onClick={() => placedEvent && handleEventRemove(placedEvent, index)}
                    >
                      {placedEvent ? (
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          {placedEvent.imageUrl && (
                            <Box
                              component="img"
                              src={placedEvent.imageUrl}
                              alt={placedEvent.title}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'cover',
                                borderRadius: 2,
                                mb: 1,
                              }}
                            />
                          )}
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '12px' }}>
                            {placedEvent.title}
                          </Typography>
                          {showDates && (
                            <Typography variant="caption" color="text.secondary">
                              {placedEvent.date}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Drop here
                        </Typography>
                      )}
                    </Paper>

                    {/* Connector line */}
                    {index < events.length - 1 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          right: timelineType === 'linear' ? -20 : undefined,
                          bottom: timelineType === 'circular' ? -20 : undefined,
                          width: timelineType === 'linear' ? 40 : 2,
                          height: timelineType === 'linear' ? 2 : 40,
                          backgroundColor: 'primary.main',
                          zIndex: 0,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>

          {/* Available events */}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Events to place:
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              {availableEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Paper
                    elevation={4}
                    onClick={() => {
                      const nextPosition = placedEvents.length;
                      if (nextPosition < events.length) {
                        handleEventPlace(event, nextPosition);
                      }
                    }}
                    sx={{
                      width: 200,
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '2px solid',
                      borderColor: 'secondary.main',
                      transition: 'all 0.3s',
                      '&:hover': {
                        backgroundColor: alpha('#f093fb', 0.1),
                        boxShadow: 6,
                      },
                    }}
                  >
                    {event.imageUrl && (
                      <Box
                        component="img"
                        src={event.imageUrl}
                        alt={event.title}
                        sx={{
                          width: '100%',
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 2,
                          mb: 1,
                        }}
                      />
                    )}

                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                      {event.title}
                    </Typography>

                    {showDates && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                        <Calendar size={14} />
                        <Typography variant="caption" color="text.secondary">
                          {event.date}
                        </Typography>
                      </Box>
                    )}

                    <Typography variant="caption" color="text.secondary">
                      {event.description}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>
        </>
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
              background: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
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

            <CheckCircle2 size={80} />

            <Typography variant="h3" fontWeight={800} sx={{ my: 3 }}>
              Perfect Timeline!
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              You arranged all {events.length} events correctly!
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              Attempts: {attempts}
            </Typography>

            <IconButton
              onClick={handleReset}
              sx={{
                backgroundColor: 'white',
                color: 'success.main',
                width: 60,
                height: 60,
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              <RotateCcw size={28} />
            </IconButton>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default TimelineBuilder;

