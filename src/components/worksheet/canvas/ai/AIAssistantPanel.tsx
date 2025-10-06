'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  alpha,
  useTheme,
  Divider
} from '@mui/material';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { 
  WorksheetEdit, 
  WorksheetEditContext,
  QuickImprovement 
} from '@/types/worksheet-generation';
import { generateQuickImprovements, getAIChatPlaceholder } from '@/utils/worksheetQuickImprovements';
import EditHistoryItem from './EditHistoryItem';
import QuickImprovementButton from './QuickImprovementButton';

type Selection = 
  | { type: 'page'; data: any }
  | { type: 'element'; pageData: any; elementData: any }
  | null;

interface AIAssistantPanelProps {
  selection: Selection;
  context: WorksheetEditContext;
  onEdit: (instruction: string) => Promise<void>;
  editHistory: WorksheetEdit[];
  isEditing: boolean;
  error: string | null;
  onClearError?: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  selection,
  context,
  onEdit,
  editHistory,
  isEditing,
  error,
  onClearError
}) => {
  const theme = useTheme();
  const [chatInput, setChatInput] = useState('');
  const chatInputRef = useRef('');
  const inputStateMapRef = useRef<Map<string, string>>(new Map());
  const historyEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousSelectionKeyRef = useRef<string | null>(null);

  // Keep chatInputRef in sync
  useEffect(() => {
    chatInputRef.current = chatInput;
  }, [chatInput]);

  // Generate unique key for selection
  const getSelectionKey = (sel: Selection): string | null => {
    if (!sel) return null;
    
    if (sel.type === 'page') {
      return `page-${sel.data.id}`;
    } else {
      return `element-${sel.pageData.id}-${sel.elementData.id}`;
    }
  };

  // Save and restore input state when selection changes
  useEffect(() => {
    const currentKey = getSelectionKey(selection);
    const prevKey = previousSelectionKeyRef.current;

    // Save current input if we had a previous selection
    if (prevKey && prevKey !== currentKey) {
      inputStateMapRef.current.set(prevKey, chatInputRef.current);
    }

    // Restore input for new selection
    if (currentKey && currentKey !== prevKey) {
      const savedInput = inputStateMapRef.current.get(currentKey) || '';
      setChatInput(savedInput);
    } else if (!currentKey) {
      setChatInput('');
    }

    // Update ref
    previousSelectionKeyRef.current = currentKey;
  }, [selection]);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [editHistory]);

  // Focus input after editing completes
  useEffect(() => {
    if (!isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Generate quick improvements based on selection
  const quickImprovements: QuickImprovement[] = React.useMemo(() => {
    if (!selection) return [];
    
    if (selection.type === 'page') {
      return generateQuickImprovements('page');
    } else {
      const componentType = selection.elementData?.type;
      return generateQuickImprovements('component', componentType);
    }
  }, [selection]);

  // Generate dynamic placeholder based on selection
  const inputPlaceholder = React.useMemo(() => {
    if (!selection) {
      return 'Що змінити?';
    }
    
    if (selection.type === 'page') {
      return getAIChatPlaceholder('page');
    } else {
      const componentType = selection.elementData?.type;
      return getAIChatPlaceholder('component', componentType);
    }
  }, [selection]);

  const handleSend = async () => {
    if (!chatInput.trim() || isEditing) return;
    
    const instruction = chatInput.trim();
    setChatInput('');
    
    // Clear saved input for current selection
    const currentKey = getSelectionKey(selection);
    if (currentKey) {
      inputStateMapRef.current.set(currentKey, '');
    }
    
    try {
      await onEdit(instruction);
    } catch (error) {
      console.error('Edit failed:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = async (improvement: QuickImprovement) => {
    if (isEditing) return;
    
    // Don't clear input for quick actions - user might have text typed
    
    try {
      await onEdit(improvement.instruction);
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  if (!selection) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          textAlign: 'center'
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={28} color={theme.palette.primary.main} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Виберіть компонент або сторінку,
            <br />
            щоб почати редагування з AI
          </Typography>
        </Stack>
      </Box>
    );
  }

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
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={onClearError}
          icon={<AlertCircle size={18} />}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="caption">{error}</Typography>
        </Alert>
      )}

      {/* Chat History */}
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
        {editHistory.length === 0 && !isEditing && (
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
            <Typography variant="caption" color="text.secondary">
              Історія змін порожня.
              <br />
              Почніть редагувати!
            </Typography>
          </Box>
        )}

        {editHistory.map((edit) => (
          <EditHistoryItem
            key={edit.id}
            edit={edit}
            canUndo={false} // Undo handled by main editor
          />
        ))}

        {/* Loading indicator */}
        {isEditing && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
              background: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <CircularProgress size={20} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              AI обробляє вашу інструкцію...
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
        {/* Quick Improvements */}
        {quickImprovements.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.secondary',
                mb: 1,
                display: 'block'
              }}
            >
              Швидкі дії
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {quickImprovements.map((improvement) => (
                <QuickImprovementButton
                  key={improvement.id}
                  improvement={improvement}
                  onClick={handleQuickAction}
                  disabled={isEditing}
                />
              ))}
            </Box>
          </Box>
        )}

        <Stack direction="row" spacing={1}>
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={3}
            placeholder={inputPlaceholder}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isEditing}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.875rem',
                '& fieldset': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
          />
          <IconButton
            onClick={handleSend}
            disabled={!chatInput.trim() || isEditing}
            sx={{
              width: 40,
              height: 40,
              background: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                background: theme.palette.primary.dark,
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
          Enter - відправити • Shift+Enter - новий рядок
        </Typography>
      </Box>
    </Stack>
  );
};

export default AIAssistantPanel;
