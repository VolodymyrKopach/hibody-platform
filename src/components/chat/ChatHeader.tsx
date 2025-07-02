import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Bot,
  Settings,
  Layers
} from 'lucide-react';

interface ChatHeaderProps {
  slidePanelOpen: boolean;
  hasSlides: boolean;
  onToggleSlidePanel: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  slidePanelOpen,
  hasSlides,
  onToggleSlidePanel
}) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 0,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: 'white',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              width: 48,
              height: 48,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <Bot size={24} color="white" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Помічник Вчителя
            </Typography>
          </Box>
        </Box>
        
        {/* Header Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={slidePanelOpen ? "Сховати слайди" : "Показати слайди"}>
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={onToggleSlidePanel}
                sx={{
                  backgroundColor: slidePanelOpen ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: slidePanelOpen ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                  }
                }}
              >
                <Layers size={18} />
              </IconButton>
              {hasSlides && !slidePanelOpen && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.error.main,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': { opacity: 1 },
                      '50%': { opacity: 0.5 },
                      '100%': { opacity: 1 },
                    }
                  }}
                />
              )}
            </Box>
          </Tooltip>
          
          <Tooltip title="Налаштування">
            <IconButton sx={{ color: 'text.secondary' }}>
              <Settings size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatHeader; 