// Service for content generation using Claude Sonnet
import { processSlideWithImages, type ProcessedSlideData } from '@/utils/slideImageProcessor';

export class ClaudeSonnetContentService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateLessonPlan(topic: string, age: string, language: string = 'uk'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    console.log('🔐 Claude API key present:', this.apiKey ? 'Yes' : 'No');
    console.log('🔐 API key length:', this.apiKey?.length || 0);
    console.log('🔐 API key starts with:', this.apiKey?.substring(0, 10) + '...');

    const prompt = this.buildLessonPlanPrompt(topic, age, language);

    console.log('📝 Generated prompt length:', prompt.length);
    console.log('🎯 API request details:', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 12000,
      temperature: 0.7,
      url: this.apiUrl
    });

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', // Claude Sonnet 4 - найновіша модель
          max_tokens: 12000, // Збільшуємо ліміт токенів для повних планів
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('🔥 Claude API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          requestModel: 'claude-sonnet-4-20250514',
          requestTokens: 12000
        });
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;

      if (!content) {
        throw new Error('No content in Claude response');
      }

      console.log(`📏 Generated lesson plan length: ${content.length} characters`);
      console.log(`📊 Response usage:`, data.usage);
      
      // Check if content was truncated
      if (data.usage?.output_tokens >= 11800) { // Close to max_tokens limit
        console.warn('⚠️ Content might be truncated due to token limit');
        console.warn('🔧 Consider increasing max_tokens or refining prompt');
      }
      
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
      console.error('Claude Sonnet content generation error:', error);
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

    // Ukrainian version (existing)
    return `Ви - експерт з розробки освітніх програм для дітей. Створіть детальний та захоплюючий план уроку.

ВХІДНІ ДАНІ:
- Тема: ${topic}
- Вік дітей: ${age}
- Мова: українська

ВИМОГИ ДО ПЛАНУ:
1. Урок має бути інтерактивним та цікавим для дітей цього віку
2. Включати різні типи активностей (навчання, гра, практика)
3. Враховувати вікові особливості розвитку
4. Містити 4-8 слайдів залежно від складності теми
5. Кожен слайд має мету, зміст та інтерактивні елементи

СТРУКТУРА ПЛАНУ:
- Заголовок та мета уроку
- Тривалість
- Детальний опис кожного слайду з типом (вступний, навчальний, активність, підсумок)
- Рекомендації для викладання

СТИЛЬ:
- Дружелюбний та захоплюючий
- Адаптований під вік дітей
- З практичними прикладами
- З ігровими елементами

ВАЖЛИВО:
- Враховуйте психологічні особливості віку ${age}
- Використовуйте інтерактивні елементи відповідно до здібностей дітей
- Забезпечте логічну послідовність подачі матеріалу
- Включіть елементи мотивації та заохочення

Створіть план у форматі Markdown з детальними описами кожного слайду.`;
  }

  async generateSlideContent(slideDescription: string, topic: string, age: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    const prompt = this.buildSlideContentPrompt(slideDescription, topic, age);

    try {
      console.log('🎯 Generating slide HTML with Claude...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', // Claude Sonnet 4
          max_tokens: 6000,
          temperature: 0.8,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('🔥 Claude Slide API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      let content = data.content[0]?.text;

      if (!content) {
        throw new Error('No content in Claude response');
      }

      // Очищаємо HTML від markdown обгортки
      content = this.cleanHtmlFromMarkdown(content);
      console.log('✅ Base slide HTML generated, length:', content.length);

      // НОВИЙ ЕТАП: Обробляємо зображення
      console.log('🎨 Processing images in slide...');
      const imageProcessingResult: ProcessedSlideData = await processSlideWithImages(content);
      
      // Логуємо результати обробки зображень
      if (imageProcessingResult.generatedImages.length > 0) {
        const successful = imageProcessingResult.generatedImages.filter(img => img.success).length;
        const failed = imageProcessingResult.generatedImages.length - successful;
        console.log(`📸 Image processing: ${successful} successful, ${failed} failed`);
      }
      
      // Виводимо помилки якщо є
      if (imageProcessingResult.processingErrors.length > 0) {
        console.warn('⚠️ Image processing errors:', imageProcessingResult.processingErrors);
      }

      // Повертаємо HTML з інтегрованими зображеннями
      const finalHtml = imageProcessingResult.htmlWithImages;
      console.log('✅ Final slide with images ready, length:', finalHtml.length);

      return finalHtml;
    } catch (error) {
      console.error('Claude Sonnet slide generation error:', error);
      throw error;
    }
  }

  private cleanHtmlFromMarkdown(content: string): string {
    // Видаляємо markdown обгортку ```html та ```
    let cleanedContent = content.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
    
    // Видаляємо будь-які інші markdown блоки
    cleanedContent = cleanedContent.replace(/^```[a-zA-Z]*\s*/gm, '').replace(/\s*```$/gm, '');
    
    // Видаляємо зайві пробіли та переноси на початку та кінці
    cleanedContent = cleanedContent.trim();
    
    // Переконуємося що контент починається з <!DOCTYPE html> або <html>
    if (!cleanedContent.match(/^\s*<!DOCTYPE\s+html/i) && !cleanedContent.match(/^\s*<html/i)) {
      console.warn('⚠️ HTML content does not start with DOCTYPE or html tag');
      console.warn('📝 Content preview:', cleanedContent.substring(0, 200));
    }
    
    return cleanedContent;
  }

  private buildSlideContentPrompt(slideDescription: string, topic: string, age: string): string {
    return `Ви - експерт з створення інтерактивних освітніх слайдів для дітей.

ЗАВДАННЯ: Створіть повний HTML-код для слайду з автоматичною генерацією зображень

ВХІДНІ ДАНІ:
- Опис слайду: ${slideDescription}
- Тема уроку: ${topic}
- Вік дітей: ${age}

ВИМОГИ ДО СЛАЙДУ:
1. Повний HTML-документ з DOCTYPE
2. Responsive дизайн
3. Яскраві кольори та привабливий дизайн
4. Інтерактивні елементи (кнопки, анімації, ефекти)
5. Адаптований під вік ${age}
6. CSS анімації та переходи
7. Простий та зрозумілий інтерфейс

ТЕХНІЧНІ ВИМОГИ:
- Використовуйте сучасний CSS (Grid, Flexbox)
- Додайте JavaScript для інтерактивності
- Шрифт: Comic Sans MS або подібний дитячий
- Кольори: яскраві, але приємні для очей

ГЕНЕРАЦІЯ ЗОБРАЖЕНЬ:
ВАЖЛИВО! Для кожного зображення що потрібно в слайді, використовуйте спеціальний HTML коментар ЗАМІСТЬ тега <img>:

Формат коментаря:
<!-- IMAGE_PROMPT: "опис зображення англійською" WIDTH: ширина HEIGHT: висота -->

Приклади:
<!-- IMAGE_PROMPT: "A colorful cartoon illustration of a friendly cat teaching mathematics to children, educational style, bright colors" WIDTH: 512 HEIGHT: 384 -->
<!-- IMAGE_PROMPT: "Simple drawing of geometric shapes (circle, square, triangle) for kids, colorful, educational poster style" WIDTH: 640 HEIGHT: 480 -->

ПРАВИЛА ДЛЯ ЗОБРАЖЕНЬ:
- Промпт ОБОВ'ЯЗКОВО англійською мовою
- Ширина та висота МАЮТЬ БУТИ кратні 16 (вимога FLUX API)
- Рекомендовані розміри: 512x384, 640x480, 768x576, 1024x768
- Опис має бути освітнім та підходящим для дітей віку ${age}
- Стиль: cartoon, illustration, educational, child-friendly
- Завжди вказуйте "for children" або "educational" в промпті
- Додавайте "bright colors", "friendly", "safe for kids"

КОЛИ ДОДАВАТИ ЗОБРАЖЕННЯ:
- Для ілюстрації основних концепцій теми ${topic}
- Для декоративних елементів що покращують сприйняття
- Для інтерактивних активностей
- Для візуалізації абстрактних понять
- ЗАВЖДИ додавайте принаймні 1-2 зображення на слайд

СТРУКТУРА:
- <!DOCTYPE html>
- <head> з meta тегами та стилями
- <body> з основним контентом
- Використовуйте IMAGE_PROMPT коментарі замість <img> тегів
- JavaScript для інтерактивності

ВАЖЛИВО: 
- Поверніть ТІЛЬКИ чистий HTML-код без будь-яких обгорток, коментарів або markdown форматування
- Відповідь має починатися з "<!DOCTYPE html>" і закінчуватися "</html>"
- НЕ використовуйте <img> теги - тільки IMAGE_PROMPT коментарі
- Кожен IMAGE_PROMPT коментар буде автоматично замінений на реальне зображення`;
  }

  async generateEditedPlan(currentPlan: string, userChanges: string, topic: string, age: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

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
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', // Claude Sonnet 4
          max_tokens: 8000,
          temperature: 0.7,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('🔥 Claude Edit Plan API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });
        throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorData?.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.content[0]?.text;

      if (!content) {
        throw new Error('No content in Claude response');
      }

      console.log(`📏 Generated edited plan length: ${content.length} characters`);
      console.log(`📊 Response usage:`, data.usage);

      return content;
    } catch (error) {
      console.error('Claude Sonnet plan editing error:', error);
      throw error;
    }
  }
} 