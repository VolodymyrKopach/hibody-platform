import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

export interface SlidePreviewOptions {
  width?: number;
  height?: number;
  quality?: number;
  scale?: number;
  background?: string;
}

/**
 * Генерує превью слайду з HTML контенту
 */
export async function generateSlidePreview(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  const {
    width = 1600,        // Стандартна ширина для превью
    height = 1200,       // Стандартна висота для превью
    quality = 0.8,
    scale = 1,
    background = '#ffffff'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Створюємо тимчасовий iframe для рендерингу HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = `${width}px`;
      iframe.style.height = `${height}px`;
      iframe.style.border = 'none';
      iframe.style.background = background;
      iframe.style.visibility = 'hidden';
      
      document.body.appendChild(iframe);

      // Timeout для безпеки (збільшуємо до 20 секунд)
      const timeoutId = setTimeout(() => {
        console.warn('Timeout при генерації превью слайду');
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        reject(new Error('Timeout при генерації превью'));
      }, 20000);

      iframe.onload = async () => {
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDocument) {
            throw new Error('Не вдалося отримати доступ до iframe документу');
          }

          console.log('⏰ Чекаємо 5 секунд для завершення анімацій...');
          // Просто чекаємо 5 секунд для завершення всіх анімацій
          await new Promise(resolve => setTimeout(resolve, 5000));

          console.log('📸 Створюємо скріншот після завершення анімацій...');

          // Генеруємо превью за допомогою html2canvas
          const canvas = await html2canvas(iframeDocument.body, {
            width,
            height,
            scale,
            backgroundColor: background,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: true,
            logging: false,
            removeContainer: true,
            imageTimeout: 8000
          });

          // Конвертуємо в base64
          const dataUrl = canvas.toDataURL('image/png', quality);
          
          // Очищуємо ресурси
          clearTimeout(timeoutId);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          
          console.log('✅ Превью успішно створено після 5-секундного очікування');
          resolve(dataUrl);
        } catch (error) {
          clearTimeout(timeoutId);
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          console.error('Помилка html2canvas:', error);
          reject(error);
        }
      };

      iframe.onerror = (error) => {
        clearTimeout(timeoutId);
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        console.error('Помилка завантаження iframe:', error);
        reject(new Error('Помилка завантаження iframe'));
      };

      // Оптимізуємо HTML контент для кращої генерації превью
      const optimizedHtml = optimizeHtmlForPreviewWithAnimations(htmlContent);
      iframe.srcdoc = optimizedHtml;
    } catch (error) {
      console.error('Помилка створення iframe:', error);
      reject(error);
    }
  });
}

/**
 * Альтернативний метод генерації превью з менш агресивною обробкою
 */
export async function generateSlidePreviewAlt(
  htmlContent: string,
  options: SlidePreviewOptions = {}
): Promise<string> {
  const {
    width = 1600,        // Стандартна ширина для превью
    height = 1200,       // Стандартна висота для превью
    quality = 0.8,
    scale = 1,
    background = '#ffffff'
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Створюємо контейнер для превью
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = `${width}px`;
      container.style.height = `${height}px`;
      container.style.overflow = 'hidden';
      container.style.background = background;
      container.style.visibility = 'hidden';
      
      document.body.appendChild(container);

      // Timeout для безпеки
      const timeoutId = setTimeout(() => {
        console.warn('Timeout при альтернативній генерації превью');
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        reject(new Error('Timeout при альтернативній генерації превью'));
      }, 15000);

      try {
        // Додаємо HTML контент
        container.innerHTML = htmlContent;

        // Простий метод - чекаємо 5 секунд і робимо скріншот
        setTimeout(async () => {
          try {
            console.log('📸 Альтернативний метод: створюємо скріншот через 5 секунд...');

            const canvas = await html2canvas(container, {
              width,
              height,
              scale,
              backgroundColor: background,
              useCORS: true,
              allowTaint: true,
              foreignObjectRendering: true,
              logging: false,
              removeContainer: true,
              imageTimeout: 5000
            });

            const dataUrl = canvas.toDataURL('image/png', quality);
            
            clearTimeout(timeoutId);
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            
            console.log('✅ Альтернативне превью успішно створено');
            resolve(dataUrl);
          } catch (error) {
            clearTimeout(timeoutId);
            if (document.body.contains(container)) {
              document.body.removeChild(container);
            }
            console.error('Помилка альтернативного html2canvas:', error);
            reject(error);
          }
        }, 5000);

      } catch (error) {
        clearTimeout(timeoutId);
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        console.error('Помилка створення контейнера:', error);
        reject(error);
      }
    } catch (error) {
      console.error('Помилка альтернативного методу:', error);
      reject(error);
    }
  });
}

/**
 * Генерує мініатюру слайду з автоматичним fallback
 */
export async function generateSlideThumbnail(
  htmlContent: string, 
  options: SlidePreviewOptions = {}
): Promise<string> {
  console.log('🖼️ Починаємо генерацію превью слайду...');
  
  try {
    // Спочатку пробуємо основний метод з 5-секундним очікуванням
    const preview = await generateSlidePreview(htmlContent, options);
    console.log('✅ Основний метод успішно створив превью');
    return preview;
  } catch (error) {
    console.warn('⚠️ Основний метод не вдався, пробуємо альтернативний...', error);
    
    try {
      // Якщо основний метод не вдався, пробуємо альтернативний
      const alternativePreview = await generateSlidePreviewAlt(htmlContent, options);
      console.log('✅ Альтернативний метод успішно створив превью');
      return alternativePreview;
    } catch (altError) {
      console.warn('⚠️ Альтернативний метод теж не вдався, створюємо fallback превью...', altError);
      
      // Якщо обидва методи не вдалися, створюємо fallback превью
      const fallbackPreview = generateFallbackPreview(options);
      console.log('✅ Створено fallback превью');
      return fallbackPreview;
    }
  }
}

/**
 * Генерує превью для всіх слайдів уроку
 */
export async function generateLessonPreviews(
  slides: Array<{ id: string; htmlContent: string }>,
  options: SlidePreviewOptions = {}
): Promise<Array<{ slideId: string; preview: string; thumbnail: string }>> {
  const results: Array<{ slideId: string; preview: string; thumbnail: string }> = [];
  
  for (const slide of slides) {
    try {
      console.log(`Генерую превью для слайду ${slide.id}...`);
      
      const [preview, thumbnail] = await Promise.all([
        generateSlidePreview(slide.htmlContent, options),
        generateSlideThumbnail(slide.htmlContent, options)
      ]);

      results.push({
        slideId: slide.id,
        preview,
        thumbnail
      });
    } catch (error) {
      console.error(`Помилка генерації превью для слайду ${slide.id}:`, error);
      
      // Генеруємо fallback превью
      const fallbackPreview = generateFallbackPreview(options);
      results.push({
        slideId: slide.id,
        preview: fallbackPreview,
        thumbnail: fallbackPreview
      });
    }
  }

  return results;
}

/**
 * Створює fallback превью у вигляді градієнту з текстом
 */
export function generateFallbackPreview(options: SlidePreviewOptions = {}): string {
  const {
    width = 640,         // Стандартна ширина для fallback превью
    height = 480,        // Стандартна висота для fallback превью
    background = '#ffffff'
  } = options;
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('Не вдалося створити 2D контекст для fallback превью');
    return '';
  }
  
  // Створюємо красивий градієнт
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(0.5, '#764ba2');
  gradient.addColorStop(1, '#f093fb');
  
  // Заливаємо фон градієнтом
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Додаємо напівпрозорий фон для тексту
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.2);
  
  // Додаємо текст
  ctx.fillStyle = '#333333';
  ctx.font = `${Math.floor(width / 20)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const text = 'Прев\'ю слайду';
  const emoji = '📋';
  
  ctx.fillText(emoji, width / 2, height / 2 - 20);
  ctx.fillText(text, width / 2, height / 2 + 20);
  
  return canvas.toDataURL('image/png', 0.8);
}

/**
 * Зберігає превью як файл у публічній директорії
 */
export async function savePreviewAsFile(
  previewDataUrl: string,
  lessonId: string,
  slideId: string
): Promise<string> {
  try {
    const response = await fetch('/api/images/slide', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: previewDataUrl,
        lessonId,
        slideId,
        type: 'preview'
      })
    });

    if (!response.ok) {
      throw new Error('Помилка збереження превью');
    }

    const result = await response.json();
    return result.imagePath;
  } catch (error) {
    console.error('Помилка збереження превью як файл:', error);
    throw error;
  }
}

/**
 * Витягує DOM елемент з HTML рядка для превью
 */
export function extractPreviewElement(htmlContent: string): HTMLElement | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Шукаємо основний контейнер слайду
  let slideElement = doc.querySelector('.slide') as HTMLElement;
  
  if (!slideElement) {
    slideElement = doc.querySelector('[class*="slide"]') as HTMLElement;
  }
  
  if (!slideElement) {
    slideElement = doc.body;
  }

  return slideElement;
}

/**
 * Оптимізує HTML для генерації превью (видаляє інтерактивні елементи)
 */
export function optimizeHtmlForPreview(htmlContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  // Видаляємо скрипти
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => script.remove());

  // Видаляємо інтерактивні елементи
  const interactive = doc.querySelectorAll('button, input, select, textarea, video, audio');
  interactive.forEach(el => {
    // Замінюємо на статичні елементи
    const staticEl = doc.createElement('div');
    staticEl.className = el.className;
    staticEl.style.cssText = (el as HTMLElement).style.cssText;
    staticEl.textContent = el.textContent || 'Interactive Element';
    el.parentNode?.replaceChild(staticEl, el);
  });

  return doc.documentElement.outerHTML;
}

/**
 * Перевіряє чи містить HTML контент анімації
 */
export function hasAnimations(htmlContent: string): boolean {
  const animationPatterns = [
    /animation\s*:/,
    /transition\s*:/,
    /@keyframes/,
    /transform\s*:/,
    /animate/i,
    /fadeIn/i,
    /slideIn/i,
    /bounceIn/i,
    /rotateIn/i,
    /data-aos/i,
    /aos-/i
  ];
  
  return animationPatterns.some(pattern => pattern.test(htmlContent));
}

/**
 * Оптимізує HTML для генерації превью з урахуванням анімацій та зображень
 */
export function optimizeHtmlForPreviewWithAnimations(htmlContent: string): string {
  let optimizedHtml = optimizeHtmlForPreview(htmlContent);
  
  // Замінюємо проблемні зображення на CSS placeholder'и
  optimizedHtml = replaceImagesWithPlaceholders(optimizedHtml);
  
  // Якщо є анімації, додаємо CSS для прискорення
  if (hasAnimations(optimizedHtml)) {
    const speedUpAnimationsCSS = `
      <style>
        *, *::before, *::after {
          animation-duration: 0.1s !important;
          animation-delay: 0s !important;
          transition-duration: 0.1s !important;
          transition-delay: 0s !important;
        }
        [data-aos] {
          animation-duration: 0.1s !important;
        }
        
        /* Стилі для placeholder зображень */
        .image-placeholder {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex !important;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          min-width: 150px;
          min-height: 100px;
        }
      </style>
    `;
    
    // Додаємо CSS перед закриваючим тегом head або body
    if (optimizedHtml.includes('</head>')) {
      optimizedHtml = optimizedHtml.replace('</head>', speedUpAnimationsCSS + '</head>');
    } else if (optimizedHtml.includes('</body>')) {
      optimizedHtml = optimizedHtml.replace('</body>', speedUpAnimationsCSS + '</body>');
    } else {
      optimizedHtml = speedUpAnimationsCSS + optimizedHtml;
    }
  }
  
  return optimizedHtml;
}

/**
 * Замінює зображення з зовнішніх джерел на CSS placeholder'и
 */
function replaceImagesWithPlaceholders(htmlContent: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const images = doc.querySelectorAll('img');
  
  images.forEach((img, index) => {
    const src = img.getAttribute('src');
    
    // Перевіряємо чи зображення з зовнішнього джерела або може бути проблемним
    const isExternal = src && (
      src.startsWith('http://') || 
      src.startsWith('https://') ||
      src.startsWith('//') ||
      src.includes('unsplash.com') ||
      src.includes('pixabay.com') ||
      src.includes('pexels.com') ||
      src.includes('freepik.com')
    );
    
    const isDataUrl = src && src.startsWith('data:');
    const isEmpty = !src || src.trim() === '';
    
    if (isExternal || isEmpty) {
      console.log(`🔄 Замінюю зображення ${index + 1} на placeholder (src: ${src?.substring(0, 50)}...)`);
      
      // Отримуємо розміри з атрибутів або CSS
      const width = img.getAttribute('width') || img.style.width || '200px';
      const height = img.getAttribute('height') || img.style.height || '150px';
      
      // Створюємо placeholder div
      const placeholder = doc.createElement('div');
      placeholder.className = `image-placeholder ${img.className}`;
      placeholder.style.cssText = `
        width: ${width.toString().includes('px') ? width : width + 'px'};
        height: ${height.toString().includes('px') ? height : height + 'px'};
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        min-width: 150px;
        min-height: 100px;
        ${img.style.cssText}
      `;
      placeholder.textContent = '🖼️';
      
      // Замінюємо img на placeholder
      img.parentNode?.replaceChild(placeholder, img);
    } else if (isDataUrl) {
      console.log(`✅ Залишаю data URL зображення ${index + 1}`);
      // Data URL зображення залишаємо як є
    }
  });
  
  return doc.documentElement.outerHTML;
} 