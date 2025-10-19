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
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import AgeGroupTooltip from './AgeGroupTooltip';
import TopicSuggestions from './TopicSuggestions';
import ModeSelectionCards from './generation/ModeSelectionCards';
import TopicGenerationChatDialog from './TopicGenerationChatDialog';

interface WorksheetParameters {
  topic: string;
  level: string;
  learningObjectives?: string;
  duration: string;
  purpose: string;
  additionalNotes: string;
  language: string;
  includeImages: boolean;
  contentMode?: 'pdf' | 'interactive';
  componentSelectionMode?: 'auto' | 'manual';
  selectedComponents?: string[];
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
    level: '2-3', // Default to youngest age group for new features
    learningObjectives: '',
    duration: 'standard',
    purpose: 'general',
    additionalNotes: '',
    language: 'en',
    includeImages: true,
    contentMode: 'pdf', // ✅ Default to PDF mode
    componentSelectionMode: 'auto',
    selectedComponents: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTopicGenerator, setShowTopicGenerator] = useState(false);

  // Age groups - reordered to show youngest first
  const levels = [
    { value: '2-3', label: '2-3 years', emoji: '👶', description: 'Малюки', ageRange: '2-3 years' },
    { value: '4-6', label: '4-6 years', emoji: '🧒', description: 'Дошкільнята', ageRange: '4-6 years' },
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


  const isValid = () => {
    // Basic validation
    const hasBasicInfo = parameters.topic.trim() !== '' && parameters.level !== '';
    
    // Mode must be selected
    const hasModeSelected = !!parameters.contentMode;
    
    return hasBasicInfo && hasModeSelected;
  };

  const handleGenerate = () => {
    if (isValid()) {
      onGenerate(parameters);
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
            {/* 1. Age Group - First Step */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Target size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Вікова група
                </Typography>
                <Typography variant="caption" color="error.main">*</Typography>
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
                      onClick={() => setParameters({ ...parameters, level: level.value, contentMode: undefined })}
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

            {/* 2. Worksheet Type - Show after age group selected */}
            {parameters.level && (
              <ModeSelectionCards
                ageGroup={parameters.level}
                selectedMode={parameters.contentMode}
                onModeSelect={(mode) => setParameters({ ...parameters, contentMode: mode })}
              />
            )}

            {/* Topic Suggestions - Show after content mode selected */}
            {parameters.level && parameters.contentMode && (
              <TopicSuggestions
                ageGroup={parameters.level}
                selectedTopic={parameters.topic}
                onTopicSelect={(topic) => setParameters({ ...parameters, topic })}
              />
            )}

            {/* 3. Topic - Show after content mode selected */}
            {parameters.level && parameters.contentMode && (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BookOpen size={18} color={theme.palette.primary.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      What's your topic?
                    </Typography>
                    <Typography variant="caption" color="error.main">*</Typography>
                  </Stack>
                  <Button
                    size="small"
                    startIcon={<Sparkles size={16} />}
                    onClick={() => setShowTopicGenerator(true)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 2,
                    }}
                  >
                    Generate with AI
                  </Button>
                </Stack>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Present Simple, Travel Vocabulary, Daily Routines...&#10;&#10;You can also describe your topic in detail or generate it with AI!"
                  value={parameters.topic}
                  onChange={(e) => setParameters({ ...parameters, topic: e.target.value })}
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      fontSize: '1rem',
                      '& textarea': {
                        py: 1.5,
                        px: 2,
                        maxHeight: '200px',
                        overflowY: 'auto !important',
                      },
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 Use AI generation for tailored topic suggestions
                </Typography>
              </Box>
            )}

            {/* Show rest of form only after topic is filled */}
            {parameters.topic.trim() && (
              <>
            {/* 4. Learning Objectives (Optional) */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Target size={18} color={theme.palette.primary.main} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Learning Objectives
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Optional)
                </Typography>
                <Tooltip title="What should students learn from this worksheet?">
                  <IconButton size="small" sx={{ ml: 0.5 }}>
                    <Info size={14} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="e.g., Learn basic counting from 1-10, Recognize animal sounds, Practice color matching..."
                value={parameters.learningObjectives}
                onChange={(e) => setParameters({ ...parameters, learningObjectives: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 AI will automatically choose appropriate exercises. Add custom goals here if needed.
              </Typography>
            </Box>
              </>
            )}

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
                        Worksheet Language
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
            {!parameters.level 
              ? '👆 Select age group to start'
              : !parameters.contentMode
              ? '👆 Select worksheet type (PDF or Interactive)'
              : !parameters.topic.trim()
              ? '👆 Add or generate a topic'
              : 'Please complete all required fields'}
          </Typography>
        )}
        </Stack>
      </Box>

      {/* Topic Generation Chat Dialog */}
      <TopicGenerationChatDialog
        open={showTopicGenerator}
        onClose={() => setShowTopicGenerator(false)}
        onTopicGenerated={(topic) => {
          setParameters({ ...parameters, topic });
          setShowTopicGenerator(false);
        }}
        ageGroup={parameters.level}
        contentMode={parameters.contentMode || 'pdf'}
      />
    </Box>
  );
};

export default Step1WorksheetParameters;
