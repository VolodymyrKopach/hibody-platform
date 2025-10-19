'use client';

import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Avatar, Chip, alpha } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface DialogOption {
  id: string;
  text: string;
  nextNodeId?: string;
  isCorrect?: boolean;
  points?: number;
}

interface DialogNode {
  id: string;
  character: string;
  text: string;
  options: DialogOption[];
  isFinal?: boolean;
}

interface Character {
  name: string;
  avatar: string;
  voice?: string;
}

interface DialogRoleplayProps {
  dialogTree: DialogNode[];
  characters: Character[];
  showHints?: boolean;
  enableVoice?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const DialogRoleplay: React.FC<DialogRoleplayProps> = ({
  dialogTree = [],
  characters = [],
  showHints = true,
  enableVoice = true,
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('');
  const [dialogHistory, setDialogHistory] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Initialize with first node
  useEffect(() => {
    if (dialogTree.length > 0 && !currentNodeId) {
      setCurrentNodeId(dialogTree[0].id);
    }
  }, [dialogTree, currentNodeId]);

  const currentNode = dialogTree.find((node) => node.id === currentNodeId);
  const currentCharacter = characters.find((char) => char.name === currentNode?.character);

  const handleSpeak = (text: string) => {
    if (enableVoice && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      triggerHaptic('light');
    }
  };

  const handleOptionSelect = (option: DialogOption) => {
    setSelectedOption(option.id);
    triggerHaptic('light');

    // Add to history
    setDialogHistory([...dialogHistory, currentNodeId]);

    // Update score
    if (option.isCorrect && option.points) {
      setScore((prev) => prev + option.points);
      soundService.playCorrect();
      triggerHaptic('success');
    } else if (option.isCorrect === false) {
      soundService.playError();
      triggerHaptic('error');
    } else {
      soundService.play('tap');
    }

    // Move to next node after a delay
    setTimeout(() => {
      if (option.nextNodeId) {
        const nextNode = dialogTree.find((node) => node.id === option.nextNodeId);
        if (nextNode?.isFinal) {
          setIsComplete(true);
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
          });
          soundService.playSuccess();
        } else {
          setCurrentNodeId(option.nextNodeId);
        }
      } else {
        // No next node means end of dialog
        setIsComplete(true);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
      }
      setSelectedOption(null);
    }, 800);
  };

  const handleReset = () => {
    setCurrentNodeId(dialogTree[0]?.id || '');
    setDialogHistory([]);
    setScore(0);
    setIsComplete(false);
    setSelectedOption(null);
    triggerHaptic('light');
  };

  if (dialogTree.length === 0 || characters.length === 0) {
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
          Add dialog tree and characters to get started!
        </Typography>
      </Box>
    );
  }

  if (!currentNode) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Dialog configuration error
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
            Dialog Roleplay
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Chip label={`Score: ${score}`} color="success" />
            <Chip label={`Turn: ${dialogHistory.length + 1}`} color="info" />
          </Box>
        </Box>

        <Button
          variant="outlined"
          onClick={handleReset}
          startIcon={<RotateCcw size={20} />}
        >
          Restart
        </Button>
      </Box>

      {!isComplete ? (
        <>
          {/* Character dialog */}
          <Paper
            elevation={6}
            sx={{
              mb: 4,
              p: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
              {/* Character avatar */}
              {currentCharacter && (
                <Avatar
                  src={currentCharacter.avatar}
                  alt={currentCharacter.name}
                  sx={{
                    width: 80,
                    height: 80,
                    border: '4px solid white',
                    boxShadow: 4,
                  }}
                />
              )}

              <Box sx={{ flex: 1 }}>
                {/* Character name */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  {currentCharacter?.name || currentNode.character}
                </Typography>

                {/* Dialog text */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={currentNodeId}
                >
                  <Typography variant="h6" sx={{ lineHeight: 1.8 }}>
                    {currentNode.text}
                  </Typography>
                </motion.div>

                {/* Voice button */}
                {enableVoice && (
                  <Button
                    variant="contained"
                    onClick={() => handleSpeak(currentNode.text)}
                    startIcon={<Volume2 size={20} />}
                    sx={{
                      mt: 2,
                      backgroundColor: alpha('#ffffff', 0.2),
                      '&:hover': {
                        backgroundColor: alpha('#ffffff', 0.3),
                      },
                    }}
                  >
                    Listen
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Response options */}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Your response:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <AnimatePresence>
                {currentNode.options.map((option, index) => (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Paper
                      elevation={selectedOption === option.id ? 8 : 3}
                      onClick={() => !selectedOption && handleOptionSelect(option)}
                      sx={{
                        p: 3,
                        cursor: selectedOption ? 'default' : 'pointer',
                        border: '2px solid',
                        borderColor:
                          selectedOption === option.id
                            ? option.isCorrect
                              ? 'success.main'
                              : 'error.main'
                            : 'transparent',
                        backgroundColor:
                          selectedOption === option.id
                            ? option.isCorrect
                              ? alpha('#4CAF50', 0.1)
                              : alpha('#f44336', 0.1)
                            : 'white',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: selectedOption ? 'none' : 'translateX(10px)',
                          boxShadow: selectedOption ? undefined : 6,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </Box>

                        <Typography variant="body1" sx={{ flex: 1 }}>
                          {option.text}
                        </Typography>

                        {showHints && option.isCorrect && (
                          <Chip
                            label="Best choice"
                            size="small"
                            color="success"
                            sx={{ opacity: selectedOption ? 1 : 0.3 }}
                          />
                        )}

                        {selectedOption === option.id && (
                          <Typography variant="h5">
                            {option.isCorrect ? '✓' : '✗'}
                          </Typography>
                        )}
                      </Box>

                      {option.points && option.points > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 5 }}>
                          +{option.points} points
                        </Typography>
                      )}
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>
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
              <Trophy size={80} />
            </Box>

            <Typography variant="h3" fontWeight={800} sx={{ mb: 2 }}>
              Dialog Complete!
            </Typography>

            <Typography variant="h5" sx={{ mb: 4 }}>
              Final Score: {score} points
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
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

            <Typography variant="h6" sx={{ mb: 3 }}>
              You completed the conversation in {dialogHistory.length + 1} turns!
            </Typography>

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
              Start New Conversation
            </Button>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default DialogRoleplay;

