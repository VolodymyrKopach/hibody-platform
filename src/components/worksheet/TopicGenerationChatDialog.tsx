'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Stack,
  Avatar,
  Fade,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface TopicGenerationChatDialogProps {
  open: boolean;
  onClose: () => void;
  onTopicGenerated: (topic: string) => void;
  ageGroup: string;
  contentMode: 'pdf' | 'interactive';
}

const TopicGenerationChatDialog: React.FC<TopicGenerationChatDialogProps> = ({
  open,
  onClose,
  onTopicGenerated,
  ageGroup,
  contentMode,
}) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTopic, setGeneratedTopic] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize conversation when dialog opens
  useEffect(() => {
    if (open && messages.length === 0) {
      const modeText = contentMode === 'pdf' ? 'PDF (printable)' : 'Interactive (digital)';
      const componentsNote = contentMode === 'interactive' 
        ? 'I have access to both standard worksheet components and interactive elements like drag-and-drop, memory games, and more.'
        : 'I have access to all standard worksheet components including exercises, images, and activities.';
      
      const initialMessage: Message = {
        id: `msg_${Date.now()}`,
        text: `Hello! I'll help you create a detailed plan for your worksheet. 

**Your Settings:**
- Mode: **${modeText}**
- Age Group: **${ageGroup}**

${componentsNote}

**Tell me about your worksheet:**
- What subject or theme are you teaching?
- What specific skills should students practice?
- Any particular learning goals or requirements?

I'll create a comprehensive plan with recommended components and activity structure!`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [open, ageGroup, contentMode, messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/worksheet/generate-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          conversationHistory: messages,
          ageGroup,
          contentMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          id: `msg_${Date.now() + 1}`,
          text: data.response,
          sender: 'ai',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Check if AI generated a final topic
        if (data.generatedTopic) {
          setGeneratedTopic(data.generatedTopic);
        }
      } else {
        throw new Error(data.error || 'Failed to generate response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUseTopic = () => {
    if (generatedTopic) {
      onTopicGenerated(generatedTopic);
      onClose();
      // Reset state
      setMessages([]);
      setGeneratedTopic(null);
      setInputText('');
    }
  };

  const handleCloseDialog = () => {
    onClose();
    // Reset state after animation
    setTimeout(() => {
      setMessages([]);
      setGeneratedTopic(null);
      setInputText('');
    }, 300);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          maxHeight: '80vh',
          maxWidth: '650px',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ 
        p: 2.5, 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color="white" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              AI Topic Generator
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Age: {ageGroup} | Mode: {contentMode === 'pdf' ? 'PDF' : 'Interactive'}
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={handleCloseDialog} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      {/* Chat Messages */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 3,
            backgroundColor: alpha(theme.palette.grey[100], 0.3),
          }}
        >
          <Stack spacing={2}>
            {messages.map((message) => (
              <Fade key={message.id} in timeout={300}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    gap: 1.5,
                  }}
                >
                  {message.sender === 'ai' && (
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      <Bot size={20} />
                    </Avatar>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '75%',
                      borderRadius: '12px',
                      backgroundColor:
                        message.sender === 'user'
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                      color: message.sender === 'user' ? 'white' : 'text.primary',
                      border: message.sender === 'ai' ? `1px solid ${theme.palette.divider}` : 'none',
                    }}
                  >
                    {message.sender === 'ai' ? (
                      <Box
                        sx={{
                          '& .chat-message': {
                            fontSize: '0.875rem',
                            '& p': {
                              margin: '8px 0',
                            },
                            '& ul': {
                              margin: '8px 0',
                            },
                            '& strong': {
                              fontWeight: 600,
                            },
                          },
                        }}
                      >
                        <MarkdownRenderer content={message.text} />
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: 1.6,
                          color: 'inherit',
                        }}
                      >
                        {message.text}
                      </Typography>
                    )}
                  </Paper>
                  {message.sender === 'user' && (
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: alpha(theme.palette.grey[400], 0.2),
                        color: theme.palette.text.primary,
                      }}
                    >
                      <User size={20} />
                    </Avatar>
                  )}
                </Box>
              </Fade>
            ))}
            {isLoading && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  <Bot size={20} />
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      Thinking...
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Stack>
        </Box>

        {/* Input Area */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Describe your topic or ask for suggestions..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              sx={{
                minWidth: 56,
                height: 56,
                borderRadius: '12px',
              }}
            >
              <Send size={20} />
            </Button>
          </Stack>
        </Box>
      </DialogContent>

      {/* Actions */}
      {generatedTopic && (
        <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckCircle size={18} />}
            onClick={handleUseTopic}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Use This Plan
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default TopicGenerationChatDialog;

