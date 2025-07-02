'use client';

import React from 'react';
import { Container, Paper, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Нові модульні компоненти
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import SlidePanel from '@/components/slides/SlidePanel';
import SlideDialog from '@/components/slides/SlideDialog';
import SaveLessonDialog from '@/components/dialogs/SaveLessonDialog';

// Хуки
import useChatLogic from '@/hooks/useChatLogic';
import useSlideManagement from '@/hooks/useSlideManagement';

// Типи
import { Message } from '@/types/chat';

const ChatInterface: React.FC = () => {
  const theme = useTheme();

  // Основна логіка чату
  const {
    messages,
    setMessages,
    isTyping,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    regenerateMessage,
    handleFeedback: provideFeedback
  } = useChatLogic();

  // Управління слайдами
  const {
    slideUIState,
    saveDialogData,
    slidePreviews,
    previewsUpdating,
    openSlideDialog,
    closeSlideDialog,
    goToNextSlide,
    goToPrevSlide,
    toggleSlideSelection,
    selectAllSlides,
    deselectAllSlides,
    openSaveDialog,
    closeSaveDialog,
    handlePreviewSelect,
    updateSaveDialogData,
    saveSelectedSlides,
    generateSlidePreview,
    regenerateSlidePreview,
    updateCurrentLesson,
    toggleSlidePanelOpen,
    exportLesson
  } = useSlideManagement(messages, setMessages);

  // Обробка збереження уроку з результатом
  const handleSaveLesson = async () => {
    try {
      const resultMessage = await saveSelectedSlides(saveDialogData);
      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Помилка збереження уроку:', error);
      const errorMessage: Message = {
        id: messages.length + 1,
        text: `❌ **Помилка збереження**\n\n${error instanceof Error ? error.message : 'Невідома помилка'}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'error',
        feedback: null
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
        {/* Основна область чату */}
        <Paper 
          elevation={3} 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper
          }}
        >
          {/* Заголовок чату */}
          <ChatHeader 
            isTyping={isTyping}
            onToggleSlidePanel={toggleSlidePanelOpen}
            slideCount={slideUIState.currentLesson?.slides.length || 0}
          />

          {/* Область повідомлень */}
          <Box 
            sx={{ 
              flex: 1, 
              p: 2, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onRegenerate={regenerateMessage}
                onFeedback={provideFeedback}
                onLessonCreate={updateCurrentLesson}
              />
            ))}
            
            {/* Індикатор друку */}
            {isTyping && <TypingIndicator />}
          </Box>

          {/* Поле введення */}
          <ChatInput
            value={inputText}
            onChange={setInputText}
            onSend={sendMessage}
            isLoading={isLoading}
            disabled={isTyping}
          />
        </Paper>

        {/* Панель слайдів */}
        {slideUIState.slidePanelOpen && (
          <SlidePanel
            lesson={slideUIState.currentLesson}
            selectedSlides={slideUIState.selectedSlides}
            slidePreviews={slidePreviews}
            previewsUpdating={previewsUpdating}
            onSlideSelect={toggleSlideSelection}
            onSelectAll={selectAllSlides}
            onDeselectAll={deselectAllSlides}
            onSlideView={openSlideDialog}
            onRegeneratePreview={regenerateSlidePreview}
            onSaveLesson={openSaveDialog}
            onExport={exportLesson}
            onClose={toggleSlidePanelOpen}
            isGenerating={slideUIState.isGenerating}
            isSaving={slideUIState.isSavingLesson}
          />
        )}
      </Box>

      {/* Діалог перегляду слайдів */}
      <SlideDialog
        open={slideUIState.slideDialogOpen}
        slides={slideUIState.currentLesson?.slides || []}
        currentIndex={slideUIState.currentSlideIndex}
        onClose={closeSlideDialog}
        onNext={goToNextSlide}
        onPrev={goToPrevSlide}
      />

      {/* Діалог збереження уроку */}
      <SaveLessonDialog
        open={slideUIState.saveDialogOpen}
        data={saveDialogData}
        selectedSlides={slideUIState.selectedSlides}
        slides={slideUIState.currentLesson?.slides || []}
        slidePreviews={slidePreviews}
        onClose={closeSaveDialog}
        onSave={handleSaveLesson}
        onDataChange={updateSaveDialogData}
        onPreviewSelect={handlePreviewSelect}
        isSaving={slideUIState.isSavingLesson}
      />
    </Container>
  );
};

export default ChatInterface; 