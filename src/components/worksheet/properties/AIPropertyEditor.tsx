'use client';

import React, { useState } from 'react';
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
import { Sparkles, Send, Lightbulb, Info } from 'lucide-react';
import { CanvasElement } from '@/types/canvas-element';
import {
  ComponentPropertySchema,
} from '@/constants/interactive-properties-schema';
import {
  WorksheetEditContext,
  WorksheetEditRequest,
  WorksheetEditResponse,
} from '@/types/worksheet-generation';
import { WorksheetEditingService } from '@/services/worksheet/WorksheetEditingService';

interface AIPropertyEditorProps {
  element: CanvasElement;
  pageId: string;
  schema: ComponentPropertySchema;
  context: WorksheetEditContext;
  onPropertiesChange: (newProperties: any) => void;
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
  const [lastChanges, setLastChanges] = useState<string[]>([]);

  const quickImprovements = QUICK_IMPROVEMENTS[element.type] || [
    { label: 'Improve content', instruction: 'Make the content more engaging for the target age group', icon: '✨' },
    { label: 'Add details', instruction: 'Add more details and information', icon: '📝' },
    { label: 'Simplify', instruction: 'Simplify the content for easier understanding', icon: '🎯' },
  ];

  const handleAIEdit = async (editInstruction: string) => {
    if (!editInstruction.trim()) {
      setError('Please enter an instruction');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLastChanges([]);

    try {
      const editRequest: WorksheetEditRequest = {
        editTarget: {
          type: 'component',
          pageId,
          elementId: element.id,
          data: element,
        },
        instruction: editInstruction,
        context,
      };

      const editingService = new WorksheetEditingService();
      const response: WorksheetEditResponse = await editingService.editWorksheetComponent(
        editRequest
      );

      if (response.success && response.patch.properties) {
        // Apply the patch to current properties
        const updatedProperties = {
          ...element.properties,
          ...response.patch.properties,
        };

        onPropertiesChange(updatedProperties);

        // Show what changed
        const changeDescriptions = response.changes.map(
          (change) => `${change.field}: ${change.description}`
        );
        setLastChanges(changeDescriptions);

        // Clear instruction after success
        setInstruction('');
      } else {
        setError(response.error || 'Failed to edit component');
      }
    } catch (err: any) {
      console.error('[AIPropertyEditor] Edit error:', err);
      setError(err.message || 'Failed to edit component. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickImprovement = (improvement: { instruction: string }) => {
    handleAIEdit(improvement.instruction);
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box>
        <Typography variant="body1" fontWeight={600} gutterBottom>
          ✨ AI-Powered Editing
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Describe what you want to change, and AI will update the component for you.
        </Typography>
      </Box>

      {/* Quick improvements */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Lightbulb size={16} />
          <Typography variant="body2" fontWeight={600}>
            Quick Improvements
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {quickImprovements.map((improvement, index) => (
            <Chip
              key={index}
              label={`${improvement.icon} ${improvement.label}`}
              onClick={() => handleQuickImprovement(improvement)}
              disabled={isLoading}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  background: alpha(theme.palette.secondary.main, 0.1),
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* Custom instruction */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
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
              <Info size={16} color={theme.palette.info.main} />
            </IconButton>
          </Tooltip>
        </Box>
        <TextField
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Make the images bigger and add more colorful backgrounds"
          multiline
          rows={3}
          fullWidth
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              handleAIEdit(instruction);
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} /> : <Send size={16} />}
            onClick={() => handleAIEdit(instruction)}
            disabled={isLoading || !instruction.trim()}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
            }}
          >
            {isLoading ? 'Processing...' : 'Apply AI Edit'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Tip: Press ⌘+Enter to apply
        </Typography>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success message with changes */}
      {lastChanges.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            background: alpha(theme.palette.success.main, 0.1),
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Sparkles size={16} color={theme.palette.success.main} />
            <Typography variant="body2" fontWeight={600} color="success.main">
              Changes Applied
            </Typography>
          </Box>
          <Stack spacing={0.5}>
            {lastChanges.map((change, index) => (
              <Typography key={index} variant="caption" color="text.secondary">
                • {change}
              </Typography>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Component info */}
      <Box>
        <Typography variant="caption" color="text.secondary">
          Component: <strong>{schema.componentName}</strong> ({schema.icon})
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Age Group: <strong>{context.ageGroup}</strong>
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Difficulty: <strong>{context.difficulty}</strong>
        </Typography>
      </Box>
    </Stack>
  );
};

export default AIPropertyEditor;

