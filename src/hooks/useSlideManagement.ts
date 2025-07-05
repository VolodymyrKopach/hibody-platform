import { useState, useCallback, useEffect, useRef } from 'react';
import { SlideUIState, SimpleLesson, SimpleSlide, SaveLessonDialogData, Message } from '@/types/chat';
import { LessonStorage, SavedLesson } from '@/utils/localStorage';
import { generateSlideThumbnail, generateFallbackPreview } from '@/utils/slidePreview';
import { generateMessageId } from '@/utils/messageUtils';

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
  forceRefreshAllPreviews: () => void;
  
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

  // Refs для відстеження та запобігання нескінченним циклам
  const previewGenerationRef = useRef<Set<string>>(new Set());
  const lastUpdateTimeRef = useRef<Record<string, number>>({});
  
  // Ref для відстеження чи панель була відкрита користувачем вручну
  const panelOpenedManuallyRef = useRef<boolean>(false);

  // Функція для генерації превью слайду (оптимізована)
  const generateSlidePreview = useCallback(async (slide: SimpleSlide, forceRegenerate = false): Promise<string> => {
    // Перевіряємо чи вже генерується превью для цього слайду
    if (previewGenerationRef.current.has(slide.id) && !forceRegenerate) {
      console.log(`⏳ Превью для слайду ${slide.id} вже генерується, пропускаємо...`);
      return slidePreviews[slide.id] || '';
    }

    // Якщо превью вже існує і не потрібно регенерувати, повертаємо його
    if (slidePreviews[slide.id] && !forceRegenerate) {
      console.log(`♻️ Використовую кешоване превью для слайду ${slide.id}`);
      return slidePreviews[slide.id];
    }

    // Додаємо слайд до списку тих, що генеруються
    previewGenerationRef.current.add(slide.id);
    setPreviewsUpdating(prev => new Set(prev).add(slide.id));

    try {
      console.log(`🎯 Генеруємо превью для слайду ${slide.id}...`);
      console.log(`📄 HTML контент (перші 200 символів): ${slide.htmlContent.substring(0, 200)}...`);

      // Спрощена генерація thumbnail
      const thumbnailUrl = await generateSlideThumbnail(slide.htmlContent, {
        width: 640,
        height: 480,
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

      // Оновлюємо час останнього оновлення
      lastUpdateTimeRef.current[slide.id] = Date.now();

      return thumbnailUrl;
    } catch (error) {
      console.error(`❌ Помилка генерації превью для слайду ${slide.id}:`, error);
      
      // Генеруємо fallback превью
      console.log(`🎨 Генеруємо fallback превью для слайду ${slide.id}...`);
      const fallbackUrl = generateFallbackPreview();
      
      // Кешуємо fallback превью
      setSlidePreviews(prev => ({
        ...prev,
        [slide.id]: fallbackUrl
      }));

      console.log(`✅ Fallback превью згенеровано для слайду ${slide.id}`);
      return fallbackUrl;
    } finally {
      // Видаляємо з списку тих, що генеруються
      previewGenerationRef.current.delete(slide.id);
      setPreviewsUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(slide.id);
        return newSet;
      });
    }
  }, [slidePreviews]);

  // Оптимізований useEffect для автоматичного генерування превью
  useEffect(() => {
    if (!slideUIState.currentLesson?.slides) return;

    const generatePreviewsForSlides = async () => {
      for (const slide of slideUIState.currentLesson!.slides) {
        // Перевіряємо чи потрібно генерувати превью
        const hasPreview = !!slidePreviews[slide.id];
        const isCurrentlyGenerating = previewGenerationRef.current.has(slide.id);
        const lastUpdateTime = lastUpdateTimeRef.current[slide.id] || 0;
        const slideUpdateTime = slide.updatedAt?.getTime() || 0;
        
        // Генеруємо превью тільки якщо:
        // 1. Немає превью зовсім
        // 2. Слайд був оновлений після останнього превью
        // 3. Не генерується зараз
        const shouldGenerate = !hasPreview || 
          (slideUpdateTime > lastUpdateTime && slideUpdateTime > Date.now() - 60000); // Останні 60 секунд

        if (shouldGenerate && !isCurrentlyGenerating) {
          console.log(`🚀 Генерація превью для ${hasPreview ? 'оновленого' : 'нового'} слайду ${slide.id}`);
          
          // Генеруємо превью з невеликою затримкою для запобігання перевантаженню
          setTimeout(() => {
            generateSlidePreview(slide, hasPreview);
          }, 100);
        }
      }
    };

    generatePreviewsForSlides();
  }, [slideUIState.currentLesson?.slides, generateSlidePreview]); // Видалили slidePreviews з залежностей

  // Автоматичне відкриття панелі слайдів при створенні першого слайду
  useEffect(() => {
    // Перевіряємо чи є урок з слайдами і панель ще не відкрита
    if (slideUIState.currentLesson?.slides && 
        slideUIState.currentLesson.slides.length > 0 && 
        !slideUIState.slidePanelOpen &&
        !panelOpenedManuallyRef.current) {
      
      console.log('🎯 Автоматично відкриваємо панель слайдів для першого слайду');
      
      setSlideUIState(prev => ({
        ...prev,
        slidePanelOpen: true
      }));
    }
  }, [slideUIState.currentLesson?.slides?.length, slideUIState.slidePanelOpen]);

  // Функція для повторної генерації превью
  const regenerateSlidePreview = useCallback((slideId: string) => {
    const slide = slideUIState.currentLesson?.slides.find(s => s.id === slideId);
    if (slide) {
      console.log(`🔄 Примусова регенерація превью для слайду ${slideId}`);
      
      // Очищаємо кеш превью та час оновлення
      setSlidePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[slideId];
        return newPreviews;
      });
      
      delete lastUpdateTimeRef.current[slideId];
      
      // Генеруємо нове превью
      setTimeout(() => {
        generateSlidePreview(slide, true);
      }, 100);
    }
  }, [slideUIState.currentLesson?.slides, generateSlidePreview]);

  // Функція для примусового оновлення превью всіх слайдів
  const forceRefreshAllPreviews = useCallback(() => {
    if (slideUIState.currentLesson?.slides) {
      console.log('🔄 Примусове оновлення всіх превью слайдів');
      
      // Очищаємо весь кеш превью та часи оновлення
      setSlidePreviews({});
      lastUpdateTimeRef.current = {};
      
      // Регенеруємо всі превью з затримкою
      slideUIState.currentLesson.slides.forEach((slide, index) => {
        setTimeout(() => {
          generateSlidePreview(slide, true);
        }, index * 200); // Затримка між слайдами
      });
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
          id: generateMessageId(),
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
  }, [slideUIState.currentLesson, slideUIState.selectedSlides]);

  // Управління поточним уроком
  const updateCurrentLesson = useCallback((lesson: SimpleLesson | null) => {
    console.log('🔄 updateCurrentLesson called:', {
      newLesson: lesson ? {
        id: lesson.id,
        title: lesson.title,
        slidesCount: lesson.slides?.length || 0,
        slideIds: lesson.slides?.map(s => s.id) || []
      } : null,
      currentLesson: slideUIState.currentLesson ? {
        id: slideUIState.currentLesson.id,
        title: slideUIState.currentLesson.title,
        slidesCount: slideUIState.currentLesson.slides?.length || 0,
        slideIds: slideUIState.currentLesson.slides?.map(s => s.id) || []
      } : null
    });

    setSlideUIState(prev => {
      // Якщо новий урок з тим же ID - це оновлення існуючого уроку
      if (lesson && prev.currentLesson && lesson.id === prev.currentLesson.id) {
        console.log('🔄 Updating existing lesson with new slides');
        console.log('📊 Previous slides count:', prev.currentLesson.slides?.length || 0);
        console.log('📊 New slides count:', lesson.slides?.length || 0);
        
        // Перевіряємо чи є оновлені слайди та очищаємо їх кеш
        const updatedSlides = lesson.slides?.filter(newSlide => {
          const oldSlide = prev.currentLesson?.slides.find(s => s.id === newSlide.id);
          const isUpdated = oldSlide && newSlide.updatedAt && oldSlide.updatedAt && newSlide.updatedAt > oldSlide.updatedAt;
          const isNewlyUpdated = newSlide.updatedAt && newSlide.updatedAt > new Date(Date.now() - 30000); // Останні 30 секунд
          return isUpdated || isNewlyUpdated;
        }) || [];
        
        console.log('🔄 Updated slides detected:', updatedSlides.map(s => ({ id: s.id, updatedAt: s.updatedAt })));
        
        // Якщо є оновлені слайди, очищаємо їх кеш (превью буде згенеровано автоматично useEffect)
        if (updatedSlides.length > 0) {
          console.log('🎯 Clearing cache for updated slides');
          
          // Очищаємо кеш превью та час оновлення для оновлених слайдів
          setSlidePreviews(prevPreviews => {
            const newPreviews = { ...prevPreviews };
            updatedSlides.forEach(slide => {
              delete newPreviews[slide.id];
              delete lastUpdateTimeRef.current[slide.id];
            });
            return newPreviews;
          });
        }
        
        return {
          ...prev,
          currentLesson: lesson  // Заміщуємо повністю, оскільки lesson вже містить всі слайди
        };
      }
      
      // Інакше це новий урок
      console.log('🆕 Setting new lesson');
      
      // Скидаємо флаг ручного відкриття для нового уроку
      if (lesson && (!prev.currentLesson || lesson.id !== prev.currentLesson.id)) {
        panelOpenedManuallyRef.current = false;
        console.log('🔄 Скидаємо флаг ручного відкриття панелі для нового уроку');
      }
      
      return {
        ...prev,
        currentLesson: lesson
      };
    });
  }, [slideUIState.currentLesson]); // Видалили generateSlidePreview з залежностей

  // Перемикання панелі слайдів
  const toggleSlidePanelOpen = useCallback(() => {
    // Відмічаємо, що панель була відкрита/закрита користувачем вручну
    panelOpenedManuallyRef.current = true;
    
    setSlideUIState(prev => {
      console.log(`🔄 ${prev.slidePanelOpen ? 'Закриваємо' : 'Відкриваємо'} панель слайдів вручну`);
      return {
        ...prev,
        slidePanelOpen: !prev.slidePanelOpen
      };
    });
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
    forceRefreshAllPreviews,
    
    // Lesson management
    updateCurrentLesson,
    toggleSlidePanelOpen,
    exportLesson
  };
};

export default useSlideManagement; 