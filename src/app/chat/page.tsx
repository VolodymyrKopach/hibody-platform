'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
  Zoom,
  Checkbox,
  FormControlLabel,
  Divider,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { 
  Send, 
  Bot,
  User,
  Paperclip,
  Settings,
  Layers,
  MessageSquare,
  Sparkles,
  X,
  ExternalLink,
  Download,
  Play,
  ThumbsUp, 
  ThumbsDown, 
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { LessonStorage, SavedLesson } from '@/utils/localStorage';
import PreviewSelector from '@/components/PreviewSelector';
import { generateSlideThumbnail, generateFallbackPreview, hasAnimations } from '@/utils/slidePreview';

// Спрощені типи
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered';
  feedback: 'like' | 'dislike' | null;
  availableActions?: Array<{
    action: string;
    label: string;
    description: string;
  }>;
}

interface SimpleSlide {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  type: 'title' | 'content' | 'interactive' | 'summary';
  status: 'completed' | 'draft';
  previewUrl?: string; // Додаємо поле для збережених превью
}

interface SimpleLesson {
  id: string;
  title: string;
  description: string;
  subject: string;
  ageGroup: string;
  duration: number;
  slides: SimpleSlide[];
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

interface SlideUIState {
  currentLesson: SimpleLesson | null;
  selectedSlideId: string | null;
  selectedSlides: Set<string>; // Додаємо для множинного вибору слайдів
  viewMode: 'grid' | 'list';
  slidePanelOpen: boolean;
  isGenerating: boolean;
  slideDialogOpen: boolean;
  currentSlideIndex: number;
  isSavingLesson: boolean; // Додаємо стан збереження
  saveDialogOpen: boolean; // Діалог збереження уроку
}

interface SaveLessonDialogData {
  title: string;
  description: string;
  subject: string;
  ageGroup: string;
  selectedPreviewId: string | null;
  previewUrl: string | null;
}

// Markdown Renderer (спрощений)
const MarkdownRenderer = ({ content }: { content: string }) => {
  const theme = useTheme();
  
  const formatText = (text: string) => {
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Emoji bullets - залишаємо як div з емодзі
      .replace(/^🔹 (.*$)/gm, '<div class="emoji-item">🔹 $1</div>')
      
      // Звичайні списки - перетворюємо в стандартні HTML списки
      .replace(/^([-•]\s.*(?:\n[-•]\s.*)*)/gm, (match) => {
        const items = match
          .split('\n')
          .map(line => line.replace(/^[-•]\s/, '').trim())
          .filter(item => item.length > 0)
          .map(item => `<li>${item}</li>`)
          .join('');
        return `<ul>${items}</ul>`;
      })
      
      // Action items
      .replace(/^⚡ (.*$)/gm, '<div class="action-item">⚡ $1</div>')
      
      // Blockquotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      
      // Emojis
      .replace(/📋|📝|🎮|📊|🎉|🤔|🦖|👥|⭐|🦕|🦴|🥬|🏃|🥚|🔍|🌟|🎯|🔹|❓|🚀/g, '<span class="emoji">$&</span>')
      
      // Paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  };

  const processedContent = formatText(content);
  const finalContent = `<p>${processedContent}</p>`;

  return (
    <Box
      className="chat-message"
      dangerouslySetInnerHTML={{
        __html: finalContent,
      }}
      sx={{
        fontSize: '0.875rem',
        lineHeight: 1.6,
        color: theme.palette.text.primary,
        
        // Headers
        '& h1': {
          fontSize: '1.25rem',
          fontWeight: 600,
          margin: '24px 0 12px 0',
          color: theme.palette.primary.main,
          '&:first-child': { marginTop: 0 },
        },
        '& h2': {
          fontSize: '1.125rem',
          fontWeight: 600,
          margin: '20px 0 10px 0',
          color: theme.palette.primary.main,
          '&:first-child': { marginTop: 0 },
        },
        '& h3': {
          fontSize: '1rem',
          fontWeight: 600,
          margin: '16px 0 8px 0',
          color: theme.palette.primary.main,
          '&:first-child': { marginTop: 0 },
        },
        
        // Paragraphs
        '& p': {
          margin: '12px 0',
          '&:first-child': { marginTop: 0 },
          '&:last-child': { marginBottom: 0 },
          '&:empty': { display: 'none' },
        },
        
        // Стандартні HTML списки
        '& ul': {
          margin: '12px 0',
          paddingLeft: '20px',
          listStyle: 'disc',
          '& li': {
            margin: '4px 0',
            lineHeight: 1.5,
          },
        },
        
        // Emoji items
        '& .emoji-item': {
          margin: '8px 0',
          paddingLeft: '4px',
          lineHeight: 1.5,
        },
        
        // Action items
        '& .action-item': {
          margin: '12px 0',
          padding: '8px 12px',
          background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
          borderLeft: '4px solid #ff9800',
          borderRadius: '6px',
          fontWeight: 500,
          color: '#e65100',
        },
        
        // Text formatting
        '& strong': { 
          fontWeight: 600,
          color: theme.palette.primary.main,
        },
        '& em': { 
          fontStyle: 'italic',
          color: theme.palette.text.secondary,
        },
        '& code': {
          background: '#f5f5f5',
          padding: '2px 4px',
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '0.85em',
          color: '#d32f2f',
        },
        
        // Blockquotes
        '& blockquote': {
          margin: '12px 0',
          padding: '8px 12px',
          borderLeft: '4px solid #e0e0e0',
          background: '#f9f9f9',
          fontStyle: 'italic',
          color: '#666',
        },
        
        // Horizontal rules
        '& hr': {
          border: 'none',
          borderTop: '1px solid #e0e0e0',
          margin: '20px 0',
        },
        
        // Emojis
        '& .emoji': {
          fontSize: '1.1em',
          marginRight: '4px',
        },
      }}
    />
  );
};



const ChatInterface = () => {
  const theme = useTheme();
  
  // Базові стани
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
  const [showImproveMenu, setShowImproveMenu] = useState(false);
  const [improveMenuAnchor, setImproveMenuAnchor] = useState<null | HTMLElement>(null);
  const [conversationHistory, setConversationHistory] = useState<any>(null);
  
  // Slide UI States
  const [slideUIState, setSlideUIState] = useState<SlideUIState>({
    currentLesson: null, // Початково немає уроку
    selectedSlideId: null,
    selectedSlides: new Set<string>(),
    viewMode: 'grid',
    slidePanelOpen: false,
    isGenerating: false,
    slideDialogOpen: false,
    currentSlideIndex: 0,
    isSavingLesson: false,
    saveDialogOpen: false
  });

  // Стан для діалогу збереження уроку
  const [saveDialogData, setSaveDialogData] = useState<SaveLessonDialogData>({
    title: '',
    description: '',
    subject: '',
    ageGroup: '',
    selectedPreviewId: null,
    previewUrl: null
  });

  // Стан для управління превью слайдів
  const [slidePreviews, setSlidePreviews] = useState<Record<string, string>>({});
  const [previewsUpdating, setPreviewsUpdating] = useState<Set<string>>(new Set());



  // Функція для генерації превью слайду (спрощена версія)
  const generateSlidePreview = useCallback(async (slide: SimpleSlide, forceRegenerate = false): Promise<string> => {
    // Якщо превью вже існує і не потрібно регенерувати, повертаємо його
    if (slidePreviews[slide.id] && !forceRegenerate) {
      console.log(`♻️ Використовую кешоване превью для слайду ${slide.id}`);
      return slidePreviews[slide.id];
    }

    // Додаємо слайд до списку тих, що оновлюються
    setPreviewsUpdating(prev => new Set(prev).add(slide.id));

    try {
      console.log(`🎯 Генеруємо превью для слайду ${slide.id}...`);
      console.log(`📄 HTML контент (перші 200 символів): ${slide.htmlContent.substring(0, 200)}...`);

      // Спрощена генерація thumbnail без складної перевірки зображень
      const thumbnailUrl = await generateSlideThumbnail(slide.htmlContent, {
        maxWidth: 320,
        maxHeight: 240,
        quality: 0.85,
        background: '#ffffff'
      });

      console.log(`🎉 Успішно згенеровано превью для слайду ${slide.id}`);
      console.log(`📊 Розмір thumbnail: ${Math.round(thumbnailUrl.length / 1024)}KB`);

      // Кешуємо превью
      setSlidePreviews(prev => ({
        ...prev,
        [slide.id]: thumbnailUrl
      }));

      // Видаляємо з списку тих, що оновлюються
      setPreviewsUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(slide.id);
        return newSet;
      });

      return thumbnailUrl;
    } catch (error) {
      console.error(`❌ Помилка генерації превью для слайду ${slide.id}:`, error);
      
      // Генеруємо fallback превью ЗАВЖДИ через нашу функцію
      console.log(`🎨 Генеруємо fallback превью для слайду ${slide.id}...`);
      const fallbackUrl = generateFallbackPreview(slide.id);
      
      // Кешуємо fallback превью
      setSlidePreviews(prev => ({
        ...prev,
        [slide.id]: fallbackUrl
      }));

      // Видаляємо з списку тих, що оновлюються
      setPreviewsUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(slide.id);
        return newSet;
      });

      console.log(`✅ Fallback превью згенеровано для слайду ${slide.id}`);
      return fallbackUrl;
    }
  }, [slidePreviews]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Функція для парсингу слайдів з HTML коду
  const parseHTMLSlides = (htmlContent: string): { lesson: SimpleLesson, slides: SimpleSlide[] } => {
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
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Автоматичне генерування превью для нових слайдів
  useEffect(() => {
    if (slideUIState.currentLesson?.slides) {
      slideUIState.currentLesson.slides.forEach(slide => {
        if (!slidePreviews[slide.id]) {
          console.log(`🚀 Генерація превью для нового слайду ${slide.id}`);
          
          // Аналіз HTML контенту для діагностики
          const hasImages = slide.htmlContent.includes('<img');
          const hasExternalImages = /src=["']https?:\/\//.test(slide.htmlContent);
          const hasDataImages = /src=["']data:/.test(slide.htmlContent);
          
          console.log(`📊 Аналіз слайду ${slide.id}:`, {
            hasImages,
            hasExternalImages,
            hasDataImages,
            contentLength: slide.htmlContent.length
          });
          
          generateSlidePreview(slide);
        }
      });
    }
  }, [slideUIState.currentLesson?.slides, generateSlidePreview, slidePreviews]);

  // Функція для повторної генерації превью
  const regenerateSlidePreview = useCallback((slideId: string) => {
    const slide = slideUIState.currentLesson?.slides.find(s => s.id === slideId);
    if (slide) {
      generateSlidePreview(slide, true);
    }
  }, [slideUIState.currentLesson?.slides, generateSlidePreview]);

  // Обробка клавіш для навігації в діалозі слайдів
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (slideUIState.slideDialogOpen) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          goToPrevSlide();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          goToNextSlide();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          closeSlideDialog();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slideUIState.slideDialogOpen, slideUIState.currentSlideIndex]);

  const handleSendMessage = async (messageText?: string, action?: string) => {
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

      // Обробляємо структуровані дані слайду (новий підхід)
      if (data.slideData) {
        try {
          const slideData = data.slideData;
          const newSlide: SimpleSlide = {
            id: `slide_${Date.now()}`,
            title: slideData.title || 'Новий слайд',
            content: slideData.description || '',
            htmlContent: slideData.content || slideData.htmlContent || '',
            type: 'interactive',
            status: 'completed'
          };

          // Оновлюємо поточний урок з новим або замінюємо існуючий слайд
          setSlideUIState(prev => {
            const currentLesson = prev.currentLesson;
        
            if (currentLesson) {
              let updatedSlides = [...currentLesson.slides];
              
              // Перевіряємо чи це заміна існуючого слайду
              if (slideData.isReplacement && slideData.replacesSlideNumber) {
                const slideIndex = slideData.replacesSlideNumber - 1;
                if (slideIndex >= 0 && slideIndex < updatedSlides.length) {
                  // Замінюємо існуючий слайд, зберігаючи оригінальний id для правильного відстеження
                  const originalSlide = updatedSlides[slideIndex];
                  updatedSlides[slideIndex] = {
                    ...newSlide,
                    id: originalSlide.id // Зберігаємо оригінальний ID
                  };
                  console.log(`Замінено слайд ${slideData.replacesSlideNumber}:`, originalSlide.title, '→', newSlide.title);
                } else {
                  // Якщо індекс неправильний, просто додаємо як новий слайд
                  updatedSlides.push(newSlide);
                  console.warn(`Неправильний індекс слайду для заміни: ${slideIndex}, додано як новий слайд`);
                }
              } else {
                // Додаємо новий слайд до існуючого уроку
                updatedSlides.push(newSlide);
                console.log('Додано новий слайд:', newSlide.title);
              }
              
              const updatedLesson = {
                ...currentLesson,
                slides: updatedSlides,
                updatedAt: new Date()
              };
              
              return {
                ...prev,
                currentLesson: updatedLesson,
                slidePanelOpen: true,
                selectedSlideId: slideData.isReplacement ? 
                  (updatedSlides[slideData.replacesSlideNumber - 1]?.id || newSlide.id) : 
                  newSlide.id
              };
            } else {
              // Створюємо новий урок
              const newLesson: SimpleLesson = {
                id: `lesson_${Date.now()}`,
                title: 'Новий урок',
                description: 'Інтерактивний урок',
                subject: 'Загальний',
                ageGroup: '6-12 років',
                duration: 30,
                slides: [newSlide],
                createdAt: new Date(),
                updatedAt: new Date(),
                authorId: 'current_user'
              };
              
              return {
                ...prev,
                currentLesson: newLesson,
                slidePanelOpen: true,
                selectedSlideId: newSlide.id
              };
            }
          });
        } catch (error) {
          console.log('Помилка обробки даних слайду:', error);
                }
      }
      // Fallback: якщо відповідь містить HTML код (старий підхід)
      else if (data.message.includes('```html')) {
        try {
          const { lesson, slides } = parseHTMLSlides(data.message);
          
          setSlideUIState(prev => {
            const currentLesson = prev.currentLesson;
            
            // Якщо це редагування існуючого слайду (EDIT_SLIDE intent)
            if (currentLesson && data.intent === 'EDIT_SLIDE' && slides.length === 1) {
              const slideToEdit = slides[0];
              const updatedSlides = [...currentLesson.slides];
              
              // Знаходимо слайд для редагування (перший за замовчуванням)
              const slideIndex = 0; // Для "перший слайд" завжди 0
              
              if (slideIndex < updatedSlides.length) {
                // Замінюємо конкретний слайд, зберігаючи оригінальний ID
                const originalSlide = updatedSlides[slideIndex];
                updatedSlides[slideIndex] = {
                  ...slideToEdit,
                  id: originalSlide.id // Зберігаємо оригінальний ID
                };
                
                const updatedLesson = {
                  ...currentLesson,
                  slides: updatedSlides,
                  updatedAt: new Date()
                };
                
                console.log('Відредаговано слайд:', slideIndex + 1, originalSlide.title, '→', slideToEdit.title);
                
                return {
                  ...prev,
                  currentLesson: updatedLesson,
                  slidePanelOpen: true,
                  selectedSlideId: originalSlide.id
                };
              }
            }
            
            // Якщо є урок і це може бути додавання нового слайду
            if (currentLesson && slides.length === 1) {
              const newSlide = slides[0];
              const updatedSlides = [...currentLesson.slides, newSlide];
              
              const updatedLesson = {
                ...currentLesson,
                slides: updatedSlides,
                updatedAt: new Date()
              };
              
              console.log('Додано новий слайд до існуючого уроку:', newSlide.title);
              
              return {
                ...prev,
                currentLesson: updatedLesson,
                slidePanelOpen: true,
                selectedSlideId: newSlide.id
              };
            }
            
            // Тільки якщо урок не існує, створюємо новий
            if (!currentLesson) {
              return {
                ...prev,
                currentLesson: lesson,
                slidePanelOpen: true,
                selectedSlideId: lesson.slides[0]?.id || null
              };
            }
            
            // Якщо урок існує, НЕ замінюємо його
            return prev;
          });
        } catch (error) {
          console.log('Помилка парсингу HTML слайдів:', error);
        }
      }

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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFeedback = (messageId: number, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, feedback: type } : msg
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return '⏳';
      case 'sent':
        return '✓';
      case 'delivered':
        return '✓✓';
      default:
        return '';
    }
  };

  const handleImproveMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setImproveMenuAnchor(event.currentTarget);
    setShowImproveMenu(true);
  };

  const handleImproveMenuClose = () => {
    setShowImproveMenu(false);
    setImproveMenuAnchor(null);
  };

  const handleAutoImprove = () => {
    handleSendMessage('Покращ цей контент автоматично', 'auto_improve');
    setShowImproveMenu(false);
  };

  const handleManualImprove = () => {
    const comment = prompt('Напишіть що саме потрібно змінити:');
    if (comment) {
      handleSendMessage(`Покращ цей контент: ${comment}`, 'manual_improve');
    }
    setShowImproveMenu(false);
  };

  // Функції для роботи з діалогом слайдів

  const openSlideDialog = (slideIndex: number) => {
    setSlideUIState(prev => ({
      ...prev,
      slideDialogOpen: true,
      currentSlideIndex: slideIndex
    }));
  };

  const closeSlideDialog = () => {
    setSlideUIState(prev => ({
      ...prev,
      slideDialogOpen: false
    }));
  };

  const goToNextSlide = () => {
    if (slideUIState.currentLesson && slideUIState.currentSlideIndex < slideUIState.currentLesson.slides.length - 1) {
      setSlideUIState(prev => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex + 1
      }));
    }
  };

  const goToPrevSlide = () => {
    if (slideUIState.currentSlideIndex > 0) {
      setSlideUIState(prev => ({
        ...prev,
        currentSlideIndex: prev.currentSlideIndex - 1
      }));
    }
  };

  // Функції для роботи з вибором слайдів
  const toggleSlideSelection = (slideId: string) => {
    setSlideUIState(prev => {
      const newSelectedSlides = new Set(prev.selectedSlides);
      if (newSelectedSlides.has(slideId)) {
        newSelectedSlides.delete(slideId);
      } else {
        newSelectedSlides.add(slideId);
      }
      return {
        ...prev,
        selectedSlides: newSelectedSlides
      };
    });
  };

  const selectAllSlides = () => {
    if (!slideUIState.currentLesson) return;
    setSlideUIState(prev => ({
      ...prev,
      selectedSlides: new Set(prev.currentLesson?.slides.map(slide => slide.id) || [])
    }));
  };

  const deselectAllSlides = () => {
    setSlideUIState(prev => ({
      ...prev,
      selectedSlides: new Set<string>()
    }));
  };

  // Відкриття діалогу збереження уроку
  const openSaveDialog = () => {
    if (!slideUIState.currentLesson || slideUIState.selectedSlides.size === 0) {
      return;
    }

    // Заповнюємо початкові дані з поточного уроку
    setSaveDialogData({
      title: slideUIState.currentLesson.title || 'Новий урок',
      description: slideUIState.currentLesson.description || `Урок створений з ${slideUIState.selectedSlides.size} слайдів`,
      subject: slideUIState.currentLesson.subject || 'Загальне навчання',
      ageGroup: slideUIState.currentLesson.ageGroup || '6-12 років',
      selectedPreviewId: null,
      previewUrl: null
    });

    setSlideUIState(prev => ({ ...prev, saveDialogOpen: true }));
  };

  // Закриття діалогу збереження
  const closeSaveDialog = () => {
    setSlideUIState(prev => ({ ...prev, saveDialogOpen: false }));
  };

  // Обробка вибору превью
  const handlePreviewSelect = (slideId: string, previewUrl: string) => {
    setSaveDialogData(prev => ({
      ...prev,
      selectedPreviewId: slideId,
      previewUrl: previewUrl
    }));
  };

  // Функція збереження уроку після підтвердження в діалозі
  const saveSelectedSlides = async (dialogData: SaveLessonDialogData) => {
    if (!slideUIState.currentLesson || slideUIState.selectedSlides.size === 0) {
      return;
    }

    setSlideUIState(prev => ({ ...prev, isSavingLesson: true }));

    try {
      const selectedSlides = slideUIState.currentLesson.slides.filter(
        slide => slideUIState.selectedSlides.has(slide.id)
      );

      const newLessonId = `lesson_${Date.now()}`;
      let savedPreviewUrl = dialogData.previewUrl || '/images/default-lesson.png';

      // Якщо є превью, зберігаємо його як файл
      if (dialogData.previewUrl && dialogData.previewUrl.startsWith('data:image/')) {
        try {
          const previewResponse = await fetch('/api/images/preview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: dialogData.previewUrl,
              lessonId: newLessonId,
              slideId: dialogData.selectedPreviewId || 'main',
              type: 'lesson-thumbnail'
            })
          });

          if (previewResponse.ok) {
            const previewResult = await previewResponse.json();
            savedPreviewUrl = previewResult.imagePath;
            console.log('✅ Preview saved as file:', savedPreviewUrl);
          } else {
            console.warn('Failed to save preview as file, using base64');
          }
        } catch (error) {
          console.error('Error saving preview:', error);
        }
      }

      // Створюємо урок для localStorage з даними з діалогу
      const newLesson: SavedLesson = {
        id: newLessonId,
        title: dialogData.title.trim(),
        description: dialogData.description.trim(),
        subject: dialogData.subject.trim(),
        ageGroup: dialogData.ageGroup.trim(),
        duration: slideUIState.currentLesson.duration,
        slides: selectedSlides.map(slide => ({
          id: slide.id,
          title: slide.title,
          content: slide.content,
          htmlContent: slide.htmlContent,
          type: slide.type,
          status: slide.status
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        authorId: 'current-user',
        thumbnail: savedPreviewUrl,
        tags: ['створений-в-чаті', 'інтерактивний'],
        difficulty: 'easy' as const,
        views: 0,
        rating: 0,
        status: 'published' as const,
        completionRate: 0
      };

      // Зберігаємо в localStorage
      const success = LessonStorage.saveLesson(newLesson);
      
      if (success) {
        // Показуємо повідомлення про успішне збереження
        const newMessage: Message = {
          id: messages.length + 1,
          text: `✅ **Урок збережено!**\n\n📚 **"${newLesson.title}"** успішно додано до ваших матеріалів.\n\n📊 **Збережено слайдів:** ${selectedSlides.length}\n\n🎯 Ви можете знайти урок на сторінці [Мої матеріали](/materials).`,
          sender: 'ai',
          timestamp: new Date(),
          status: 'sent',
          feedback: null
        };

        setMessages(prev => [...prev, newMessage]);
        
        // Очищаємо вибір після збереження і закриваємо діалог
        setSlideUIState(prev => ({
          ...prev,
          selectedSlides: new Set<string>(),
          saveDialogOpen: false
        }));
      } else {
        throw new Error('Помилка збереження в localStorage');
      }
    } catch (error) {
      console.error('Помилка збереження уроку:', error);
      
      // Показуємо повідомлення про помилку
      const errorMessage: Message = {
        id: messages.length + 1,
        text: `❌ **Помилка збереження**\n\nНе вдалося зберегти урок. Спробуйте ще раз або зверніться до підтримки.`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
        feedback: null
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSlideUIState(prev => ({ ...prev, isSavingLesson: false }));
    }
  };

  // Slide Panel Component
  const SlidePanel = () => {
    const getSlideIcon = (type: string) => {
      switch (type) {
        case 'title': return '📋';
        case 'content': return '📝';
        case 'interactive': return '🎮';
        case 'summary': return '📊';
        default: return '📄';
    }
  };

    const renderSlideCard = (slide: SimpleSlide, index: number) => {
      const isSelected = slideUIState.selectedSlides.has(slide.id);
      const isUpdating = previewsUpdating.has(slide.id);
      
      return (
        <Paper
          key={slide.id}
          elevation={0}
          sx={{
            mb: 3,
            border: `1px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            backgroundColor: isSelected 
              ? alpha(theme.palette.primary.main, 0.08)
              : 'white',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }
          }}
        >
          {/* Превью слайду */}
          <Box sx={{ 
            position: 'relative',
            height: 160, 
            overflow: 'hidden',
            backgroundColor: alpha(theme.palette.grey[100], 0.3),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}>
            {/* Реальне превью слайду */}
            {slidePreviews[slide.id] && !isUpdating ? (
              <img
                src={slidePreviews[slide.id]}
                alt={`Превью слайду ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: isUpdating ? 0.5 : 1
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                {/* Індикатор завантаження або іконка */}
                <CircularProgress 
                  size={24} 
                  sx={{ 
                    color: theme.palette.primary.main,
                    opacity: 0.6
                  }} 
                />
                <Typography variant="caption" sx={{ 
                  mt: 1, 
                  opacity: 0.6,
                  fontSize: '0.7rem'
                }}>
                  {isUpdating ? 'Оновлення...' : 'Генерація...'}
                </Typography>
              </Box>
            )}
            
            {/* Номер слайду */}
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: alpha(theme.palette.primary.main, 0.8),
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            >
              {index + 1}
            </Typography>

            {/* Статус індикатор */}
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: slide.status === 'completed' 
                  ? theme.palette.success.main 
                  : theme.palette.warning.main,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            />

            {/* Кнопка оновлення превью */}
            {slidePreviews[slide.id] && (
              <Tooltip title={isUpdating ? "Оновлюється..." : "Оновити превью"}>
                <IconButton
                  size="small"
                  disabled={isUpdating}
                  onClick={(e) => {
                    e.stopPropagation();
                    regenerateSlidePreview(slide.id);
                  }}
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    width: 24,
                    height: 24,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    },
                    '&:disabled': {
                      opacity: 0.5
                    }
                  }}
                >
                  {isUpdating ? (
                    <CircularProgress size={12} />
                  ) : (
                    <Box component="span" sx={{ fontSize: '12px' }}>🔄</Box>
                  )}
                </IconButton>
              </Tooltip>
            )}
            
            {/* Ховер ефект */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                '&:hover': {
                  opacity: 1,
                  background: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <Box
                sx={{
                  background: theme.palette.primary.main,
                  color: 'white',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <Maximize2 size={16} />
              </Box>
            </Box>
          </Box>

          {/* Інформація про слайд */}
          <Box sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              {/* Checkbox для вибору слайду */}
              <Checkbox
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSlideSelection(slide.id);
                }}
                size="small"
                sx={{
                  p: 0.5,
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  }
                }}
              />
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  flex: 1,
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
                onClick={() => openSlideDialog(index)}
              >
                {slide.title}
              </Typography>
              {/* Кнопка перегляду */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  openSlideDialog(index);
                }}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                  }
                }}
              >
                <Maximize2 size={14} />
              </IconButton>
            </Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                ml: 3, // Відступ від checkbox
                fontSize: '0.75rem'
              }}
            >
              {slide.content}
            </Typography>
          </Box>
        </Paper>
      );
    };

    return (
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Слайди уроку
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {slideUIState.currentLesson && (
              <Tooltip title="Експортувати урок">
                <IconButton
                  onClick={() => {
                    // Знаходимо останнє повідомлення з HTML
                    const htmlMessage = messages.find(msg => 
                      msg.sender === 'ai' && msg.text.includes('```html')
                    );
                    if (htmlMessage) {
                      const htmlMatch = htmlMessage.text.match(/```html\n([\s\S]*?)\n```/);
                      if (htmlMatch) {
                        const blob = new Blob([htmlMatch[1]], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${slideUIState.currentLesson?.title.replace(/[^a-zA-Z0-9]/g, '-') || 'lesson'}.html`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }
                    }
                  }}
                  size="small"
                  sx={{ color: 'primary.main' }}
                >
                  <Download size={16} />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              onClick={() => setSlideUIState(prev => ({ ...prev, slidePanelOpen: false }))}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <X size={16} />
            </IconButton>
          </Box>
        </Box>

        {slideUIState.currentLesson ? (
          <>
            {/* Інформація про урок */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.primary.main, 0.04), borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                {slideUIState.currentLesson.title}
                  </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {slideUIState.currentLesson.description}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                  label={slideUIState.currentLesson.subject} 
                    size="small"
                    color="primary"
                    variant="outlined"
                />
                <Chip 
                  label={slideUIState.currentLesson.ageGroup} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
                <Chip 
                  label={`${slideUIState.currentLesson.duration} хв`} 
                  size="small" 
                  variant="outlined"
                  />
                </Box>
            </Paper>
            
            {/* Панель керування вибором */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, backgroundColor: alpha(theme.palette.grey[50], 0.5), borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Вибрано: <strong>{slideUIState.selectedSlides.size}</strong> з <strong>{slideUIState.currentLesson.slides.length}</strong> слайдів
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={selectAllSlides}
                    disabled={slideUIState.selectedSlides.size === slideUIState.currentLesson.slides.length}
                  >
                    Вибрати всі
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={deselectAllSlides}
                    disabled={slideUIState.selectedSlides.size === 0}
                  >
                    Очистити
                  </Button>
                </Box>
              </Box>
              
              {/* Кнопка збереження */}
              {slideUIState.selectedSlides.size > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={openSaveDialog}
                    disabled={slideUIState.isSavingLesson}
                    startIcon={slideUIState.isSavingLesson ? <LinearProgress /> : null}
                    sx={{
                      px: 4,
                      py: 1,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    {slideUIState.isSavingLesson ? 'Збереження...' : `Зберегти урок (${slideUIState.selectedSlides.size} слайдів)`}
                  </Button>
                </Box>
              )}
            </Paper>
            
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {slideUIState.currentLesson.slides.map((slide, index) => renderSlideCard(slide, index))}
              </Box>
          </>
        ) : (
          /* Заохочення до створення першого уроку */
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            textAlign: 'center',
            p: 3
          }}>
            <Box sx={{ fontSize: '4rem', mb: 2 }}>🎨</Box>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Створіть свій перший урок!
                </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Просто напишіть в чаті що ви хочете створити, наприклад:
            </Typography>
            
            <Paper elevation={0} sx={{ 
              p: 2, 
              mb: 3, 
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
              borderRadius: 2,
              width: '100%'
            }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                💡 "Створи урок про космос для дітей 7 років"
                        </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
                📚 "Зроби урок математики про додавання"
                      </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
                🌈 "Урок англійської про кольори"
              </Typography>
            </Paper>
            
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              ✨ Після створення уроку тут з'являться всі слайди з можливістю перегляду та редагування
            </Typography>
                </Box>
        )}
              </Box>
    );
  };

  // Компонент контенту слайду (оптимізований)
  const SlideContent = React.memo(({ htmlContent }: { htmlContent: string }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    
    // Debug logging to see what content we're receiving
    useEffect(() => {
      console.log('SlideContent received htmlContent:', {
        content: htmlContent,
        length: htmlContent?.length,
        isValidHTML: htmlContent?.includes('<html') || htmlContent?.includes('<!DOCTYPE'),
        preview: htmlContent?.substring(0, 200) + '...'
      });
    }, [htmlContent]);
    
    useEffect(() => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = htmlContent;
      }
    }, [htmlContent]);

    return (
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'white',
        }}
      />
    );
  });

  SlideContent.displayName = 'SlideContent';

  // Мемоізований заголовок діалогу
  const SlideDialogHeader = React.memo(({ 
    title, 
    currentIndex, 
    totalSlides, 
    hasNext, 
    hasPrev 
  }: {
    title: string;
    currentIndex: number;
    totalSlides: number;
    hasNext: boolean;
    hasPrev: boolean;
  }) => (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        background: alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        p: 2,
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Chip
          label={`${currentIndex + 1} з ${totalSlides}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
          ← → для навігації • Esc для закриття
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Попередній слайд">
          <IconButton
            onClick={goToPrevSlide}
            disabled={!hasPrev}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
              '&:disabled': {
                backgroundColor: alpha(theme.palette.grey[300], 0.5),
              }
            }}
          >
            <ChevronLeft size={20} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Наступний слайд">
          <IconButton
            onClick={goToNextSlide}
            disabled={!hasNext}
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              },
              '&:disabled': {
                backgroundColor: alpha(theme.palette.grey[300], 0.5),
              }
            }}
          >
            <ChevronRight size={20} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Закрити">
          <IconButton
            onClick={closeSlideDialog}
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.2),
              }
            }}
          >
            <X size={20} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  ));

  SlideDialogHeader.displayName = 'SlideDialogHeader';

  // Компонент діалогу слайдів
  const SlideDialog = () => {
    if (!slideUIState.currentLesson || !slideUIState.slideDialogOpen) return null;

    const currentSlide = slideUIState.currentLesson.slides[slideUIState.currentSlideIndex];
    if (!currentSlide) return null;
    
    const hasNext = slideUIState.currentSlideIndex < slideUIState.currentLesson.slides.length - 1;
    const hasPrev = slideUIState.currentSlideIndex > 0;

    return (
      <Dialog
        open={slideUIState.slideDialogOpen}
        onClose={closeSlideDialog}
        maxWidth={false}
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            width: '95vw',
            height: '95vh',
            maxWidth: 'none',
            margin: '2.5vh auto',
            borderRadius: '16px',
            overflow: 'hidden',
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', height: '100%' }}>
          <SlideDialogHeader
            title={currentSlide.title}
            currentIndex={slideUIState.currentSlideIndex}
            totalSlides={slideUIState.currentLesson.slides.length}
            hasNext={hasNext}
            hasPrev={hasPrev}
          />

          {/* Контент слайду */}
          <Box sx={{ width: '100%', height: '100%', pt: '80px', position: 'relative' }}>
            <SlideContent htmlContent={currentSlide.htmlContent} />
              </Box>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Layout title="AI Чат" noPadding>
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', backgroundColor: theme.palette.background.default }}>
        {/* Chat Area */}
        <Box sx={{ 
          flex: 1,
            display: 'flex', 
            flexDirection: 'column',
          minWidth: 0
          }}>
          {/* Chat Header */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 0,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                    width: 48,
                    height: 48,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <Bot size={24} color="white" />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Помічник Вчителя
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: theme.palette.success.main,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Онлайн • Готовий створювати уроки
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Header Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={slideUIState.slidePanelOpen ? "Сховати слайди" : "Показати слайди"}>
                  <Box sx={{ position: 'relative' }}>
                    <IconButton
                      onClick={() => setSlideUIState(prev => ({ ...prev, slidePanelOpen: !prev.slidePanelOpen }))}
                      sx={{
                        backgroundColor: slideUIState.slidePanelOpen ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                        color: slideUIState.slidePanelOpen ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                        }
                      }}
                    >
                      <Layers size={18} />
                    </IconButton>
                    {slideUIState.currentLesson && slideUIState.currentLesson.slides && slideUIState.currentLesson.slides.length > 0 && !slideUIState.slidePanelOpen && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: theme.palette.error.main,
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.5 },
                            '100%': { opacity: 1 },
                          }
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
                
                <Tooltip title="Налаштування">
                  <IconButton sx={{ color: 'text.secondary' }}>
                    <Settings size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, backgroundColor: theme.palette.background.default }}>
            <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
              {messages.map((message) => (
                <Fade in timeout={300} key={message.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 2,
                        maxWidth: '80%',
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: message.sender === 'user' 
                            ? theme.palette.secondary.main 
                            : theme.palette.primary.main,
                        }}
                      >
                        {message.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                      </Avatar>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          backgroundColor: message.sender === 'user' 
                            ? theme.palette.primary.main 
                            : 'white',
                          color: message.sender === 'user' ? 'white' : 'text.primary',
                          border: message.sender === 'ai' ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none',
                          boxShadow: message.sender === 'user' 
                            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                            : '0 2px 12px rgba(0,0,0,0.06)',
                        }}
                                              >
                          <MarkdownRenderer content={message.text} />

                        {/* Action Buttons */}
                        {message.sender === 'ai' && message.availableActions && message.availableActions.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {message.availableActions.map((actionItem, index) => (
                                <Button
                                key={index}
                                variant="outlined"
                                  size="small"
                                onClick={() => handleSendMessage(actionItem.label, actionItem.action)}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                  fontSize: '0.875rem',
                                  color: theme.palette.primary.main,
                                  borderColor: alpha(theme.palette.primary.main, 0.3),
                                    '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                    }
                                  }}
                                >
                                {actionItem.label}
                                </Button>
                            ))}
                          </Box>
                        )}

                        {/* Message Status */}
                        {message.sender === 'user' && (
                          <Box sx={{ textAlign: 'right', mt: 1 }}>
                            <Typography variant="caption" sx={{ opacity: 0.7 }}>
                              {getStatusIcon(message.status)}
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Box>
                  </Box>
                </Fade>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <Fade in>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, maxWidth: '80%' }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: theme.palette.primary.main,
                        }}
                      >
                        <Bot size={18} />
                      </Avatar>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          borderRadius: '16px',
                          backgroundColor: 'white',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Друкую...
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                </Fade>
              )}
              
              <div ref={messagesEndRef} />
            </Box>
          </Box>

          {/* Input Area */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 0,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишіть про який урок ви мрієте (предмет, вік дітей, тема)..."
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                    '&.Mui-focused': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.06),
                    }
                  }
                }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Прикріпити файл">
                  <IconButton color="primary" size="large">
                    <Paperclip size={20} />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  disabled={!inputValue.trim() || isTyping}
                  sx={{
                    minWidth: 56,
                    height: 56,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
                    },
                    '&:disabled': {
                      background: theme.palette.grey[300],
                    }
                  }}
                >
                  <Send size={20} />
                </Button>
              </Box>
            </Box>
          </Paper>
          </Box>

        {/* Right Slide Panel */}
        {slideUIState.slidePanelOpen && (
          <Paper
          elevation={0}
          sx={{
              width: 400,
            borderRadius: 0,
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
          }}
        >
            <SlidePanel />
                </Paper>
                            )}
                          </Box>

      {/* Діалог слайдів */}
      <SlideDialog />

      {/* Діалог збереження уроку */}
      <Dialog
        open={slideUIState.saveDialogOpen}
        onClose={closeSaveDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.95) 100%)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 2, 
          pt: 3,
          px: 3,
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
          borderRadius: '16px 16px 0 0',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: '16px', 
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            minWidth: 56,
            minHeight: 56
          }}>
            💾
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              mb: 0.5,
              fontSize: '1.3rem'
            }}>
              Зберегти урок
            </Typography>
            <Typography variant="body2" sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem',
              lineHeight: 1.4
            }}>
              Налаштуйте інформацію про ваш урок перед збереженням
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 4, pb: 3, px: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {/* Назва уроку */}
            <TextField
              label="📚 Назва уроку"
              variant="outlined"
              fullWidth
              value={saveDialogData.title}
              onChange={(e) => setSaveDialogData(prev => ({ ...prev, title: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                  '&.Mui-focused': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem',
                  fontWeight: 500
                }
              }}
              placeholder="Введіть назву уроку"
              required
            />

            {/* Опис уроку */}
            <TextField
              label="📝 Опис уроку"
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              value={saveDialogData.description}
              onChange={(e) => setSaveDialogData(prev => ({ ...prev, description: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                  '&.Mui-focused': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem',
                  fontWeight: 500
                }
              }}
              placeholder="Короткий опис змісту та мети уроку"
            />

            {/* Предмет/жанр */}
            <TextField
              label="🎯 Предмет/Жанр"
              variant="outlined"
              fullWidth
              select
              value={saveDialogData.subject}
              onChange={(e) => setSaveDialogData(prev => ({ ...prev, subject: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                  '&.Mui-focused': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem',
                  fontWeight: 500
                }
              }}
            >
              <MenuItem value="Математика">🔢 Математика</MenuItem>
              <MenuItem value="Українська мова">🇺🇦 Українська мова</MenuItem>
              <MenuItem value="Англійська мова">🇬🇧 Англійська мова</MenuItem>
              <MenuItem value="Природознавство">🌿 Природознавство</MenuItem>
              <MenuItem value="Історія">📜 Історія</MenuItem>
              <MenuItem value="Географія">🌍 Географія</MenuItem>
              <MenuItem value="Фізика">⚡ Фізика</MenuItem>
              <MenuItem value="Хімія">🧪 Хімія</MenuItem>
              <MenuItem value="Біологія">🧬 Біологія</MenuItem>
              <MenuItem value="Мистецтво">🎨 Мистецтво</MenuItem>
              <MenuItem value="Музика">🎵 Музика</MenuItem>
              <MenuItem value="Фізкультура">⚽ Фізкультура</MenuItem>
              <MenuItem value="Інформатика">💻 Інформатика</MenuItem>
              <MenuItem value="Трудове навчання">🔨 Трудове навчання</MenuItem>
              <MenuItem value="Загальне навчання">📚 Загальне навчання</MenuItem>
            </TextField>

            {/* Вікова група */}
            <TextField
              label="👥 Вікова група"
              variant="outlined"
              fullWidth
              select
              value={saveDialogData.ageGroup}
              onChange={(e) => setSaveDialogData(prev => ({ ...prev, ageGroup: e.target.value }))}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                  '&.Mui-focused': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.06),
                  }
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1rem',
                  fontWeight: 500
                }
              }}
            >
              <MenuItem value="3-5 років">🍼 3-5 років (дошкільна)</MenuItem>
              <MenuItem value="6-7 років">🎒 6-7 років (1 клас)</MenuItem>
              <MenuItem value="8-9 років">📖 8-9 років (2-3 класи)</MenuItem>
              <MenuItem value="10-11 років">🧮 10-11 років (4-5 класи)</MenuItem>
              <MenuItem value="12-13 років">🔬 12-13 років (6-7 класи)</MenuItem>
              <MenuItem value="14-15 років">🎓 14-15 років (8-9 класи)</MenuItem>
              <MenuItem value="16-18 років">🎯 16-18 років (10-11 класи)</MenuItem>
              <MenuItem value="Всі вікові групи">🌈 Всі вікові групи</MenuItem>
            </TextField>

            {/* Превью селектор */}
            {slideUIState.currentLesson && slideUIState.selectedSlides.size > 0 && (
              <PreviewSelector
                slides={slideUIState.currentLesson.slides
                  .filter(slide => slideUIState.selectedSlides.has(slide.id))
                  .map(slide => ({
                    id: slide.id,
                    title: slide.title,
                    htmlContent: slide.htmlContent,
                    type: slide.type
                  }))
                }
                selectedPreviewId={saveDialogData.selectedPreviewId}
                onPreviewSelect={handlePreviewSelect}
                disabled={slideUIState.isSavingLesson}
                cachedPreviews={slidePreviews}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          pt: 2, 
          gap: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.grey[50], 0.5)
        }}>
          <Button 
            onClick={closeSaveDialog} 
            sx={{ 
              textTransform: 'none',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.grey[400], 0.1),
                color: theme.palette.text.primary
              }
            }}
          >
            Скасувати
          </Button>
          <Button 
            onClick={() => saveSelectedSlides(saveDialogData)}
            variant="contained"
            disabled={!saveDialogData.title.trim() || slideUIState.isSavingLesson}
            startIcon={slideUIState.isSavingLesson ? <LinearProgress /> : null}
            sx={{ 
              textTransform: 'none',
              borderRadius: 3,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: theme.palette.grey[300],
                color: theme.palette.grey[500],
                boxShadow: 'none'
              }
            }}
          >
            {slideUIState.isSavingLesson ? 'Збереження...' : 'Зберегти урок'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu покращення */}
      <Menu
        anchorEl={improveMenuAnchor}
        open={showImproveMenu}
        onClose={handleImproveMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem onClick={handleAutoImprove}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Sparkles size={18} />
            <Typography>Покращити автоматично</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleManualImprove}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MessageSquare size={18} />
            <Typography>Покращити з коментарем</Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Layout>
  );
};

export default ChatInterface; 