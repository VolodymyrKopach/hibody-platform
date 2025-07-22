import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, SimpleLesson } from '@/types/chat';
import { ChatServiceAPIAdapter } from '@/services/chat/ChatServiceAPIAdapter';
import { useRealTimeSlideGeneration } from './useRealTimeSlideGeneration';
import { useSlideProgressSSE } from './useSlideProgressSSE';
import { ContextCompressionService } from '@/services/context/ContextCompressionService';

// === СПРОЩЕНИЙ КОНТЕКСТ РОЗМОВИ (ТІЛЬКИ РЯДОК) ===
export type ConversationContext = string;

export const useChatLogic = () => {
  // Ref для динамічного callback
  const onLessonUpdateRef = useRef<((lesson: SimpleLesson) => void) | null>(null);
  
  // Функція для встановлення callback
  const setOnLessonUpdate = useCallback((callback: (lesson: SimpleLesson) => void) => {
    onLessonUpdateRef.current = callback;
  }, []);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any>(null);
  
  // === СПРОЩЕНИЙ СТЕЙТ ДЛЯ КОНТЕКСТУ РОЗМОВИ (ТІЛЬКИ РЯДОК) ===
  const [conversationContext, setConversationContext] = useState<ConversationContext>(() => {
    const initialContext = 'Session started';
    console.log('🆕 [CONVERSATION CONTEXT] Initial context:', initialContext);
    return initialContext;
  });

  // === ІНІЦІАЛІЗУЄМО СЕРВІС СТИСНЕННЯ КОНТЕКСТУ ===
  const compressionService = useRef(new ContextCompressionService()).current;

  // === РОЗУМНЕ ДОДАВАННЯ ДО КОНТЕКСТУ З AI СТИСНЕННЯМ ===
  const addToConversationContext = useCallback(async (addition: string) => {
    console.log('➕ [CONVERSATION CONTEXT] Adding:', addition.substring(0, 100) + '...');
    
    const currentContext = conversationContext;
    const newContext = currentContext + ' | ' + addition;
    const currentLength = newContext.length;
    
    console.log(`📊 [CONVERSATION CONTEXT] Current length: ${currentLength} chars`);
    
    // Перевіряємо, чи потребує стиснення
    if (compressionService.shouldCompress(newContext)) {
      console.log('🤖 [CONVERSATION CONTEXT] Context too long, using AI compression...');
      
      try {
        const compressed = await compressionService.adaptiveCompression(newContext);
        
        console.log(`📉 [CONVERSATION CONTEXT] AI Compressed: ${currentLength} → ${compressed.length} chars`);
        console.log(`💰 [CONVERSATION CONTEXT] Estimated cost: ~$0.0003`);
        
        setConversationContext(compressed);
      } catch (error) {
        console.error('❌ [CONVERSATION CONTEXT] AI compression failed:', error);
        
        // Fallback до простого обрізання
        const parts = newContext.split(' | ');
        const fallback = [
          parts[0], // Session start
          ...parts.slice(-8) // Last 8 interactions
        ].join(' | ');
        
        console.log(`📉 [CONVERSATION CONTEXT] Fallback truncation: ${currentLength} → ${fallback.length} chars`);
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
    console.log('⚙️ [CONVERSATION CONTEXT] Adding with options:', options);
    
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
        
        console.log('📊 [CONVERSATION CONTEXT] Compression metrics:', result.metrics);
        setConversationContext(result.compressed);
      } catch (error) {
        console.error('❌ [CONVERSATION CONTEXT] Custom compression failed:', error);
        setConversationContext(newContext);
      }
    } else {
      setConversationContext(newContext);
    }
  }, [compressionService, conversationContext]);

  // === ОНОВЛЕНІ ФУНКЦІЇ ДЛЯ КЕРУВАННЯ КОНТЕКСТОМ ===
  const updateConversationContext = useCallback((newContext: string) => {
    console.log('🔄 [CONVERSATION CONTEXT] Direct update to:', newContext.substring(0, 100) + '...');
    setConversationContext(newContext);
  }, []);

  const resetConversationContext = useCallback(() => {
    console.log('🔄 [CONVERSATION CONTEXT] Resetting conversation context');
    const newContext = 'Conversation reset';
    console.log('🆕 [CONVERSATION CONTEXT] New context:', newContext);
    setConversationContext(newContext);
  }, []);

  // API adapter for client-server communication
  const apiAdapter = new ChatServiceAPIAdapter();
  
  // SSE progress tracking
  const {
    isGenerating: isSSEGenerating,
    currentProgress,
    startGenerationWithProgress
  } = useSlideProgressSSE({
    onProgressUpdate: (data) => {
      console.log('📊 [CHAT] SSE Progress update:', data);
      
      // Оновлюємо повідомлення з прогресом
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.sender === 'ai') {
          // Додаємо прогрес до повідомлення
          (lastMessage as any).slideGenerationProgress = data.progress;
          (lastMessage as any).isGeneratingSlides = true;
          
          // Оновлюємо урок якщо є
          if (data.lesson) {
            lastMessage.lesson = data.lesson;
            
            // === ВИКЛИК CALLBACK ДЛЯ ОНОВЛЕННЯ ПАНЕЛІ СЛАЙДІВ ===
            if (onLessonUpdateRef.current) {
              const slideInfo = data.newSlide ? `with new slide: "${data.newSlide.title}"` : `with ${data.lesson.slides?.length || 0} slides`;
              console.log(`🎨 [CHAT] Lesson updated ${slideInfo}`);
              onLessonUpdateRef.current(data.lesson);
            }
          }
            
            // Примусово оновлюємо повідомлення для тригеру useEffect
            return [...newMessages];
        }
        
        return newMessages;
      });
    },
    onCompletion: (data) => {
      console.log('🎉 [CHAT] SSE Generation completed:', data);
      
      // Оновлюємо повідомлення з фінальним результатом
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.sender === 'ai') {
          (lastMessage as any).slideGenerationProgress = data.finalProgress;
          (lastMessage as any).isGeneratingSlides = false;
          lastMessage.lesson = data.lesson;
          
          // === ВИКЛИК CALLBACK ДЛЯ ФІНАЛЬНОГО ОНОВЛЕННЯ ПАНЕЛІ СЛАЙДІВ ===
          if (onLessonUpdateRef.current) {
            console.log(`🎉 [CHAT] Final lesson update with ${data.lesson.slides?.length || 0} slides`);
            onLessonUpdateRef.current(data.lesson);
          }
          
          // Прибираємо кнопку скасування після завершення генерації
          lastMessage.availableActions = lastMessage.availableActions?.filter(
            action => action.action !== 'cancel_generation'
          ) || [];
          
          // Перевіряємо, чи вже додано статистику, щоб уникнути дублювання
          if (!lastMessage.text.includes('✅ **Генерація завершена!**')) {
            // Замінюємо початковий текст про прогрес на фінальну статистику
            const planSection = lastMessage.text.split('⏳ **Прогрес:**')[0];
            lastMessage.text = planSection + `✅ **Генерація завершена!**
📊 **Статистика:**

Створено слайдів: ${data.statistics.completedSlides}/${data.statistics.totalSlides}
${data.statistics.failedSlides > 0 ? `Помилок: ${data.statistics.failedSlides}` : ''}`;
          }
        }
        
        return newMessages;
      });
    },
    onError: (error) => {
      console.error('❌ [CHAT] SSE Error:', error);
      
      // Додаємо повідомлення про помилку
      const errorMessage: Message = {
        id: Date.now(),
        text: `❌ **Помилка генерації:** ${error}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        feedback: null
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  });
  
  const [generationState, generationActions] = useRealTimeSlideGeneration(
    (lesson) => {
      console.log('🔄 [CHAT] Lesson updated from parallel generation:', lesson.slides.length, 'slides');
      
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
    setIsTyping(false);

    // Додаємо повідомлення користувача
    const userMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      feedback: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // === ОНОВЛЮЄМО КОНТЕКСТ РОЗМОВИ З ПОВІДОМЛЕННЯМ КОРИСТУВАЧА ===
    const updatedContext = conversationContext + ' | USER: ' + message;
    console.log('📝 [CHAT] Updated context with user message');

    try {
      // === ПЕРЕДАЄМО КОНТЕКСТ ДО API ADAPTER ДЛЯ PRE-REQUEST COMPRESSION ===
      const response = await apiAdapter.sendMessage(message, conversationHistory, undefined, updatedContext);
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }

      // Оновлюємо conversation history
      if (response.conversationHistory) {
        setConversationHistory(response.conversationHistory);
        
        // === ОНОВЛЮЄМО КОНТЕКСТ З ІНФОРМАЦІЄЮ З CONVERSATION HISTORY ===
        const contextWithTopic = updatedContext + ' | TOPIC: ' + (response.conversationHistory.lessonTopic || 'Unknown topic');
        setConversationContext(contextWithTopic);
      }

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        feedback: null,
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
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);

      // === ОНОВЛЮЄМО КОНТЕКСТ З ПОМИЛКОЮ ===
      const errorContext = conversationContext + ' | ERROR: ' + (error instanceof Error ? error.message : 'Unknown error');
      setConversationContext(errorContext);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationHistory, apiAdapter, conversationContext]);

  const handleActionClick = useCallback(async (action: string) => {
    if (isLoading) return;

    setIsLoading(true);

    // === ОНОВЛЮЄМО КОНТЕКСТ З ДІЄЮ КОРИСТУВАЧА ===
    const updatedContext = conversationContext + ' | ACTION: ' + action;
    console.log('⚡ [CHAT] Updated context with user action');

    try {
      // Спеціальна обробка для approve_plan - використовуємо SSE генерацію з прогресом
      if (action === 'approve_plan' && conversationHistory) {
        console.log('🚀 [CHAT] Using SSE generation with progress for plan approval');
        
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
          feedback: null,
          availableActions: response.actions?.map(action => ({
            action: action.action,
            label: action.label,
            description: action.description || ''
          })),
          lesson: response.lesson
        };

        setMessages(prev => [...prev, aiMessage]);

        // Якщо є описи слайдів, запускаємо генерацію з прогресом
        if (response.conversationHistory?.slideDescriptions && response.lesson) {
          try {
            console.log('🎯 [CHAT] Starting SSE slide generation...');
            
            // === ОНОВЛЮЄМО КОНТЕКСТ ПРИ ПОЧАТКУ ГЕНЕРАЦІЇ СЛАЙДІВ ===
            const generationContext = updatedContext + ' | GENERATION: Starting slide generation';
            setConversationContext(generationContext);
            
            await startGenerationWithProgress(
              response.conversationHistory.slideDescriptions,
              response.lesson,
              response.conversationHistory.lessonTopic || 'урок',
              response.conversationHistory.lessonAge || '6-8 років'
            );
          } catch (error) {
            console.error('❌ [CHAT] SSE generation failed:', error);
            
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
              feedback: null
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
          feedback: null,
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
      
      const errorMessage: Message = {
        id: Date.now(),
        text: `❌ **Помилка:** ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);

      // === ОНОВЛЮЄМО КОНТЕКСТ З ПОМИЛКОЮ ===
      const errorContext = updatedContext + ' | ACTION_ERROR: ' + (error instanceof Error ? error.message : 'Unknown error');
      setConversationContext(errorContext);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationHistory, apiAdapter, generationActions, startGenerationWithProgress, conversationContext]);

  const regenerateMessage = useCallback(async (messageId: number) => {
    // Реалізація регенерації повідомлення
    console.log('Regenerating message:', messageId);
  }, []);

  const handleFeedback = useCallback((messageId: number, feedback: 'like' | 'dislike') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
  }, []);

  // === ФУНКЦІЇ ДЛЯ ОНОВЛЕННЯ КОНТЕКСТУ РОЗМОВИ ===
  // updateConversationContext, // This function is now directly available
  // addInteractionToContext, // This function is no longer needed
  // resetConversationContext // This function is now directly available

  return {
    messages,
    setMessages,
    isTyping,
    inputText,
    setInputText,
    isLoading,
    sendMessage,
    regenerateMessage,
    handleFeedback,
    handleActionClick,
    
    // Додаємо інформацію про паралельну генерацію
    generationState,
    generationActions,
    
    // Додаємо інформацію про SSE прогрес
    isSSEGenerating,
    currentProgress,
    
    // Функція для встановлення callback оновлення уроку
    setOnLessonUpdate,
    
    // === НОВИЙ КОНТЕКСТ РОЗМОВИ ===
    conversationContext,
    updateConversationContext,
    addToConversationContext,
    addToConversationContextWithOptions,
    resetConversationContext
  };
}; 