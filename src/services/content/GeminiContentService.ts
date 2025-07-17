// Service for content generation using Gemini 2.5 Flash
import { GoogleGenAI } from '@google/genai';
import { processSlideWithImages, type ProcessedSlideData } from '@/utils/slideImageProcessor';

export class GeminiContentService {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    // Pass the API key explicitly to the Google GenAI client
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateLessonPlan(topic: string, age: string, language: string = 'uk'): Promise<string> {
    const prompt = this.buildLessonPlanPrompt(topic, age, language);

    console.log('📝 Generated prompt length:', prompt.length);
    console.log('🎯 API request details:', {
      model: 'gemini-2.5-flash'
    });

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster generation
          },
          temperature: 0.7
        }
      });

      const content = response.text;

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      console.log(`📏 Generated lesson plan length: ${content.length} characters`);
      
      // Check for common truncation indicators
      if (content.includes('[TRUNCATED]') || 
          (content.includes('...') && content.length > 3000) ||
          !content.includes('Рекомендації') ||
          !content.includes('матеріали')) {
        console.warn('⚠️ Content appears to be truncated or incomplete');
        console.warn('📝 Content ending:', content.slice(-200));
      }

      return content;
    } catch (error) {
      console.error('Gemini content generation error:', error);
      throw error;
    }
  }

  private buildLessonPlanPrompt(topic: string, age: string, language: string): string {
    if (language === 'en') {
      return `You are an expert in developing educational programs for children. Create a detailed and engaging lesson plan.

INPUT DATA:
- Topic: ${topic}
- Children's age: ${age}
- Language: English

LESSON PLAN REQUIREMENTS:
1. Create an engaging title
2. Clear learning objectives
3. Age-appropriate content structure
4. Interactive elements and activities
5. Assessment methods
6. Required materials

STRUCTURE:
## 📚 [Lesson Title]

**Target Audience:** ${age}
**Duration:** 30-45 minutes
**Subject:** [Subject area]

### 🎯 Learning Objectives
- [Objective 1]
- [Objective 2]
- [Objective 3]

### 📋 Lesson Plan

#### Slide 1: Introduction (5 minutes)
- [Content description]
- [Interactive element]

#### Slide 2: Main Content (10 minutes)
- [Content description]
- [Activities]

[Continue with more slides...]

### 🎮 Interactive Activities
- [Activity 1]
- [Activity 2]

### 📊 Assessment
- [Assessment method]

### 📚 Required Materials
- [Material 1]
- [Material 2]

### 💡 Recommendations
- [Teaching tips]
- [Adaptation suggestions]

Create a complete, detailed lesson plan that is engaging and educational for the specified age group.`;
    }

    // Ukrainian version
    return `Ви - експерт з розробки освітніх програм для дітей. Створіть детальний та захоплюючий план уроку.

ВХІДНІ ДАНІ:
- Тема: ${topic}
- Вік дітей: ${age}
- Мова: українська

ОБОВ'ЯЗКОВА СТРУКТУРА ПЛАНУ:

# [Назва уроку]

**Цільова аудиторія:** ${age}
**Тривалість:** 30-45 хвилин
**Мета уроку:** [Основна мета]

## 🎯 Навчальні цілі
- [Ціль 1]
- [Ціль 2]
- [Ціль 3]

## 📋 Структура уроку

### Слайд 1: Вітання та знайомство з темою (5-7 хв)
**Тип:** Вступний
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис контенту]
**Інтерактивні елементи:** [Опис інтерактивності]

### Слайд 2: Основний матеріал - частина 1 (8-10 хв)
**Тип:** Навчальний
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис контенту]
**Інтерактивні елементи:** [Опис інтерактивності]

### Слайд 3: Основний матеріал - частина 2 (8-10 хв)
**Тип:** Навчальний
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис контенту]
**Інтерактивні елементи:** [Опис інтерактивності]

### Слайд 4: Практичне завдання (10-12 хв)
**Тип:** Активність
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис активності]
**Інтерактивні елементи:** [Опис ігрових елементів]

### Слайд 5: Підсумок та закріплення (5-7 хв)
**Тип:** Підсумок
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис підсумкових дій]
**Інтерактивні елементи:** [Опис інтерактивності]

## 🎮 Ігрові елементи
- [Гра/активність 1]
- [Гра/активність 2]

## 📚 Необхідні матеріали
- [Матеріал 1]
- [Матеріал 2]

## 💡 Рекомендації вчителю
- [Рекомендація 1]
- [Рекомендація 2]

ВАЖЛИВО:
- СТРОГО дотримуйтесь структури "### Слайд X: [Назва]"
- Кожен слайд має містити детальний опис (мінімум 100 слів)
- Адаптуйте контент під вік ${age}
- Включіть інтерактивні елементи для кожного слайду
- Зробіть урок захоплюючим та освітнім`;
  }

  async generateSlideContent(slideDescription: string, topic: string, age: string): Promise<string> {
    const prompt = this.buildSlideContentPrompt(slideDescription, topic, age);

    try {
      console.log('🎯 Generating slide HTML with Gemini...');
      
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster generation
          },
          temperature: 0.7
        }
      });

      let content = response.text;

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      // Очищаємо HTML від markdown обгортки
      content = this.cleanHtmlFromMarkdown(content);
      console.log('✅ Base slide HTML generated, length:', content.length);

      // НОВИЙ ЕТАП: Обробляємо зображення
      console.log('🎨 Processing images in slide...');
      const imageProcessingResult: ProcessedSlideData = await processSlideWithImages(content);
      
      console.log('🎨 Image processing result:', {
        originalLength: content.length,
        processedLength: imageProcessingResult.htmlWithImages.length,
        imagesGenerated: imageProcessingResult.generatedImages?.length || 0,
        processingErrors: imageProcessingResult.processingErrors?.length || 0
      });

      // Повертаємо оброблений контент з реальними зображеннями
      return imageProcessingResult.htmlWithImages;

    } catch (error) {
      console.error('Gemini slide generation error:', error);
      throw error;
    }
  }

  private buildSlideContentPrompt(slideDescription: string, topic: string, age: string): string {
    return `Ти експерт з створення інтерактивних HTML слайдів для дітей. 

**ЗАВДАННЯ:** Створити повноцінний HTML слайд для дітей віку ${age} на основі опису.

**ОПИС СЛАЙДУ:**
${slideDescription}

**КОНТЕКСТ:**
- Тема уроку: ${topic}
- Цільова аудиторія: діти ${age}

**ТЕХНІЧНІ ВИМОГИ:**
1. Створи ПОВНИЙ HTML документ з <!DOCTYPE html>
2. Використай CSS-in-style для всього стилізування
3. Додай JavaScript для інтерактивності
4. Формат: 4:3 (800x600px або схожий)
5. Шрифти великі та читабельні для дітей
6. Яскраві кольори та привабливий дизайн

**ОБОВ'ЯЗКОВІ ЕЛЕМЕНТИ:**
- Заголовок слайду
- Основний контент відповідно до опису
- Мінімум 2-3 інтерактивні елементи (кнопки, анімації, ігри)
- Навігація або кнопки дій
- Адаптивність під планшети

**СТИЛЬ ДИЗАЙНУ:**
- Дитячий, яскравий, дружелюбний
- Великі кнопки та елементи для дотику
- Анімації та візуальні ефекти
- Ігрові елементи відповідно до віку

**ІНТЕРАКТИВНІСТЬ:**
- Кнопки з hover ефектами
- Анімації при кліку
- Можливість взаємодії (drag&drop, click, hover)
- Звукові ефекти (за можливості)

**СТРУКТУРА ВІДПОВІДІ:**
Надай тільки готовий HTML код без жодних пояснень. Код має бути повністю самостійним та готовим до використання.

**УВАГА:** 
- НЕ використовуй зовнішні бібліотеки (jQuery, Bootstrap тощо)
- Всі стилі - inline або в <style> секції
- Весь JavaScript - в <script> секції
- Готовий для негайного відображення в браузері`;
  }

  private cleanHtmlFromMarkdown(content: string): string {
    // Remove markdown code blocks
    let cleaned = content.replace(/```html\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove any remaining markdown formatting
    cleaned = cleaned.replace(/```.*$/gm, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  async generateEditedPlan(currentPlan: string, userChanges: string, topic: string, age: string): Promise<string> {
    const prompt = `Ти експерт з педагогіки та створення освітніх матеріалів для дітей. 

**ЗАВДАННЯ:** Оновити існуючий план уроку згідно з побажаннями користувача.

**ПОТОЧНИЙ ПЛАН:**
${currentPlan}

**ЗМІНИ ВІД КОРИСТУВАЧА:**
${userChanges}

**КОНТЕКСТ:**
- Тема уроку: ${topic}
- Вік дітей: ${age}

**ІНСТРУКЦІЇ:**
1. Проаналізуй поточний план і зміни користувача
2. Внеси відповідні модифікації зберігаючи структуру та якість
3. Переконайся що план залишається педагогічно обґрунтованим
4. Зберігай відповідний віку рівень складності
5. Якщо зміни суперечать педагогічним принципам, запропонуй альтернативи

**ФОРМАТ ВІДПОВІДІ:**
Надай оновлений план у тому ж форматі що й оригінал, з чіткою структурою слайдів 1-6, рекомендаціями для вчителя, необхідними матеріалами та очікуваними результатами.

**ДОДАТКОВІ ВИМОГИ:**
- Забезпечуй оптимальне відображення контенту на різних пристроях
- Всі інтерактивні елементи мають бути зручними для використання дітьми

**ОНОВЛЕНИЙ ПЛАН УРОКУ:**`;

    try {
      const response = await this.client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disable thinking for faster generation
          },
          temperature: 0.7
        }
      });

      const content = response.text;

      if (!content) {
        throw new Error('No content in Gemini response');
      }

      console.log(`📏 Generated edited plan length: ${content.length} characters`);

      return content;
    } catch (error) {
      console.error('Gemini plan editing error:', error);
      throw error;
    }
  }
} 