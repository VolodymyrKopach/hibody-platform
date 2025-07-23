import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Send, Wand2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled: boolean;
  onOpenGenerationConstructor: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  disabled,
  onOpenGenerationConstructor
}) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%' }}>
      {/* Generation constructor button */}
      {/* COMMENTED OUT: currently inactive in this project version
      <Tooltip title="Generation constructor">
        <IconButton
          onClick={onOpenGenerationConstructor}
          disabled={disabled}
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              borderColor: alpha(theme.palette.primary.main, 0.4),
            },
            '&:disabled': {
              color: theme.palette.grey[400],
              borderColor: theme.palette.grey[300],
              backgroundColor: theme.palette.grey[50],
            }
          }}
        >
          <Wand2 size={20} />
        </IconButton>
      </Tooltip>
      */}

      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder={t('interface.placeholder')}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
            '&.Mui-focused': {
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
            }
          }
        }}
      />
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Button
          variant="contained"
          onClick={(e) => {
            e.preventDefault();
            onSend();
          }}
          disabled={!value?.trim() || isLoading || disabled}
          sx={{
            minWidth: 56,
            height: 56,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
            },
            '&:disabled': {
              background: theme.palette.grey[300],
            }
          }}
        >
          <Send size={20} />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInput; 