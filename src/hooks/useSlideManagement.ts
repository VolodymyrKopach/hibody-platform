import { useState, useCallback, useEffect } from 'react';
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
        width: 640,          // Збільшено на 25% (512 * 1.25 = 640)
        height: 480,         // Збільшено на 25% (384 * 1.25 = 480) - пропорції 4:3
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

  // Автоматичне генерування превью для нових слайдів та оновлення існуючих
  useEffect(() => {
    if (slideUIState.currentLesson?.slides) {
      slideUIState.currentLesson.slides.forEach(slide => {
        // Генеруємо превью для нових слайдів або слайдів з оновленим контентом
        const shouldGenerate = !slidePreviews[slide.id] || 
                              (slide.updatedAt && slide.updatedAt > new Date(Date.now() - 15000)); // Збільшено до 15 секунд
        
        if (shouldGenerate) {
          console.log(`🚀 Генерація превью для ${slidePreviews[slide.id] ? 'оновленого' : 'нового'} слайду ${slide.id}`);
          console.log(`⏰ Slide updatedAt: ${slide.updatedAt?.toISOString()}`);
          console.log(`⏰ Current time: ${new Date().toISOString()}`);
          console.log(`⏰ Time difference: ${slide.updatedAt ? (new Date().getTime() - slide.updatedAt.getTime()) / 1000 : 'N/A'} seconds`);
          
          // Аналіз HTML контенту для діагностики
          const hasImages = slide.htmlContent.includes('<img');
          const hasExternalImages = /src=["']https?:\/\//.test(slide.htmlContent);
          const hasDataImages = /src=["']data:/.test(slide.htmlContent);
          
          console.log(`📊 Аналіз слайду ${slide.id}:`, {
            hasImages,
            hasExternalImages,
            hasDataImages,
            contentLength: slide.htmlContent.length,
            isRegenerated: !!slidePreviews[slide.id]
          });
          
          // Примусово регенеруємо превью для оновлених слайдів
          generateSlidePreview(slide, !!slidePreviews[slide.id]);
        }
      });
    }
  }, [slideUIState.currentLesson?.slides, generateSlidePreview, slidePreviews]);

  // Новий useEffect для відстеження змін в уроці та примусового оновлення превью
  useEffect(() => {
    if (slideUIState.currentLesson?.slides) {
      // Перевіряємо чи є слайди, що були оновлені нещодавно
      const recentlyUpdatedSlides = slideUIState.currentLesson.slides.filter(slide => 
        slide.updatedAt && slide.updatedAt > new Date(Date.now() - 20000) // Останні 20 секунд
      );
      
      if (recentlyUpdatedSlides.length > 0) {
        console.log(`🔄 Виявлено ${recentlyUpdatedSlides.length} нещодавно оновлених слайдів:`, 
          recentlyUpdatedSlides.map(s => ({ id: s.id, updatedAt: s.updatedAt })));
        
        // Примусово оновлюємо превью для всіх нещодавно оновлених слайдів
        recentlyUpdatedSlides.forEach(slide => {
          console.log(`🎯 Примусово оновлюємо превью для слайду ${slide.id}`);
          
          // Видаляємо старе превью з кешу
          setSlidePreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[slide.id];
            return newPreviews;
          });
          
          // Генеруємо нове превью
          setTimeout(() => {
            generateSlidePreview(slide, true);
          }, 100); // Невелика затримка для очищення кешу
        });
      }
    }
  }, [slideUIState.currentLesson?.id, slideUIState.currentLesson?.slides?.length, generateSlidePreview]);

  // Функція для повторної генерації превью
  const regenerateSlidePreview = useCallback((slideId: string) => {
    const slide = slideUIState.currentLesson?.slides.find(s => s.id === slideId);
    if (slide) {
      console.log(`🔄 Примусова регенерація превью для слайду ${slideId}`);
      
      // Очищаємо кеш превью
      setSlidePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[slideId];
        return newPreviews;
      });
      
      // Генеруємо нове превью
      generateSlidePreview(slide, true);
    }
  }, [slideUIState.currentLesson?.slides, generateSlidePreview]);

  // Функція для примусового оновлення превью всіх слайдів
  const forceRefreshAllPreviews = useCallback(() => {
    if (slideUIState.currentLesson?.slides) {
      console.log('🔄 Примусове оновлення всіх превью слайдів');
      
      // Очищаємо весь кеш превью
      setSlidePreviews({});
      
      // Регенеруємо всі превью
      slideUIState.currentLesson.slides.forEach(slide => {
        setTimeout(() => {
          generateSlidePreview(slide, true);
        }, 100);
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
        
        // Перевіряємо чи є оновлені слайди
        const updatedSlides = lesson.slides?.filter(newSlide => {
          const oldSlide = prev.currentLesson?.slides.find(s => s.id === newSlide.id);
          const isUpdated = oldSlide && newSlide.updatedAt && oldSlide.updatedAt && newSlide.updatedAt > oldSlide.updatedAt;
          const isNewlyUpdated = newSlide.updatedAt && newSlide.updatedAt > new Date(Date.now() - 30000); // Останні 30 секунд
          return isUpdated || isNewlyUpdated;
        }) || [];
        
        console.log('🔄 Updated slides detected:', updatedSlides.map(s => ({ id: s.id, updatedAt: s.updatedAt })));
        
        // Якщо є оновлені слайди, примусово оновлюємо їх превью
        if (updatedSlides.length > 0) {
          console.log('🎯 Forcing preview refresh for updated slides');
          
          // Очищаємо кеш превью для оновлених слайдів
          setSlidePreviews(prevPreviews => {
            const newPreviews = { ...prevPreviews };
            updatedSlides.forEach(slide => {
              delete newPreviews[slide.id];
            });
            return newPreviews;
          });
          
          // Плануємо регенерацію превью через невелику затримку
          setTimeout(() => {
            updatedSlides.forEach(slide => {
              console.log(`🔄 Regenerating preview for updated slide ${slide.id}`);
              generateSlidePreview(slide, true);
            });
          }, 200);
        }
        
        return {
          ...prev,
          currentLesson: lesson  // Заміщуємо повністю, оскільки lesson вже містить всі слайди
        };
      }
      
      // Інакше це новий урок
      console.log('🆕 Setting new lesson');
      return {
        ...prev,
        currentLesson: lesson
      };
    });
  }, [slideUIState.currentLesson, generateSlidePreview]);

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
    forceRefreshAllPreviews,
    
    // Lesson management
    updateCurrentLesson,
    toggleSlidePanelOpen,
    exportLesson
  };
};

export default useSlideManagement; 