/**
 * === SOLID: SRP - Single Responsibility ===
 * Хук відповідальний лише за управління станом та логікою форми генерації
 */

import { useState, useCallback, useMemo } from 'react';
import { AgeGroup, FormData } from '../types/generation';
import { formValidator } from '../services/generation/FormValidationService';
import { promptGenerator } from '../services/generation/PromptGeneratorService';

// === SOLID: ISP - Спеціалізований інтерфейс для хука ===
interface UseGenerationFormOptions {
  onGenerate: (data: { ageGroup: AgeGroup; formData: FormData; detailedPrompt: string }) => void;
  onPreview: (data: { ageGroup: AgeGroup; formData: FormData }) => void;
}

interface UseGenerationFormReturn {
  // Стан
  selectedAge: AgeGroup | null;
  formData: FormData;
  isFormValid: boolean;
  validationErrors: string[];
  
  // Дії
  handleAgeSelect: (age: AgeGroup) => void;
  handleFieldChange: (field: keyof FormData, value: string | string[] | boolean) => void;
  handleGenerate: () => void;
  handlePreview: () => void;
  resetForm: () => void;
}

// === SOLID: SRP - Початковий стан форми ===
const getInitialFormData = (): FormData => ({
  // Базові поля
  topic: '',
  difficulty: '🌟 Початковий рівень',
  duration: '⚡ Коротка тривалість',
  activities: '🎮 Інтерактивні активності',
  goals: '📚 Засвоєння нових знань',
  
  // Поля для 2-3 років
  lessonGoal: '🗣️ Розвиток мови - перші слова і прості речення',
  activityType: ['👋 Імітація - повтори рухи, звуки, жести'],
  thematic24: '👨‍👩‍👧‍👦 Сім\'я - мама, тато, бабуся',
  complexityLevel24: '🌟 Простий - один елемент, одна дія',
  lessonDuration24: '⚡ Коротка - 2-3 хвилини',
  audioSupport24: true,
  presentationStyle24: '🎪 Ігровий - через гру та розвагу',
  participationFormat24: '👶 Індивідуальний - дитина сама',
  visualEffects: ['✨ Яскраві кольори - насичена палітра'],
  presentationSpeed24: '🐌 Повільна - для уважного вивчення',
  
  // Поля для 4-6 років  
  thematic: '🔤 Абетка - букви, звуки, перші слова',
  taskTypes: ['🔤 Повтори слово - розвиток мови'],
  language: '🇺🇦 Українська - рідна мова',
  learningGoal: '📚 Підготовка до школи - базові навички',
  complexityLevel: '🌟 Початковий - 1-2 елементи, прості завдання',
  lessonDuration: '⚡ Коротка - 3-5 хвилин',
  presentationStyle: '🎪 Ігровий - через веселі активності',
  participationFormat: '👶 Індивідуальний - дитина працює сама',
  audioSupport: ['🗣️ Дружній диктор - приємний голос'],
  visualDesign: ['🌈 Яскраві кольори - насичена палітра'],
  presentationSpeed: '🐌 Повільна - для уважного вивчення',
  interactivity: '👆 Натискання - прості кліки',
  educationalProgram: '🇺🇦 Базова програма - державні стандарти',
  gradingSystem: '🌟 Зірочки - за досягнення',
  
  // Поля для 7-8 років
  subject78: '📖 Українська мова - читання, письмо, граматика',
  lessonFormat78: ['🎮 Вправа + гра - навчання через гру'],
  skills78: ['👀 Уважність - концентрація, фокус'],
  complexityLevel78: '🌟 Початковий - базові поняття для новачків',
  lessonDuration78: '⚡ Коротка - 5-7 хвилин',
  thematicOrientation78: '📚 Шкільна програма - відповідно до класу',
  pedagogicalGoal78: '📚 Засвоєння знань - нова інформація',
  assessmentMethod78: '🏆 Бали - числова система',
  audioSettings78: ['🗣️ Вчительський голос - професійний диктор'],
  interactionType78: '🖱️ Клік та вибір - прості натискання',
  presentationStyle78: '🎮 Ігровий - навчання через гру',
  socialFormat78: '👤 Індивідуальна робота - самостійне виконання',
  platform78: ['💻 Комп\'ютер/ноутбук - традиційний формат'],
  visualStyle78: '🌈 Яскравий - кольорові акценти',
  educationalProgram78: '🇺🇦 НУШ - Нова українська школа',
  competencies78: ['🗣️ Спілкування - рідною та іноземними мовами'],
  
  // Поля для 9-10 років
  subject910: '📊 Математика - алгебра, геометрія, статистика',
  complexity910: '🌟 Базова - стандартна шкільна програма',
  taskTypes910: ['📝 Текстові задачі - аналіз та розв\'язання'],
  learningGoal910: '📚 Поглиблення знань - детальне вивчення теми',
  lessonDuration910: '⚡ Швидка перевірка - 5-10 хвилин',
  thematicOrientation910: '📚 Академічна - наукові дисципліни',
  pedagogicalApproach910: '🧠 Когнітивний - розвиток мислення',
  independenceLevel910: '🤝 З підтримкою - допомога вчителя',
  gradingSystem910: '🏆 Бали - числова оцінка',
  digitalTools910: ['💻 Презентації - слайди та візуалізація'],
  visualDesign910: '🎨 Професійний - академічний стиль',
  audioSettings910: '🔕 Без звуку - тільки текст та зображення',
  interactionFormat910: '👤 Індивідуальний - самостійна робота',
  studentRole910: '📚 Слухач - сприйняття інформації',
  educationalProgram910: '🇺🇦 НУШ - Нова українська школа',
  keyCompetencies910: ['🗣️ Спілкування - рідною та іноземними мовами'],
  
  // Додаткова інформація для всіх груп
  additionalInfo: ''
});

// === SOLID: SRP - Кастомний хук ===
export const useGenerationForm = ({ 
  onGenerate, 
  onPreview 
}: UseGenerationFormOptions): UseGenerationFormReturn => {
  
  // === SOLID: SRP - Стан форми ===
  const [selectedAge, setSelectedAge] = useState<AgeGroup | null>('2-3');
  const [formData, setFormData] = useState<FormData>(getInitialFormData());
  
  // === SOLID: SRP - Валідація форми ===
  const validationResult = useMemo(() => {
    if (!selectedAge) {
      return { isValid: false, errors: ['Оберіть вікову групу'] };
    }
    
    return formValidator.validateWithResult(selectedAge, formData);
  }, [selectedAge, formData]);
  
  const isFormValid = validationResult.isValid;
  const validationErrors = validationResult.errors;
  
  // === SOLID: SRP - Обробка вибору вікової групи ===
  const handleAgeSelect = useCallback((age: AgeGroup) => {
    setSelectedAge(age);
    // Скидаємо форму при зміні вікової групи
    setFormData(getInitialFormData());
  }, []);
  
  // === SOLID: SRP - Обробка зміни полів форми ===
  const handleFieldChange = useCallback((field: keyof FormData, value: string | string[] | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // === SOLID: SRP - Генерація уроку ===
  const handleGenerate = useCallback(() => {
    if (!selectedAge || !isFormValid) {
      console.warn('Cannot generate: form is invalid');
      return;
    }
    
    try {
      const detailedPrompt = promptGenerator.generatePrompt(selectedAge, formData);
      
      onGenerate({
        ageGroup: selectedAge,
        formData,
        detailedPrompt
      });
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
  }, [selectedAge, formData, isFormValid, onGenerate]);
  
  // === SOLID: SRP - Попередній перегляд ===
  const handlePreview = useCallback(() => {
    if (!selectedAge) {
      console.warn('Cannot preview: no age group selected');
      return;
    }
    
    onPreview({
      ageGroup: selectedAge,
      formData
    });
  }, [selectedAge, formData, onPreview]);
  
  // === SOLID: SRP - Скидання форми ===
  const resetForm = useCallback(() => {
    setSelectedAge(null);
    setFormData(getInitialFormData());
  }, []);
  
  return {
    // Стан
    selectedAge,
    formData,
    isFormValid,
    validationErrors,
    
    // Дії
    handleAgeSelect,
    handleFieldChange,
    handleGenerate,
    handlePreview,
    resetForm
  };
}; 