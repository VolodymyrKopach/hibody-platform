'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Chip,
  alpha,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

interface AIFeedback {
  score: number;
  praise: string;
  suggestions: string;
  overall: string;
}

interface OpenQuestionProps {
  question: string;
  expectedKeywords?: string[];
  maxLength?: number;
  enableVoiceInput?: boolean;
  feedbackType?: 'encouraging' | 'detailed' | 'concise';
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const OpenQuestion: React.FC<OpenQuestionProps> = ({
  question = '',
  expectedKeywords = [],
  maxLength = 500,
  enableVoiceInput = false,
  feedbackType = 'encouraging',
  ageGroup,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedback | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  React.useEffect(() => {
    if (enableVoiceInput && typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setAnswer((prev) => prev + finalTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [enableVoiceInput]);

  const handleVoiceToggle = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      triggerHaptic('light');
    } else {
      recognition.start();
      setIsRecording(true);
      triggerHaptic('light');
      soundService.play('tap');
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    triggerHaptic('light');

    try {
      const response = await fetch('/api/interactive/ai-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer: answer.trim(),
          expectedKeywords,
          feedbackType,
          ageGroup,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFeedback(data.feedback);
        soundService.playSuccess();
        triggerHaptic('success');
      } else {
        console.error('Failed to get feedback:', data.error);
        soundService.playError();
        triggerHaptic('error');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      soundService.playError();
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnswer('');
    setFeedback(null);
    triggerHaptic('light');
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'success';
    if (score >= 3) return 'info';
    if (score >= 2) return 'warning';
    return 'error';
  };

  if (!question) {
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
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Add a question to get started!
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
        minHeight: 400,
        p: 3,
        border: isSelected ? '2px solid' : '2px solid transparent',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'grey.50',
        cursor: onFocus ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Open Question
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Write your answer and get AI feedback
        </Typography>
      </Box>

      {/* Question */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 3,
          backgroundColor: 'primary.main',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {question}
        </Typography>

        {/* Expected keywords chips */}
        {expectedKeywords.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ mr: 1, alignSelf: 'center' }}>
              Keywords:
            </Typography>
            {expectedKeywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                size="small"
                sx={{
                  backgroundColor: alpha('#ffffff', 0.2),
                  color: 'white',
                }}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Answer input */}
      <Paper elevation={3} sx={{ mb: 3, p: 2, borderRadius: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          disabled={isLoading || !!feedback}
          inputProps={{ maxLength }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
            },
          }}
        />

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {answer.length} / {maxLength} characters
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {enableVoiceInput && recognition && (
              <IconButton
                onClick={handleVoiceToggle}
                color={isRecording ? 'error' : 'primary'}
                disabled={isLoading || !!feedback}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </IconButton>
            )}

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!answer.trim() || isLoading || !!feedback}
              startIcon={isLoading ? <CircularProgress size={20} /> : <Send size={20} />}
              size="large"
            >
              {isLoading ? 'Analyzing...' : 'Submit'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* AI Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '2px solid',
                borderColor: `${getScoreColor(feedback.score)}.main`,
                backgroundColor: alpha(
                  getScoreColor(feedback.score) === 'success' ? '#4CAF50' : '#2196F3',
                  0.05
                ),
              }}
            >
              {/* Score */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {feedback.score >= 4 ? (
                    <CheckCircle2 size={32} color="#4CAF50" />
                  ) : (
                    <AlertCircle size={32} color="#FF9800" />
                  )}
                  <Typography variant="h6" fontWeight={700}>
                    Score: {feedback.score}/5
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', gap: 0.5 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 1,
                        backgroundColor:
                          i < feedback.score
                            ? `${getScoreColor(feedback.score)}.main`
                            : 'grey.300',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Praise */}
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="subtitle2"
                  color="success.main"
                  fontWeight={700}
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Sparkles size={20} /> What you did well:
                </Typography>
                <Typography variant="body1">{feedback.praise}</Typography>
              </Box>

              {/* Suggestions */}
              {feedback.suggestions && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle2"
                    color="info.main"
                    fontWeight={700}
                    sx={{ mb: 1 }}
                  >
                    💡 Suggestions for improvement:
                  </Typography>
                  <Typography variant="body1">{feedback.suggestions}</Typography>
                </Box>
              )}

              {/* Overall */}
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: alpha('#4CAF50', 0.1),
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1" fontWeight={600} color="success.dark">
                  {feedback.overall}
                </Typography>
              </Box>

              {/* Try again button */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button variant="outlined" onClick={handleReset} size="large">
                  Try Another Answer
                </Button>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice recording indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <Paper
            elevation={8}
            sx={{
              px: 3,
              py: 2,
              backgroundColor: 'error.main',
              color: 'white',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <Mic size={24} />
            </motion.div>
            <Typography variant="body1" fontWeight={600}>
              Recording...
            </Typography>
          </Paper>
        </motion.div>
      )}
    </Box>
  );
};

export default OpenQuestion;

