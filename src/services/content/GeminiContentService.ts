// Service for content generation using Gemini 2.5 Flash
import { GoogleGenAI } from '@google/genai';
import { processSlideWithImages, type ProcessedSlideData } from '@/utils/slideImageProcessor';
import { ageComponentTemplatesService } from '@/services/templates/AgeComponentTemplatesService';
import { AgeGroup } from '@/types/generation';

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

  async generateLessonPlan(
    topic: string, 
    age: string, 
    language: string = 'uk', 
    conversationContext?: string
  ): Promise<string> {
    const prompt = this.buildLessonPlanPrompt(topic, age, language, conversationContext);

    console.log('📝 Generated prompt length:', prompt.length);
    console.log('🎯 API request details:', {
      model: 'gemini-2.5-flash',
      hasConversationContext: !!conversationContext
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

  private buildLessonPlanPrompt(topic: string, age: string, language: string, conversationContext?: string): string {
    let contextSection = '';
    
    // === ADD CONVERSATION CONTEXT TO LESSON PLAN GENERATION ===
    if (conversationContext) {
      contextSection = `
CONVERSATION HISTORY:
${conversationContext}

Based on this conversation history, consider the user's preferences, style, and any specific requirements mentioned throughout the conversation when creating the lesson plan.
`;
    }

    if (language === 'en') {
      return `You are an expert in developing educational programs for children. Create a detailed and engaging lesson plan.

${contextSection}

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

    // Ukrainian prompt (default)
    return `Ти експерт з розробки освітніх програм для дітей. Створи детальний та захоплюючий план уроку.

${contextSection}

ВХІДНІ ДАНІ:
- Тема: ${topic}
- Вік дітей: ${age}
- Мова: Українська

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

### Слайд 1: Вітання та знайомство з темою
**Тип:** Вступний
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис контенту]
**Інтерактивні елементи:** [Опис інтерактивності]

### Слайд 2: Основний матеріал - частина 1
**Тип:** Навчальний
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис контенту]
**Інтерактивні елементи:** [Опис інтерактивності]

### Слайд 3: Основний матеріал - частина 2
**Тип:** Навчальний
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис контенту]
**Інтерактивні елементи:** [Опис інтерактивності]

### Слайд 4: Практичне завдання
**Тип:** Активність
**Мета:** [Мета слайду]
**Зміст:** [Детальний опис активності]
**Інтерактивні елементи:** [Опис ігрових елементів]

### Слайд 5: Підсумок та закріплення
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
    const prompt = await this.buildSlideContentPrompt(slideDescription, topic, age);

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

  private async buildSlideContentPrompt(slideDescription: string, topic: string, age: string): Promise<string> {
    // Отримуємо age-specific шаблон компонентів
    let ageTemplate = '';
    try {
      const ageGroup = this.mapAgeToAgeGroup(age);
      ageTemplate = await ageComponentTemplatesService.getTemplateForAge(ageGroup);
      console.log(`✅ Loaded age template for ${ageGroup}, length: ${ageTemplate.length}`);
    } catch (error) {
      console.warn('Failed to load age template:', error);
      ageTemplate = '<!-- No age-specific template available -->';
    }

    return `Ти експерт з створення інтерактивних HTML слайдів для дітей. 

**ЗАВДАННЯ:** Створити повноцінний HTML слайд для дітей віку ${age} на основі опису.

**ОПИС СЛАЙДУ:**
${slideDescription}

**КОНТЕКСТ:**
- Тема уроку: ${topic}
- Цільова аудиторія: діти ${age}

**ПРИКЛАДИ КОМПОНЕНТІВ ДЛЯ ЦІЄЇ ВІКОВОЇ ГРУПИ:**
Використовуй наступні приклади компонентів як референс для створення відповідних візуальних елементів:

${ageTemplate}

**ІНСТРУКЦІЇ З ВИКОРИСТАННЯ ШАБЛОНУ:**
- Вивчи стилі та компоненти з прикладу вище
- Адаптуй дизайн під свій контент
- Використовуй схожі кольори, шрифти та розміри
- Повторюй інтерактивні паттерни (hover ефекти, анімації)
- Зберігай стиль кнопок та інтерфейсних елементів
- Адаптуй складність під вікову групу

**ТЕХНІЧНІ ВИМОГИ:**
1. Створи ПОВНИЙ HTML документ з <!DOCTYPE html>
2. Використай CSS-in-style для всього стилізування
3. Додай JavaScript для інтерактивності
4. Формат: 4:3 (800x600px або схожий)
5. Шрифти великі та читабельні для дітей
6. Яскраві кольори та привабливий дизайн

**ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ:**
ЗАМІСТЬ того, щоб додавати реальні зображення, використовуй СПЕЦІАЛЬНІ КОМЕНТАРІ для кожного місця де потрібне зображення:

**ФОРМАТ КОМЕНТАРЯ ДЛЯ ЗОБРАЖЕННЯ:**
<!-- IMAGE_PROMPT: "детальний опис зображення англійською мовою" WIDTH: XXX HEIGHT: YYY -->

**ПРАВИЛА ДЛЯ ЗОБРАЖЕНЬ:**
1. Розміри WIDTH та HEIGHT МАЮТЬ БУТИ КРАТНІ 16 (наприклад: 512, 528, 640, 768, 800)
2. Мінімальні розміри: 256x256
3. Максимальні розміри: 1536x1536
4. Промпт ОБОВ'ЯЗКОВО англійською мовою
5. Промпт має бути детальним та описувати:
   - Що зображено
   - Стиль (cartoon, illustration, realistic)
   - Кольори та настрій
   - Вікова група (for children aged X-Y)

**ПРИКЛАДИ ПРАВИЛЬНИХ КОМЕНТАРІВ:**
<!-- IMAGE_PROMPT: "colorful cartoon illustration of happy children counting numbers 1 to 10, bright colors, educational style, for children aged 6-8" WIDTH: 640 HEIGHT: 480 -->
<!-- IMAGE_PROMPT: "cute animated animals learning mathematics, cartoon style, bright and friendly, educational illustration for kids" WIDTH: 512 HEIGHT: 384 -->
<!-- IMAGE_PROMPT: "simple geometric shapes in vibrant colors, educational poster style, clean and child-friendly design" WIDTH: 800 HEIGHT: 600 -->

**РОЗМІЩЕННЯ КОМЕНТАРІВ:**
- Розмісти коментарі там, де в макеті має з'явитися зображення
- Після коментаря одразу добав пустий div з placeholder стилем
- Приклад розміщення:
  <!-- IMAGE_PROMPT: "опис" WIDTH: 640 HEIGHT: 480 -->
  <div style="width: 640px; height: 480px; background: #f0f0f0; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999;">🖼️ Image will be generated here</div>

**ОБОВ'ЯЗКОВІ ЕЛЕМЕНТИ:**
- Заголовок слайду
- Основний контент відповідно до опису
- МІНІМУМ 1-2 зображення через IMAGE_PROMPT коментарі
- Мінімум 2-3 інтерактивні елементи (кнопки, анімації, ігри)
- Навігація або кнопки дій
- Адаптивність під планшети

**ОБОВ'ЯЗКОВЕ ВИКОРИСТАННЯ ЗОБРАЖЕНЬ:**
- Кожен слайд МАЄ містити хоча б 1 зображення
- Для навчальних слайдів додавай 2-3 зображення
- Зображення мають бути релевантними до контенту
- Використовуй зображення для ілюстрації ключових понять
- Розміщуй зображення логічно в макеті

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

  /**
   * === SOLID: SRP - Маппінг віку на вікову групу ===
   */
  private mapAgeToAgeGroup(age: string): AgeGroup {
    // Витягуємо числове значення з рядка
    const ageNumber = parseInt(age.match(/\d+/)?.[0] || '6');
    
    if (ageNumber <= 3) return '2-3';
    if (ageNumber <= 6) return '4-6';
    if (ageNumber <= 8) return '7-8';
    return '9-10';
  }

  async generateEditedPlan(
    currentPlan: string, 
    userChanges: string, 
    topic: string, 
    age: string,
    conversationContext?: string
  ): Promise<string> {
    
    let contextSection = '';
    
    // === ADD CONVERSATION CONTEXT TO PLAN EDITING ===
    if (conversationContext) {
      contextSection = `
CONVERSATION HISTORY:
${conversationContext}

Consider the conversation history when making edits to ensure consistency with user preferences and previous discussions.
`;
    }

    const prompt = `Ти експерт з створення освітніх програм для дітей. Тобі потрібно оновити існуючий план уроку на основі запитів користувача.

${contextSection}

ПОТОЧНИЙ ПЛАН УРОКУ:
${currentPlan}

ЗМІНИ ВІД КОРИСТУВАЧА:
${userChanges}

КОНТЕКСТ:
- Тема: ${topic}
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