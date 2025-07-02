import React from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  isTyping,
  onInputChange,
  onSendMessage,
  onKeyPress
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 0,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: 'white',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Прикріпити файл">
            <IconButton color="primary" size="large">
              <Paperclip size={20} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              onSendMessage();
            }}
            disabled={!inputValue.trim() || isTyping}
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
    </Paper>
  );
};

export default ChatInput; 