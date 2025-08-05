import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { SlideUIState, SimpleLesson, SimpleSlide, SaveLessonDialogData, Message } from '@/types/chat';
import { generateMessageId } from '@/utils/messageUtils';
import { getLocalThumbnailStorage } from '@/services/slides/LocalThumbnailService';

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
  
  // Slide preview functions (simplified)
  generateSlidePreview: (slideId: string, htmlContent: string) => Promise<string>;
  regenerateSlidePreview: (slideId: string) => void;
  loadLocalPreviews: () => void;
  
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

  // Локальні превью слайдів (в пам'яті під час редагування)
  const [slidePreviews, setSlidePreviews] = useState<Record<string, string>>({});
  const [previewsUpdating, setPreviewsUpdating] = useState<Set<string>>(new Set());

  // Ref для відстеження чи панель була відкрита користувачем вручну
  const panelOpenedManuallyRef = useRef<boolean>(false);

  // Local thumbnail storage instance
  const localThumbnailStorage = getLocalThumbnailStorage();

  // === ЛОКАЛЬНЕ УПРАВЛІННЯ ПРЕВЬЮ ===

  // Спрощена функція генерації превью (тільки локально)
  const generateSlidePreview = useCallback(async (slideId: string, htmlContent: string): Promise<string> => {
    console.log('🎨 NEW PREVIEW: Генерація превью для слайду:', slideId);
    
    setPreviewsUpdating(prev => new Set(prev).add(slideId));

    try {
      // Генеруємо і зберігаємо локально
      const thumbnailBase64 = await localThumbnailStorage.generateThumbnail(slideId, htmlContent);
      
      // Оновлюємо локальний стан
      setSlidePreviews(prev => ({
        ...prev,
        [slideId]: thumbnailBase64
      }));

      console.log('✅ NEW PREVIEW: Превью згенеровано та збережено локально:', slideId);
      return thumbnailBase64;
    } catch (error) {
      console.error('❌ NEW PREVIEW: Помилка генерації:', error);
      throw error;
    } finally {
      setPreviewsUpdating(prev => {
        const newSet = new Set(prev);
        newSet.delete(slideId);
        return newSet;
      });
    }
  }, [localThumbnailStorage]);

  // Функція для регенерації превью конкретного слайду
  const regenerateSlidePreview = useCallback(async (slideId: string) => {
    if (!slideUIState.currentLesson?.slides) return;

    const slide = slideUIState.currentLesson.slides.find(s => s.id === slideId);
    if (!slide?.htmlContent) {
      console.warn('⚠️ NEW PREVIEW: Не знайдено слайд або HTML контент для:', slideId);
      return;
    }

    console.log('🔄 NEW PREVIEW: Регенерація превью для слайду:', slideId);
    
    // Видаляємо старе превью
    localThumbnailStorage.delete(slideId);
    setSlidePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[slideId];
      return newPreviews;
    });

    // Генеруємо нове
    await generateSlidePreview(slideId, slide.htmlContent);
  }, [slideUIState.currentLesson?.slides, generateSlidePreview, localThumbnailStorage]);

  // Завантаження всіх локальних превью
  const loadLocalPreviews = useCallback(() => {
    console.log('📦 NEW PREVIEW: Завантаження локальних превью');
    const allLocalPreviews = localThumbnailStorage.getAll();
    setSlidePreviews(allLocalPreviews);
  }, [localThumbnailStorage]);

  // Відстеження згенерованих превью для запобігання повторним генераціям
  const generatedPreviewsRef = useRef<Set<string>>(new Set());

  // Автоматична генерація превью тільки для нових слайдів (мемоізовано)
  const slidesForPreviews = useMemo(() => {
    if (!slideUIState.currentLesson?.slides) return [];
    
    return slideUIState.currentLesson.slides.filter(slide => 
      !slide.isPlaceholder && // Не генеруємо для плейсхолдерів
      slide.htmlContent && // Є HTML контент
      !localThumbnailStorage.has(slide.id) && // Немає локального превью
      !generatedPreviewsRef.current.has(slide.id) // Ще не генерували
    );
  }, [slideUIState.currentLesson?.slides, localThumbnailStorage]);

  // Генерація превью тільки для нових слайдів
  useEffect(() => {
    if (slidesForPreviews.length === 0) return;

    const generateNewPreviews = async () => {
      for (const slide of slidesForPreviews) {
        try {
          console.log('🆕 NEW PREVIEW: Генерація для нового слайду:', slide.id);
          generatedPreviewsRef.current.add(slide.id); // Відмічаємо як згенеровано
          await generateSlidePreview(slide.id, slide.htmlContent);
        } catch (error) {
          console.error('❌ Preview generation failed for slide:', slide.id, error);
          generatedPreviewsRef.current.delete(slide.id); // Забираємо з відміток при помилці
        }
      }
    };

    generateNewPreviews();
  }, [slidesForPreviews, generateSlidePreview]);

  // === ФУНКЦІЇ ДІАЛОГІВ ===

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
      if (!prev.currentLesson?.slides) return prev;
      const nextIndex = prev.currentSlideIndex < prev.currentLesson.slides.length - 1 
        ? prev.currentSlideIndex + 1 
        : 0;
      return {
        ...prev,
        currentSlideIndex: nextIndex
      };
    });
  }, []);

  const goToPrevSlide = useCallback(() => {
    setSlideUIState(prev => {
      if (!prev.currentLesson?.slides) return prev;
      const prevIndex = prev.currentSlideIndex > 0 
        ? prev.currentSlideIndex - 1 
        : prev.currentLesson.slides.length - 1;
      return {
        ...prev,
        currentSlideIndex: prevIndex
      };
    });
  }, []);

  // === ФУНКЦІЇ ВИБОРУ СЛАЙДІВ ===

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
    if (!slideUIState.currentLesson?.slides) return;
    
    const allSlideIds = new Set(slideUIState.currentLesson.slides.map(slide => slide.id));
    setSlideUIState(prev => ({
      ...prev,
      selectedSlides: allSlideIds
    }));
  }, [slideUIState.currentLesson?.slides]);

  const deselectAllSlides = useCallback(() => {
    setSlideUIState(prev => ({
      ...prev,
      selectedSlides: new Set<string>()
    }));
  }, []);

  // === ФУНКЦІЇ ЗБЕРЕЖЕННЯ ===

  const openSaveDialog = useCallback(() => {
    setSlideUIState(prev => ({
      ...prev,
      saveDialogOpen: true
    }));

    // Встановлюємо дефолтні дані для збереження
    if (slideUIState.currentLesson) {
      setSaveDialogData({
        title: slideUIState.currentLesson.title || '',
        description: slideUIState.currentLesson.description || '',
        subject: slideUIState.currentLesson.subject || '',
        ageGroup: slideUIState.currentLesson.ageGroup || '',
        selectedPreviewId: null,
        previewUrl: null
      });
    }
  }, [slideUIState.currentLesson]);

  const closeSaveDialog = useCallback(() => {
    setSlideUIState(prev => ({
      ...prev,
      saveDialogOpen: false
    }));
  }, []);

  const handlePreviewSelect = useCallback((slideId: string, previewUrl: string) => {
    setSaveDialogData(prev => ({
      ...prev,
      selectedPreviewId: slideId,
      previewUrl: previewUrl
    }));
  }, []);

  const updateSaveDialogData = useCallback((data: Partial<SaveLessonDialogData>) => {
    setSaveDialogData(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  // Основна функція збереження з завантаженням тільки вибраного превью в Storage
  const saveSelectedSlides = useCallback(async (dialogData: SaveLessonDialogData): Promise<Message> => {
    console.log('💾 NEW SAVE: Початок збереження презентації');
    
    if (!slideUIState.currentLesson || slideUIState.selectedSlides.size === 0) {
      throw new Error('Немає слайдів для збереження');
    }

    setSlideUIState(prev => ({ ...prev, isSavingLesson: true }));

    try {
      const selectedSlideIds = Array.from(slideUIState.selectedSlides);
      console.log('📋 NEW SAVE: Слайди для збереження:', selectedSlideIds);

      // 1. ЗАВАНТАЖУЄМО ТІЛЬКИ ВИБРАНИЙ THUMBNAIL В SUPABASE STORAGE
      let lessonThumbnailUrl: string | null = null;
      
      if (dialogData.selectedPreviewId && dialogData.previewUrl) {
        console.log('☁️ NEW SAVE: Завантаження вибраного превью в Storage:', dialogData.selectedPreviewId);
        const lessonId = `lesson_${Date.now()}`; // Тимчасовий ID для нового уроку
        
        // Завантажуємо тільки вибраний thumbnail як превью уроку
        lessonThumbnailUrl = await localThumbnailStorage.uploadToStorage(dialogData.selectedPreviewId, lessonId);
        
        console.log('📊 NEW SAVE: Превью уроку завантажено:', lessonThumbnailUrl);
      } else {
        console.log('⚠️ NEW SAVE: Превью для уроку не вибрано');
      }

      // 2. ПІДГОТОВКА ДАНИХ ДЛЯ ВІДПРАВКИ НА СЕРВЕР
      console.log('📤 NEW SAVE: Підготовка даних для відправки на сервер');
      console.log('🎯 NEW SAVE: Вибраний превью:', {
        slideId: dialogData.selectedPreviewId,
        hasPreviewUrl: !!dialogData.previewUrl,
        storageUrl: lessonThumbnailUrl
      });

      // 3. ВІДПРАВЛЯЄМО НА СЕРВЕР
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: dialogData.title,
          description: dialogData.description,
          subject: dialogData.subject,
          targetAge: dialogData.ageGroup,
          duration: slideUIState.currentLesson.duration,
          thumbnail_url: lessonThumbnailUrl, // Тільки вибраний превью
          slides: selectedSlideIds.map(slideId => {
            const slide = slideUIState.currentLesson!.slides.find(s => s.id === slideId)!;
            return {
              title: slide.title,
              description: slide.content,
              htmlContent: slide.htmlContent
            };
          })
        })
      });

      if (!response.ok) {
        throw new Error('Помилка збереження уроку на сервері');
      }

      const savedLesson = await response.json();
      console.log('✅ NEW SAVE: Урок успішно збережено:', savedLesson);

      // 4. СТВОРЮЄМО ПОВІДОМЛЕННЯ ПРО УСПІХ
      const successMessage: Message = {
        id: generateMessageId(),
        text: `✅ **Урок "${dialogData.title}" успішно збережено!**\n\n📚 **Деталі:**\n- Слайдів збережено: ${selectedSlideIds.length}\n- Предмет: ${dialogData.subject}\n- Вікова група: ${dialogData.ageGroup}\n\n🎯 Урок тепер доступний в бібліотеці матеріалів.`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, successMessage]);

      // 5. ОЧИЩУЄМО СТАН ПІСЛЯ УСПІШНОГО ЗБЕРЕЖЕННЯ
      setSlideUIState(prev => ({
        ...prev,
        selectedSlides: new Set<string>(),
        saveDialogOpen: false
      }));

      return successMessage;

    } catch (error) {
      console.error('❌ NEW SAVE: Помилка збереження:', error);
      
      const errorMessage: Message = {
        id: generateMessageId(),
        text: `❌ **Помилка збереження уроку**\n\n${error instanceof Error ? error.message : 'Невідома помилка'}\n\nСпробуйте ще раз або зверніться до підтримки.`,
        sender: 'ai',
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setSlideUIState(prev => ({ ...prev, isSavingLesson: false }));
    }
  }, [slideUIState.currentLesson, slideUIState.selectedSlides, localThumbnailStorage, setMessages]);

  // === УПРАВЛІННЯ УРОКАМИ ===

  const updateCurrentLesson = useCallback((lesson: SimpleLesson | null) => {
    console.log('🔄 NEW LESSON: Оновлення поточного уроку:', lesson?.id || 'null');
    
    setSlideUIState(prev => {
      // Скидаємо флаг ручного відкриття для нового уроку
      if (lesson && (!prev.currentLesson || lesson.id !== prev.currentLesson.id)) {
        panelOpenedManuallyRef.current = false;
        console.log('🔄 NEW LESSON: Скидаємо флаг ручного відкриття панелі');
      }
      
      return {
        ...prev,
        currentLesson: lesson
      };
    });

    // Очищуємо локальний кеш при зміні уроку
    if (lesson) {
      console.log('🧹 NEW LESSON: Очищення локального кешу для нового уроку');
      localThumbnailStorage.clear();
      setSlidePreviews({});
      generatedPreviewsRef.current.clear(); // Очищуємо трекінг згенерованих превью
    }
  }, [localThumbnailStorage]);

  // Автоматичне відкриття панелі слайдів при створенні першого слайду
  useEffect(() => {
    if (slideUIState.currentLesson?.slides && 
        slideUIState.currentLesson.slides.length > 0 && 
        !slideUIState.slidePanelOpen &&
        !panelOpenedManuallyRef.current) {
      
      console.log('🎯 NEW LESSON: Автоматично відкриваємо панель слайдів');
      
      setSlideUIState(prev => ({
        ...prev,
        slidePanelOpen: true
      }));
    }
  }, [slideUIState.currentLesson?.slides?.length, slideUIState.slidePanelOpen]);

  const toggleSlidePanelOpen = useCallback(() => {
    panelOpenedManuallyRef.current = true;
    
    setSlideUIState(prev => {
      console.log(`🔄 NEW PANEL: ${prev.slidePanelOpen ? 'Закриваємо' : 'Відкриваємо'} панель слайдів вручну`);
      return {
        ...prev,
        slidePanelOpen: !prev.slidePanelOpen
      };
    });
  }, []);

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
    
    // Slide preview functions (simplified)
    generateSlidePreview,
    regenerateSlidePreview,
    loadLocalPreviews,
    
    // Lesson management
    updateCurrentLesson,
    toggleSlidePanelOpen,
    exportLesson
  };
};

export default useSlideManagement; 