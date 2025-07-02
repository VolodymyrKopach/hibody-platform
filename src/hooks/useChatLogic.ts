import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';
import { ChatService } from '@/services/chat/ChatService';

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
}

const chatService = new ChatService();

const useChatLogic = (): UseChatLogicReturn => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Привіт! 👋 Я HiBody AI - ваш персональний помічник для створення інтерактивних уроків для дітей.\n\n🎯 **Що я можу зробити:**\n\n🔹 Створити урок на будь-яку тему з інтерактивними слайдами\n🔹 Адаптувати матеріал під вік дитини\n🔹 Додати ігрові елементи та завдання\n🔹 Згенерувати візуальний контент\n\n💬 **Просто опишіть, який урок ви хочете створити!**\n\nНаприклад: *\"Створи урок про динозаврів для дітей 6-8 років з інтерактивними іграми\"*",
      sender: 'ai',
      timestamp: new Date(),
      status: 'sent',
      feedback: null
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Функція відправки повідомлення
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
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
      const response = await chatService.processMessage(inputText);
      
      setIsTyping(false);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: response.message,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        feedback: null
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
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
  }, [inputText, isLoading, messages]);

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
      const response = await chatService.processMessage(previousUserMessage.text);
      
      setIsTyping(false);
      
      const updatedMessage: Message = {
        ...messages[messageIndex],
        text: response.message,
        timestamp: new Date(),
        status: 'sent',
        feedback: null
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
  }, [messages]);

  // Функція обробки зворотного зв'язку
  const handleFeedback = useCallback((messageId: number, feedback: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
        : msg
    ));
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
    handleFeedback
  };
};

export default useChatLogic; 