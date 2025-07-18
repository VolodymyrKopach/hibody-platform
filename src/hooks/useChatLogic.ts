import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, SimpleLesson } from '@/types/chat';
import { ChatServiceAPIAdapter } from '@/services/chat/ChatServiceAPIAdapter';
import { useRealTimeSlideGeneration } from './useRealTimeSlideGeneration';
import { useSlideProgressSSE } from './useSlideProgressSSE';



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

    try {
      const response = await apiAdapter.sendMessage(message, conversationHistory);
      
      if (!response.success) {
        throw new Error(response.error || 'Unknown error');
      }

      // Оновлюємо conversation history
      if (response.conversationHistory) {
        setConversationHistory(response.conversationHistory);
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

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: `Вибачте, сталася помилка: ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationHistory, apiAdapter]);

  const handleActionClick = useCallback(async (action: string) => {
    if (isLoading || !conversationHistory) return;

    setIsLoading(true);

    try {
      // Спеціальна обробка для approve_plan - використовуємо SSE генерацію з прогресом
      if (action === 'approve_plan' && conversationHistory) {
        console.log('🚀 [CHAT] Using SSE generation with progress for plan approval');
        
        // Спочатку отримуємо план від сервера без генерації
        const response = await apiAdapter.sendMessage('', conversationHistory, action);
        
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
            await startGenerationWithProgress(
              response.conversationHistory.slideDescriptions,
              response.lesson,
              response.conversationHistory.lessonTopic || 'урок',
              response.conversationHistory.lessonAge || '6-8 років'
            );
          } catch (error) {
            console.error('❌ [CHAT] SSE generation failed:', error);
            
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
        // Стандартна обробка інших дій
        const response = await apiAdapter.sendMessage('', conversationHistory, action);
        
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
      }

    } catch (error) {
      console.error('Error handling action:', error);
      
      const errorMessage: Message = {
        id: Date.now(),
        text: `Помилка при виконанні дії: ${error instanceof Error ? error.message : 'Невідома помилка'}`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationHistory, apiAdapter, generationActions]);

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
    setOnLessonUpdate
  };
}; 