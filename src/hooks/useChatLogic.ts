import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, SimpleLesson } from '@/types/chat';
import { ChatServiceAPIAdapter } from '@/services/chat/ChatServiceAPIAdapter';
import { ConversationHistory } from '@/services/chat/types';
import { useRealTimeSlideGeneration } from './useRealTimeSlideGeneration';
// import { useSlideProgressSSE } from './useSlideProgressSSE'; // Removed - no longer needed
import { ContextCompressionService } from '@/services/context/ContextCompressionService';

// === СПРОЩЕНИЙ КОНТЕКСТ РОЗМОВИ (ТІЛЬКИ РЯДОК) ===
export type ConversationContext = string;

export const useChatLogic = () => {
  // Ref для динамічного callback
  const onLessonUpdateRef = useRef<((lesson: SimpleLesson) => void) | null>(null);
  const onSlidePanelOpenRef = useRef<(() => void) | null>(null);
  
  // Функція для встановлення callback
  const setOnLessonUpdate = useCallback((callback: (lesson: SimpleLesson) => void) => {
    onLessonUpdateRef.current = callback;
  }, []);
  
  // Функція для встановлення callback відкриття панелі слайдів
  const setOnSlidePanelOpen = useCallback((callback: () => void) => {
    onSlidePanelOpenRef.current = callback;
  }, []);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingStage, setTypingStage] = useState<'thinking' | 'processing' | 'generating' | 'finalizing'>('thinking');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any>(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  
  // === СПРОЩЕНИЙ СТЕЙТ ДЛЯ КОНТЕКСТУ РОЗМОВИ (ТІЛЬКИ РЯДОК) ===
  const [conversationContext, setConversationContext] = useState<ConversationContext>(() => {
    const initialContext = 'Session started';
    return initialContext;
  });

  // === ІНІЦІАЛІЗУЄМО СЕРВІС СТИСНЕННЯ КОНТЕКСТУ ===
  const compressionService = useRef(new ContextCompressionService()).current;

  // === РОЗУМНЕ ДОДАВАННЯ ДО КОНТЕКСТУ З AI СТИСНЕННЯМ ===
  const addToConversationContext = useCallback(async (addition: string) => {
    const currentContext = conversationContext;
    const newContext = currentContext + ' | ' + addition;
    const currentLength = newContext.length;
    
    // Перевіряємо, чи потребує стиснення
    if (compressionService.shouldCompress(newContext)) {
      try {
        const compressed = await compressionService.adaptiveCompression(newContext);
        setConversationContext(compressed);
      } catch (error) {
        // Fallback до простого обрізання
        const parts = newContext.split(' | ');
        const fallback = [
          parts[0], // Session start
          ...parts.slice(-8) // Last 8 interactions
        ].join(' | ');
        
        setConversationContext(fallback);
      }
    } else {
      setConversationContext(newContext);
    }
  }, [compressionService, conversationContext]);

  // === СПЕЦІАЛЬНЕ ДОДАВАННЯ З ОПЦІЯМИ СТИСНЕННЯ ===
  const addToConversationContextWithOptions = useCallback(async (
    addition: string,
    options: {
      forceCompression?: boolean;
      targetTokens?: number;
      preserveRecentCount?: number;
    } = {}
  ) => {
    const currentContext = conversationContext;
    const newContext = currentContext + ' | ' + addition;
    
    if (options.forceCompression || compressionService.shouldCompress(newContext)) {
      try {
        const result = await compressionService.compressContext(newContext, {
          targetTokens: options.targetTokens || 1500,
          semanticCleaning: true,
          preserveRecent: true,
          recentMessagesCount: options.preserveRecentCount || 3
        });
        
        setConversationContext(result.compressed);
      } catch (error) {
        setConversationContext(newContext);
      }
    } else {
      setConversationContext(newContext);
    }
  }, [compressionService, conversationContext]);

  // === ОНОВЛЕНІ ФУНКЦІЇ ДЛЯ КЕРУВАННЯ КОНТЕКСТОМ ===
  const updateConversationContext = useCallback((newContext: string) => {
    setConversationContext(newContext);
  }, []);

  const resetConversationContext = useCallback(() => {
    const newContext = 'Conversation reset';
    setConversationContext(newContext);
  }, []);

  // API adapter for client-server communication
  const apiAdapter = new ChatServiceAPIAdapter();
  
  // SSE progress tracking removed - using parallel generation instead
  
  const [generationState, generationActions] = useRealTimeSlideGeneration(
    (lesson) => {
      // Оновлюємо останнє повідомлення з актуальним уроком
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.sender === 'ai') {
          lastMessage.lesson = lesson;
        }
        
        return newMessages;
      });
    }
  );



  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    setIsTyping(true);
    setTypingStage('thinking');

    // Додаємо повідомлення користувача
    const userMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // === ОНОВЛЮЄМО КОНТЕКСТ РОЗМОВИ З ПОВІДОМЛЕННЯМ КОРИСТУВАЧА ===
    const updatedContext = conversationContext + ' | USER: ' + message;

    try {
      setTypingStage('processing');
      
      // === ПЕРЕДАЄМО КОНТЕКСТ ДО API ADAPTER ДЛЯ PRE-REQUEST COMPRESSION ===
      const response = await apiAdapter.sendMessage(message, conversationHistory, undefined, updatedContext);
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }

      setTypingStage('generating');

      // Оновлюємо conversation history
      if (response.conversationHistory) {
        setConversationHistory(response.conversationHistory);
        
        // === ОНОВЛЮЄМО КОНТЕКСТ З ІНФОРМАЦІЄЮ З CONVERSATION HISTORY ===
        const contextWithTopic = updatedContext + ' | TOPIC: ' + (response.conversationHistory.lessonTopic || 'Unknown topic');
        setConversationContext(contextWithTopic);
      }

      setTypingStage('finalizing');

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        availableActions: response.actions?.map(action => ({
          action: action.action,
          label: action.label,
          description: action.description || ''
        })),
        lesson: response.lesson
      };

      setMessages(prev => [...prev, aiMessage]);

      // === ОНОВЛЮЄМО КОНТЕКСТ З AI ВІДПОВІДДЮ ===
      const finalContext = conversationContext + ' | AI: ' + response.message;
      setConversationContext(finalContext);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `❌ **Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',

      };

      setMessages(prev => [...prev, errorMessage]);

      // === ОНОВЛЮЄМО КОНТЕКСТ З ПОМИЛКОЮ ===
      const errorContext = conversationContext + ' | ERROR: ' + (error instanceof Error ? error.message : 'Unknown error');
      setConversationContext(errorContext);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setTypingStage('thinking');
    }
  }, [isLoading, conversationHistory, apiAdapter, conversationContext]);

  const handleActionClick = useCallback(async (action: string) => {
    if (isLoading) return;

    setIsLoading(true);

    // === АКТИВУЄМО TYPING VIEW ДЛЯ APPROVE_PLAN ===
    if (action === 'approve_plan') {
      setIsTyping(true);
      setTypingStage('processing');
      setIsGeneratingSlides(true);
    }

    // === ОНОВЛЮЄМО КОНТЕКСТ З ДІЄЮ КОРИСТУВАЧА ===
    const updatedContext = conversationContext + ' | ACTION: ' + action;

    try {
      // Спеціальна обробка для approve_plan - використовуємо SSE генерацію з прогресом
      if (action === 'approve_plan' && conversationHistory) {
        
        // === ПЕРЕДАЄМО КОНТЕКСТ ДО API ADAPTER ДЛЯ PRE-REQUEST COMPRESSION ===
        const response = await apiAdapter.sendMessage('', conversationHistory, action, updatedContext);
        
        if (!response.success) {
          throw new Error(response.error || 'Unknown error');
        }

        // Оновлюємо conversation history
        if (response.conversationHistory) {
          setConversationHistory(response.conversationHistory);
        }

        // Створюємо повідомлення з початковим статусом
        const aiMessage: Message = {
          id: Date.now(),
          text: response.message,
          sender: 'ai',
          timestamp: new Date(),
          status: 'delivered',
          availableActions: response.actions?.map(action => ({
            action: action.action,
            label: action.label,
            description: action.description || ''
          })),
          lesson: response.lesson
        };

        setMessages(prev => [...prev, aiMessage]);

        // === АВТОМАТИЧНО ВІДКРИВАЄМО ПАНЕЛЬ СЛАЙДІВ ===
        if (onSlidePanelOpenRef.current) {
          onSlidePanelOpenRef.current();
        }

        // Якщо є описи слайдів та sessionId, запускаємо PARALLEL генерацію
        if (response.conversationHistory?.slideDescriptions && response.lesson && response.sessionId) {
          try {
            // === ОНОВЛЮЄМО TYPING STAGE ДЛЯ ПОЧАТКУ ГЕНЕРАЦІЇ ===
            setTypingStage('processing');
            
            // === ОНОВЛЮЄМО КОНТЕКСТ ПРИ ПОЧАТКУ ГЕНЕРАЦІЇ СЛАЙДІВ ===
            const generationContext = updatedContext + ' | PARALLEL_GENERATION: Starting parallel slide generation';
            setConversationContext(generationContext);
            
                         // === CREATE DEDICATED PROGRESS MESSAGE ===
             const progressMessage: Message = {
               id: Date.now() + 1,
               text: `🔄 **Generating slides...**`,
               sender: 'ai',
               timestamp: new Date(),
               status: 'delivered'
             };
            
            setMessages(prev => [...prev, progressMessage]);
            
            // === DISABLE TYPING INDICATOR SINCE WE HAVE PROGRESS MESSAGE ===
            setIsTyping(false);
            setTypingStage('thinking');
            
            // === START PARALLEL GENERATION ===
            handleParallelSlideGeneration(
              response.conversationHistory.slideDescriptions,
              response.conversationHistory.lessonTopic || 'Unknown topic',
              response.conversationHistory.lessonAge || '6-8',
              response.sessionId,
              response.lesson,
              progressMessage.id // Pass the progress message ID
            );
            
          } catch (error) {
            // === ВИМИКАЄМО TYPING VIEW ПРИ ПОМИЛЦІ ГЕНЕРАЦІЇ ===
            setIsTyping(false);
            setTypingStage('thinking');
            setIsGeneratingSlides(false);
            
            // === ОНОВЛЮЄМО КОНТЕКСТ ПРИ ПОМИЛЦІ ГЕНЕРАЦІЇ ===
            const errorContext = updatedContext + ' | GENERATION_ERROR: ' + (error instanceof Error ? error.message : 'Unknown error');
            setConversationContext(errorContext);
            
            // Додаємо повідомлення про помилку
            const errorMessage: Message = {
              id: Date.now(),
              text: `❌ **Помилка генерації:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
              sender: 'ai',
              timestamp: new Date(),
              status: 'delivered',
      
            };
            
            setMessages(prev => [...prev, errorMessage]);
          }
        }
        
      } else {
        // === СТАНДАРТНА ОБРОБКА ІНШИХ ДІЙ З PRE-REQUEST COMPRESSION ===
        const response = await apiAdapter.sendMessage('', conversationHistory, action, updatedContext);
        
        if (!response.success) {
          throw new Error(response.error || 'Unknown error');
        }

        if (response.conversationHistory) {
          setConversationHistory(response.conversationHistory);
        }

        const aiMessage: Message = {
          id: Date.now(),
          text: response.message,
          sender: 'ai',
          timestamp: new Date(),
          status: 'delivered',
          availableActions: response.actions?.map(action => ({
            action: action.action,
            label: action.label,
            description: action.description || ''
          })),
          lesson: response.lesson
        };

        setMessages(prev => [...prev, aiMessage]);

        // === ОНОВЛЮЄМО КОНТЕКСТ З AI ВІДПОВІДДЮ ===
        const responseContext = updatedContext + ' | AI_RESPONSE: ' + response.message;
        setConversationContext(responseContext);
      }

    } catch (error) {
      console.error('Error handling action:', error);
      
      // === ВИМИКАЄМО TYPING VIEW ПРИ ПОМИЛЦІ (ОКРІМ APPROVE_PLAN) ===
      if (action !== 'approve_plan') {
        setIsTyping(false);
        setTypingStage('thinking');
        setIsGeneratingSlides(false);
      } else {
        // Для approve_plan та generate_slides помилок, також вимикаємо флаг генерації слайдів
        setIsGeneratingSlides(false);
      }
      
      const errorMessage: Message = {
        id: Date.now(),
        text: `❌ **Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',

      };

      setMessages(prev => [...prev, errorMessage]);

      // === ОНОВЛЮЄМО КОНТЕКСТ З ПОМИЛКОЮ ===
      const errorContext = updatedContext + ' | ACTION_ERROR: ' + (error instanceof Error ? error.message : 'Unknown error');
      setConversationContext(errorContext);
    } finally {
      setIsLoading(false);
      
      // === НЕ ВИМИКАЄМО TYPING ДЛЯ APPROVE_PLAN І GENERATE_SLIDES ===
      // Typing буде вимкнено в onCompletion або onError callbacks SSE
      if (action !== 'approve_plan') {
        setIsTyping(false);
        setTypingStage('thinking');
        setIsGeneratingSlides(false);
      }
    }
  }, [isLoading, conversationHistory, apiAdapter, generationActions, conversationContext]);



  // === PARALLEL SLIDE GENERATION FUNCTION ===
  const handleParallelSlideGeneration = async (
    slideDescriptions: any[],
    topic: string,
    age: string,
    sessionId: string,
    lesson: any,
    progressMessageId: number
  ) => {
    
    // Initialize progress tracking
    const progressMap = new Map<number, any>();
    const progressIntervals = new Map<number, NodeJS.Timeout>();
    
    // Progress randomization utilities
    const getRandomMaxProgress = () => Math.floor(Math.random() * 10) + 70; // 70-79%
    const getRandomStepSize = () => Math.floor(Math.random() * 10) + 10; // 10-19%
    const getRandomInterval = () => Math.floor(Math.random() * 2000) + 4000; // 4-6 seconds
    const getRandomInitialProgress = () => Math.floor(Math.random() * 10) + 5; // 5-14%
    
    slideDescriptions.forEach(desc => {
      progressMap.set(desc.slideNumber, {
        slideNumber: desc.slideNumber,
        title: desc.title,
        status: 'pending',
        progress: 0
      });
    });

    // === CREATE PLACEHOLDER SLIDES FOR IMMEDIATE FEEDBACK ===
    const placeholderSlides = slideDescriptions.map((desc, index) => ({
      id: `slide-${desc.slideNumber}-${sessionId}`, // Stable ID that will be preserved
      title: desc.title,
      htmlContent: `
        <div style="
          width: 100%; 
          height: 400px; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
          border: 2px dashed #e0e0e0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;">🎨</div>
          <h2 style="font-size: 24px; color: #666; margin: 0 0 10px 0; font-weight: 600;">${desc.title}</h2>
          <p style="font-size: 16px; color: #999; margin: 0; opacity: 0.8;">Generating...</p>
          <div style="
            width: 80px; 
            height: 4px; 
            background: #e0e0e0; 
            border-radius: 2px; 
            margin-top: 20px;
            overflow: hidden;
          ">
            <div style="
              width: 30%; 
              height: 100%; 
              background: linear-gradient(90deg, #4fc3f7, #29b6f6);
              border-radius: 2px;
              animation: pulse 2s ease-in-out infinite;
            "></div>
          </div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { width: 30%; }
            50% { width: 70%; }
          }
        </style>
      `,
      isPlaceholder: true,
      status: 'generating'
    }));

    // Update lesson with placeholder slides immediately for panel display
    const lessonWithPlaceholders = {
      ...lesson,
      slides: placeholderSlides
    };

    // Update lesson immediately so placeholders appear in the panel
    if (onLessonUpdateRef.current) {
      onLessonUpdateRef.current(lessonWithPlaceholders);
    }

    // Update initial progress in conversation history
    setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
      ...prev,
      slideGenerationProgress: Array.from(progressMap.values()),
      currentLesson: lessonWithPlaceholders
    } : prev);

    // === RANDOMIZED PROGRESS SIMULATION ===
    const startFakeProgress = (slideNumber: number) => {
      // Each slide gets its own random parameters for more natural variation
      const maxProgress = getRandomMaxProgress();
      const intervalTime = getRandomInterval();
      
      const updateProgress = () => {
        const currentSlide = progressMap.get(slideNumber);
        if (currentSlide && currentSlide.status === 'generating' && currentSlide.progress < maxProgress) {
          const stepSize = getRandomStepSize();
          const newProgress = Math.min(currentSlide.progress + stepSize, maxProgress);
          progressMap.set(slideNumber, {
            ...currentSlide,
            progress: newProgress
          });
          
          // Update conversation history
          setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
            ...prev,
            slideGenerationProgress: Array.from(progressMap.values())
          } : prev);
          

          
          // Schedule next update with new random interval
          if (newProgress < maxProgress) {
            const nextInterval = getRandomInterval();
            const timeoutId = setTimeout(updateProgress, nextInterval);
            progressIntervals.set(slideNumber, timeoutId);
          }
        }
      };
      
      // Start the first update after initial random interval
      const timeoutId = setTimeout(updateProgress, intervalTime);
      progressIntervals.set(slideNumber, timeoutId);
    };

    const stopFakeProgress = (slideNumber: number) => {
      const timeoutId = progressIntervals.get(slideNumber);
      if (timeoutId) {
        clearTimeout(timeoutId);
        progressIntervals.delete(slideNumber);
      }
    };

    try {
      // Create parallel requests for each slide
      const slidePromises = slideDescriptions.map(async (desc, index) => {
        try {
          // Update status to generating and start randomized progress
          const initialProgress = getRandomInitialProgress();
          progressMap.set(desc.slideNumber, {
            ...progressMap.get(desc.slideNumber)!,
            status: 'generating',
            progress: initialProgress
          });
          
          // Start randomized progress simulation for this slide
          startFakeProgress(desc.slideNumber);
          
          // Update progress in conversation history
          setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
            ...prev,
            slideGenerationProgress: Array.from(progressMap.values())
          } : prev);



          const response = await fetch('/api/generation/slides/single', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: desc.title,
              description: desc.description,
              topic: topic,
              age: age,
              sessionId: `${sessionId}_slide_${desc.slideNumber}`
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to generate slide ${desc.slideNumber}: ${response.statusText}`);
          }

          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.error || `Unknown error for slide ${desc.slideNumber}`);
          }

                      // Stop randomized progress and update status to completed
            stopFakeProgress(desc.slideNumber);
          progressMap.set(desc.slideNumber, {
            ...progressMap.get(desc.slideNumber)!,
            status: 'completed',
            progress: 100,
            htmlContent: result.slide?.htmlContent
          });

          // Generate thumbnail BEFORE adding slide to store
          if (onLessonUpdateRef.current && result.slide) {
            try {
              // Import thumbnail generation service
              const { getLocalThumbnailStorage } = await import('@/services/slides/LocalThumbnailService');
              const localThumbnailStorage = getLocalThumbnailStorage();
              
              // Generate thumbnail before store update
              let thumbnailUrl: string | undefined;
              try {
                thumbnailUrl = await localThumbnailStorage.generateThumbnail(
                  `slide-${desc.slideNumber}-${sessionId}`, // Use the stable ID
                  result.slide.htmlContent
                );
              } catch (thumbError) {
                // Continue without thumbnail - slide will show "Preparing..." state
              }

              // Update store with FULLY READY slide (including thumbnail)
              setConversationHistory((prev: ConversationHistory | undefined) => {
                if (prev?.currentLesson?.slides) {
                  const updatedSlides = prev.currentLesson.slides.map((slide: any) => {
                    // Find placeholder slide for this slide number and replace it
                    if (slide.isPlaceholder && slide.title === desc.title) {
                      return {
                        ...result.slide,
                        id: slide.id, // Keep the same stable ID from placeholder
                        isPlaceholder: false,
                        status: 'completed',
                        thumbnailUrl: thumbnailUrl, // Add pre-generated thumbnail
                        thumbnailReady: !!thumbnailUrl // Flag to prevent further generation
                      };
                    }
                    return slide;
                  });

                  const updatedLesson = {
                    ...prev.currentLesson,
                    slides: updatedSlides
                  };

                  // Update lesson immediately in the panel
                  onLessonUpdateRef.current!(updatedLesson);

                  return {
                    ...prev,
                    currentLesson: updatedLesson
                  };
                }
                return prev;
              });
            } catch (error) {
              // Fallback to basic slide addition without thumbnail
              setConversationHistory((prev: ConversationHistory | undefined) => {
                if (prev?.currentLesson?.slides) {
                  const updatedSlides = prev.currentLesson.slides.map((slide: any) => {
                    if (slide.isPlaceholder && slide.title === desc.title) {
                      return {
                        ...result.slide,
                        id: slide.id,
                        isPlaceholder: false,
                        status: 'completed'
                      };
                    }
                    return slide;
                  });

                  const updatedLesson = {
                    ...prev.currentLesson,
                    slides: updatedSlides
                  };

                  onLessonUpdateRef.current!(updatedLesson);
                  return {
                    ...prev,
                    currentLesson: updatedLesson
                  };
                }
                return prev;
              });
            }
          }



          return {
            slideNumber: desc.slideNumber,
            slide: result.slide,
            success: true
          };

        } catch (error) {
          
          // Stop randomized progress and update status to error
          stopFakeProgress(desc.slideNumber);
          progressMap.set(desc.slideNumber, {
            ...progressMap.get(desc.slideNumber)!,
            status: 'error',
            progress: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          });

          return {
            slideNumber: desc.slideNumber,
            slide: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        } finally {
          // Update progress after each slide completes
          setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
            ...prev,
            slideGenerationProgress: Array.from(progressMap.values())
          } : prev);
        }
      });

      // Wait for all slides to complete
      const results = await Promise.all(slidePromises);
      
      // Process results
      const successfulSlides = results.filter(r => r.success).map(r => r.slide);
      const failedSlides = results.filter(r => !r.success);

      // 🛡️ PRESERVE EXISTING SLIDES: Don't recreate slides array to prevent re-renders
      // Slides were already updated individually during generation
      
      // Update conversation history with completion flags ONLY (no slides array change)
      setConversationHistory((prev: ConversationHistory | undefined) => {
        if (!prev?.currentLesson) return prev;
        
        // Use existing lesson with individually updated slides - DON'T recreate slides array
        const preservedLesson = {
          ...prev.currentLesson,
          updatedAt: new Date() // Only update timestamp, preserve existing slides
        };
        
        return {
          ...prev,
          currentLesson: preservedLesson, // Preserve existing lesson with individual slide updates
          isGeneratingAllSlides: false,   // Update completion flag
          slideGenerationProgress: Array.from(progressMap.values()) // Update progress
        };
      });

      // Add completion message (get current lesson from state, don't recreate)
      const currentLesson = conversationHistory?.currentLesson;
      const completionMessage = {
        id: Date.now(),
        text: `🎉 **Generation completed!**

✨ Your lesson is ready! ${successfulSlides.length} slides have been generated successfully.${failedSlides.length > 0 ? ` ${failedSlides.length} slide${failedSlides.length > 1 ? 's' : ''} couldn't be generated.` : ''}

📚 Check the slide panel to view and edit your slides.`,
        sender: 'ai' as const,
        timestamp: new Date(),
        status: 'delivered' as const,
        lesson: currentLesson // Use existing lesson, don't recreate
      };

      setMessages(prev => [...prev, completionMessage]);

      // Update context
      const completionContext = conversationContext + ` | PARALLEL_COMPLETED: ${successfulSlides.length}/${slideDescriptions.length} slides generated`;
      setConversationContext(completionContext);

    } catch (error) {
      
      // Add error message
      const errorMessage = {
        id: Date.now(),
        text: `❌ **Generation failed**\n\n${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`,
        sender: 'ai' as const,
        timestamp: new Date(),
        status: 'delivered' as const,

      };

      setMessages(prev => [...prev, errorMessage]);
      
      // Update conversation history
      setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
        ...prev,
        isGeneratingAllSlides: false
      } : prev);
    } finally {
      // Always stop typing indicators
      setIsTyping(false);
      setTypingStage('thinking');
      setIsGeneratingSlides(false);
      
      // Clean up all randomized progress timeouts
      progressIntervals.forEach((timeoutId, slideNumber) => {
        clearTimeout(timeoutId);
      });
      progressIntervals.clear();
    }
  };

  // === ФУНКЦІЇ ДЛЯ ОНОВЛЕННЯ КОНТЕКСТУ РОЗМОВИ ===
  // updateConversationContext, // This function is now directly available
  // addInteractionToContext, // This function is no longer needed
  // resetConversationContext // This function is now directly available

  return {
    messages,
    setMessages,
    isTyping,
    typingStage,
    isGeneratingSlides,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    handleActionClick,
    conversationHistory,
    
    // Додаємо інформацію про паралельну генерацію
    generationState,
    generationActions,
    
    // SSE progress removed - using parallel generation instead
    
    // Функція для встановлення callback оновлення уроку
    setOnLessonUpdate,
    
    // Функція для встановлення callback відкриття панелі слайдів
    setOnSlidePanelOpen,
    
    // === НОВИЙ КОНТЕКСТ РОЗМОВИ ===
    conversationContext,
    updateConversationContext,
    addToConversationContext,
    addToConversationContextWithOptions,
    resetConversationContext
  };
}; 