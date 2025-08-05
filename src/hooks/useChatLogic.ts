import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, SimpleLesson } from '@/types/chat';
import { ChatServiceAPIAdapter } from '@/services/chat/ChatServiceAPIAdapter';
import { ConversationHistory } from '@/services/chat/types';
import { useRealTimeSlideGeneration } from './useRealTimeSlideGeneration';
import { useSlideProgressSSE } from './useSlideProgressSSE';
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
      status: 'sent'
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
          console.log('🎯 [CHAT] Opening slide panel automatically for generation');
          onSlidePanelOpenRef.current();
        }

        // Якщо є описи слайдів та sessionId, запускаємо PARALLEL генерацію
        if (response.conversationHistory?.slideDescriptions && response.lesson && response.sessionId) {
          try {
            console.log('🚀 [CHAT] Starting PARALLEL slide generation with sessionId:', response.sessionId);
            
            // === ОНОВЛЮЄМО TYPING STAGE ДЛЯ ПОЧАТКУ ГЕНЕРАЦІЇ ===
            setTypingStage('processing');
            console.log('⌨️ [CHAT] Updated typing stage to processing for parallel generation start');
            
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
            console.error('❌ [CHAT] Parallel generation failed:', error);
            
            // === ВИМИКАЄМО TYPING VIEW ПРИ ПОМИЛЦІ ГЕНЕРАЦІЇ ===
            setIsTyping(false);
            setTypingStage('thinking');
            setIsGeneratingSlides(false);
            console.log('⌨️ [CHAT] Typing view deactivated due to parallel generation error');
            
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



  // === PARALLEL SLIDE GENERATION FUNCTION ===
  const handleParallelSlideGeneration = async (
    slideDescriptions: any[],
    topic: string,
    age: string,
    sessionId: string,
    lesson: any,
    progressMessageId: number
  ) => {
    console.log('🚀 [PARALLEL] Starting parallel generation of', slideDescriptions.length, 'slides');
    
    // Initialize progress tracking
    const progressMap = new Map<number, any>();
    const progressIntervals = new Map<number, NodeJS.Timeout>();
    const maxFakeProgress = 75; // Cap fake progress at 75%
    
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
      console.log('🎯 [PARALLEL] Created', placeholderSlides.length, 'placeholder slides for immediate feedback');
    }

    // Update initial progress in conversation history
    setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
      ...prev,
      slideGenerationProgress: Array.from(progressMap.values()),
      currentLesson: lessonWithPlaceholders
    } : prev);

    // === FAKE PROGRESS SIMULATION ===
    const startFakeProgress = (slideNumber: number) => {
      const interval = setInterval(() => {
        const currentSlide = progressMap.get(slideNumber);
        if (currentSlide && currentSlide.status === 'generating' && currentSlide.progress < maxFakeProgress) {
          const newProgress = Math.min(currentSlide.progress + 15, maxFakeProgress);
          progressMap.set(slideNumber, {
            ...currentSlide,
            progress: newProgress
          });
          
          // Update conversation history
          setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
            ...prev,
            slideGenerationProgress: Array.from(progressMap.values())
          } : prev);
          
          console.log(`📊 [FAKE PROGRESS] Slide ${slideNumber}: ${newProgress}%`);
        }
      }, 5000); // Every 5 seconds
      
      progressIntervals.set(slideNumber, interval);
    };

    const stopFakeProgress = (slideNumber: number) => {
      const interval = progressIntervals.get(slideNumber);
      if (interval) {
        clearInterval(interval);
        progressIntervals.delete(slideNumber);
        console.log(`⏹️ [FAKE PROGRESS] Stopped for slide ${slideNumber}`);
      }
    };

    try {
      // Create parallel requests for each slide
      const slidePromises = slideDescriptions.map(async (desc, index) => {
        try {
          // Update status to generating and start fake progress
          progressMap.set(desc.slideNumber, {
            ...progressMap.get(desc.slideNumber)!,
            status: 'generating',
            progress: 10
          });
          
          // Start fake progress simulation for this slide
          startFakeProgress(desc.slideNumber);
          
          // Update progress in conversation history
          setConversationHistory((prev: ConversationHistory | undefined) => prev ? {
            ...prev,
            slideGenerationProgress: Array.from(progressMap.values())
          } : prev);

          console.log(`📤 [PARALLEL] Generating slide ${desc.slideNumber}: ${desc.title}`);

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

          // Stop fake progress and update status to completed
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
              console.log(`🎨 [PRE-GENERATION] Generating thumbnail for slide ${desc.slideNumber} before store update`);
              
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
                console.log(`✅ [PRE-GENERATION] Thumbnail generated for slide ${desc.slideNumber}`);
              } catch (thumbError) {
                console.warn(`⚠️ [PRE-GENERATION] Thumbnail generation failed for slide ${desc.slideNumber}:`, thumbError);
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
                  console.log(`🔄 [PARALLEL] Added fully ready slide ${desc.slideNumber} to store:`, result.slide.title);

                  return {
                    ...prev,
                    currentLesson: updatedLesson
                  };
                }
                return prev;
              });
            } catch (error) {
              console.error(`❌ [PRE-GENERATION] Failed to process slide ${desc.slideNumber}:`, error);
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

          console.log(`✅ [PARALLEL] Slide ${desc.slideNumber} completed:`, result.slide?.title);

          return {
            slideNumber: desc.slideNumber,
            slide: result.slide,
            success: true
          };

        } catch (error) {
          console.error(`❌ [PARALLEL] Slide ${desc.slideNumber} failed:`, error);
          
          // Stop fake progress and update status to error
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
      console.log('⏳ [PARALLEL] Waiting for all slides to complete...');
      const results = await Promise.all(slidePromises);
      
      // Process results
      const successfulSlides = results.filter(r => r.success).map(r => r.slide);
      const failedSlides = results.filter(r => !r.success);
      
      console.log(`🎉 [PARALLEL] Generation completed! ${successfulSlides.length}/${slideDescriptions.length} slides successful`);

      // 🛡️ PRESERVE EXISTING SLIDES: Don't recreate slides array to prevent re-renders
      // Slides were already updated individually during generation
      console.log('🛡️ [PARALLEL] Preserving existing slides array to prevent re-renders');
      
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
      console.error('❌ [PARALLEL] Critical error during parallel generation:', error);
      
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
      
      // Clean up all fake progress intervals
      progressIntervals.forEach((interval, slideNumber) => {
        clearInterval(interval);
        console.log(`🧹 [CLEANUP] Cleared interval for slide ${slideNumber}`);
      });
      progressIntervals.clear();
      
      console.log('⌨️ [PARALLEL] Typing view deactivated after generation completion');
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
    
    // Додаємо інформацію про SSE прогрес
    isSSEGenerating,
    currentProgress,
    
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