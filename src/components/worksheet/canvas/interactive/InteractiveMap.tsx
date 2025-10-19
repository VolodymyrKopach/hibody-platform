'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Tooltip, Chip, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface Hotspot {
  id: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage
  height: number; // percentage
  label: string;
  info: string;
  isCorrect?: boolean;
}

interface InteractiveMapProps {
  backgroundImage: string;
  hotspots: Hotspot[];
  mode?: 'learning' | 'quiz';
  showLabels?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
  backgroundImage,
  hotspots = [],
  mode = 'learning',
  showLabels = true,
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [discoveredHotspots, setDiscoveredHotspots] = useState<Set<string>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<string>>(new Set());
  const [wrongAnswers, setWrongAnswers] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot.id);
    triggerHaptic('light');

    if (mode === 'learning') {
      // Learning mode: just show info
      if (!discoveredHotspots.has(hotspot.id)) {
        setDiscoveredHotspots(new Set([...discoveredHotspots, hotspot.id]));
        soundService.playCorrect();
      } else {
        soundService.play('tap');
      }
    } else {
      // Quiz mode: check if correct
      if (hotspot.isCorrect) {
        setCorrectAnswers(new Set([...correctAnswers, hotspot.id]));
        soundService.playCorrect();
        triggerHaptic('success');

        // Check if all correct answers found
        const allCorrect = hotspots.filter((h) => h.isCorrect);
        if (correctAnswers.size + 1 === allCorrect.length) {
          setIsCompleted(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          soundService.playSuccess();
        }
      } else if (hotspot.isCorrect === false) {
        setWrongAnswers(new Set([...wrongAnswers, hotspot.id]));
        soundService.playError();
        triggerHaptic('error');
      }
    }
  };

  const getHotspotStatus = (hotspot: Hotspot) => {
    if (mode === 'learning') {
      return discoveredHotspots.has(hotspot.id) ? 'discovered' : 'undiscovered';
    } else {
      if (correctAnswers.has(hotspot.id)) return 'correct';
      if (wrongAnswers.has(hotspot.id)) return 'wrong';
      return 'unanswered';
    }
  };

  const getHotspotColor = (status: string) => {
    switch (status) {
      case 'discovered':
        return '#2196F3';
      case 'correct':
        return '#4CAF50';
      case 'wrong':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const selectedHotspotData = hotspots.find((h) => h.id === selectedHotspot);

  if (!backgroundImage) {
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
          Add a background image and hotspots to get started!
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
            Interactive {mode === 'learning' ? 'Map' : 'Quiz'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {mode === 'learning'
              ? 'Click on areas to learn more'
              : 'Find all the correct locations'}
          </Typography>
        </Box>

        {mode === 'learning' ? (
          <Chip
            label={`Discovered: ${discoveredHotspots.size}/${hotspots.length}`}
            color="info"
            icon={<MapPin size={16} />}
          />
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={`Correct: ${correctAnswers.size}`}
              color="success"
              icon={<CheckCircle2 size={16} />}
            />
            <Chip
              label={`Wrong: ${wrongAnswers.size}`}
              color="error"
              icon={<XCircle size={16} />}
            />
          </Box>
        )}
      </Box>

      {/* Map container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 900,
          mx: 'auto',
          mb: 3,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            border: '4px solid',
            borderColor: 'primary.main',
          }}
        >
          {/* Background image */}
          <Box
            component="img"
            src={backgroundImage}
            alt="Interactive map"
            sx={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />

          {/* Hotspots overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            {hotspots.map((hotspot) => {
              const status = getHotspotStatus(hotspot);
              const color = getHotspotColor(status);

              return (
                <Tooltip
                  key={hotspot.id}
                  title={showLabels ? hotspot.label : ''}
                  arrow
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHotspotClick(hotspot);
                    }}
                    style={{
                      position: 'absolute',
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                      width: `${hotspot.width}%`,
                      height: `${hotspot.height}%`,
                      cursor: 'pointer',
                      pointerEvents: 'all',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: alpha(color, 0.3),
                        border: '3px solid',
                        borderColor: color,
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          backgroundColor: alpha(color, 0.5),
                        },
                      }}
                    >
                      {(status === 'correct' || status === 'discovered') && (
                        <CheckCircle2 size={24} color="white" />
                      )}
                      {status === 'wrong' && <XCircle size={24} color="white" />}
                    </Box>
                  </motion.div>
                </Tooltip>
              );
            })}
          </Box>
        </Paper>
      </Box>

      {/* Info panel */}
      <AnimatePresence>
        {selectedHotspotData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 4,
                maxWidth: 700,
                mx: 'auto',
                borderRadius: 3,
                border: '2px solid',
                borderColor: getHotspotColor(getHotspotStatus(selectedHotspotData)),
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                {selectedHotspotData.label}
              </Typography>

              <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                {selectedHotspotData.info}
              </Typography>

              {mode === 'quiz' && (
                <Box sx={{ mt: 2 }}>
                  {correctAnswers.has(selectedHotspotData.id) && (
                    <Chip
                      label="Correct! ✓"
                      color="success"
                      icon={<CheckCircle2 size={16} />}
                    />
                  )}
                  {wrongAnswers.has(selectedHotspotData.id) && (
                    <Chip
                      label="Incorrect ✗"
                      color="error"
                      icon={<XCircle size={16} />}
                    />
                  )}
                </Box>
              )}
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion screen for quiz mode */}
      <AnimatePresence>
        {isCompleted && mode === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
            }}
          >
            <Paper
              elevation={24}
              sx={{
                px: 6,
                py: 4,
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: 4,
                textAlign: 'center',
              }}
            >
              <Trophy size={64} />
              <Typography variant="h3" fontWeight={800} sx={{ mt: 2 }}>
                Perfect Score!
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                You found all {correctAnswers.size} correct locations!
              </Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {wrongAnswers.size > 0
                  ? `Mistakes: ${wrongAnswers.size}`
                  : 'No mistakes - excellent work!'}
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default InteractiveMap;

