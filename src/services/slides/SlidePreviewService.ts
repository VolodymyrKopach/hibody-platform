import { ISlidePreviewService } from '@/types/store';

// === SOLID: SRP - SlidePreviewService відповідає тільки за генерацію та кешування превью ===
export class SlidePreviewService implements ISlidePreviewService {
  private previewCache: Map<string, string> = new Map();
  private readonly canvasCache: Map<string, HTMLCanvasElement> = new Map();

  private readonly defaultConfig = {
    cacheSize: 100,
    canvasWidth: 400,
    canvasHeight: 300,
    quality: 0.8
  };

  constructor(
    configOverrides: Partial<{
      cacheSize: number;
      canvasWidth: number;
      canvasHeight: number;
      quality: number;
    }> = {}
  ) {
    this.config = { ...this.defaultConfig, ...configOverrides };
  }

  private config: {
    cacheSize: number;
    canvasWidth: number;
    canvasHeight: number;
    quality: number;
  };

  // === SOLID: ISP - Конкретна реалізація для генерації превью ===
  async generatePreview(slideId: string, htmlContent: string): Promise<string> {
    try {
      console.log(`🎨 [SlidePreviewService] Generating preview for slide: ${slideId}`);

      // Перевіряємо кеш спочатку
      if (this.previewCache.has(slideId)) {
        console.log(`✅ [SlidePreviewService] Using cached preview for slide: ${slideId}`);
        return this.previewCache.get(slideId)!;
      }

      // Створюємо або отримуємо canvas
      const canvas = this.getOrCreateCanvas(slideId);
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Очищуємо canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Конвертуємо HTML в превью через DOM
      const previewDataUrl = await this.renderHtmlToCanvas(htmlContent, canvas, ctx);

      // Кешуємо результат
      this.cachePreview(slideId, previewDataUrl);

      console.log(`✅ [SlidePreviewService] Preview generated for slide: ${slideId}`);
      return previewDataUrl;

    } catch (error) {
      console.error(`❌ [SlidePreviewService] Failed to generate preview for slide ${slideId}:`, error);
      
      // Повертаємо fallback превью
      return this.generateFallbackPreview(slideId);
    }
  }

  // === SOLID: ISP - Перевірка наявності превью ===
  hasPreview(slideId: string): boolean {
    return this.previewCache.has(slideId);
  }

  // === SOLID: ISP - Отримання превью з кешу ===
  getPreview(slideId: string): string | null {
    return this.previewCache.get(slideId) || null;
  }

  // === SOLID: ISP - Очищення превью ===
  clearPreview(slideId: string): void {
    this.previewCache.delete(slideId);
    this.canvasCache.delete(slideId);
    console.log(`🗑️ [SlidePreviewService] Cleared preview for slide: ${slideId}`);
  }

  // === Private Helper Methods ===

  private getOrCreateCanvas(slideId: string): HTMLCanvasElement {
    if (this.canvasCache.has(slideId)) {
      return this.canvasCache.get(slideId)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = this.config.canvasWidth;
    canvas.height = this.config.canvasHeight;
    
    this.canvasCache.set(slideId, canvas);
    return canvas;
  }

  private async renderHtmlToCanvas(htmlContent: string, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<string> {
    return new Promise((resolve) => {
      // Створюємо тимчасовий iframe для рендерингу HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = `${this.config.canvasWidth}px`;
      iframe.style.height = `${this.config.canvasHeight}px`;
      iframe.style.border = 'none';

      document.body.appendChild(iframe);

      iframe.onload = () => {
        try {
          // Записуємо HTML в iframe
          const iframeDoc = iframe.contentDocument;
          if (iframeDoc) {
            iframeDoc.open();
            iframeDoc.write(htmlContent);
            iframeDoc.close();

            // Чекаємо завершення рендерингу
            setTimeout(() => {
              try {
                // Використовуємо html2canvas для конвертації (якщо доступно)
                // Інакше створюємо простий fallback
                this.captureIframeContent(iframe, canvas, ctx)
                  .then(dataUrl => {
                    document.body.removeChild(iframe);
                    resolve(dataUrl);
                  })
                  .catch(() => {
                    document.body.removeChild(iframe);
                    resolve(this.generateSimpleFallback(canvas, ctx));
                  });
              } catch (error) {
                document.body.removeChild(iframe);
                resolve(this.generateSimpleFallback(canvas, ctx));
              }
            }, 500); // Даємо час на рендеринг
          } else {
            document.body.removeChild(iframe);
            resolve(this.generateSimpleFallback(canvas, ctx));
          }
        } catch (error) {
          document.body.removeChild(iframe);
          resolve(this.generateSimpleFallback(canvas, ctx));
        }
      };

      iframe.onerror = () => {
        document.body.removeChild(iframe);
        resolve(this.generateSimpleFallback(canvas, ctx));
      };

      // Встановлюємо пустий src для ініціалізації
      iframe.src = 'about:blank';
    });
  }

  private async captureIframeContent(iframe: HTMLIFrameElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<string> {
    // Спроба використати більш просунуті методи захоплення
    // Поки що використовуємо простий fallback
    return this.generateSimpleFallback(canvas, ctx);
  }

  private generateSimpleFallback(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): string {
    // Створюємо простий градієнт як fallback
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(1, '#e0e0e0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Додаємо текст
    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Слайд', canvas.width / 2, canvas.height / 2 - 10);
    ctx.fillText('Превью', canvas.width / 2, canvas.height / 2 + 10);

    return canvas.toDataURL('image/png', this.config.quality);
  }

  private generateFallbackPreview(slideId: string): string {
    const canvas = this.getOrCreateCanvas(slideId);
    const ctx = canvas.getContext('2d')!;
    
    return this.generateSimpleFallback(canvas, ctx);
  }

  private cachePreview(slideId: string, previewDataUrl: string): void {
    // Перевіряємо розмір кешу
    if (this.previewCache.size >= this.config.cacheSize) {
      // Видаляємо найстарший елемент
      const firstKey = this.previewCache.keys().next().value;
      if (firstKey) {
        this.clearPreview(firstKey);
      }
    }

    this.previewCache.set(slideId, previewDataUrl);
  }

  // === Public Management Methods ===

  clearAllPreviews(): void {
    this.previewCache.clear();
    this.canvasCache.clear();
    console.log('🗑️ [SlidePreviewService] Cleared all previews');
  }

  getCacheSize(): number {
    return this.previewCache.size;
  }

  getCacheInfo(): { size: number; maxSize: number; slides: string[] } {
    return {
      size: this.previewCache.size,
      maxSize: this.config.cacheSize,
      slides: Array.from(this.previewCache.keys())
    };
  }
}

// === SOLID: SRP - Factory для створення сервісу ===
export class SlidePreviewServiceFactory {
  static create(config?: Partial<SlidePreviewService['config']>): SlidePreviewService {
    return new SlidePreviewService(config);
  }

  static createWithHighQuality(): SlidePreviewService {
    return new SlidePreviewService({
      cacheSize: 50,
      canvasWidth: 800,
      canvasHeight: 600,
      quality: 0.9
    });
  }

  static createForTesting(): SlidePreviewService {
    return new SlidePreviewService({
      cacheSize: 10,
      canvasWidth: 200,
      canvasHeight: 150,
      quality: 0.5
    });
  }
} 