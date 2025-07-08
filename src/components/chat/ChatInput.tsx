import React from 'react';
import {
  Box,
  TextField,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  disabled
}) => {
  const theme = useTheme();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', width: '100%' }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder="Напишіть про який урок ви мрієте (предмет, вік дітей, тема)..."
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