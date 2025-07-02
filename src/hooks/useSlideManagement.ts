import { useState, useCallback, useEffect } from 'react';
import { SlideUIState, SimpleLesson, SimpleSlide, SaveLessonDialogData, Message } from '@/types/chat';
import { LessonStorage, SavedLesson } from '@/utils/localStorage';
import { generateSlideThumbnail, generateFallbackPreview } from '@/utils/slidePreview';

interface UseSlideManagementReturn {
  slideUIState: SlideUIState;
  saveDialogData: SaveLessonDialogData;
  slidePreviews: Record<string, string>;
  previewsUpdating: Set<string>;
  
  // Slide dialog functions
  openSlideDialog: (slideIndex: number) => void;
  closeSlideDialog: () => void;
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  
  // Slide selection functions
  toggleSlideSelection: (slideId: string) => void;
  selectAllSlides: () => void;
  deselectAllSlides: () => void;
  
  // Save dialog functions
  openSaveDialog: () => void;
  closeSaveDialog: () => void;
  handlePreviewSelect: (slideId: string, previewUrl: string) => void;
  updateSaveDialogData: (data: Partial<SaveLessonDialogData>) => void;
  saveSelectedSlides: (dialogData: SaveLessonDialogData) => Promise<Message>;
  
  // Slide preview functions
  generateSlidePreview: (slide: SimpleSlide, forceRegenerate?: boolean) => Promise<string>;
  regenerateSlidePreview: (slideId: string) => void;
  
  // Lesson management
  updateCurrentLesson: (lesson: SimpleLesson | null) => void;
  toggleSlidePanelOpen: () => void;
  exportLesson: () => void;
}

const useSlideManagement = (
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
): UseSlideManagementReturn => {
  
  // Slide UI States
  const [slideUIState, setSlideUIState] = useState<SlideUIState>({
    currentLesson: null,
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
        width: 320,
        height: 240,
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
      const fallbackUrl = generateFallbackPreview();
      
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

  // Функції для роботи з діалогом слайдів
  const openSlideDialog = useCallback((slideIndex: number) => {
    setSlideUIState(prev => ({
      ...prev,
      slideDialogOpen: true,
      currentSlideIndex: slideIndex
    }));
  }, []);

  const closeSlideDialog = useCallback(() => {
    setSlideUIState(prev => ({
      ...prev,
      slideDialogOpen: false
    }));
  }, []);

  const goToNextSlide = useCallback(() => {
    setSlideUIState(prev => {
      if (prev.currentLesson && prev.currentSlideIndex < prev.currentLesson.slides.length - 1) {
        return {
          ...prev,
          currentSlideIndex: prev.currentSlideIndex + 1
        };
      }
      return prev;
    });
  }, []);

  const goToPrevSlide = useCallback(() => {
    setSlideUIState(prev => {
      if (prev.currentSlideIndex > 0) {
        return {
          ...prev,
          currentSlideIndex: prev.currentSlideIndex - 1
        };
      }
      return prev;
    });
  }, []);

  // Функції для роботи з вибором слайдів
  const toggleSlideSelection = useCallback((slideId: string) => {
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
  }, []);

  const selectAllSlides = useCallback(() => {
    setSlideUIState(prev => {
      if (!prev.currentLesson) return prev;
      return {
        ...prev,
        selectedSlides: new Set(prev.currentLesson.slides.map(slide => slide.id))
      };
    });
  }, []);

  const deselectAllSlides = useCallback(() => {
    setSlideUIState(prev => ({
      ...prev,
      selectedSlides: new Set<string>()
    }));
  }, []);

  // Відкриття діалогу збереження уроку
  const openSaveDialog = useCallback(() => {
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
  }, [slideUIState.currentLesson, slideUIState.selectedSlides]);

  // Закриття діалогу збереження
  const closeSaveDialog = useCallback(() => {
    setSlideUIState(prev => ({ ...prev, saveDialogOpen: false }));
  }, []);

  // Обробка вибору превью
  const handlePreviewSelect = useCallback((slideId: string, previewUrl: string) => {
    setSaveDialogData(prev => ({
      ...prev,
      selectedPreviewId: slideId,
      previewUrl: previewUrl
    }));
  }, []);

  // Оновлення даних діалогу збереження
  const updateSaveDialogData = useCallback((data: Partial<SaveLessonDialogData>) => {
    setSaveDialogData(prev => ({ ...prev, ...data }));
  }, []);

  // Функція збереження уроку після підтвердження в діалозі
  const saveSelectedSlides = useCallback(async (dialogData: SaveLessonDialogData): Promise<Message> => {
    if (!slideUIState.currentLesson || slideUIState.selectedSlides.size === 0) {
      throw new Error('Немає уроку або вибраних слайдів');
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
        // Очищаємо вибір після збереження і закриваємо діалог
        setSlideUIState(prev => ({
          ...prev,
          selectedSlides: new Set<string>(),
          saveDialogOpen: false
        }));

        return {
          id: messages.length + 1,
          text: `✅ **Урок збережено!**\n\n📚 **"${newLesson.title}"** успішно додано до ваших матеріалів.\n\n📊 **Збережено слайдів:** ${selectedSlides.length}\n\n🎯 Ви можете знайти урок на сторінці [Мої матеріали](/materials).`,
          sender: 'ai' as const,
          timestamp: new Date(),
          status: 'sent' as const,
          feedback: null
        };
      } else {
        throw new Error('Помилка збереження в localStorage');
      }
    } catch (error) {
      console.error('Помилка збереження уроку:', error);
      throw error;
    } finally {
      setSlideUIState(prev => ({ ...prev, isSavingLesson: false }));
    }
  }, [slideUIState.currentLesson, slideUIState.selectedSlides, messages.length]);

  // Управління поточним уроком
  const updateCurrentLesson = useCallback((lesson: SimpleLesson | null) => {
    setSlideUIState(prev => ({
      ...prev,
      currentLesson: lesson
    }));
  }, []);

  // Перемикання панелі слайдів
  const toggleSlidePanelOpen = useCallback(() => {
    setSlideUIState(prev => ({
      ...prev,
      slidePanelOpen: !prev.slidePanelOpen
    }));
  }, []);

  // Експорт уроку
  const exportLesson = useCallback(() => {
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
  }, [messages, slideUIState.currentLesson?.title]);

  return {
    slideUIState,
    saveDialogData,
    slidePreviews,
    previewsUpdating,
    
    // Slide dialog functions
    openSlideDialog,
    closeSlideDialog,
    goToNextSlide,
    goToPrevSlide,
    
    // Slide selection functions
    toggleSlideSelection,
    selectAllSlides,
    deselectAllSlides,
    
    // Save dialog functions
    openSaveDialog,
    closeSaveDialog,
    handlePreviewSelect,
    updateSaveDialogData,
    saveSelectedSlides,
    
    // Slide preview functions
    generateSlidePreview,
    regenerateSlidePreview,
    
    // Lesson management
    updateCurrentLesson,
    toggleSlidePanelOpen,
    exportLesson
  };
};

export default useSlideManagement; 