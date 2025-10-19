'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Sparkles, Send, Lightbulb, Info, AlertCircle } from 'lucide-react';
import { CanvasElement } from '@/types/canvas-element';
import {
  ComponentPropertySchema,
} from '@/constants/interactive-properties-schema';
import {
  WorksheetEditContext,
  WorksheetEditResponse,
  WorksheetEditChange,
} from '@/types/worksheet-generation';
import { WorksheetEditingService } from '@/services/worksheet/WorksheetEditingService';

interface AIPropertyEditorProps {
  element: CanvasElement;
  pageId: string;
  schema: ComponentPropertySchema;
  context: WorksheetEditContext;
  onPropertiesChange: (newProperties: any) => void;
}

// Edit history item type
interface EditHistoryItem {
  id: string;
  instruction: string;
  changes: WorksheetEditChange[];
  timestamp: Date;
  success: boolean;
  error?: string;
}

// Quick improvement suggestions for different component types
const QUICK_IMPROVEMENTS: Record<string, Array<{ label: string; instruction: string; icon: string }>> = {
  'tap-image': [
    { label: 'Make it bigger', instruction: 'Change the size to large', icon: '🔍' },
    { label: 'Add caption', instruction: 'Add a fun and engaging caption for kids', icon: '💬' },
    { label: 'Change animation', instruction: 'Change animation to something more exciting', icon: '✨' },
  ],
  'simple-drag-drop': [
    { label: 'Add more items', instruction: 'Add 2 more drag and drop items with targets', icon: '➕' },
    { label: 'Make it easier', instruction: 'Change difficulty to easy mode with hints', icon: '🎯' },
    { label: 'Change colors', instruction: 'Use more colorful and vibrant colors for backgrounds', icon: '🎨' },
  ],
  'color-matcher': [
    { label: 'Add more colors', instruction: 'Add 2 more colors to the game', icon: '🌈' },
    { label: 'Enable voice', instruction: 'Enable voice prompts and auto-voice features', icon: '🔊' },
    { label: 'Simplify', instruction: 'Switch to single mode for easier gameplay', icon: '🎯' },
  ],
  'memory-cards': [
    { label: 'More pairs', instruction: 'Increase grid size to add more pairs', icon: '🃏' },
    { label: 'Make easier', instruction: 'Change difficulty to easy with slower card flips', icon: '⏱️' },
    { label: 'Add theme', instruction: 'Add a custom card back image with a fun theme', icon: '🎨' },
  ],
  'sorting-game': [
    { label: 'Add category', instruction: 'Add one more category with items', icon: '📦' },
    { label: 'Change layout', instruction: 'Change to grid layout for better organization', icon: '🔲' },
    { label: 'More items', instruction: 'Add 2 more items to sort', icon: '➕' },
  ],
};

const AIPropertyEditor: React.FC<AIPropertyEditorProps> = ({
  element,
  pageId,
  schema,
  context,
  onPropertiesChange,
}) => {
  const theme = useTheme();
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editHistory, setEditHistory] = useState<EditHistoryItem[]>([]);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickImprovements = QUICK_IMPROVEMENTS[element.type] || [
    { label: 'Improve content', instruction: 'Make the content more engaging for the target age group', icon: '✨' },
    { label: 'Add details', instruction: 'Add more details and information', icon: '📝' },
    { label: 'Simplify', instruction: 'Simplify the content for easier understanding', icon: '🎯' },
  ];

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [editHistory]);

  // Focus input after editing completes
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleAIEdit = async (editInstruction: string) => {
    if (!editInstruction.trim()) {
      setError('Please enter an instruction');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const editingService = new WorksheetEditingService();
      const response: WorksheetEditResponse = await editingService.editComponent(
        pageId,
        element.id,
        element,
        editInstruction,
        context
      );

      if (response.success && response.patch.properties) {
        // Apply the patch to current properties
        const updatedProperties = {
          ...element.properties,
          ...response.patch.properties,
        };

        onPropertiesChange(updatedProperties);

        // Add to history
        const historyItem: EditHistoryItem = {
          id: `edit-${Date.now()}`,
          instruction: editInstruction,
          changes: response.changes,
          timestamp: new Date(),
          success: true,
        };
        setEditHistory(prev => [...prev, historyItem]);

        // Clear instruction after success
        setInstruction('');
      } else {
        const errorMsg = response.error || 'Failed to edit component';
        setError(errorMsg);
        
        // Add failed edit to history
        const historyItem: EditHistoryItem = {
          id: `edit-${Date.now()}`,
          instruction: editInstruction,
          changes: [],
          timestamp: new Date(),
          success: false,
          error: errorMsg,
        };
        setEditHistory(prev => [...prev, historyItem]);
      }
    } catch (err: any) {
      console.error('[AIPropertyEditor] Edit error:', err);
      const errorMsg = err.message || 'Failed to edit component. Please try again.';
      setError(errorMsg);

      // Add failed edit to history
      const historyItem: EditHistoryItem = {
        id: `edit-${Date.now()}`,
        instruction: editInstruction,
        changes: [],
        timestamp: new Date(),
        success: false,
        error: errorMsg,
      };
      setEditHistory(prev => [...prev, historyItem]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickImprovement = (improvement: { instruction: string }) => {
    handleAIEdit(improvement.instruction);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAIEdit(instruction);
    }
  };

  return (
    <Stack 
      spacing={2} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Sparkles size={18} color={theme.palette.secondary.main} />
          <Typography variant="body1" fontWeight={600}>
            AI-Powered Editing
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Describe what you want to change, and AI will update the component for you.
        </Typography>
      </Box>

      <Divider />

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          icon={<AlertCircle size={18} />}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="caption">{error}</Typography>
        </Alert>
      )}

      {/* Edit History */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.grey[300], 0.3),
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.grey[500], 0.5),
            borderRadius: '3px',
            '&:hover': {
              background: alpha(theme.palette.grey[600], 0.7),
            },
          },
        }}
      >
        {editHistory.length === 0 && !isLoading && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              p: 3
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: alpha(theme.palette.secondary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={28} color={theme.palette.secondary.main} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Edit history is empty.
                <br />
                Start editing with AI!
              </Typography>
            </Stack>
          </Box>
        )}

        {/* History items */}
        {editHistory.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              p: 2,
              mb: 1.5,
              borderRadius: 2,
              border: `1px solid ${alpha(
                item.success ? theme.palette.success.main : theme.palette.error.main,
                0.2
              )}`,
              background: alpha(
                item.success ? theme.palette.success.main : theme.palette.error.main,
                0.05
              ),
            }}
          >
            {/* Instruction */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <Typography variant="caption">💬</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {item.instruction}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>

            {/* Changes or Error */}
            {item.success && item.changes.length > 0 && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
              >
                <Typography variant="caption" fontWeight={600} color="success.main" sx={{ mb: 0.5, display: 'block' }}>
                  ✅ Changes Applied:
                </Typography>
                <Stack spacing={0.5}>
                  {item.changes.map((change, index) => (
                    <Typography key={index} variant="caption" color="text.secondary">
                      • {change.field}: {change.description}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}

            {!item.success && item.error && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="error.main">
                  ❌ {item.error}
                </Typography>
              </Box>
            )}
          </Paper>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
              background: alpha(theme.palette.secondary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
            }}
          >
            <CircularProgress size={20} thickness={4} color="secondary" />
            <Typography variant="body2" color="text.secondary">
              AI is processing your instruction...
            </Typography>
          </Box>
        )}

        <div ref={historyEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          pt: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        {/* Quick improvements */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Lightbulb size={16} />
            <Typography variant="caption" fontWeight={600}>
              Quick Improvements
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                    💡 Click any suggestion to apply it instantly
                  </Typography>
                  <Typography variant="caption" display="block">
                    These are pre-made improvements tailored to this component type.
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
            >
              <IconButton size="small" sx={{ p: 0.5 }}>
                <Info size={14} color={theme.palette.info.main} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            {quickImprovements.map((improvement, index) => (
              <Chip
                key={index}
                label={`${improvement.icon} ${improvement.label}`}
                onClick={() => handleQuickImprovement(improvement)}
                disabled={isLoading}
                size="small"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    background: alpha(theme.palette.secondary.main, 0.1),
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Custom instruction input */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" fontWeight={600}>
              Custom Instruction
            </Typography>
            <Tooltip
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="caption" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                    💡 AI Editing Tips:
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 0.3 }}>
                    • Be specific: "Change the first image to a cat"
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 0.3 }}>
                    • Describe outcome: "Make it more engaging for 5-year-olds"
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mb: 0.3 }}>
                    • Multiple changes: "Add 2 more items and change colors to pastel"
                  </Typography>
                  <Typography variant="caption" display="block">
                    • Use context: "Make it match the ocean theme"
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
              enterDelay={300}
            >
              <IconButton size="small" sx={{ p: 0.5 }}>
                <Info size={14} color={theme.palette.info.main} />
              </IconButton>
            </Tooltip>
          </Box>

          <Stack direction="row" spacing={1}>
            <TextField
              inputRef={inputRef}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Make the images bigger and add more colorful backgrounds"
              multiline
              maxRows={3}
              fullWidth
              disabled={isLoading}
              onKeyPress={handleKeyPress}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  '& fieldset': {
                    borderColor: alpha(theme.palette.divider, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.secondary.main, 0.3),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.secondary.main,
                  },
                },
              }}
            />
            <IconButton
              onClick={() => handleAIEdit(instruction)}
              disabled={isLoading || !instruction.trim()}
              sx={{
                width: 40,
                height: 40,
                background: theme.palette.secondary.main,
                color: 'white',
                '&:hover': {
                  background: theme.palette.secondary.dark,
                },
                '&.Mui-disabled': {
                  background: alpha(theme.palette.action.disabled, 0.12),
                  color: theme.palette.action.disabled,
                },
              }}
            >
              <Send size={18} />
            </IconButton>
          </Stack>

          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ display: 'block', mt: 0.5, ml: 1 }}
          >
            Enter - send • Shift+Enter - new line
          </Typography>
        </Box>

        {/* Component info */}
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Component: <strong>{schema.componentName}</strong> ({schema.icon})
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            Age Group: <strong>{context.ageGroup}</strong> • Difficulty: <strong>{context.difficulty}</strong>
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};

export default AIPropertyEditor;
