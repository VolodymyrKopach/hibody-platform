'use client';

import React from 'react';
import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

// === New Store-based imports ===
import { SlideStoreProvider, SlideStoreDevTools } from '@/providers/SlideStoreProvider';
import { useSlideUI, useLessonManagement } from '@/hooks/useSlideStore';
import SlidePanelStore from '@/components/slides/SlidePanelStore';
import { SlideDialog } from '@/components/slides/SlideDialog';

// === Existing components ===
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { useChatLogic } from '@/hooks/useChatLogic';

// === SOLID: SRP - ChatInterface is only responsible for layout and integration ===
const ChatInterfaceWithStore: React.FC = () => {
  const { t } = useTranslation('common');
  const theme = useTheme();

  // Existing chat logic
  const {
    messages,
    isTyping,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    handleActionClick
  } = useChatLogic();

  return (
    <SlideStoreProvider enableLogging={true} enablePersistence={true}>
      <ChatInterfaceContent 
        messages={messages}
        isTyping={isTyping}
        inputText={inputText}
        setInputText={setInputText}
        isLoading={isLoading}
        sendMessage={sendMessage}
        handleActionClick={handleActionClick}
      />
      
      {/* Development tools */}
      <SlideStoreDevTools />
    </SlideStoreProvider>
  );
};

// === SOLID: SRP - Separating layout logic from Provider setup ===
interface ChatInterfaceContentProps {
  messages: any[];
  isTyping: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  sendMessage: (text: string) => void;
  handleActionClick: (action: string) => void;
}

const ChatInterfaceContent: React.FC<ChatInterfaceContentProps> = ({
  messages,
  isTyping,
  inputText,
  setInputText,
  isLoading,
  sendMessage,
  handleActionClick
}) => {
  const theme = useTheme();
  
  // === SOLID: DIP - Using Store through abstraction ===
  const { 
    slidePanelOpen, 
    slideDialogOpen, 
    currentSlide,
    currentSlideIndex,
    hasNext,
    hasPrev,
    setDialog,
    nextSlide,
    prevSlide,
    togglePanel
  } = useSlideUI();

  const { hasSlides } = useLessonManagement();

  return (
    <Box sx={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header with Store integration */}
      <ChatHeader 
        slidePanelOpen={slidePanelOpen}
        hasSlides={hasSlides}
        onToggleSlidePanel={togglePanel}
      />

      {/* Main content area */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Chat area */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Messages */}
          <Box sx={{ 
            flex: 1,
            overflowY: 'auto',
            p: 2,
            backgroundColor: theme.palette.background.default
          }}>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                onActionClick={handleActionClick}
              />
            ))}
            
            {isTyping && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                p: 2,
                color: 'text.secondary' 
              }}>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                Assistant is processing your request...
              </Box>
            )}
          </Box>

          {/* TODO: Integrate ChatInput with Store */}
          <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            {/* ChatInput integration would go here */}
            <p>ChatInput integration - TODO: Match component interface</p>
          </Box>
        </Box>

        {/* === NEW: Store-based Slide Panel (no props drilling!) === */}
        {slidePanelOpen && (
          <Box sx={{ 
            width: 400,
            flexShrink: 0,
            borderLeft: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper
          }}>
            <SlidePanelStore />
          </Box>
        )}
      </Box>

      {/* === NEW: Store-based Slide Dialog === */}
      <SlideDialog
        open={slideDialogOpen}
        currentLesson={null} // Store manages this internally
        currentSlideIndex={currentSlideIndex}
        onClose={() => setDialog(false)}
        onNextSlide={nextSlide}
        onPrevSlide={prevSlide}
      />
    </Box>
  );
};

export default ChatInterfaceWithStore;

// === SOLID: LSP - Component can be used instead of the original ===
export { ChatInterfaceWithStore as ChatInterface }; 