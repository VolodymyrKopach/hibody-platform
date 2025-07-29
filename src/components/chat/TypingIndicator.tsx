import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Fade,
  Chip
} from '@mui/material';
import { alpha, useTheme, keyframes } from '@mui/material/styles';
import { Bot, MessageCircle, Cpu, Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  isTyping: boolean;
  typingStage?: 'thinking' | 'processing' | 'generating' | 'finalizing';
  customMessage?: string;
  isGeneratingSlides?: boolean;
}

const bounceAnimation = keyframes`
  0%, 80%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
`;

const pulseAnimation = keyframes`
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
`;

const sparkleAnimation = keyframes`
  0%, 100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 1;
  }
`;

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isTyping, 
  typingStage = 'thinking',
  customMessage,
  isGeneratingSlides = false
}) => {
  const { t } = useTranslation(['chat', 'common']);
  const theme = useTheme();

  if (!isTyping) return null;

  const getTypingMessage = () => {
    if (customMessage) return customMessage;
    
    switch (typingStage) {
      case 'thinking':
        return t('messages.thinking', { ns: 'chat' });
      case 'processing':
        return isGeneratingSlides ? t('messages.generatingSlides', { ns: 'chat' }) : t('interface.typing', { ns: 'chat' });
      case 'generating':
        return isGeneratingSlides ? t('messages.generatingSlides', { ns: 'chat' }) : t('buttons.generating', { ns: 'common' });
      case 'finalizing':
        return t('messages.finalizing', { ns: 'chat' });
      default:
        return t('chat.typingIndicator', { ns: 'common' });
    }
  };

  const getIcon = () => {
    switch (typingStage) {
      case 'thinking':
        return <Cpu size={18} />;
      case 'processing':
        return <MessageCircle size={18} />;
      case 'generating':
        return (
          <Box sx={{ animation: `${sparkleAnimation} 2s ease-in-out infinite` }}>
            <Sparkles size={18} />
          </Box>
        );
      case 'finalizing':
        return <Bot size={18} />;
      default:
        return <Bot size={18} />;
    }
  };

  const getStatusColor = () => {
    // Always use the main project color for consistency
    return theme.palette.primary.main;
  };

  return (
    <Fade in timeout={300}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, maxWidth: '80%' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: theme.palette.primary.main,
              animation: `${pulseAnimation} 2s ease-in-out infinite`,
            }}
          >
            {getIcon()}
          </Avatar>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: '#ffffff',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              minWidth: '200px',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Main typing message */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {getTypingMessage()}
                  </Typography>
                  
                  {/* Animated typing dots */}
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    {[0, 1, 2].map((index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.primary.main,
                          animation: `${bounceAnimation} 1.4s ease-in-out infinite`,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                
                {/* Status chip */}
                <Chip
                  size="small"
                  label={typingStage}
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    textTransform: 'capitalize',
                    fontWeight: 500,
                  }}
                />
              </Box>
              
              {/* Secondary patience message for slide generation */}
              {isGeneratingSlides && (typingStage === 'processing' || typingStage === 'generating') && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    fontStyle: 'italic',
                    opacity: 0.8,
                    fontSize: '0.75rem',
                    mt: 0.5
                  }}
                >
                  {t('messages.patienceMessage', { ns: 'chat' })}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Fade>
  );
};

export default TypingIndicator; 