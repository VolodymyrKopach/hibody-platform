import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, SimpleLesson, SimpleSlide } from '@/types/chat';

interface UseChatLogicReturn {
  messages: Message[];
  inputValue: string;
  isTyping: boolean;
  conversationHistory: any;
  setInputValue: (value: string) => void;
  handleSendMessage: (messageText?: string, action?: string) => Promise<any>;
  handleKeyPress: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  parseHTMLSlides: (htmlContent: string) => { lesson: SimpleLesson, slides: SimpleSlide[] };
}

const useChatLogic = (): UseChatLogicReturn => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '🎉 Привіт! Я ваш помічник для створення інтерактивних уроків!\n\n**🔄 Новий поетапний процес:**\n📋 **Крок 1:** Спочатку створю план уроку\n🎨 **Крок 2:** Потім кожен слайд окремо з HTML кодом\n👀 **Крок 3:** Ви зможете переглядати та покращувати кожен слайд\n\n✨ **Просто опишіть що хочете:**\n• "Створи урок про динозаврів для дітей 6 років"\n• "Зроби урок математики про додавання"\n• "Урок англійської про кольори"\n\n🚀 **Я проведу вас через весь процес крок за кроком!**\n📱 Слайди з\'являться в правій панелі ➡️',
      sender: 'ai',
      timestamp: new Date(),
      status: 'delivered',
      feedback: null
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const parseHTMLSlides = useCallback((htmlContent: string): { lesson: SimpleLesson, slides: SimpleSlide[] } => {
    const slides: SimpleSlide[] = [];
    let lessonTitle = 'Новий урок';
    let lessonDescription = 'Інтерактивний урок';
    let ageGroup = 'Всі вікові групи';
    let subject = 'Загальне навчання';
    
    // Debug logging
    console.log('parseHTMLSlides called with:', {
      contentLength: htmlContent?.length,
      contentPreview: htmlContent?.substring(0, 300),
      hasHtmlBlock: htmlContent?.includes('```html'),
      hasSlideDiv: htmlContent?.includes('<div class="slide"')
    });
    
    // Витягуємо назву уроку з title або h1
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      lessonTitle = titleMatch[1].replace(/\[.*?\]/g, '').trim();
    }
    
    // Витягуємо опис з коментарів або мета-тегів  
    const descMatch = htmlContent.match(/(\*\*📝 Короткий опис:\*\*\s*\*([^*]+)\*)/);
    if (descMatch) {
      lessonDescription = descMatch[2].trim();
    }
    
    // Витягуємо вікову групу
    const ageMatch = htmlContent.match(/(\*\*👥 Для дітей:\*\*\s*([^|]+))/);
    if (ageMatch) {
      ageGroup = ageMatch[2].trim();
    }
    
    // If this is a markdown message with HTML code block, extract the HTML first
    let actualHtmlContent = htmlContent;
    const htmlBlockMatch = htmlContent.match(/```html\n([\s\S]*?)\n```/);
    if (htmlBlockMatch) {
      actualHtmlContent = htmlBlockMatch[1];
      console.log('Extracted HTML from markdown block:', {
        extractedLength: actualHtmlContent.length,
        extractedPreview: actualHtmlContent.substring(0, 300)
      });
    }
    
    // Парсимо слайди з HTML
    const slideMatches = actualHtmlContent.match(/<div class="slide"[^>]*id="slide(\d+)"[^>]*>([\s\S]*?)<\/div>/g);
    
    console.log('Slide parsing results:', {
      slideMatches: slideMatches?.length || 0,
      matchesFound: slideMatches?.map((match, index) => ({
        index,
        matchLength: match.length,
        preview: match.substring(0, 150)
      }))
    });
    
    if (slideMatches) {
      slideMatches.forEach((slideHtml, index) => {
        const slideIdMatch = slideHtml.match(/id="slide(\d+)"/);
        const slideId = slideIdMatch ? slideIdMatch[1] : String(index + 1);
        
        // Витягуємо заголовок слайду (h1, h2)
        const titleMatch = slideHtml.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        let title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : `Слайд ${slideId}`;
        
        // Очищаємо emoji з заголовка для кращого вигляду
        title = title.replace(/[📋📝🎮📊🎉🤔🦖🎮👥⭐]/g, '').trim();
        
        // Витягуємо текстовий контент слайду
        const textMatches = slideHtml.match(/<p[^>]*>(.*?)<\/p>/gi);
        let content = '';
        if (textMatches) {
          content = textMatches
            .map(p => p.replace(/<[^>]*>/g, '').trim())
            .filter(text => text.length > 0)
            .join(' ')
            .substring(0, 100);
        }
        
        // Визначаємо тип слайду за контентом
        let type: 'title' | 'content' | 'interactive' | 'summary' = 'content';
        
        if (index === 0 || title.toLowerCase().includes('привіт') || title.toLowerCase().includes('вітаємо')) {
          type = 'title';
        } else if (title.toLowerCase().includes('гра') || slideHtml.includes('onclick=') || slideHtml.includes('button')) {
          type = 'interactive';
        } else if (index === slideMatches.length - 1 || title.toLowerCase().includes('молодці') || title.toLowerCase().includes('завершення')) {
          type = 'summary';
        }
        
        // Створюємо повний HTML для слайду з усім необхідним
        const fullSlideHTML = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        ${actualHtmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || ''}
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .slide { 
          position: relative; 
          width: 100%; 
          height: 100vh; 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          align-items: center; 
          text-align: center; 
        }
    </style>
</head>
<body>
    ${slideHtml}
    ${actualHtmlContent.includes('<script>') ? `<script>${actualHtmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] || ''}</script>` : ''}
</body>
</html>`;

        console.log(`Created slide ${slideId}:`, {
          title,
          type,
          contentLength: content.length,
          fullHTMLLength: fullSlideHTML.length,
          hasValidHTML: fullSlideHTML.includes('<!DOCTYPE'),
          slideHtmlPreview: slideHtml.substring(0, 200)
        });

        slides.push({
          id: `slide-${slideId}`,
          title: title || `Слайд ${slideId}`,
          content: content || 'Інтерактивний контент',
          htmlContent: fullSlideHTML,
          type,
          status: 'completed'
        });
      });
    } else {
      console.warn('No slide matches found in HTML content. Falling back to single slide creation.');
      // Fallback: create a single slide from the entire content if no slide divs found
      const fallbackHTML = `
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Слайд</title>
    <style>
        ${actualHtmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || ''}
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    </style>
</head>
<body>
    ${actualHtmlContent}
    ${actualHtmlContent.includes('<script>') ? `<script>${actualHtmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i)?.[1] || ''}</script>` : ''}
</body>
</html>`;
      
      slides.push({
        id: 'slide-1',
        title: lessonTitle || 'Слайд 1',
        content: 'Інтерактивний контент',
        htmlContent: fallbackHTML,
        type: 'content',
        status: 'completed'
      });
    }
    
    // Визначаємо предмет за контентом
    const content = htmlContent.toLowerCase();
    if (content.includes('динозавр')) subject = 'Природознавство';
    else if (content.includes('матем') || content.includes('число') || content.includes('додав')) subject = 'Математика';
    else if (content.includes('англій') || content.includes('english') || content.includes('кольор')) subject = 'Англійська мова';
    else if (content.includes('літер') || content.includes('букв')) subject = 'Українська мова';
    
    const lesson: SimpleLesson = {
      id: `lesson-${Date.now()}`,
      title: lessonTitle,
      description: lessonDescription,
      subject,
      ageGroup,
      duration: slides.length * 5, // 5 хвилин на слайд
      slides,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: 'ai-generated'
    };
    
    return { lesson, slides };
  }, []);

  const handleSendMessage = useCallback(async (messageText?: string, action?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      feedback: null
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputValue('');
    setIsTyping(true);

    // Update message status
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: textToSend,
          action: action,
          conversationHistory: conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);
      
      // Оновлюємо conversation history з відповіді
      if (data.conversationHistory) {
        setConversationHistory(data.conversationHistory);
      }

      let messageText = data.message;
      
      // Додаємо кнопки action до повідомлення, якщо вони є
      if (data.availableActions && data.availableActions.length > 0) {
        messageText += '\n\n**⚡ Доступні дії:**\n';
        data.availableActions.forEach((actionItem: any) => {
          messageText += `\n🔹 **${actionItem.label}** - ${actionItem.description}`;
        });
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        text: messageText,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        feedback: null,
        availableActions: data.availableActions || []
      };
      
      setMessages(prev => [...prev, aiMessage]);

      return { data, parseHTMLSlides };
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        text: 'Вибачте, сталася помилка при генерації контенту. Спробуйте ще раз.',
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered',
        feedback: null
      };
      
      setMessages(prev => [...prev, errorMessage]);
      throw error;
    }
  }, [inputValue, messages.length, conversationHistory]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return {
    messages,
    inputValue,
    isTyping,
    conversationHistory,
    setInputValue,
    handleSendMessage,
    handleKeyPress,
    messagesEndRef,
    scrollToBottom,
    parseHTMLSlides
  };
};

export default useChatLogic; 