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
  const [typingStage, setTypingStage] = useState<'thinking' | 'processing' | 'generating' | 'finalizing'>('thinking');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any>(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  
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
    startGenerationWithProgress,
    connect: connectSSE
  } = useSlideProgressSSE({
    onProgressUpdate: (data) => {
      console.log('📊 [CHAT] SSE Progress update:', data);
      
      // === ОНОВЛЮЄМО TYPING STAGE ПІД ЧАС ГЕНЕРАЦІЇ ===
      setTypingStage('generating');
      console.log('⌨️ [CHAT] Updated typing stage to generating');
      
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
      
      // === ПОКАЗУЄМО FINALIZING STAGE ===
      setTypingStage('finalizing');
      console.log('⌨️ [CHAT] Updated typing stage to finalizing');
      
      // === ВИМИКАЄМО TYPING VIEW ПІСЛЯ КОРОТКОЇ ЗАТРИМКИ ===
      setTimeout(() => {
        setIsTyping(false);
        setTypingStage('thinking');
        setIsGeneratingSlides(false);
        console.log('⌨️ [CHAT] Typing view deactivated after slide generation completion');
      }, 1000);
      
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
      
      // === ВИМИКАЄМО TYPING VIEW ПРИ ПОМИЛЦІ ГЕНЕРАЦІЇ ===
      setIsTyping(false);
      setTypingStage('thinking');
      setIsGeneratingSlides(false);
      console.log('⌨️ [CHAT] Typing view deactivated due to SSE error');
      
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
    setIsTyping(true);
    setTypingStage('thinking');

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
      setIsTyping(false);
      setTypingStage('thinking');
    }
  }, [isLoading, conversationHistory, apiAdapter, conversationContext]);

  const handleActionClick = useCallback(async (action: string) => {
    if (isLoading) return;

    setIsLoading(true);

    // === АКТИВУЄМО TYPING VIEW ДЛЯ APPROVE_PLAN ===
    if (action === 'approve_plan' || action === 'generate_slides') {
      setIsTyping(true);
      setTypingStage('processing');
      setIsGeneratingSlides(true);
      console.log('⌨️ [CHAT] Activated typing view for', action, 'with slide generation flag');
    }

    // === ОНОВЛЮЄМО КОНТЕКСТ З ДІЄЮ КОРИСТУВАЧА ===
    const updatedContext = conversationContext + ' | ACTION: ' + action;
    console.log('⚡ [CHAT] Updated context with user action');

    try {
      // Спеціальна обробка для approve_plan та generate_slides - використовуємо SSE генерацію з прогресом
      if ((action === 'approve_plan' || action === 'generate_slides') && conversationHistory) {
        console.log('🚀 [CHAT] Using SSE generation with progress for', action === 'approve_plan' ? 'plan approval' : 'slide generation');
        
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

        // Якщо є описи слайдів та sessionId, запускаємо генерацію з прогресом
        if (response.conversationHistory?.slideDescriptions && response.lesson && response.sessionId) {
          try {
            console.log('🎯 [CHAT] Starting SSE slide generation with sessionId:', response.sessionId);
            
            // === ОНОВЛЮЄМО TYPING STAGE ДЛЯ ПОЧАТКУ ГЕНЕРАЦІЇ ===
            setTypingStage('processing');
            console.log('⌨️ [CHAT] Updated typing stage to processing for slide generation start');
            
            // === ОНОВЛЮЄМО КОНТЕКСТ ПРИ ПОЧАТКУ ГЕНЕРАЦІЇ СЛАЙДІВ ===
            const generationContext = updatedContext + ' | GENERATION: Starting slide generation';
            setConversationContext(generationContext);
            
            // The SSE hook is already initialized above - we need to find a way to connect with sessionId
            // For now, let's trigger the API call which should send completion via SSE
            console.log('🔄 [CHAT] API will handle SSE events with sessionId:', response.sessionId);
            
            // Connect to SSE with the sessionId from the response
            connectSSE(response.sessionId);
          } catch (error) {
            console.error('❌ [CHAT] SSE generation failed:', error);
            
            // === ВИМИКАЄМО TYPING VIEW ПРИ ПОМИЛЦІ ГЕНЕРАЦІЇ ===
            setIsTyping(false);
            setTypingStage('thinking');
            setIsGeneratingSlides(false);
            console.log('⌨️ [CHAT] Typing view deactivated due to SSE generation error');
            
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
      
      // === ВИМИКАЄМО TYPING VIEW ПРИ ПОМИЛЦІ (ОКРІМ APPROVE_PLAN) ===
      if (action !== 'approve_plan' && action !== 'generate_slides') {
        setIsTyping(false);
        setTypingStage('thinking');
        setIsGeneratingSlides(false);
        console.log('⌨️ [CHAT] Typing view deactivated due to action error');
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
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);

      // === ОНОВЛЮЄМО КОНТЕКСТ З ПОМИЛКОЮ ===
      const errorContext = updatedContext + ' | ACTION_ERROR: ' + (error instanceof Error ? error.message : 'Unknown error');
      setConversationContext(errorContext);
    } finally {
      setIsLoading(false);
      
      // === НЕ ВИМИКАЄМО TYPING ДЛЯ APPROVE_PLAN І GENERATE_SLIDES ===
      // Typing буде вимкнено в onCompletion або onError callbacks SSE
      if (action !== 'approve_plan' && action !== 'generate_slides') {
        setIsTyping(false);
        setTypingStage('thinking');
        setIsGeneratingSlides(false);
      }
    }
  }, [isLoading, conversationHistory, apiAdapter, generationActions, startGenerationWithProgress, conversationContext]);



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