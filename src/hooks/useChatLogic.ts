import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';
import { generateMessageId, setMessageIdCounter } from '@/utils/messageUtils';

interface UseChatLogicReturn {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isTyping: boolean;
  inputText: string;
  setInputText: (value: string) => void;
  isLoading: boolean;
  sendMessage: () => void;
  regenerateMessage: (messageId: number) => void;
  handleFeedback: (messageId: number, feedback: 'like' | 'dislike') => void;
  handleActionClick: (action: string, description: string) => void;
}

// Client-side function to call the API
const sendMessageToAPI = async (message: string, conversationHistory?: any, action?: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationHistory, action }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};

// Початкове повідомлення як константа поза компонентом
const INITIAL_MESSAGE: Message = {
  id: generateMessageId(),
  text: "Привіт! 👋 Я HiBody AI - ваш персональний помічник для створення інтерактивних уроків для дітей.\n\n🎯 **Що я можу зробити:**\n\n🔹 Створити урок на будь-яку тему з інтерактивними слайдами\n🔹 Адаптувати матеріал під вік дитини\n🔹 Додати ігрові елементи та завдання\n🔹 Згенерувати візуальний контент\n\n💬 **Просто опишіть, який урок ви хочете створити!**\n\nНаприклад: *\"Створи урок про динозаврів для дітей 6-8 років з інтерактивними іграми\"*",
  sender: 'ai',
  timestamp: new Date(),
  status: 'sent',
  feedback: null
};

const useChatLogic = (): UseChatLogicReturn => {
  const [messages, setMessages] = useState<Message[]>(() => [INITIAL_MESSAGE]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any>(null);

  // Функція відправки повідомлення
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: generateMessageId(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      feedback: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await sendMessageToAPI(inputText, conversationHistory);
      
      setIsTyping(false);
      
      // Update conversation history from the response
      if (response.conversationHistory) {
        setConversationHistory(response.conversationHistory);
        console.log('📋 Updated conversation context:', response.conversationHistory.step || 'none');
      }
      
      const aiMessage: Message = {
        id: generateMessageId(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        feedback: null,
        availableActions: response.actions || [],
        lesson: response.lesson
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        text: 'Вибачте, сталася помилка. Спробуйте ще раз.',
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading]);

  // Функція регенерації повідомлення
  const regenerateMessage = useCallback(async (messageId: number) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const previousUserMessage = messages[messageIndex - 1];
    if (previousUserMessage.sender !== 'user') return;

    setIsLoading(true);
    setIsTyping(true);

    try {
      const contextMessages = messages.slice(0, messageIndex - 1);
      const response = await sendMessageToAPI(previousUserMessage.text, conversationHistory);
      
      setIsTyping(false);
      
      // Update conversation history from the response
      if (response.conversationHistory) {
        setConversationHistory(response.conversationHistory);
      }
      
      const updatedMessage: Message = {
        ...messages[messageIndex],
        text: response.message,
        timestamp: new Date(),
        status: 'sent',
        feedback: null,
        availableActions: response.actions || [],
        lesson: response.lesson
      };

      setMessages(prev => [
        ...prev.slice(0, messageIndex),
        updatedMessage,
        ...prev.slice(messageIndex + 1)
      ]);
    } catch (error) {
      setIsTyping(false);
      console.error('Error regenerating message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationHistory]);

  // Функція обробки зворотного зв'язку
  const handleFeedback = useCallback((messageId: number, feedback: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
        : msg
    ));
  }, []);

  // Функція обробки кліків на дії
  const handleActionClick = useCallback(async (action: string, description: string) => {
    console.log(`🔧 Action clicked: ${action} - ${description}`);
    
    // Відправляємо дію як повідомлення користувача
    const actionMessage: Message = {
      id: generateMessageId(),
      text: description,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      feedback: null
    };

    setMessages(prev => [...prev, actionMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await sendMessageToAPI(description, conversationHistory, action);
      
      setIsTyping(false);
      
      // Update conversation history from the response
      if (response.conversationHistory) {
        setConversationHistory(response.conversationHistory);
        console.log('📋 Updated conversation context after action:', response.conversationHistory.step || 'none');
      }
      
      const aiMessage: Message = {
        id: generateMessageId(),
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        feedback: null,
        availableActions: response.actions || [],
        lesson: response.lesson
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      console.error('Error handling action:', error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        text: 'Вибачте, сталася помилка при обробці дії. Спробуйте ще раз.',
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationHistory]);

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
    handleActionClick
  };
};

export default useChatLogic; 