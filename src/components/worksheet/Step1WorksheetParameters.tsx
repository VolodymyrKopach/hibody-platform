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
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Alert,
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
  Zap,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import AgeGroupTooltip from './AgeGroupTooltip';

interface WorksheetParameters {
  topic: string;
  level: string;
  focusAreas: string[];
  exerciseTypes: string[];
  duration: string;
  purpose: string;
  additionalNotes: string;
  language: string;              // NEW
  includeImages: boolean;        // NEW
}

interface Step1WorksheetParametersProps {
  onGenerate: (parameters: WorksheetParameters) => void;
  onSkip?: () => void;
  inDialog?: boolean;
}

const Step1WorksheetParameters: React.FC<Step1WorksheetParametersProps> = ({ 
  onGenerate, 
  onSkip,
  inDialog = false 
}) => {
  const theme = useTheme();

  const [parameters, setParameters] = useState<WorksheetParameters>({
    topic: '',
    level: '8-9', // Default to elementary age group
    focusAreas: ['grammar', 'vocabulary'],
    exerciseTypes: ['fill-blanks', 'multiple-choice'],
    duration: 'standard',
    purpose: 'general',
    additionalNotes: '',
    language: 'en',
    includeImages: true,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoExerciseTypes, setAutoExerciseTypes] = useState(false); // NEW

  // Age groups
  const levels = [
    { value: '3-5', label: '3-5 years', emoji: '🎨', description: 'Дошкільний вік', ageRange: '3-5 years' },
    { value: '6-7', label: '6-7 years', emoji: '📚', description: '1-2 клас', ageRange: '6-7 years' },
    { value: '8-9', label: '8-9 years', emoji: '✏️', description: '3-4 клас', ageRange: '8-9 years' },
    { value: '10-12', label: '10-12 years', emoji: '📖', description: '5-6 клас', ageRange: '10-12 years' },
    { value: '13-15', label: '13-15 years', emoji: '🎯', description: '7-9 клас', ageRange: '13-15 years' },
    { value: '16-18', label: '16-18 years', emoji: '🎓', description: '10-12 клас', ageRange: '16-18 years' },
    { value: '19-25', label: '19-25 years', emoji: '💼', description: 'Молоді дорослі', ageRange: '19-25 years' },
    { value: '26-35', label: '26-35 years', emoji: '👔', description: 'Дорослі', ageRange: '26-35 years' },
    { value: '36-50', label: '36-50 years', emoji: '🏆', description: 'Зрілі дорослі', ageRange: '36-50 years' },
    { value: '50+', label: '50+ years', emoji: '⭐', description: 'Старші дорослі', ageRange: '50+ years' },
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

  const languages = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'uk', label: 'Ukrainian', flag: '🇺🇦' },
    { value: 'es', label: 'Spanish', flag: '🇪🇸' },
    { value: 'fr', label: 'French', flag: '🇫🇷' },
    { value: 'de', label: 'German', flag: '🇩🇪' },
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
      (autoExerciseTypes || parameters.exerciseTypes.length > 0)
    );
  };

  const handleGenerate = () => {
    if (isValid()) {
      const finalParams = {
        ...parameters,
        exerciseTypes: autoExerciseTypes ? [] : parameters.exerciseTypes,
      };
      onGenerate(finalParams);
    }
  };

  return (
    <Box 
      sx={{ 
        height: inDialog ? 'auto' : '100vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ 
        maxWidth: 900, 
        mx: 'auto', 
        py: inDialog ? 0 : 4, 
        px: inDialog ? 0 : 2, 
        flex: 1 
      }}>
        <Stack spacing={inDialog ? 2 : 3}>

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
                inputProps={{
                  style: { whiteSpace: 'normal' }
                }}
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

            {/* 2. Age Group - Compact Chips */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Target size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Вікова група
                </Typography>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {levels.map((level) => (
                  <AgeGroupTooltip
                    key={level.value}
                    ageGroup={level.value}
                    duration={parameters.duration as 'quick' | 'standard' | 'extended'}
                  >
                    <Chip
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
                  </AgeGroupTooltip>
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

            {/* 4. Exercise Types - WITH AUTO-SELECT TOGGLE */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <FileEdit size={18} color={theme.palette.primary.main} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Exercise Types
                  </Typography>
                  <Tooltip title="Choose types or let AI decide">
                    <IconButton size="small">
                      <Info size={14} />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoExerciseTypes}
                      onChange={(e) => setAutoExerciseTypes(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                      Let AI choose
                    </Typography>
                  }
                />
              </Stack>
              
              {autoExerciseTypes ? (
                <Alert 
                  severity="info"
                  sx={{ 
                    borderRadius: '12px',
                    '& .MuiAlert-message': {
                      fontSize: '0.875rem',
                    },
                  }}
                >
                  🤖 AI will automatically select the best exercise types for your topic and level
                </Alert>
              ) : (
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
              )}
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
                  
                  {/* Language - NEW */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Globe size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Content Language
                      </Typography>
                    </Stack>
                    <FormControl fullWidth size="small">
                      <Select
                        value={parameters.language}
                        onChange={(e) => setParameters({ ...parameters, language: e.target.value })}
                        sx={{ 
                          borderRadius: '12px',
                          fontSize: '0.875rem',
                        }}
                      >
                        {languages.map((lang) => (
                          <MenuItem key={lang.value} value={lang.value}>
                            {lang.flag} {lang.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Include Images - NEW */}
                  <Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={parameters.includeImages}
                          onChange={(e) => setParameters({ ...parameters, includeImages: e.target.checked })}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ImageIcon size={16} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Include Images
                          </Typography>
                        </Stack>
                      }
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 4, display: 'block' }}>
                      Add relevant images to enhance visual learning
                    </Typography>
                  </Box>

                  {/* Duration */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                      <Clock size={16} color={theme.palette.text.secondary} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Duration
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        (affects content amount)
                      </Typography>
                    </Stack>
                    <Stack direction="row" gap={1} flexWrap="wrap">
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
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Content amount auto-adjusts based on age group
                    </Typography>
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

        {/* Action Buttons */}
        <Stack direction="row" spacing={2}>
          {onSkip && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={onSkip}
              sx={{
                py: 2,
                borderRadius: inDialog ? 2 : '16px',
                textTransform: 'none',
                fontSize: inDialog ? '0.95rem' : '1.1rem',
                fontWeight: 600,
                borderColor: alpha(theme.palette.grey[400], 0.5),
                color: theme.palette.text.secondary,
                '&:hover': {
                  borderColor: theme.palette.grey[600],
                  background: alpha(theme.palette.grey[100], 0.5),
                },
              }}
            >
              Skip & Build Manually
            </Button>
          )}
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<Sparkles size={inDialog ? 20 : 22} />}
            disabled={!isValid()}
            onClick={handleGenerate}
            sx={{
              py: 2,
              borderRadius: inDialog ? 2 : '16px',
              textTransform: 'none',
              fontSize: inDialog ? '0.95rem' : '1.1rem',
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
        </Stack>
        
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
