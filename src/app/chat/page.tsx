'use client';

import React, { useRef, useEffect } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// Layout
import Layout from '@/components/layout/Layout';

// New modular components
import ChatHeader from '@/components/chat/ChatHeader';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import SlidePanel from '@/components/slides/SlidePanel';
import { SlideDialog } from '@/components/slides';
import SaveLessonDialog from '@/components/dialogs/SaveLessonDialog';
import SimpleGenerationDialog from '@/components/dialogs/SimpleGenerationDialog';

// Hooks
import { useChatLogic } from '@/hooks/useChatLogic';
import useSlideManagement from '@/hooks/useSlideManagement';

// Types
import { Message } from '@/types/chat';
import { generateMessageId } from '@/utils/messageUtils';

const ChatInterface: React.FC = () => {
  const { t } = useTranslation('common');
  const theme = useTheme();

  // Main chat logic
  const {
    messages,
    setMessages,
    isTyping,
    typingStage,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    regenerateMessage,
    handleFeedback: provideFeedback,
    handleActionClick,
    setOnLessonUpdate
  } = useChatLogic();

  // Slide management
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

  // Set callback for lesson update after initialization
  useEffect(() => {
    setOnLessonUpdate(updateCurrentLesson);
  }, [setOnLessonUpdate, updateCurrentLesson]);

  // State for generation constructor dialog
  const [generationConstructorOpen, setGenerationConstructorOpen] = React.useState(false);

  const handleOpenGenerationConstructor = () => {
    setGenerationConstructorOpen(true);
  };

  const handleCloseGenerationConstructor = () => {
    setGenerationConstructorOpen(false);
  };

  const handleGenerate = (parameters: any) => {
    console.log('🎯 Generation started with parameters:', parameters);
    // Logic to pass parameters to ChatService will go here
    setGenerationConstructorOpen(false);
  };

  // 🔥 FIX: Track changes in lesson message objects to update the slide panel
  React.useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.sender === 'ai' && (lastMessage as any).lesson) {
      const lesson = (lastMessage as any).lesson;
      console.log('🎯 [CHAT] Detected lesson update in message, updating slide panel');
      console.log('📊 [CHAT] Lesson has', lesson.slides?.length || 0, 'slides');
      updateCurrentLesson(lesson);
    }
  }, [messages, updateCurrentLesson]);

    // Handle lesson saving with result
  const handleSaveLesson = async () => {
    console.log('💾 CHAT PAGE: Save lesson triggered');
    console.log('📋 CHAT PAGE: Save dialog data:', saveDialogData);
    
    try {
      const resultMessage = await saveSelectedSlides(saveDialogData);
      console.log('✅ CHAT PAGE: Save completed successfully, adding result message');
      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('❌ CHAT PAGE: Save failed:', error);
      const errorMessage: Message = {
        id: generateMessageId(),
        text: `❌ **Save Error**\n\n${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        feedback: null
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <Layout 
      title={t('pages.chatTitle')} 
      breadcrumbs={[{ label: t('navigation.home'), href: '/' }, { label: t('navigation.chat') }]}
      noPadding={true}
    >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Main chat area */}
          <Box 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backgroundColor: theme.palette.background.default
            }}
          >
            {/* Chat header */}
            <ChatHeader 
              slidePanelOpen={slideUIState.slidePanelOpen}
              hasSlides={(slideUIState.currentLesson?.slides.length || 0) > 0}
              onToggleSlidePanel={toggleSlidePanelOpen}
            />

            {/* Messages area */}
            <Box 
              sx={{ 
                flex: 1, 
                p: 3, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{
                maxWidth: '1200px',
                mx: 'auto',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onRegenerate={regenerateMessage}
                    onFeedback={provideFeedback}
                    onLessonCreate={updateCurrentLesson}
                    onActionClick={handleActionClick}
                    slideGenerationProgress={(message as any).slideGenerationProgress}
                    isGeneratingSlides={(message as any).isGeneratingSlides}
                  />
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <TypingIndicator 
                    isTyping={isTyping}
                    typingStage={typingStage}
                  />
                )}
              </Box>
            </Box>

            {/* Input field */}
            <Box sx={{ 
              p: 3, 
              backgroundColor: theme.palette.background.paper,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}>
              <Box sx={{ 
                maxWidth: '1200px',
                mx: 'auto',
                width: '100%'
              }}>
                <ChatInput
                  value={inputText}
                  onChange={setInputText}
                  onSend={() => sendMessage(inputText)}
                  isLoading={isLoading}
                  disabled={isTyping}
                  onOpenGenerationConstructor={handleOpenGenerationConstructor}
                />
              </Box>
            </Box>
          </Box>

          {/* Slides panel */}
          {slideUIState.slidePanelOpen && (
            <Box sx={{ 
              width: 400,          // Optimal width for 300px cards + padding
              flexShrink: 0,       // Do not shrink width
              borderLeft: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper
            }}>
              <SlidePanel
                currentLesson={slideUIState.currentLesson}
                selectedSlides={slideUIState.selectedSlides}
                slidePreviews={slidePreviews}
                previewsUpdating={previewsUpdating}
                isSavingLesson={slideUIState.isSavingLesson}
                onToggleSlideSelection={toggleSlideSelection}
                onSelectAllSlides={selectAllSlides}
                onDeselectAllSlides={deselectAllSlides}
                onOpenSlideDialog={openSlideDialog}
                onOpenSaveDialog={openSaveDialog}
                onCloseSidePanel={toggleSlidePanelOpen}
                onExportLesson={exportLesson}
              />
            </Box>
          )}
        </Box>

        {/* Slide preview dialog */}
        <SlideDialog
          open={slideUIState.slideDialogOpen}
          currentLesson={slideUIState.currentLesson}
          currentSlideIndex={slideUIState.currentSlideIndex}
          onClose={closeSlideDialog}
          onNextSlide={goToNextSlide}
          onPrevSlide={goToPrevSlide}
        />

        {/* Lesson save dialog */}
        <SaveLessonDialog
          open={slideUIState.saveDialogOpen}
          dialogData={saveDialogData}
          selectedSlides={slideUIState.currentLesson?.slides.filter(slide => slideUIState.selectedSlides.has(slide.id)) || []}
          cachedPreviews={slidePreviews}
          onClose={closeSaveDialog}
          onSave={handleSaveLesson}
          onDataChange={updateSaveDialogData}
          onPreviewSelect={handlePreviewSelect}
          isSaving={slideUIState.isSavingLesson}
        />

        {/* Generation constructor dialog */}
        <SimpleGenerationDialog
          open={generationConstructorOpen}
          onClose={handleCloseGenerationConstructor}
          onSendToChat={(prompt) => {
            setInputText(prompt);
            setTimeout(() => sendMessage(prompt), 100);
          }}
        />
      </Box>
          </Layout>
  );
};

export default ChatInterface; 