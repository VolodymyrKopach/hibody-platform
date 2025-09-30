'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Sparkles, 
  BookOpen, 
  Target, 
  FileEdit, 
  Clock, 
  MessageSquare,
  ChevronDown,
  Info,
  Zap
} from 'lucide-react';

interface WorksheetParameters {
  topic: string;
  level: string;
  focusAreas: string[];
  exerciseTypes: string[];
  numberOfPages: number;
  duration: string;
  purpose: string;
  additionalNotes: string;
}

interface Step1WorksheetParametersProps {
  onGenerate: (parameters: WorksheetParameters) => void;
}

const Step1WorksheetParameters: React.FC<Step1WorksheetParametersProps> = ({ onGenerate }) => {
  const theme = useTheme();

  const [parameters, setParameters] = useState<WorksheetParameters>({
    topic: '',
    level: 'intermediate',
    focusAreas: ['grammar', 'vocabulary'], // Smart defaults
    exerciseTypes: ['fill-blanks', 'multiple-choice'], // Smart defaults
    numberOfPages: 3, // Default 3 pages
    duration: 'standard',
    purpose: 'general',
    additionalNotes: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const levels = [
    { value: 'beginner', label: 'Beginner', emoji: '🌱', description: 'A1 - Starting basics' },
    { value: 'elementary', label: 'Elementary', emoji: '🌿', description: 'A2 - Simple talks' },
    { value: 'intermediate', label: 'Intermediate', emoji: '🌳', description: 'B1 - Everyday topics' },
    { value: 'upper-intermediate', label: 'Upper-Int.', emoji: '🎯', description: 'B2 - Complex topics' },
    { value: 'advanced', label: 'Advanced', emoji: '🚀', description: 'C1+ - Fluent' },
  ];

  const focusAreas = [
    { value: 'grammar', label: 'Grammar', icon: '📖', popular: true },
    { value: 'vocabulary', label: 'Vocabulary', icon: '📝', popular: true },
    { value: 'reading', label: 'Reading', icon: '📚', popular: false },
    { value: 'writing', label: 'Writing', icon: '✍️', popular: false },
    { value: 'speaking', label: 'Speaking', icon: '💬', popular: false },
    { value: 'listening', label: 'Listening', icon: '👂', popular: false },
  ];

  const exerciseTypes = [
    { value: 'fill-blanks', label: 'Fill in the Blanks', icon: '✏️', popular: true },
    { value: 'multiple-choice', label: 'Multiple Choice', icon: '☑️', popular: true },
    { value: 'match-pairs', label: 'Match Pairs', icon: '🔗', popular: true },
    { value: 'true-false', label: 'True/False', icon: '✓✗', popular: false },
    { value: 'short-answer', label: 'Short Answer', icon: '💭', popular: false },
    { value: 'word-bank', label: 'Word Bank', icon: '📦', popular: false },
  ];

  const durations = [
    { value: 'quick', label: '10-15 min', description: 'Quick practice' },
    { value: 'standard', label: '20-30 min', description: 'Standard length' },
    { value: 'extended', label: '40-50 min', description: 'Extended practice' },
  ];

  const purposes = [
    { value: 'homework', label: 'Homework Assignment', icon: '🏠' },
    { value: 'in-class', label: 'In-Class Practice', icon: '🎓' },
    { value: 'quiz', label: 'Quiz/Test', icon: '📋' },
    { value: 'general', label: 'General Practice', icon: '✏️' },
  ];

  const toggleFocusArea = (value: string) => {
    setParameters(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(value)
        ? prev.focusAreas.filter(v => v !== value)
        : [...prev.focusAreas, value],
    }));
  };

  const toggleExerciseType = (value: string) => {
    setParameters(prev => ({
      ...prev,
      exerciseTypes: prev.exerciseTypes.includes(value)
        ? prev.exerciseTypes.filter(v => v !== value)
        : [...prev.exerciseTypes, value],
    }));
  };

  const isValid = () => {
    return (
      parameters.topic.trim() !== '' &&
      parameters.focusAreas.length > 0 &&
      parameters.exerciseTypes.length > 0
    );
  };

  const handleGenerate = () => {
    if (isValid()) {
      onGenerate(parameters);
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto', py: 4, px: 2, flex: 1 }}>
        <Stack spacing={3}>

        {/* Header with Quick Start */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                ✨ Create Worksheet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in topic and we'll generate a ready-to-use worksheet
              </Typography>
            </Box>
            <Chip
              icon={<Zap size={16} />}
              label="Quick Start"
              size="small"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Paper>

        {/* Main Form - Compact */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Stack spacing={3}>
            {/* 1. Topic - Prominent */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <BookOpen size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  What's your topic?
                </Typography>
                <Typography variant="caption" color="error.main">*</Typography>
              </Stack>
              <TextField
                fullWidth
                placeholder="Present Simple, Travel Vocabulary, Daily Routines..."
                value={parameters.topic}
                onChange={(e) => setParameters({ ...parameters, topic: e.target.value })}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '1.1rem',
                    '& input': {
                      py: 1.5,
                    },
                  },
                }}
              />
            </Box>

            {/* 2. Student Level - Compact Chips */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Target size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Student Level
                </Typography>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {levels.map((level) => (
                  <Chip
                    key={level.value}
                    label={`${level.emoji} ${level.label}`}
                    onClick={() => setParameters({ ...parameters, level: level.value })}
                    sx={{
                      px: 1.5,
                      py: 2.5,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: '12px',
                      background: parameters.level === level.value
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                        : alpha(theme.palette.grey[400], 0.1),
                      color: parameters.level === level.value ? 'white' : theme.palette.text.primary,
                      border: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: parameters.level === level.value
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                          : alpha(theme.palette.primary.main, 0.15),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* 3. Focus Areas - With Smart Defaults */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <FileEdit size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Focus Areas
                </Typography>
                <Tooltip title="Select what skills to practice">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <Info size={14} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {focusAreas.map((area) => (
                  <Chip
                    key={area.value}
                    label={`${area.icon} ${area.label}`}
                    onClick={() => toggleFocusArea(area.value)}
                    size="medium"
                    sx={{
                      px: 1.5,
                      py: 2.5,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: '12px',
                      background: parameters.focusAreas.includes(area.value)
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                        : alpha(theme.palette.grey[400], 0.1),
                      color: parameters.focusAreas.includes(area.value) ? 'white' : theme.palette.text.primary,
                      border: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: parameters.focusAreas.includes(area.value)
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                          : alpha(theme.palette.primary.main, 0.15),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* 4. Exercise Types - Compact */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <FileEdit size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Exercise Types
                </Typography>
                <Tooltip title="What types of exercises to include">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <Info size={14} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {exerciseTypes.map((type) => (
                  <Chip
                    key={type.value}
                    label={`${type.icon} ${type.label}`}
                    onClick={() => toggleExerciseType(type.value)}
                    size="medium"
                    sx={{
                      px: 1.5,
                      py: 2.5,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      borderRadius: '12px',
                      background: parameters.exerciseTypes.includes(type.value)
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                        : alpha(theme.palette.grey[400], 0.1),
                      color: parameters.exerciseTypes.includes(type.value) ? 'white' : theme.palette.text.primary,
                      border: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: parameters.exerciseTypes.includes(type.value)
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                          : alpha(theme.palette.primary.main, 0.15),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* 5. Number of Pages - NEW */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <FileEdit size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Number of Pages
                </Typography>
                <Tooltip title="How many worksheet pages to generate">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <Info size={14} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Stack direction="row" gap={1.5}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <Box
                    key={num}
                    onClick={() => setParameters({ ...parameters, numberOfPages: num })}
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      background: parameters.numberOfPages === num
                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                        : alpha(theme.palette.grey[400], 0.1),
                      color: parameters.numberOfPages === num ? 'white' : theme.palette.text.primary,
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      border: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        background: parameters.numberOfPages === num
                          ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                          : alpha(theme.palette.primary.main, 0.15),
                        transform: 'translateY(-2px)',
                        boxShadow: parameters.numberOfPages === num 
                          ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                          : 'none',
                      },
                    }}
                  >
                    {num}
                  </Box>
                ))}
                <TextField
                  type="number"
                  value={parameters.numberOfPages > 5 ? parameters.numberOfPages : ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0 && val <= 20) {
                      setParameters({ ...parameters, numberOfPages: val });
                    }
                  }}
                  placeholder="6+"
                  inputProps={{ min: 6, max: 20 }}
                  sx={{
                    width: 64,
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      textAlign: 'center',
                      '& input': {
                        textAlign: 'center',
                        p: 0,
                      },
                    },
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Recommended: 3-5 pages for optimal learning
              </Typography>
            </Box>

            {/* Advanced Options - Collapsible */}
            <Box>
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                endIcon={
                  <ChevronDown
                    size={18}
                    style={{
                      transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  />
                }
                sx={{
                  textTransform: 'none',
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Advanced Options
              </Button>
              
              <Collapse in={showAdvanced}>
                <Stack spacing={3} sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  {/* Duration */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Clock size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Duration
                      </Typography>
                    </Stack>
                    <Stack direction="row" gap={1}>
                      {durations.map((duration) => (
                        <Chip
                          key={duration.value}
                          label={duration.label}
                          onClick={() => setParameters({ ...parameters, duration: duration.value })}
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            background: parameters.duration === duration.value
                              ? alpha(theme.palette.primary.main, 0.15)
                              : alpha(theme.palette.grey[400], 0.1),
                            color: parameters.duration === duration.value ? theme.palette.primary.main : theme.palette.text.primary,
                            fontWeight: 500,
                            '&:hover': {
                              background: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Purpose */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Target size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Purpose
                      </Typography>
                    </Stack>
                    <Stack direction="row" gap={1}>
                      {purposes.map((purpose) => (
                        <Chip
                          key={purpose.value}
                          label={`${purpose.icon} ${purpose.label}`}
                          onClick={() => setParameters({ ...parameters, purpose: purpose.value })}
                          size="small"
                          sx={{
                            borderRadius: '8px',
                            background: parameters.purpose === purpose.value
                              ? alpha(theme.palette.primary.main, 0.15)
                              : alpha(theme.palette.grey[400], 0.1),
                            color: parameters.purpose === purpose.value ? theme.palette.primary.main : theme.palette.text.primary,
                            fontWeight: 500,
                            '&:hover': {
                              background: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>

                  {/* Additional Notes */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <MessageSquare size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Special Instructions
                      </Typography>
                    </Stack>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Any specific requirements or preferences..."
                      value={parameters.additionalNotes}
                      onChange={(e) => setParameters({ ...parameters, additionalNotes: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  </Box>
                </Stack>
              </Collapse>
            </Box>
          </Stack>
        </Paper>

        {/* Action Button - Prominent */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<Sparkles size={22} />}
          disabled={!isValid()}
          onClick={handleGenerate}
          sx={{
            py: 2,
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 700,
            background: isValid()
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
              : alpha(theme.palette.grey[400], 0.2),
            boxShadow: isValid() ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}` : 'none',
            transition: 'all 0.3s',
            '&:hover': {
              background: isValid()
                ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                : alpha(theme.palette.grey[400], 0.2),
              boxShadow: isValid() ? `0 12px 32px ${alpha(theme.palette.primary.main, 0.45)}` : 'none',
              transform: isValid() ? 'translateY(-2px)' : 'none',
            },
            '&:disabled': {
              color: theme.palette.text.disabled,
            },
          }}
        >
          Generate My Worksheet
        </Button>
        
        {!isValid() && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
            Please fill in the topic to continue
          </Typography>
        )}
        </Stack>
      </Box>
    </Box>
  );
};

export default Step1WorksheetParameters;
