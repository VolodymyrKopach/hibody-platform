// Simple service for slide editing - just send HTML to Claude with instruction
export class SimpleEditService {
  private readonly apiKey: string;
  private readonly apiUrl: string = 'https://api.anthropic.com/v1/messages';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Просто редагує слайд - надсилає HTML до Claude з інструкцією
   */
  async editSlide(
    currentSlideHTML: string,
    userInstruction: string,
    topic: string,
    age: string
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    // Витягуємо base64 зображення та стискаємо HTML
    const { cleanedHTML, extractedImages } = this.extractBase64Images(currentSlideHTML);
    const compressedHTML = this.compressHTML(cleanedHTML);
    
    console.log(`📏 Original: ${currentSlideHTML.length}, Cleaned: ${cleanedHTML.length}, Compressed: ${compressedHTML.length}`);
    console.log(`🖼️ Extracted ${extractedImages.length} base64 images`);

    const prompt = this.buildSimpleEditPrompt(compressedHTML, userInstruction, topic, age);

    try {
      console.log('🔧 Simple slide editing with Claude...');
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 6000,
          temperature: 0.5, // Середня температура для балансу
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('🔥 Claude Simple Edit API Error:', {
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
      
      // Відновлюємо base64 зображення там, де потрібно
      const restoredContent = this.restoreBase64Images(content, extractedImages);
      
      console.log('✅ Simple slide edit completed, length:', restoredContent.length);

      return restoredContent;
    } catch (error) {
      console.error('Simple edit error:', error);
      throw error;
    }
  }

  /**
   * Витягує base64 зображення з HTML та замінює на placeholder
   */
  private extractBase64Images(html: string): { cleanedHTML: string; extractedImages: Array<{ placeholder: string; data: string }> } {
    const extractedImages: Array<{ placeholder: string; data: string }> = [];
    let imageCounter = 0;

    // Витягуємо base64 зображення з src атрибутів
    const cleanedHTML = html.replace(
      /src="(data:image\/[^;]+;base64,[^"]+)"/g,
      (match, base64Data) => {
        const placeholder = `[BASE64_IMAGE_${imageCounter}]`;
        extractedImages.push({ placeholder, data: base64Data });
        imageCounter++;
        return `src="${placeholder}"`;
      }
    );

    // Витягуємо base64 зображення з CSS url()
    const cleanedCSS = cleanedHTML.replace(
      /url\((data:image\/[^;]+;base64,[^)]+)\)/g,
      (match, base64Data) => {
        const placeholder = `[BASE64_CSS_${imageCounter}]`;
        extractedImages.push({ placeholder, data: base64Data });
        imageCounter++;
        return `url(${placeholder})`;
      }
    );

    return { cleanedHTML: cleanedCSS, extractedImages };
  }

  /**
   * Відновлює base64 зображення в HTML
   */
  private restoreBase64Images(html: string, extractedImages: Array<{ placeholder: string; data: string }>): string {
    let restoredHTML = html;

    // Відновлюємо кожне витягнуте зображення
    extractedImages.forEach(({ placeholder, data }) => {
      // Відновлюємо в src атрибутах
      restoredHTML = restoredHTML.replace(
        new RegExp(`src="${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
        `src="${data}"`
      );
      
      // Відновлюємо в CSS url()
      restoredHTML = restoredHTML.replace(
        new RegExp(`url\\(${placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'),
        `url(${data})`
      );
    });

    return restoredHTML;
  }

  /**
   * Стискає HTML для зменшення розміру
   */
  private compressHTML(html: string): string {
    return html
      // Видаляємо HTML коментарі (окрім IMAGE_PROMPT)
      .replace(/<!--(?!.*IMAGE_PROMPT)[\s\S]*?-->/g, '')
      // Замінюємо багато пробілів на один
      .replace(/\s+/g, ' ')
      // Видаляємо пробіли між тегами
      .replace(/>\s+</g, '><')
      // Видаляємо пробіли на початку та в кінці рядків
      .replace(/^\s+|\s+$/gm, '')
      // Видаляємо порожні рядки
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Створює простий промпт для редагування
   */
  private buildSimpleEditPrompt(
    currentSlideHTML: string, 
    userInstruction: string, 
    topic: string, 
    age: string
  ): string {
    return `Ти експерт з редагування HTML слайдів для дітей.

**ЗАВДАННЯ:** Відредагуй HTML слайд згідно з інструкцією користувача.

**ПОТОЧНИЙ HTML СЛАЙДУ:**
${currentSlideHTML}

**ІНСТРУКЦІЯ КОРИСТУВАЧА:**
${userInstruction}

**КОНТЕКСТ:**
- Тема уроку: ${topic}
- Вік дітей: ${age}

**ПРАВИЛА:**
1. Виконай інструкцію користувача якомога точніше
2. Зберігай формат HTML документа (DOCTYPE, html, head, body)
3. Використовуй яскраві кольори та дитячий дизайн
4. Зберігай інтерактивні елементи якщо вони є
5. ⚠️ ВАЖЛИВО ДЛЯ ЗОБРАЖЕНЬ: Якщо потрібно замінити або додати зображення, використовуй IMAGE_PROMPT коментарі
6. 🔄 PLACEHOLDER'И: Якщо бачиш [BASE64_IMAGE_X] або [BASE64_CSS_X] - це тимчасові placeholder'и, НЕ видаляй їх

**РОБОТА З ЗОБРАЖЕННЯМИ:**
- Якщо користувач просить замінити зображення, НЕ видаляй існуючі img теги
- Замість цього, заміни img тег на IMAGE_PROMPT коментар з новим описом
- Приклад заміни: img тег → IMAGE_PROMPT коментар з новим описом
- Якщо користувач просить додати зображення, створи новий IMAGE_PROMPT коментар
- ⚠️ PLACEHOLDER'И: Якщо бачиш src="[BASE64_IMAGE_X]" - це тимчасові placeholder'и, зберігай їх як є

**ФОРМАТ IMAGE_PROMPT:**
<!-- IMAGE_PROMPT: "опис зображення англійською" WIDTH: ширина HEIGHT: висота -->

**ВИМОГИ ДО ЗОБРАЖЕНЬ:**
- Промпт ОБОВ'ЯЗКОВО англійською мовою
- Розміри кратні 16 (512x384, 640x480, 768x576, 1024x768)
- Стиль: cartoon, educational, child-friendly, bright colors
- Для динозаврів: "cartoon dinosaur [назва], educational illustration for children, bright colors, friendly style"

**СПЕЦІАЛЬНІ ІНСТРУКЦІЇ ДЛЯ ЗАМІНИ ЗОБРАЖЕНЬ:**
Якщо користувач просить замінити зображення (наприклад "заміни теранозавра на диплодока"):
1. Знайди відповідний img тег в HTML
2. Заміни його на IMAGE_PROMPT коментар з новим описом
3. Приклад: якщо треба замінити теранозавра на диплодока, створи:
   <!-- IMAGE_PROMPT: "cartoon diplodocus dinosaur, educational illustration for children, bright colors, friendly style, prehistoric scene" WIDTH: 640 HEIGHT: 480 -->

**ВІДПОВІДЬ:**
Поверни ТІЛЬКИ оновлений HTML код без будь-яких пояснень або markdown обгортки.
Код має починатися з "<!DOCTYPE html>" і закінчуватися "</html>".`;
  }

  /**
   * Аналізує зміни між старим та новим слайдом
   */
  analyzeChanges(oldHTML: string, newHTML: string, instruction: string): string[] {
    const changes: string[] = [];
    
    try {
      // Простий аналіз основних змін
      const oldText = oldHTML.replace(/<[^>]*>/g, '').trim();
      const newText = newHTML.replace(/<[^>]*>/g, '').trim();
      
      if (oldText !== newText) {
        const lengthDiff = newText.length - oldText.length;
        if (lengthDiff > 100) {
          changes.push(`📝 Додано текст (+${lengthDiff} символів)`);
        } else if (lengthDiff < -100) {
          changes.push(`✂️ Видалено текст (-${Math.abs(lengthDiff)} символів)`);
        } else {
          changes.push('📝 Оновлено текстовий контент');
        }
      }

      // Аналіз зображень
      const oldImages = (oldHTML.match(/(?:IMAGE_PROMPT|<img)/g) || []).length;
      const newImages = (newHTML.match(/(?:IMAGE_PROMPT|<img)/g) || []).length;
      
      if (newImages > oldImages) {
        changes.push(`🖼️ Додано ${newImages - oldImages} зображень`);
      } else if (newImages < oldImages) {
        changes.push(`🗑️ Видалено ${oldImages - newImages} зображень`);
      } else if (newImages === oldImages && newImages > 0) {
        // Перевіряємо чи змінилися IMAGE_PROMPT коментарі
        const oldImagePrompts = (oldHTML.match(/IMAGE_PROMPT:[^>]+/g) || []).join('');
        const newImagePrompts = (newHTML.match(/IMAGE_PROMPT:[^>]+/g) || []).join('');
        
        if (oldImagePrompts !== newImagePrompts) {
          changes.push('🔄 Замінено зображення');
        }
      }

      // Аналіз кнопок
      const oldButtons = (oldHTML.match(/<button/g) || []).length;
      const newButtons = (newHTML.match(/<button/g) || []).length;
      
      if (newButtons > oldButtons) {
        changes.push(`🎮 Додано ${newButtons - oldButtons} кнопок`);
      } else if (newButtons < oldButtons) {
        changes.push(`🗑️ Видалено ${oldButtons - newButtons} кнопок`);
      }

      // Аналіз кольорів
      const oldColors = (oldHTML.match(/(background|color)\s*:\s*[^;]+/g) || []).length;
      const newColors = (newHTML.match(/(background|color)\s*:\s*[^;]+/g) || []).length;
      
      if (newColors !== oldColors) {
        changes.push('🎨 Оновлено кольорову схему');
      }

      // Аналіз на основі інструкції
      const lowerInstruction = instruction.toLowerCase();
      
      if (lowerInstruction.includes('заголовок') || lowerInstruction.includes('назва')) {
        changes.push('📋 Оновлено заголовок');
      }
      
      if (lowerInstruction.includes('замін') && (lowerInstruction.includes('фото') || lowerInstruction.includes('зображення') || lowerInstruction.includes('картинку'))) {
        changes.push('🔄 Замінено зображення');
      } else if (lowerInstruction.includes('замін') || lowerInstruction.includes('зміни')) {
        changes.push('🔄 Виконано заміну контенту');
      }

      if (lowerInstruction.includes('додай') || lowerInstruction.includes('створи')) {
        changes.push('➕ Додано новий контент');
      }

      if (lowerInstruction.includes('видали') || lowerInstruction.includes('убери')) {
        changes.push('➖ Видалено контент');
      }

      // Якщо нічого не знайдено, додаємо загальну зміну
      if (changes.length === 0) {
        changes.push('🔄 Слайд оновлено згідно з інструкцією');
      }

      return changes;

    } catch (error) {
      console.error('Error analyzing changes:', error);
      return ['🔄 Слайд оновлено'];
    }
  }

  /**
   * Очищає HTML від markdown обгортки
   */
  private cleanHtmlFromMarkdown(content: string): string {
    // Видаляємо markdown обгортку ```html та ```
    let cleanedContent = content.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
    
    // Видаляємо будь-які інші markdown блоки
    cleanedContent = cleanedContent.replace(/^```[a-zA-Z]*\s*/gm, '').replace(/\s*```$/gm, '');
    
    // Видаляємо зайві пробіли та переноси на початку та кінці
    cleanedContent = cleanedContent.trim();
    
    return cleanedContent;
  }
} 