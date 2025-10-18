'use client';

import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Chip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, RotateCcw, Download, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '@/services/interactive/SoundService';
import { triggerHaptic } from '@/utils/interactive/haptics';

type RecordingState = 'idle' | 'recording' | 'recorded';

interface VoiceRecorderProps {
  prompt?: string;
  maxDuration?: number; // in seconds
  showPlayback?: boolean;
  autoPlay?: boolean;
  ageGroup?: string;
  isSelected?: boolean;
  onEdit?: (properties: any) => void;
  onFocus?: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  prompt = 'Record your voice!',
  maxDuration = 30,
  showPlayback = true,
  autoPlay = false,
  isSelected,
  onEdit,
  onFocus,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlaybackComplete, setIsPlaybackComplete] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrlRef.current = audioUrl;
        
        // Create audio element for playback
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Auto-play if enabled
        if (autoPlay && showPlayback) {
          setTimeout(() => {
            playRecording();
          }, 500);
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);
      soundService.playCorrect();
      triggerHaptic('light');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('recorded');
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      soundService.playSuccess();
      triggerHaptic('success');
      
      // Celebration
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const playRecording = () => {
    if (audioRef.current && recordingState === 'recorded') {
      audioRef.current.play();
      setIsPlaying(true);
      triggerHaptic('light');

      audioRef.current.onended = () => {
        setIsPlaying(false);
        setIsPlaybackComplete(true);
        
        // Celebration after listening
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
        soundService.playSuccess();
      };
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      triggerHaptic('light');
    }
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setRecordingState('idle');
    setRecordingTime(0);
    setIsPlaying(false);
    setIsPlaybackComplete(false);
    audioChunksRef.current = [];
    triggerHaptic('light');
  };

  const downloadRecording = () => {
    if (audioUrlRef.current) {
      const a = document.createElement('a');
      a.href = audioUrlRef.current;
      a.download = `recording-${Date.now()}.webm`;
      a.click();
      triggerHaptic('light');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            {recordingState === 'recorded' ? '🎤 Recording Complete!' : 'Voice Recorder'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {recordingState === 'idle' && 'Press the microphone to start'}
            {recordingState === 'recording' && 'Recording...'}
            {recordingState === 'recorded' && 'Listen to your recording'}
          </Typography>
        </Box>

        {/* Reset button */}
        {recordingState !== 'idle' && (
          <IconButton onClick={resetRecording} color="primary" size="large">
            <RotateCcw size={28} />
          </IconButton>
        )}
      </Box>

      {/* Prompt */}
      {prompt && recordingState === 'idle' && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            mb: 4,
            mx: 'auto',
            maxWidth: 500,
            borderRadius: 3,
            border: '3px solid',
            borderColor: 'primary.main',
            backgroundColor: 'primary.50',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" fontWeight={700} color="primary">
            {prompt}
          </Typography>
        </Paper>
      )}

      {/* Recording controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* Main recording button */}
        {recordingState === 'idle' && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Paper
              elevation={8}
              onClick={startRecording}
              sx={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                border: '6px solid white',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: '0 12px 48px rgba(239, 68, 68, 0.6)',
                },
              }}
            >
              <Mic size={80} color="white" />
            </Paper>
          </motion.div>
        )}

        {/* Recording in progress */}
        {recordingState === 'recording' && (
          <Box sx={{ textAlign: 'center' }}>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: '6px solid white',
                  boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)',
                  position: 'relative',
                }}
              >
                <Mic size={80} color="white" />
                
                {/* Pulsing rings */}
                <motion.div
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.6, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid #EF4444',
                  }}
                />
              </Paper>
            </motion.div>

            {/* Timer */}
            <Typography variant="h4" fontWeight={700} color="error" sx={{ mt: 3 }}>
              {formatTime(recordingTime)} / {formatTime(maxDuration)}
            </Typography>

            {/* Stop button */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={stopRecording}
                sx={{
                  mt: 2,
                  width: 80,
                  height: 80,
                  backgroundColor: 'grey.800',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'grey.900',
                  },
                }}
              >
                <Square size={40} />
              </IconButton>
            </motion.div>
          </Box>
        )}

        {/* Playback controls */}
        {recordingState === 'recorded' && showPlayback && (
          <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 500 }}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                borderRadius: 3,
                border: '3px solid',
                borderColor: 'success.main',
                backgroundColor: 'white',
              }}
            >
              {/* Recording duration */}
              <Chip
                label={`Duration: ${formatTime(recordingTime)}`}
                color="success"
                sx={{ mb: 3, fontSize: '1rem', fontWeight: 600 }}
              />

              {/* Play/Pause button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                {!isPlaying ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                      onClick={playRecording}
                      sx={{
                        width: 100,
                        height: 100,
                        backgroundColor: 'success.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'success.dark',
                        },
                      }}
                    >
                      <Play size={48} fill="white" />
                    </IconButton>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                      onClick={pauseRecording}
                      sx={{
                        width: 100,
                        height: 100,
                        backgroundColor: 'warning.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'warning.dark',
                        },
                      }}
                    >
                      <Pause size={48} />
                    </IconButton>
                  </motion.div>
                )}
              </Box>

              {/* Download button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <IconButton
                  onClick={downloadRecording}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <Download size={24} />
                </IconButton>
              </motion.div>

              {isPlaying && (
                <motion.div
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <Typography variant="body1" color="success.main" fontWeight={600} sx={{ mt: 2 }}>
                    🎵 Playing...
                  </Typography>
                </motion.div>
              )}
            </Paper>
          </Box>
        )}
      </Box>

      {/* Success message */}
      <AnimatePresence>
        {isPlaybackComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Paper
              elevation={8}
              sx={{
                mt: 3,
                p: 3,
                mx: 'auto',
                maxWidth: 400,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Sparkles size={48} />
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                Great job! You sound amazing! 🎤
              </Typography>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {recordingState === 'idle' && (
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
            💡 Tap the microphone to start recording your voice
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};

export default VoiceRecorder;

