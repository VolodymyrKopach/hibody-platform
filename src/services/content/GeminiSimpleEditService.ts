// Simple service for slide editing using Gemini 2.5 Flash
import { GoogleGenAI } from '@google/genai';

export class GeminiSimpleEditService {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    // Pass the API key explicitly to the Google GenAI client
    this.client = new GoogleGenAI({ apiKey });
  }

  /**
   * Просто редагує слайд - надсилає HTML до Gemini з інструкцією
   */
  async editSlide(
    currentSlideHTML: string,
    userInstruction: string,
    topic: string,
    age: string
  ): Promise<string> {

    // Витягуємо base64 зображення та стискаємо HTML
    const { cleanedHTML, extractedImages } = this.extractBase64Images(currentSlideHTML);
    const compressedHTML = this.compressHTML(cleanedHTML);
    
    console.log(`📏 Original: ${currentSlideHTML.length}, Cleaned: ${cleanedHTML.length}, Compressed: ${compressedHTML.length}`);
    console.log(`🖼️ Extracted ${extractedImages.length} base64 images`);

    const prompt = this.buildSimpleEditPrompt(compressedHTML, userInstruction, topic, age);

    try {
      console.log('🔧 Simple slide editing with Gemini 2.5 Flash...');
      
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

      let editedHTML = response.text;

      if (!editedHTML) {
        throw new Error('No content in Gemini response');
      }

      // Очищаємо від markdown обгортки
      editedHTML = this.cleanHtmlFromMarkdown(editedHTML);

      // Повертаємо зображення назад
      const finalHTML = this.restoreBase64Images(editedHTML, extractedImages);

      console.log(`✅ Simple slide edit successful, final length: ${finalHTML.length}`);
      return finalHTML;

    } catch (error) {
      console.error('Gemini simple edit error:', error);
      throw error;
    }
  }

  private buildSimpleEditPrompt(
    compressedHTML: string,
    userInstruction: string,
    topic: string,
    age: string
  ): string {
    return `You are an expert in editing HTML slides for children. Receive an HTML slide and instruction, make precise changes.

**CURRENT HTML SLIDE:**
${compressedHTML}

**EDIT INSTRUCTION:**
${userInstruction}

**REQUIREMENTS:**
1. Make ONLY the requested changes
2. Preserve all existing functionality
3. Maintain responsive design
4. Keep child-friendly style
5. Ensure all interactions work properly

**RESPONSE:**
Provide ONLY the updated HTML code, without any explanations or comments.

**UPDATED HTML:**`;
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
   * Витягує base64 зображення з HTML для зменшення розміру
   */
  private extractBase64Images(html: string): {
    cleanedHTML: string;
    extractedImages: Array<{ placeholder: string; data: string }>;
  } {
    const extractedImages: Array<{ placeholder: string; data: string }> = [];
    let imageCounter = 0;

    // Знаходимо всі base64 зображення
    const base64ImageRegex = /src="data:image\/[^;]+;base64,[^"]+"/g;
    
    const cleanedHTML = html.replace(base64ImageRegex, (match) => {
      const placeholder = `[BASE64_IMAGE_${imageCounter}]`;
      extractedImages.push({
        placeholder,
        data: match
      });
      imageCounter++;
      return `src="${placeholder}"`;
    });

    return { cleanedHTML, extractedImages };
  }

  /**
   * Повертає base64 зображення назад в HTML
   */
  private restoreBase64Images(html: string, extractedImages: Array<{ placeholder: string; data: string }>): string {
    let restoredHTML = html;
    
    extractedImages.forEach(({ placeholder, data }) => {
      restoredHTML = restoredHTML.replace(`src="${placeholder}"`, data);
    });

    return restoredHTML;
  }

  /**
   * Стискає HTML для зменшення токенів
   */
  private compressHTML(html: string): string {
    return html
      // Видаляємо зайві пробіли та переноси
      .replace(/\s+/g, ' ')
      // Видаляємо пробіли навколо тегів
      .replace(/>\s+</g, '><')
      // Видаляємо коментарі
      .replace(/<!--.*?-->/g, '')
      // Тримаємо тільки основний контент
      .trim();
  }

  /**
   * Покращує слайд з додатковими інструкціями
   */
  async improveSlide(
    currentSlideHTML: string,
    improvementType: 'visual' | 'interactive' | 'content' | 'accessibility',
    topic: string,
    age: string
  ): Promise<string> {
    const improvements = {
      visual: 'Покращ дизайн: зроби яскравішим, додай кольори та візуальні ефекти',
      interactive: 'Додай інтерактивності: кнопки, анімації, ігрові елементи',
      content: 'Покращ контент: зроби текст зрозумілішим та цікавішим для дітей',
      accessibility: 'Покращ доступність: збільш шрифт, контрастність, навігацію'
    };

    return this.editSlide(
      currentSlideHTML,
      improvements[improvementType],
      topic,
      age
    );
  }

  /**
   * Змінює тему слайду
   */
  async changeTheme(
    currentSlideHTML: string,
    newTheme: string,
    topic: string,
    age: string
  ): Promise<string> {
    return this.editSlide(
      currentSlideHTML,
      `Зміни тему дизайну на: ${newTheme}. Адаптуй кольори, стилі та оформлення під цю тему.`,
      topic,
      age
    );
  }

  /**
   * Додає нові елементи до слайду
   */
  async addElement(
    currentSlideHTML: string,
    elementType: 'quiz' | 'game' | 'animation' | 'video' | 'interactive_button',
    topic: string,
    age: string
  ): Promise<string> {
    const elements = {
      quiz: 'Додай міні-вікторину з 2-3 запитаннями по темі',
      game: 'Додай просту гру або інтерактивну активність',
      animation: 'Додай CSS анімації для привернення уваги',
      video: 'Додай placeholder для відео з кнопкою відтворення',
      interactive_button: 'Додай інтерактивні кнопки з hover ефектами'
    };

    return this.editSlide(
      currentSlideHTML,
      elements[elementType],
      topic,
      age
    );
  }

  /**
   * Видаляє елементи зі слайду
   */
  async removeElement(
    currentSlideHTML: string,
    elementSelector: string,
    topic: string,
    age: string
  ): Promise<string> {
    return this.editSlide(
      currentSlideHTML,
      `Видали елемент: ${elementSelector}. Відрегулюй layout після видалення.`,
      topic,
      age
    );
  }

  /**
   * Змінює розмір та позицію елементів
   */
  async resizeElements(
    currentSlideHTML: string,
    instructions: string,
    topic: string,
    age: string
  ): Promise<string> {
    return this.editSlide(
      currentSlideHTML,
      `Зміни розмір та позицію елементів: ${instructions}`,
      topic,
      age
    );
  }

  /**
   * Додає або змінює текст
   */
  async updateText(
    currentSlideHTML: string,
    textChanges: string,
    topic: string,
    age: string
  ): Promise<string> {
    return this.editSlide(
      currentSlideHTML,
      `Зміни текст: ${textChanges}. Адаптуй під вік ${age} та тему ${topic}.`,
      topic,
      age
    );
  }

  /**
   * Перевіряє чи містить слайд конкретний елемент
   */
  hasElement(html: string, selector: string): boolean {
    // Проста перевірка на наявність селектора в HTML
    return html.includes(selector) || 
           html.includes(`class="${selector}"`) ||
           html.includes(`id="${selector}"`);
  }

  /**
   * Отримує базову статистику слайду
   */
  getSlideStats(html: string): {
    length: number;
    hasImages: boolean;
    hasInteractivity: boolean;
    hasAnimations: boolean;
    textLength: number;
  } {
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    
    return {
      length: html.length,
      hasImages: html.includes('<img') || html.includes('data:image'),
      hasInteractivity: html.includes('onclick') || html.includes('addEventListener'),
      hasAnimations: html.includes('@keyframes') || html.includes('animation:'),
      textLength: textContent.length
    };
  }

  /**
   * Аналізує зміни між старим та новим слайдом
   */
  analyzeChanges(oldHTML: string, newHTML: string, instruction: string): {
    summary: string;
    detectedChanges: string[];
    changeCount: number;
  } {
    const changes: string[] = [];
    
    // Порівняння довжини
    const oldLength = oldHTML.length;
    const newLength = newHTML.length;
    if (Math.abs(oldLength - newLength) > 100) {
      changes.push(`Змінено розмір контенту: ${oldLength} → ${newLength} символів`);
    }

    // Перевірка на додавання елементів
    const oldElementCount = (oldHTML.match(/<[^/][^>]*>/g) || []).length;
    const newElementCount = (newHTML.match(/<[^/][^>]*>/g) || []).length;
    if (newElementCount > oldElementCount) {
      changes.push(`Додано ${newElementCount - oldElementCount} нових елементів`);
    } else if (newElementCount < oldElementCount) {
      changes.push(`Видалено ${oldElementCount - newElementCount} елементів`);
    }

    // Перевірка на зміни в стилях
    const oldStyleMatch = oldHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    const newStyleMatch = newHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    if (oldStyleMatch && newStyleMatch) {
      const oldStyles = oldStyleMatch[1];
      const newStyles = newStyleMatch[1];
      if (oldStyles !== newStyles) {
        changes.push('Оновлено CSS стилі');
      }
    }

    // Перевірка на зміни в JavaScript
    if (oldHTML.includes('<script') !== newHTML.includes('<script') ||
        oldHTML.includes('onclick') !== newHTML.includes('onclick')) {
      changes.push('Змінено JavaScript функціональність');
    }

    // Перевірка на зміни кольорів
    const oldColors = oldHTML.match(/color:\s*[^;]+/g) || [];
    const newColors = newHTML.match(/color:\s*[^;]+/g) || [];
    if (oldColors.length !== newColors.length) {
      changes.push('Змінено кольорову схему');
    }

    // Генеруємо загальний опис
    let summary = 'Слайд оновлено відповідно до інструкції';
    if (changes.length > 0) {
      summary = `Виконано ${changes.length} типів змін: ${instruction}`;
    }

    return {
      summary,
      detectedChanges: changes,
      changeCount: changes.length
    };
  }
} 