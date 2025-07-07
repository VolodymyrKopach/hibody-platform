import { useState, useCallback, useEffect, useRef } from 'react';
import { SlideUIState, SimpleLesson, SimpleSlide, SaveLessonDialogData, Message } from '@/types/chat';
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

  // Додаємо ref для зберігання поточних превью
  const slidePreviewsRef = useRef<Record<string, string>>({});
  
  // Синхронізуємо ref з state
  useEffect(() => {
    slidePreviewsRef.current = slidePreviews;
  }, [slidePreviews]);

  // Функція для генерації превью слайду (оптимізована)
  const generateSlidePreview = useCallback(async (slide: SimpleSlide, forceRegenerate = false): Promise<string> => {
    // Перевіряємо чи вже генерується превью для цього слайду
    if (previewGenerationRef.current.has(slide.id) && !forceRegenerate) {
      console.log(`⏳ Превью для слайду ${slide.id} вже генерується, пропускаємо...`);
      return slidePreviewsRef.current[slide.id] || '';
    }

    // Якщо превью вже існує і не потрібно регенерувати, повертаємо його
    if (slidePreviewsRef.current[slide.id] && !forceRegenerate) {
      console.log(`♻️ Використовую кешоване превью для слайду ${slide.id}`);
      return slidePreviewsRef.current[slide.id];
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
  }, []);

  // Ref для відстеження останньої обробленої версії слайдів
  const processedSlidesRef = useRef<Set<string>>(new Set());

  // Оптимізований useEffect для автоматичного генерування превью
  useEffect(() => {
    if (!slideUIState.currentLesson?.slides) return;

    const generatePreviewsForSlides = async () => {
      for (const slide of slideUIState.currentLesson!.slides) {
        // Перевіряємо чи потрібно генерувати превью
        const isCurrentlyGenerating = previewGenerationRef.current.has(slide.id);
        const lastUpdateTime = lastUpdateTimeRef.current[slide.id] || 0;
        const slideUpdateTime = slide.updatedAt?.getTime() || 0;
        
        // Отримуємо поточне превью з ref (не з state!)
        const hasPreview = !!slidePreviewsRef.current[slide.id];
        const wasProcessed = processedSlidesRef.current.has(slide.id);
        
        // Генеруємо превью тільки якщо:
        // 1. Немає превью зовсім І слайд ще не обробляли
        // 2. Слайд був оновлений після останнього превью (протягом останніх 60 секунд)
        // 3. Не генерується зараз
        const shouldGenerate = (!hasPreview && !wasProcessed) || 
          (slideUpdateTime > lastUpdateTime && slideUpdateTime > Date.now() - 60000);

        if (shouldGenerate && !isCurrentlyGenerating) {
          console.log(`🚀 Генерація превью для ${hasPreview ? 'оновленого' : 'нового'} слайду ${slide.id}`);
          
          // Позначаємо слайд як оброблений
          processedSlidesRef.current.add(slide.id);
          
          // Генеруємо превью з невеликою затримкою для запобігання перевантаженню
          setTimeout(() => {
            generateSlidePreview(slide, hasPreview);
          }, 100);
        }
      }
    };

    generatePreviewsForSlides();
  }, [slideUIState.currentLesson?.slides]);

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
      
      // Видаляємо з processed slides щоб можна було регенерувати
      processedSlidesRef.current.delete(slideId);
      
      // Генеруємо нове превью
      setTimeout(() => {
        generateSlidePreview(slide, true);
      }, 100);
    }
  }, [slideUIState.currentLesson?.slides]);

  // Функція для примусового оновлення превью всіх слайдів
  const forceRefreshAllPreviews = useCallback(() => {
    if (slideUIState.currentLesson?.slides) {
      console.log('🔄 Примусове оновлення всіх превью слайдів');
      
      // Очищаємо весь кеш превью та часи оновлення
      setSlidePreviews({});
      lastUpdateTimeRef.current = {};
      
      // Очищаємо processed slides щоб можна було регенерувати всі
      processedSlidesRef.current.clear();
      
      // Регенеруємо всі превью з затримкою
      slideUIState.currentLesson.slides.forEach((slide, index) => {
        setTimeout(() => {
          generateSlidePreview(slide, true);
        }, index * 200); // Затримка між слайдами
      });
    }
  }, [slideUIState.currentLesson?.slides]);

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

    console.log('💾 OPEN SAVE DIALOG: Dialog opening with lesson data:', {
      lessonTitle: slideUIState.currentLesson.title,
      lessonSubject: slideUIState.currentLesson.subject,
      lessonAgeGroup: slideUIState.currentLesson.ageGroup,
      selectedSlidesCount: slideUIState.selectedSlides.size,
      currentSlidePreviewsCount: Object.keys(slidePreviews).length,
      availablePreviews: Object.keys(slidePreviews),
      firstSlideId: slideUIState.currentLesson.slides?.[0]?.id
    });

    // Заповнюємо початкові дані з поточного уроку
    setSaveDialogData({
      title: slideUIState.currentLesson.title || 'Новий урок',
      description: slideUIState.currentLesson.description || `Урок створений з ${slideUIState.selectedSlides.size} слайдів`,
      subject: slideUIState.currentLesson.subject || 'Загальне навчання',
      ageGroup: slideUIState.currentLesson.ageGroup || '8-9 років',
      selectedPreviewId: null,
      previewUrl: null
    });

    setSlideUIState(prev => ({ ...prev, saveDialogOpen: true }));
  }, [slideUIState.currentLesson, slideUIState.selectedSlides, slidePreviews]);

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
    console.log('💾 SAVE LESSON: Starting save process...');
    console.log('📋 SAVE LESSON: Dialog data received:', {
      title: dialogData.title,
      description: dialogData.description,
      subject: dialogData.subject,
      ageGroup: dialogData.ageGroup,
      selectedPreviewId: dialogData.selectedPreviewId,
      hasPreviewUrl: !!dialogData.previewUrl,
      previewUrlType: dialogData.previewUrl?.startsWith('data:image/') ? 'base64' : 'url'
    });

    if (!slideUIState.currentLesson || slideUIState.selectedSlides.size === 0) {
      console.error('❌ SAVE LESSON: No lesson or selected slides');
      throw new Error('Немає уроку або вибраних слайдів');
    }

    console.log('📊 SAVE LESSON: Current lesson state:', {
      lessonId: slideUIState.currentLesson.id,
      lessonTitle: slideUIState.currentLesson.title,
      totalSlides: slideUIState.currentLesson.slides.length,
      selectedSlidesCount: slideUIState.selectedSlides.size,
      selectedSlideIds: Array.from(slideUIState.selectedSlides)
    });

    setSlideUIState(prev => ({ ...prev, isSavingLesson: true }));

    try {
      const selectedSlides = slideUIState.currentLesson.slides.filter(
        slide => slideUIState.selectedSlides.has(slide.id)
      );

      console.log('🎯 SAVE LESSON: Selected slides for saving:', selectedSlides.map(slide => ({
        id: slide.id,
        title: slide.title,
        type: slide.type,
        hasContent: !!slide.content,
        hasHtmlContent: !!slide.htmlContent,
        contentLength: slide.content?.length || 0,
        htmlContentLength: slide.htmlContent?.length || 0
      })));

      const newLessonId = `lesson_${Date.now()}`;
      let savedPreviewUrl = dialogData.previewUrl || '/images/default-lesson.png';

      console.log('🆔 SAVE LESSON: Generated lesson ID:', newLessonId);
      console.log('🖼️ SAVE LESSON: Initial preview URL:', savedPreviewUrl);
      console.log('🔍 SAVE LESSON: Preview URL analysis:', {
        hasPreviewUrl: !!dialogData.previewUrl,
        isDataUrl: dialogData.previewUrl?.startsWith('data:image/'),
        previewUrlLength: dialogData.previewUrl?.length || 0,
        selectedPreviewId: dialogData.selectedPreviewId,
        hasSelectedPreviewId: !!dialogData.selectedPreviewId
      });

      // Якщо є превью, зберігаємо його як файл
      if (dialogData.previewUrl && dialogData.previewUrl.startsWith('data:image/')) {
        console.log('📸 SAVE LESSON: Saving preview image as file...');
        console.log('📏 SAVE LESSON: Preview data size:', Math.round(dialogData.previewUrl.length / 1024), 'KB');
        
        try {
          const previewRequestData = {
            imageData: dialogData.previewUrl,
            lessonId: newLessonId,
            slideId: dialogData.selectedPreviewId || 'main',
            type: 'lesson-thumbnail'
          };
          
          console.log('📤 SAVE LESSON: Sending preview save request:', {
            lessonId: previewRequestData.lessonId,
            slideId: previewRequestData.slideId,
            type: previewRequestData.type,
            imageDataSize: Math.round(previewRequestData.imageData.length / 1024) + 'KB'
          });

          const previewResponse = await fetch('/api/images/preview', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(previewRequestData)
          });

          if (previewResponse.ok) {
            const previewResult = await previewResponse.json();
            savedPreviewUrl = previewResult.imagePath;
            console.log('✅ SAVE LESSON: Preview saved as file:', savedPreviewUrl);
          } else {
            const errorText = await previewResponse.text();
            console.warn('⚠️ SAVE LESSON: Failed to save preview as file:', {
              status: previewResponse.status,
              statusText: previewResponse.statusText,
              error: errorText
            });
            console.warn('📋 SAVE LESSON: Using base64 preview instead');
          }
        } catch (error) {
          console.error('❌ SAVE LESSON: Error saving preview:', error);
        }
      }

      // Підготовка даних для API
      const lessonRequestData = {
        title: dialogData.title.trim(),
        description: dialogData.description.trim(),
        subject: dialogData.subject.trim(),
        targetAge: dialogData.ageGroup.trim(),
        duration: slideUIState.currentLesson.duration,
        thumbnail_url: savedPreviewUrl,
        slides: selectedSlides.map((slide, index) => ({
          title: slide.title,
          description: slide.content,
          htmlContent: slide.htmlContent,
          type: slide.type,
          slideNumber: index + 1
        }))
      };

      console.log('📤 SAVE LESSON: Sending lesson save request to API:', {
        title: lessonRequestData.title,
        description: lessonRequestData.description,
        subject: lessonRequestData.subject,
        targetAge: lessonRequestData.targetAge,
        duration: lessonRequestData.duration,
        thumbnail_url: lessonRequestData.thumbnail_url,
        slidesCount: lessonRequestData.slides.length,
        slidesData: lessonRequestData.slides.map(slide => ({
          title: slide.title,
          type: slide.type,
          slideNumber: slide.slideNumber,
          hasDescription: !!slide.description,
          hasHtmlContent: !!slide.htmlContent,
          descriptionLength: slide.description?.length || 0,
          htmlContentLength: slide.htmlContent?.length || 0
        }))
      });

      // Створюємо урок через API (база даних)
      const lessonResponse = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lessonRequestData)
      });

      console.log('📡 SAVE LESSON: API response status:', lessonResponse.status, lessonResponse.statusText);

      if (!lessonResponse.ok) {
        const errorData = await lessonResponse.json();
        console.error('❌ SAVE LESSON: API error:', {
          status: lessonResponse.status,
          statusText: lessonResponse.statusText,
          errorData
        });
        throw new Error(errorData.error?.message || 'Помилка збереження уроку');
      }

      const result = await lessonResponse.json();
      console.log('✅ SAVE LESSON: Lesson saved to database successfully!');
      console.log('📊 SAVE LESSON: API response:', {
        success: result.success,
        message: result.message,
        lessonId: result.lesson?.id,
        lessonTitle: result.lesson?.title,
        slidesCount: result.lesson?.slides?.length || 0
      });

      // Очищаємо вибір після збереження і закриваємо діалог
      setSlideUIState(prev => ({
        ...prev,
        selectedSlides: new Set<string>(),
        saveDialogOpen: false
      }));

      console.log('🎉 SAVE LESSON: Process completed successfully');

      return {
        id: generateMessageId(),
        text: `✅ **Урок збережено в базу даних!**\n\n📚 **"${dialogData.title}"** успішно додано до ваших матеріалів.\n\n📊 **Збережено слайдів:** ${selectedSlides.length}\n\n🎯 Ви можете знайти урок на сторінці [Мої матеріали](/materials).`,
        sender: 'ai' as const,
        timestamp: new Date(),
        status: 'sent' as const,
        feedback: null
      };

    } catch (error) {
      console.error('❌ SAVE LESSON: Error during save process:', error);
      throw error;
    } finally {
      setSlideUIState(prev => ({ ...prev, isSavingLesson: false }));
      console.log('🏁 SAVE LESSON: Cleanup completed');
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
  }, [slideUIState.currentLesson]);

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