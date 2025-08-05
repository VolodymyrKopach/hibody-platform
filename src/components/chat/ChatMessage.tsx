import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Fade,
  LinearProgress,
  Chip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { Bot, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Message, SlideGenerationProgress } from '@/types/chat';
import { SimpleLesson } from '@/types/chat';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  onLessonCreate?: (lesson: SimpleLesson) => void;
  onActionClick?: (action: string, description: string) => void;
  slideGenerationProgress?: SlideGenerationProgress[]; // Slide generation progress
  isGeneratingSlides?: boolean; // Slide generation flag
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onLessonCreate,
  onActionClick,
  slideGenerationProgress,
  isGeneratingSlides
}) => {
  const { t } = useTranslation('chat');
  const theme = useTheme();

  // Handle lesson creation from message
  const handleLessonCreate = () => {
    if (message.text.includes('```html') && onLessonCreate) {
      // Parsing lesson from Assistant response
      const lessonMatch = message.text.match(/## 📚 (.*?)\n/);
      const title = lessonMatch ? lessonMatch[1] : 'New lesson';
      
      // Simple parser for creating slides from HTML
      const htmlMatch = message.text.match(/```html\n([\s\S]*?)\n```/);
      if (htmlMatch) {
        const lesson: SimpleLesson = {
          id: `lesson_${Date.now()}`,
          title,
          description: `Lesson created from chat`,
          subject: 'General education',
          ageGroup: '6-12 years',
          duration: 30,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: 'ai-chat',
          slides: [{
            id: `slide_${Date.now()}`,
            title: title,
            content: htmlMatch[1],
            htmlContent: htmlMatch[1],
            status: 'completed'
          }]
        };
        onLessonCreate(lesson);
      }
    }
  };

  // Automatic lesson creation when a message with a slide is received
  React.useEffect(() => {
    console.log('🔍 ChatMessage useEffect triggered:', {
      messageId: message.id,
      sender: message.sender,
      hasFirstSlideText: message.text.includes('✅ **First slide ready!**'),
      hasSlideReadyText: message.text.includes('ready!**'),
      hasLessonObject: !!(message as any).lesson,
      messagePreview: message.text.substring(0, 100) + '...'
    });
    
    // Extended condition for handling first, subsequent slides, and editing
    if (message.sender === 'ai' && onLessonCreate && (message as any).lesson) {
      // Check if there is text about a ready/updated slide (any number)
      const isSlideReady = message.text.includes('ready!**') || 
                          message.text.includes('✅ **First slide ready!**') ||
                          (message.text.includes('✅ **Slide') && message.text.includes('ready!**'));
      
      // Check if there is text about editing/improving the slide
      const isSlideEdited = message.text.includes('improved!**') ||
                           message.text.includes('regenerated!**') ||
                           message.text.includes('edited!**') ||
                           (message.text.includes('✏️ **Slide') && message.text.includes('improved!**')) ||
                           (message.text.includes('🔄 **Slide') && message.text.includes('regenerated!**')) ||
                           (message.text.includes('📝 **Slide') && message.text.includes('edited!**')) ||
                           (message.text.includes('🎨 **Slide') && message.text.includes('improved!**')) ||
                           // Additional conditions for actual messages from ChatService
                           message.text.includes('New slide variant created') ||
                           message.text.includes('Slide updated using') ||
                           message.text.includes('replaced** previous slide') ||
                           (message.text.includes('**What changed:**') && message.text.includes('Same slide'));
      
      if (isSlideReady || isSlideEdited) {
        console.log(`🎨 Auto-updating lesson from ${isSlideEdited ? 'slide editing' : 'slide generation'}...`);
        console.log('🎯 Found lesson object in message:', (message as any).lesson);
        console.log('🎯 Lesson slides count:', (message as any).lesson.slides?.length);
        
        if ((message as any).lesson.slides?.length > 0) {
          const lastSlideIndex = (message as any).lesson.slides.length - 1;
          console.log('🎯 Last slide htmlContent preview:', 
            (message as any).lesson.slides[lastSlideIndex]?.htmlContent?.substring(0, 100) + '...');
          
          // If this is a slide edit, set the current time as updatedAt
          if (isSlideEdited) {
            const updatedLesson = {
              ...(message as any).lesson,
              slides: (message as any).lesson.slides.map((slide: any) => ({
                ...slide,
                updatedAt: new Date() // Set current time to force preview update
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
    
    // Old code for compatibility (for the first slide without a lesson object)
    if (message.sender === 'ai' && message.text.includes('✅ **First slide ready!**') && onLessonCreate && !(message as any).lesson) {
      console.log('🎨 Auto-creating lesson from approved plan (fallback)...');
      
      // Fallback option - creating a lesson without real HTML data (NOT RECOMMENDED)
      console.warn('⚠️ No lesson object found in message, creating fallback lesson');
      
      const topicMatch = message.text.match(/про\s+([^"]+?)[\s]*для/i);
      const topic = topicMatch ? topicMatch[1].trim() : 'New lesson';
      
      const lesson: SimpleLesson = {
        id: `lesson_${Date.now()}`,
        title: topic || 'New lesson',
        description: `Lesson created from chat`,
        subject: 'General education',
        ageGroup: '6-12 years',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: 'ai-chat',
        slides: [{
          id: `slide_${Date.now()}`,
          title: `${topic} - Introduction`,
          content: 'Introductory slide generated',
          htmlContent: '<div>Slide generating...</div>',
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

                     {/* Slide Generation Progress */}
       {message.sender === 'ai' && isGeneratingSlides && slideGenerationProgress && 
        message.text.includes('Generating slides...') && (
                <Box sx={{ mt: 3, mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={16} />
                    📊 Slide Generation Progress
                  </Typography>
                  
                  {slideGenerationProgress.map((slide, index) => (
                    <Box key={slide.slideNumber} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {slide.slideNumber}. {slide.title}
                        </Typography>
                        <Chip
                          size="small"
                          icon={
                            slide.status === 'completed' ? <CheckCircle size={14} /> :
                            slide.status === 'error' ? <XCircle size={14} /> :
                            slide.status === 'generating' ? <Clock size={14} /> :
                            <Clock size={14} />
                          }
                          label={
                            slide.status === 'completed' ? 'Ready' :
                            slide.status === 'error' ? 'Error' :
                            slide.status === 'generating' ? 'Generating' :
                            'Pending'
                          }
                          color={
                            slide.status === 'completed' ? 'success' :
                            slide.status === 'error' ? 'error' :
                            slide.status === 'generating' ? 'info' :
                            'default'
                          }
                          variant={slide.status === 'generating' ? 'filled' : 'outlined'}
                        />
                      </Box>
                      
                      {slide.status !== 'pending' && (
                        <LinearProgress
                          variant="determinate"
                          value={slide.progress || 0}
                          sx={{
                            height: 8, // Increased from 6 to 8
                            borderRadius: 4, // Increased from 3 to 4
                            width: '100%', // Ensure full width
                            backgroundColor: alpha(theme.palette.grey[300], 0.3),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4, // Increased from 3 to 4
                              backgroundColor: 
                                slide.status === 'completed' ? theme.palette.success.main :
                                slide.status === 'error' ? theme.palette.error.main :
                                theme.palette.info.main
                            }
                          }}
                        />
                      )}
                      
                      {slide.error && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {slide.error}
                        </Typography>
                      )}
                    </Box>
                  ))}
                  
                  {/* Overall progress */}
                  <Box sx={{ mt: 2, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      Overall Progress: {slideGenerationProgress.filter(s => s.status === 'completed').length} / {slideGenerationProgress.length} slides
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(slideGenerationProgress.filter(s => s.status === 'completed').length / slideGenerationProgress.length) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor: theme.palette.primary.main
                        }
                      }}
                    />
                  </Box>
                </Box>
              )}

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

              {message.sender === 'ai' && message.text.includes('```html') && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
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