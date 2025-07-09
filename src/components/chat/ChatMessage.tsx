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
import { useTranslation } from 'react-i18next';
import { Bot, User, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react';
import { Message } from '@/types/chat';
import { SimpleLesson } from '@/types/chat';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: (messageId: number) => void;
  onFeedback?: (messageId: number, feedback: 'like' | 'dislike') => void;
  onLessonCreate?: (lesson: SimpleLesson) => void;
  onActionClick?: (action: string, description: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onFeedback,
  onLessonCreate,
  onActionClick
}) => {
  const { t } = useTranslation('chat');
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

  // Автоматичне створення уроку при отриманні повідомлення зі слайдом
  React.useEffect(() => {
    console.log('🔍 ChatMessage useEffect triggered:', {
      messageId: message.id,
      sender: message.sender,
      hasFirstSlideText: message.text.includes('✅ **Перший слайд готовий!**'),
      hasSlideReadyText: message.text.includes('готовий!**'),
      hasLessonObject: !!(message as any).lesson,
      messagePreview: message.text.substring(0, 100) + '...'
    });
    
    // Розширена умова для обробки як першого, так і наступних слайдів та редагування
    if (message.sender === 'ai' && onLessonCreate && (message as any).lesson) {
      // Перевіряємо чи є текст про готовий/оновлений слайд (будь-який номер)
      const isSlideReady = message.text.includes('готовий!**') || 
                          message.text.includes('✅ **Перший слайд готовий!**') ||
                          (message.text.includes('✅ **Слайд') && message.text.includes('готовий!**'));
      
      // Перевіряємо чи є текст про редагування/покращення слайду
      const isSlideEdited = message.text.includes('покращено!**') ||
                           message.text.includes('перегенеровано!**') ||
                           message.text.includes('відредаговано!**') ||
                           (message.text.includes('✏️ **Слайд') && message.text.includes('покращено!**')) ||
                           (message.text.includes('🔄 **Слайд') && message.text.includes('перегенеровано!**')) ||
                           (message.text.includes('📝 **Слайд') && message.text.includes('відредаговано!**')) ||
                           (message.text.includes('🎨 **Слайд') && message.text.includes('покращено!**')) ||
                           // Додаткові умови для реальних повідомлень з ChatService
                           message.text.includes('Новий варіант слайду створено') ||
                           message.text.includes('Слайд оновлено з використанням') ||
                           message.text.includes('замінено** попередній слайд') ||
                           (message.text.includes('**Що змінилося:**') && message.text.includes('Той же слайд'));
      
      if (isSlideReady || isSlideEdited) {
        console.log(`🎨 Auto-updating lesson from ${isSlideEdited ? 'slide editing' : 'slide generation'}...`);
        console.log('🎯 Found lesson object in message:', (message as any).lesson);
        console.log('🎯 Lesson slides count:', (message as any).lesson.slides?.length);
        
        if ((message as any).lesson.slides?.length > 0) {
          const lastSlideIndex = (message as any).lesson.slides.length - 1;
          console.log('🎯 Last slide htmlContent preview:', 
            (message as any).lesson.slides[lastSlideIndex]?.htmlContent?.substring(0, 100) + '...');
          
          // Якщо це редагування слайда, встановлюємо поточний час як updatedAt
          if (isSlideEdited) {
            const updatedLesson = {
              ...(message as any).lesson,
              slides: (message as any).lesson.slides.map((slide: any) => ({
                ...slide,
                updatedAt: new Date() // Встановлюємо поточний час для примусового оновлення превью
              }))
            };
            console.log('🔄 Setting current time as updatedAt for edited slides');
            onLessonCreate(updatedLesson);
          } else {
            onLessonCreate((message as any).lesson);
          }
        } else {
          onLessonCreate((message as any).lesson);
        }
        return;
      }
    }
    
    // Старий код для сумісності (для першого слайду без lesson об'єкта)
    if (message.sender === 'ai' && message.text.includes('✅ **Перший слайд готовий!**') && onLessonCreate && !(message as any).lesson) {
      console.log('🎨 Auto-creating lesson from approved plan (fallback)...');
      
      // Резервний варіант - створення уроку без реальних HTML даних (НЕ РЕКОМЕНДУЄТЬСЯ)
      console.warn('⚠️ No lesson object found in message, creating fallback lesson');
      
      const topicMatch = message.text.match(/про\s+([^"]+?)[\s]*для/i);
      const topic = topicMatch ? topicMatch[1].trim() : 'Новий урок';
      
      const lesson: SimpleLesson = {
        id: `lesson_${Date.now()}`,
        title: topic || 'Новий урок',
        description: `Урок створений з чату`,
        subject: 'Загальне навчання',
        ageGroup: '6-12 років',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'ai-chat',
        slides: [{
          id: `slide_${Date.now()}`,
          title: `${topic} - Вступ`,
          content: 'Вступний слайд згенеровано з Claude Sonnet',
          htmlContent: '<div>Слайд генерується...</div>',
          type: 'content',
          status: 'completed'
        }]
      };
      
      console.log('🎨 Auto-created fallback lesson:', lesson);
      onLessonCreate(lesson);
    }
  }, [message, onLessonCreate]);

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

              {/* Available Action Buttons */}
              {message.sender === 'ai' && message.availableActions && message.availableActions.length > 0 && (
                <Box sx={{ mt: 3, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    🚀 {t('actions.quickActions')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {message.availableActions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.action === 'approve_plan' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => onActionClick?.(action.action, action.description)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          px: 2,
                          py: 1,
                          fontWeight: action.action === 'approve_plan' ? 600 : 500,
                          boxShadow: action.action === 'approve_plan' ? 2 : 0,
                          '&:hover': {
                            boxShadow: action.action === 'approve_plan' ? 4 : 1,
                          }
                        }}
                        title={action.description}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Standard Action Buttons */}
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
                        {t('actions.createLesson')}
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