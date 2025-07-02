import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Fade,
  IconButton
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Bot, User, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Message } from '@/types/chat';
import { SimpleLesson } from '@/types/chat';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: (messageId: number) => void;
  onFeedback?: (messageId: number, feedback: 'like' | 'dislike') => void;
  onLessonCreate?: (lesson: SimpleLesson) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onFeedback,
  onLessonCreate
}) => {
  const theme = useTheme();

  // Обробка створення уроку з повідомлення
  const handleLessonCreate = () => {
    if (message.text.includes('```html') && onLessonCreate) {
      // Парсинг уроку з відповіді AI
      const lessonMatch = message.text.match(/## 📚 (.*?)\n/);
      const title = lessonMatch ? lessonMatch[1] : 'Новий урок';
      
      // Простий парсер для створення слайдів з HTML
      const htmlMatch = message.text.match(/```html\n([\s\S]*?)\n```/);
      if (htmlMatch) {
                 const lesson: SimpleLesson = {
           id: `lesson_${Date.now()}`,
           title,
           description: `Урок створений з чату`,
           subject: 'Загальне навчання',
           ageGroup: '6-12 років',
           duration: 30,
           createdAt: new Date(),
           updatedAt: new Date(),
           authorId: 'ai-chat',
           slides: [{
             id: `slide_${Date.now()}`,
             title: title,
             content: htmlMatch[1],
             htmlContent: htmlMatch[1],
             type: 'content',
             status: 'completed'
           }]
         };
        onLessonCreate(lesson);
      }
    }
  };

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: 2,
            maxWidth: '80%',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              backgroundColor: message.sender === 'user' 
                ? theme.palette.secondary.main 
                : theme.palette.primary.main,
            }}
          >
            {message.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
          </Avatar>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              backgroundColor: message.sender === 'user' 
                ? theme.palette.primary.main 
                : 'white',
              color: message.sender === 'user' ? 'white' : 'text.primary',
              border: message.sender === 'ai' ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
              boxShadow: message.sender === 'user' 
                ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                : '0 2px 12px rgba(0,0,0,0.06)',
            }}
          >
            <MarkdownRenderer content={message.text} />

            {/* Action Buttons */}
            {message.sender === 'ai' && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Feedback buttons */}
                  <IconButton
                    size="small"
                    onClick={() => onFeedback?.(message.id, 'like')}
                    sx={{
                      color: message.feedback === 'like' ? theme.palette.success.main : theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.success.main }
                    }}
                  >
                    <ThumbsUp size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onFeedback?.(message.id, 'dislike')}
                    sx={{
                      color: message.feedback === 'dislike' ? theme.palette.error.main : theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.error.main }
                    }}
                  >
                    <ThumbsDown size={16} />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {/* Create lesson button if contains HTML */}
                  {message.text.includes('```html') && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleLessonCreate}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontSize: '0.75rem',
                      }}
                    >
                      Створити урок
                    </Button>
                  )}
                  
                  {/* Regenerate button */}
                  <IconButton
                    size="small"
                    onClick={() => onRegenerate?.(message.id)}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': { color: theme.palette.primary.main }
                    }}
                  >
                    <RefreshCw size={16} />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Message Status */}
            {message.sender === 'user' && (
              <Box sx={{ textAlign: 'right', mt: 1 }}>
                                 <Typography variant="caption" sx={{ opacity: 0.7 }}>
                   {message.status === 'sending' && '⏳'}
                   {message.status === 'sent' && '✓'}
                   {message.status === 'delivered' && '✓✓'}
                 </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Fade>
  );
};

export default ChatMessage; 