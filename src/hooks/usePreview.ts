import { useState, useCallback, useMemo } from 'react';
import { 
  PreviewState, 
  PreviewData, 
  PreviewElement, 
  AgeGroupConfig, 
  FormValues,
  IPreviewGenerator
} from '@/types/generation';

// === SOLID: SRP - Генератор превю ===

/**
 * Генератор превю для системи генерації
 * SOLID: SRP - відповідає тільки за генерацію превю
 * SOLID: DIP - реалізує інтерфейс IPreviewGenerator
 */
class PreviewGenerator implements IPreviewGenerator {
  /**
   * Генерувати превю для вікової групи
   * SOLID: SRP - одна відповідальність: генерувати превю
   */
  generatePreview(ageGroup: AgeGroupConfig, values: FormValues): PreviewData {
    return {
      ageGroup,
      characteristics: {
        fontSize: ageGroup.fontSize,
        layout: ageGroup.layout,
        audio: ageGroup.audio,
        estimatedDuration: ageGroup.timeRange
      },
      sampleSlide: this.generateSampleSlide(ageGroup, values)
    };
  }

  /**
   * Генерувати приклад слайду
   * SOLID: SRP - одна відповідальність: генерувати слайд
   */
  generateSampleSlide(ageGroup: AgeGroupConfig, values: FormValues = {}): any {
    const elements = this.generateSampleElements(ageGroup);
    const title = this.generateSampleTitle(ageGroup, values);
    const content = this.generateSampleContent(ageGroup, values);

    return {
      title,
      content,
      elements
    };
  }

  /**
   * Генерувати елементи слайду
   * SOLID: SRP - одна відповідальність: генерувати елементи
   */
  generateSampleElements(ageGroup: AgeGroupConfig): PreviewElement[] {
    const elements: PreviewElement[] = [];
    
    // Генеруємо елементи в залежності від налаштувань групи
    for (let i = 0; i < ageGroup.layout.elementsPerSlide; i++) {
      elements.push({
        id: `element-${i}`,
        type: this.getElementType(ageGroup, i),
        content: this.getElementContent(ageGroup, i),
        style: {
          fontSize: i === 0 ? ageGroup.fontSize.primary : ageGroup.fontSize.secondary,
          color: '#333333',
          position: this.getElementPosition(ageGroup, i)
        }
      });
    }

    return elements;
  }

  // === SOLID: SRP - Допоміжні методи ===

  /**
   * Отримати тип елемента для позиції
   */
  private getElementType(ageGroup: AgeGroupConfig, index: number): PreviewElement['type'] {
    if (index === 0) return 'text';
    if (ageGroup.audio.required && index === 1) return 'audio';
    if (ageGroup.layout.elementsPerSlide > 3 && index === 2) return 'image';
    return 'text';
  }

  /**
   * Отримати контент елемента
   */
  private getElementContent(ageGroup: AgeGroupConfig, index: number): string {
    const samples = this.getSampleContent(ageGroup);
    return samples[index] || `Елемент ${index + 1}`;
  }

  /**
   * Отримати позицію елемента
   */
  private getElementPosition(ageGroup: AgeGroupConfig, index: number): 'top' | 'center' | 'bottom' {
    if (index === 0) return 'top';
    if (ageGroup.layout.elementsPerSlide <= 3) return 'center';
    return index % 2 === 0 ? 'top' : 'bottom';
  }

  /**
   * Отримати приклади контенту для вікової групи
   */
  private getSampleContent(ageGroup: AgeGroupConfig): string[] {
    const samples: Record<string, string[]> = {
      '2-3': [
        '🐶 Собачка',
        '🎵 Гав-гав!',
        '🌈 Кольори'
      ],
      '4-6': [
        '📚 Вивчаємо букву А',
        '🔤 А-а-а-а',
        '🍎 Яблуко',
        '✏️ Завдання'
      ],
      '7-8': [
        '🔢 Математика: 2 + 3 = ?',
        '✅ Правильна відповідь: 5',
        '🎯 Наступне завдання',
        '📝 Запишіть у зошит',
        '🎮 Гра з цифрами'
      ],
      '9-10': [
        '🧠 Логічна задача',
        '📊 Дані для аналізу',
        '💡 Підказка',
        '📝 Рішення задачі',
        '🔍 Перевірка',
        '📈 Графік',
        '🎯 Висновок',
        '📚 Додаткова інформація'
      ]
    };

    return samples[ageGroup.id] || ['Приклад контенту'];
  }

  /**
   * Генерувати заголовок слайду
   */
  private generateSampleTitle(ageGroup: AgeGroupConfig, values: FormValues): string {
    const titles: Record<string, string> = {
      '2-3': '🌟 Давайте пізнавати світ!',
      '4-6': '📚 Навчаємося граючи',
      '7-8': '🎯 Школярський урок',
      '9-10': '🧠 Поглиблене навчання'
    };

    return titles[ageGroup.id] || 'Навчальний матеріал';
  }

  /**
   * Генерувати опис контенту
   */
  private generateSampleContent(ageGroup: AgeGroupConfig, values: FormValues): string {
    const descriptions: Record<string, string> = {
      '2-3': 'Простий і зрозумілий контент з великими яскравими елементами',
      '4-6': 'Ігровий підхід до навчання з інтерактивними елементами',
      '7-8': 'Структурований матеріал з поясненнями та прикладами',
      '9-10': 'Детальний аналіз з додатковими матеріалами для поглибленого вивчення'
    };

    return descriptions[ageGroup.id] || 'Навчальний контент';
  }
}

// === Main Hook ===

/**
 * Хук для управління превю по запиту
 * SOLID: SRP - відповідає тільки за стан превю
 * SOLID: DIP - використовує абстрактний генератор
 */
export function usePreview(ageGroup: AgeGroupConfig | null, values: FormValues) {
  // === SOLID: SRP - Стан превю ===
  const [previewState, setPreviewState] = useState<PreviewState>({
    visible: false,
    loading: false,
    data: null,
    error: null
  });

  // === SOLID: SRP - Генератор превю ===
  const generator = useMemo(() => new PreviewGenerator(), []);

  // === SOLID: SRP - Показати превю ===
  const showPreview = useCallback(async () => {
    if (!ageGroup) {
      setPreviewState(prev => ({
        ...prev,
        visible: true,
        error: 'Не вибрано вікову групу'
      }));
      return;
    }

    setPreviewState(prev => ({
      ...prev,
      visible: true,
      loading: true,
      error: null
    }));

    try {
      // Симуляція генерації (можна додати затримку для реалістичності)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const previewData = generator.generatePreview(ageGroup, values);
      
      setPreviewState(prev => ({
        ...prev,
        loading: false,
        data: previewData
      }));
    } catch (error) {
      setPreviewState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Помилка генерації превю'
      }));
    }
  }, [ageGroup, values, generator]);

  // === SOLID: SRP - Сховати превю ===
  const hidePreview = useCallback(() => {
    setPreviewState({
      visible: false,
      loading: false,
      data: null,
      error: null
    });
  }, []);

  // === SOLID: SRP - Оновити превю ===
  const refreshPreview = useCallback(async () => {
    if (!previewState.visible) return;
    await showPreview();
  }, [previewState.visible, showPreview]);

  // === SOLID: SRP - Перевірка готовності ===
  const canShowPreview = useMemo(() => {
    return ageGroup !== null && !previewState.loading;
  }, [ageGroup, previewState.loading]);

  // === SOLID: SRP - Статус превю ===
  const previewStatus = useMemo(() => {
    if (previewState.loading) return 'loading';
    if (previewState.error) return 'error';
    if (previewState.data) return 'success';
    return 'idle';
  }, [previewState.loading, previewState.error, previewState.data]);

  // === SOLID: SRP - Отримання характеристик ===
  const getCharacteristics = useCallback(() => {
    return previewState.data?.characteristics || null;
  }, [previewState.data]);

  // === SOLID: SRP - Отримання слайду ===
  const getSampleSlide = useCallback(() => {
    return previewState.data?.sampleSlide || null;
  }, [previewState.data]);

  // === API хука ===
  return {
    // Стан
    previewState,
    previewStatus,
    
    // Дії
    showPreview,
    hidePreview,
    refreshPreview,
    
    // Перевірки
    canShowPreview,
    
    // Дані
    getCharacteristics,
    getSampleSlide,
    
    // Розширені властивості для зручності
    isVisible: previewState.visible,
    isLoading: previewState.loading,
    hasError: !!previewState.error,
    hasData: !!previewState.data,
    error: previewState.error,
    data: previewState.data,
    
    // Генератор для розширення
    generator
  };
}

// === Типи для експорту ===
export type UsePreviewReturn = ReturnType<typeof usePreview>;
export { PreviewGenerator }; 