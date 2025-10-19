'use client';

import React, { useState } from 'react';
import { Box, Paper, Typography, Button, IconButton, Grid, Chip, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Box as BoxIcon, RotateCcw, CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface BuildingPart {
  id: string;
  name: string;
  color: string;
  shape: 'square' | 'rectangle' | 'circle' | 'triangle';
  size: number;
  requiredPosition?: number;
}

interface BuiltObject {
  targetName: string;
  parts: BuildingPart[];
  completionMessage?: string;
}

interface ObjectBuilderProps {
  targetObject: BuiltObject;
  showGuide?: boolean;
  allowFreeform?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const ObjectBuilder: React.FC<ObjectBuilderProps> = ({
  targetObject,
  showGuide = true,
  allowFreeform = false,
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [placedParts, setPlacedParts] = useState<BuildingPart[]>([]);
  const [availableParts, setAvailableParts] = useState<BuildingPart[]>(
    [...targetObject.parts].sort(() => Math.random() - 0.5)
  );
  const [isComplete, setIsComplete] = useState(false);

  const handlePartPlace = (part: BuildingPart) => {
    // Remove from available
    setAvailableParts(availableParts.filter((p) => p.id !== part.id));

    // Add to placed
    const newPlaced = [...placedParts, part];
    setPlacedParts(newPlaced);

    soundService.playCorrect();
    triggerHaptic('light');

    // Check if complete
    if (newPlaced.length === targetObject.parts.length) {
      checkCompletion(newPlaced);
    }
  };

  const handlePartRemove = (part: BuildingPart) => {
    // Remove from placed
    setPlacedParts(placedParts.filter((p) => p.id !== part.id));

    // Add back to available
    setAvailableParts([...availableParts, part]);

    soundService.play('tap');
    triggerHaptic('light');
  };

  const checkCompletion = (placed: BuildingPart[]) => {
    // Simple completion check - all parts placed
    const allPlaced = placed.length === targetObject.parts.length;

    if (allowFreeform) {
      // In freeform mode, any arrangement is valid
      if (allPlaced) {
        setIsComplete(true);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
        triggerHaptic('success');
      }
    } else {
      // In strict mode, check if parts are in correct order
      const correctOrder = targetObject.parts.every((part, index) => {
        return placed[index]?.id === part.id;
      });

      if (correctOrder) {
        setIsComplete(true);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
        triggerHaptic('success');
      } else if (allPlaced) {
        soundService.playError();
        triggerHaptic('error');
      }
    }
  };

  const handleReset = () => {
    setAvailableParts([...targetObject.parts].sort(() => Math.random() - 0.5));
    setPlacedParts([]);
    setIsComplete(false);
    triggerHaptic('light');
  };

  const renderPart = (part: BuildingPart, size: number = part.size) => {
    const shapeStyles = {
      square: {
        width: size,
        height: size,
        borderRadius: '4px',
      },
      rectangle: {
        width: size * 1.5,
        height: size,
        borderRadius: '4px',
      },
      circle: {
        width: size,
        height: size,
        borderRadius: '50%',
      },
      triangle: {
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${part.color}`,
        backgroundColor: 'transparent',
      },
    };

    return (
      <Box
        sx={{
          ...shapeStyles[part.shape],
          backgroundColor: part.shape !== 'triangle' ? part.color : 'transparent',
          border: '2px solid',
          borderColor: alpha('#000', 0.2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      />
    );
  };

  if (!targetObject || !targetObject.parts || targetObject.parts.length === 0) {
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
          Add building parts to create an object!
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
        minHeight: 700,
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
            🧱 Object Builder
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Build a {targetObject.targetName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={`${placedParts.length}/${targetObject.parts.length} parts`}
            color="primary"
            icon={<BoxIcon size={16} />}
          />
          <IconButton onClick={handleReset} color="primary" size="large">
            <RotateCcw size={24} />
          </IconButton>
        </Box>
      </Box>

      {!isComplete ? (
        <>
          {/* Guide/Preview */}
          {showGuide && (
            <Paper elevation={4} sx={{ mb: 4, p: 4, borderRadius: 3, backgroundColor: alpha('#667eea', 0.05) }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, textAlign: 'center' }}>
                🎯 Target: {targetObject.targetName}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  alignItems: 'center',
                  opacity: 0.4,
                }}
              >
                {targetObject.parts.map((part) => (
                  <Box key={part.id}>{renderPart(part)}</Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Building Area */}
          <Paper
            elevation={6}
            sx={{
              mb: 4,
              p: 4,
              borderRadius: 3,
              minHeight: 300,
              border: '3px dashed',
              borderColor: 'primary.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {placedParts.length === 0 ? (
              <Typography variant="h6" color="text.secondary">
                Start building by selecting parts below
              </Typography>
            ) : (
              <AnimatePresence>
                {placedParts.map((part, index) => (
                  <motion.div
                    key={part.id}
                    initial={{ scale: 0, y: -50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: 'spring', delay: index * 0.1 }}
                    onClick={() => handlePartRemove(part)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                        transition: 'transform 0.2s',
                      }}
                    >
                      {renderPart(part)}
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: -20,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {part.name}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </Paper>

          {/* Available Parts */}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Available Parts:
            </Typography>

            <Grid container spacing={2}>
              {availableParts.map((part) => (
                <Grid item xs={6} sm={4} md={3} key={part.id}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Paper
                      elevation={3}
                      onClick={() => handlePartPlace(part)}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        borderRadius: 3,
                        border: '2px solid',
                        borderColor: 'secondary.main',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: alpha('#f093fb', 0.1),
                          boxShadow: 6,
                        },
                      }}
                    >
                      {renderPart(part)}
                      <Typography variant="subtitle2" fontWeight={700} textAlign="center">
                        {part.name}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      ) : (
        /* Completion Screen */
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

            <Trophy size={80} />

            <Typography variant="h3" fontWeight={800} sx={{ my: 3 }}>
              Built Successfully!
            </Typography>

            <Typography variant="h5" sx={{ mb: 2 }}>
              You built a {targetObject.targetName}!
            </Typography>

            {targetObject.completionMessage && (
              <Typography variant="h6" sx={{ mb: 4, fontStyle: 'italic' }}>
                {targetObject.completionMessage}
              </Typography>
            )}

            {/* Show built object */}
            <Paper
              elevation={8}
              sx={{
                p: 4,
                backgroundColor: 'white',
                borderRadius: 3,
                mb: 4,
                display: 'inline-flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {placedParts.map((part) => (
                <Box key={part.id}>{renderPart(part)}</Box>
              ))}
            </Paper>

            <Button
              variant="contained"
              size="large"
              onClick={handleReset}
              sx={{
                backgroundColor: 'white',
                color: 'success.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              Build Another
            </Button>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default ObjectBuilder;

